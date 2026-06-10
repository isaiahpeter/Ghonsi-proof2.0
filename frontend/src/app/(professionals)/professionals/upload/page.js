'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, X, ChevronUp, ChevronDown, Upload as UploadIcon } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { uploadProof } from '@/utils/proofsApi';
import { extractDocumentData, supportsExtraction } from '@/utils/extractionApi';
import { uploadDocumentWithMetadata } from '@/utils/pinataUpload';
import { saveFormData, getFormData, clearFormData } from '@/utils/formPersistence';
import { extractAndSaveSmartTags } from '@/utils/smartTags';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/components/ui/Toast';
import ToastContainer from '@/components/ui/Toast';
import TransactionSignerModal from '@/components/shared/TransactionSignerModal';
import SolanaPaymentModal from '@/components/shared/SolanaPaymentModal';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import './upload.css';

function Upload() {
  const { publicKey, connected, connectWallet } = useWallet();
  const { toasts, addToast, removeToast } = useToast();

  // Form state
  const [proofType, setProofType] = useState('');
  const [proofName, setProofName] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tagPlaceholder, setTagPlaceholder] = useState(''); // ✅ FIXED: Added missing state
  const [summary, setSummary] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);

  // UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProTipsOpen, setIsProTipsOpen] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [supportingError, setSupportingError] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSmartTagModal, setShowSmartTagModal] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);

  // Transaction modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentSig, setPendingPaymentSig] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showExtractionPreview, setShowExtractionPreview] = useState(false);
  const [proposedData, setProposedData] = useState(null);
  const [mintData, setMintData] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [extractedApiData, setExtractedApiData] = useState(null);
  const [pendingProofData, setPendingProofData] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  const dropdownRef = useRef(null);
  const referenceFileInputRef = useRef(null);
  const tagPlaceholderIntervalRef = useRef(null);
  // Guards against race condition: if the user switches proof types while an async
  // extraction is in-flight, we discard the stale result when it resolves.
  const activeProofTypeRef = useRef('');

  // Syntax-highlight JSON preview (copied from portfolio.jsx MetadataModal)
  const renderSyntaxJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-blue-300';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'text-gray-300' : 'text-[#C19A4A]';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  // Generate smart tag suggestions based on extracted data
  const generateSmartTagSuggestions = (extractedData) => {
    if (!extractedData) return [];

    const allTags = Object.values(SMART_TAG_CATEGORIES).flat();
    const textToAnalyze = JSON.stringify(extractedData).toLowerCase();

    // Score each tag based on relevance
    const tagScores = allTags.map(tag => {
      const tagLower = tag.toLowerCase();
      const tagWords = tagLower.split(/[\s/&]+/);
      let score = 0;

      // Check for exact match
      if (textToAnalyze.includes(tagLower)) {
        score += 10;
      }

      // Check for partial word matches
      tagWords.forEach(word => {
        if (word.length > 3 && textToAnalyze.includes(word)) {
          score += 3;
        }
      });

      return { tag, score };
    });

    // Sort by score and take top 3
    const topTags = tagScores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.tag);

    return topTags.length > 0 ? topTags : ['UI/UX Design', 'Web Development', 'Project Management'];
  };

  const MAX_SIZE = 2 * 1024 * 1024;
  const ACCEPTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  // Smart Tags Categories
  const SMART_TAG_CATEGORIES = {
    'Design & Creative': [
      'UI Design', 'UX Design', 'UI/UX Design', 'Interaction Design', 'Product Design',
      'Graphic Design', 'Visual Design', 'Motion Design', 'Animation', '3D Design',
      'Illustration', 'Branding', 'Brand Identity', 'Logo Design', 'Typography',
      'Icon Design', 'Packaging Design', 'Print Design', 'Web Design', 'Mobile App Design',
      'Design Systems', 'Prototyping', 'AR/VR Design', 'Game Design', 'Generative Design',
      'Inclusive Design', 'Sustainable Design'
    ],
    'Development & Technical': [
      'Frontend Development', 'Backend Development', 'Full Stack Development', 'Mobile Development',
      'Web Development', 'Software Engineering', 'DevOps', 'Cloud Architecture', 'Database Design',
      'API Development', 'Blockchain Development', 'AI/ML Engineering', 'Data Engineering',
      'Cybersecurity', 'Quality Assurance (QA)', 'Technical Writing'
    ],
    'Marketing & Growth': [
      'Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'SEO',
      'SEM / Paid Advertising', 'Email Marketing', 'Brand Marketing', 'Growth Marketing',
      'Influencer Marketing', 'Marketing Strategy', 'Analytics & Data Marketing', 'Copywriting'
    ],
    'Content & Writing': [
      'Content Writing', 'Copywriting', 'Technical Writing', 'Creative Writing',
      'Scriptwriting', 'Journalism', 'Editing & Proofreading', 'Storytelling',
      'Ghostwriting', 'Translation'
    ],
    'Media & Production': [
      'Photography', 'Videography', 'Video Editing', 'Audio Production', 'Music Production',
      'Podcast Production', 'Cinematography', 'Motion Graphics', 'VFX', '3D Animation',
      'Filmmaking', 'Directing'
    ],
    'Business & Professional': [
      'Project Management', 'Product Management', 'Business Strategy', 'Entrepreneurship',
      'Sales', 'Business Development', 'Consulting', 'Leadership & Management',
      'Human Resources (HR)', 'Finance & Accounting', 'Data Analysis', 'Research',
      'Teaching / Training', 'Coaching'
    ],
    'Specialized / Emerging': [
      'NFT & Digital Collectibles', 'AI Ethics & Governance', 'Sustainability Consulting',
      'User Research', 'Service Design', 'Experience Design', 'Data Visualization',
      'Information Architecture', 'Accessibility (a11y)', 'E-commerce Strategy',
      'Community Management', 'Event Planning'
    ]
  };

  const proofRequirements = {
    certificates: {
      summaryPlaceholder: 'Tell us what this was the challenge, what you did and what changed because of it. Include clear results or metrics where possible.',
      validEvidences: [
        'Full certificate file (PDF, PNG, screenshot)',
        'Certificate link',
        'Official issuer message confirming completion of training',
        'Link to public graduate announcement (if issuer posts those)',
      ],
      notAllowed: 'NDA-covered materials, proprietary internal tools, certificate PDFs with watermarks forbidding redistribution, documents showing sensitive internal company data.',
    },
    job_history: {
      summaryPlaceholder: 'Enter: Job Title, Employer Name, Employment Type, Start/End Dates, Job Category, Internal Work Experience ID...',
      validEvidences: [
        'Snapshot of offer letter (redacted salary)',
        'HR email confirming employment',
        'Work badge snapshot',
        "Public team page snapshot where user's name appears (if applicable)",
        'GitHub contribution logs linked to the company repo',
        'Public posts (LinkedIn) from the employer announcing new hires',
      ],
      notAllowed: 'Confidential HR portals, salary details, internal documentation, private client data, or anything uniquely traceable to a person.',
    },
    skills: {
      summaryPlaceholder: 'Enter: Skill Name (e.g., Solidity), Proficiency Level (e.g., Beginner/Intermediate/Advanced), Skill Category, Internal Skill ID...',
      validEvidences: [
        'GitHub activity screenshots',
        'Snippets of work (non-sensitive)',
        'Public portfolio links',
        'Dribbble/Behance links',
        'Snapshots of skill tests (without sensitive user info)',
      ],
      notAllowed: "Proprietary materials, private client work, snapshots of codebases belonging to employers, or any IP you don't own.",
    },
    milestones: {
      summaryPlaceholder: 'Enter: Milestone Type (Promotion/Award/Recognition/Key Result), Issuer Name(company or platform), Month & Year, Internal Milestone ID...',
      validEvidences: [
        'Snapshot of award announcement',
        'Email confirming promotion',
        'Public recognition posts',
        'Certificate of achievement',
      ],
      notAllowed: 'Performance reviews, salary information, internal feedback or one-on-one reports, data regarding other employees.',
    },
    // NOTE: key must match the value sent to uploadProof / DB schema.
    // Original codebase used 'community_contributions' — keep that here.
    community_contributions: {
      summaryPlaceholder: 'Enter: Contribution Type (Talk, Article, Open Source, Community Role), Platform Name, Date, Internal Contribution ID...',
      validEvidences: [
        'Link to article, talk, or recording',
        'Snapshot of Speaking Engagement Flyer',
        'Image of GitHub PR',
        'Snapshot of community role announcement',
      ],
      notAllowed: 'Sensitive community data or private correspondence.',
    },
  };

  const proofOptions = [
    { value: 'certificates', label: 'Certificates / Trainings' },
    { value: 'job_history', label: 'Job History (Work Experience)' },
    { value: 'skills', label: 'Skills / Competencies' },
    { value: 'milestones', label: 'Career Milestones (Promotions / Awards)' },
    { value: 'community_contributions', label: 'Community Contributions / Public Work' },
  ];

  const extractProofData = async (file, selectedProofType) => {
    if (!supportsExtraction(selectedProofType)) return null;
    try {
      setIsExtracting(true);
      setExtractionProgress(0);

      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      const data = await extractDocumentData(file, selectedProofType);
      clearInterval(progressInterval);

      if (!data) {
        setExtractionProgress(0);
        return null;
      }

      setExtractionProgress(100);
      setTimeout(() => setExtractionProgress(0), 500);
      return data;
    } catch (error) {
      console.error('Extraction error:', error);
      setExtractionProgress(0);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const placeholders = [
      'Search tags - e.g Motion Design, Solidity,...',
      'Areas of expertise covered by your proofs.'
    ];
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let charIndex = 0;

    const typingSpeed = 80;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    const type = () => {
      const currentPlaceholder = placeholders[currentIndex];

      if (!isDeleting) {
        currentText = currentPlaceholder.substring(0, charIndex + 1);
        charIndex++;
        setTagPlaceholder(currentText);

        if (charIndex === currentPlaceholder.length) {
          isDeleting = true;
          tagPlaceholderIntervalRef.current = setTimeout(type, pauseDuration);
          return;
        }
      } else {
        currentText = currentPlaceholder.substring(0, charIndex - 1);
        charIndex--;
        setTagPlaceholder(currentText);

        if (charIndex === 0) {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % placeholders.length;
          tagPlaceholderIntervalRef.current = setTimeout(type, 500);
          return;
        }
      }

      tagPlaceholderIntervalRef.current = setTimeout(
        type,
        isDeleting ? deletingSpeed : typingSpeed
      );
    };

    type();

    return () => {
      if (tagPlaceholderIntervalRef.current) {
        clearTimeout(tagPlaceholderIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const savedData = getFormData('uploadProof');
    if (savedData) {
      console.log('Restoring upload form data');
      setProofType(savedData.proofType || '');
      setProofName(savedData.proofName || '');
      setTags(savedData.tags || []);
      setSummary(savedData.summary || '');
      setReferenceLink(savedData.referenceLink || '');
      // Bug fix: showInstructions must also be restored so the Required Evidence
      // panel re-appears for the rehydrated proof type on page reload.
      if (savedData.proofType) {
        activeProofTypeRef.current = savedData.proofType;
        setShowInstructions(true);
      }
    }
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveFormData('uploadProof', { proofType, proofName, tags, summary, referenceLink });
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [proofType, proofName, tags, summary, referenceLink]);

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleProofTypeSelect = async (value) => {
    // Track which type is "active" so in-flight extractions for the previous
    // type don't overwrite state after the user has already switched away.
    activeProofTypeRef.current = value;
    setProofType(value);
    setIsDropdownOpen(false);
    setShowInstructions(true);

    // Bug fix: clear stale extraction data from the previous proof type so it
    // can't contaminate a submission for the newly selected type.
    setExtractedApiData(null);
    setProposedData(null);
    setShowExtractionPreview(false);

    if (referenceFiles.length > 0) {
      const extracted = await extractProofData(referenceFiles[0], value);
      // Race condition guard: discard result if the user switched types again
      // while this async call was in-flight.
      if (extracted && activeProofTypeRef.current === value) {
        setProposedData({
          title: extracted.title,
          summary: extracted.summary,
          raw: extracted.raw,
          needsReview: extracted.needsReview,
        });
        setShowExtractionPreview(true);
      }
    }
  };

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
      return `"${file.name}" is not a supported format.`;
    }
    if (file.size > MAX_SIZE) {
      return `"${file.name}" exceeds the 2MB size limit.`;
    }
    return null;
  };

  const handleReferenceFiles = async (files) => {
    setSupportingError('');
    if (files.length === 0) return;
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      setSupportingError(error);
      addToast(error, 'error');
      setTimeout(() => setSupportingError(''), 5000);
      return;
    }
    setReferenceFiles([file]);
    if (proofType) {
      // Snapshot the active type at the moment of upload so the race condition
      // guard below works correctly if the user switches type while extracting.
      const typeAtUpload = proofType;
      const extracted = await extractProofData(file, typeAtUpload);
      // Bug fix: discard result if the user switched proof types while this
      // async extraction was in-flight (mirrors the guard in handleProofTypeSelect).
      if (extracted && activeProofTypeRef.current === typeAtUpload) {
        setProposedData({
          title: extracted.title,
          summary: extracted.summary,
          raw: extracted.raw,
          needsReview: extracted.needsReview,
        });
        setShowExtractionPreview(true);
      } else if (!extracted) {
        addToast('Auto-fill unavailable — fill in the fields manually', 'info');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    let hasError = false;

    if (!proofName.trim() || !summary.trim() || !proofType) {
      setUploadError('Please fill in all required fields.');
      hasError = true;
    }
    if (referenceFiles.length === 0) {
      setSupportingError('A Reference Document is required.');
      hasError = true;
    }
    if (hasError) return;

    if (!connected) {
      setUploadError('Please connect your wallet to sign the upload transaction.');
      try {
        await connectWallet();
      } catch (err) {
        // User rejected wallet connection - error already shown by wallet adapter
      }

      // IMPORTANT: don't exit early if the user connected successfully.
      // Otherwise the UI still behaves like the page is "locked" until the user clicks submit again.
      const startedAt = Date.now();
      while (!connected && Date.now() - startedAt < 10000) {
        await new Promise((r) => setTimeout(r, 250));
      }

      if (!connected) return;
    }


    setIsUploading(true);
    setShowPendingModal(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('You must be logged in to upload proofs');

      const documentData = {
        proofType,
        proofName,
        summary,
        referenceLink: referenceLink || null,
        walletAddress: publicKey?.toString() || null,
        userId: user.id,
        uploadedAt: new Date().toISOString(),
        ...(extractedApiData ? { extractedData: extractedApiData } : {}),
      };

      // Compute sha256 BEFORE upload — file object is guaranteed fresh here
      let fileHash = null;
      try {
        const arrayBuffer = await referenceFiles[0].arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        console.log('sha256 computed:', fileHash);
      } catch (hashErr) {
        console.warn('sha256 computation failed (non-fatal):', hashErr.message);
      }

      console.log('Uploading document to IPFS...');
      const ipfsResult = await uploadDocumentWithMetadata(
        referenceFiles[0],
        documentData,
        { walletAddress: publicKey?.toString() || null, timestamp: new Date().toISOString() }
      );
      console.log('IPFS upload successful:', ipfsResult);

      // Generate a short unique ID (32 chars max for on-chain storage)
      const proofId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);

      // Resolve the raw file CID — Pinata can return it under different keys
      const fileCid =
        ipfsResult.fileHash ||   // uploadDocumentWithMetadata sets this
        ipfsResult.fileCid ||   // alternate naming
        ipfsResult.IpfsHash ||   // raw Pinata API response shape
        ipfsResult.hash;         // last resort: metadata CID (still a valid CID)

      if (!fileCid) {
        throw new Error(
          `IPFS upload did not return a file CID. Got: ${JSON.stringify(ipfsResult)}`
        );
      }

      // Anchor program enforces max 59 chars — CIDv0 is 46, CIDv1 is 59
      const safeCid = fileCid.slice(0, 59);

      // ✅ CRITICAL: Validate ALL required fields BEFORE proceeding
      const requiredFields = {
        publicKey: publicKey?.toString()?.trim() || '',
        proofId: String(proofId).trim(),
        safeCid: String(safeCid).trim(),
        proofName: proofName?.trim() || '',
        summary: summary?.trim() || '',
        proofType: proofType?.trim() || '',
      };

      // Log for debugging
      console.log('[upload] Required fields check:', {
        publicKey: !!requiredFields.publicKey,
        proofId: !!requiredFields.proofId,
        safeCid: !!requiredFields.safeCid,
        proofName: !!requiredFields.proofName,
        summary: !!requiredFields.summary,
        proofType: !!requiredFields.proofType,
      });

      // Find any missing fields
      const missing = Object.entries(requiredFields)
        .filter(([_key, value]) => !value)
        .map(([key]) => key);

      if (missing.length > 0) {
        throw new Error(
          `Cannot prepare transaction - missing: ${missing.join(', ')}`
        );
      }

      setPendingProofData({
        proofType,
        proofName: requiredFields.proofName,
        summary: requiredFields.summary,
        referenceLink: referenceLink || null,
        userId: user.id,
        extractedData: extractedApiData,
        metadataIpfsHash: ipfsResult.hash,   // metadata CID → metadata_ipfs_hash in DB
        metadataIpfsUrl: ipfsResult.url,     // metadata URL → metadata_ipfs_url in DB
        fileIpfsHash: fileCid,               // file CID → file_ipfs_hash in DB
        fileIpfsUrl: ipfsResult.fileUrl,     // file URL → file_ipfs_url in DB
        fileHash,                            // sha256 → file_hash in DB
      });

      // ✅ Build mintData with validated fields
      const mintDataPayload = {
        ownerWallet: requiredFields.publicKey,
        proofId: requiredFields.proofId,
        ipfsUri: requiredFields.safeCid,     // backend expects ipfsUri not ipfsCid
        title: requiredFields.proofName,
        description: requiredFields.summary,
        proofType: requiredFields.proofType,
      };

      // ✅ Log the exact payload being prepared
      console.log('[upload] ✓ Validated mintData:', mintDataPayload);

      setMintData(mintDataPayload);
      setDisplayData({
        proofName: requiredFields.proofName,
        proofType: requiredFields.proofType,
      });

      setShowPendingModal(false);
      // Step 1: user pays $0.20 USDT first, THEN signs the Solana tx
      setShowPaymentModal(true);

    } catch (error) {
      console.error('Error preparing proof submission:', error);
      addToast(error.message || 'Failed to prepare proof submission', 'error');
      setShowPendingModal(false);
      setIsUploading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Called when $0.20 USDT payment confirmed — then opens the Anchor tx modal
  const handlePaymentSuccess = (paymentSig) => {
    console.log('[upload] USDT payment confirmed:', paymentSig);
    setPendingPaymentSig(paymentSig);
    setShowPaymentModal(false);
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = async ({ txHash }) => {
    setShowTransactionModal(false);
    setShowPendingModal(true);

    try {
      console.log('Mint tx confirmed:', txHash, '— saving to database...');

      const proofDataWithIPFS = {
        ...pendingProofData,
        transactionHash: txHash,
      };

      const uploadedProof = await uploadProof(proofDataWithIPFS, [], [referenceFiles[0]]);
      console.log('Proof saved to database:', uploadedProof.proof.id);

      // ✨ Extract and save smart tags
      try {
        console.log('Extracting smart tags...');
        const smartTags = await extractAndSaveSmartTags(uploadedProof.proof.id, {
          proof_name: pendingProofData.proofName,
          proof_type: pendingProofData.proofType,
          summary: pendingProofData.summary,
          extracted_data: pendingProofData.extractedData,
        });
        console.log('Smart tags extracted:', smartTags);
        if (smartTags.length > 0) {
          addToast(`${smartTags.length} smart tags added: ${smartTags.slice(0, 3).join(', ')}${smartTags.length > 3 ? '...' : ''}`, 'success');
        }
      } catch (tagError) {
        console.warn('Smart tag extraction failed (non-fatal):', tagError);
        // Don't block the upload flow if tag extraction fails
      }

      setSubmissionResult({
        txHash,
        fileUrl: pendingProofData.fileIpfsUrl,
        metadataUrl: pendingProofData.ipfsUrl,
        proofName: pendingProofData.proofName,
      });

      clearFormData('uploadProof');
      setShowPendingModal(false);
      setShowSubmittedModal(true);

    } catch (error) {
      console.error('Error saving proof to database:', error);
      addToast(error.message || 'Failed to save proof — the NFT was minted but DB save failed.', 'error');
      setShowPendingModal(false);
      setIsUploading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTransactionModalClose = () => {
    setShowTransactionModal(false);
    // Clear mintData to force regeneration of proofId on next attempt
    setMintData(null);
    setDisplayData(null);
    // Don't clear pendingProofData yet - we might need it if user retries
    // setPendingProofData(null);
    setIsUploading(false);
  };

  const handleTransactionError = () => {
    // When transaction fails, clear everything to force fresh data generation
    setShowTransactionModal(false);
    setMintData(null);
    setDisplayData(null);
    setPendingProofData(null);
    setIsUploading(false);
    setShowPendingModal(false);
  };

  const resetAll = () => {
    activeProofTypeRef.current = '';
    setProofType('');
    setProofName('');
    setTags([]);
    setTagInput('');
    setSummary('');
    setReferenceLink('');
    setReferenceFiles([]);
    setShowInstructions(false);
    setSupportingError('');
    setUploadError('');
    setIsUploading(false);
    setIsExtracting(false);
    setExtractionProgress(0);
    setShowTransactionModal(false);
    setShowExtractionPreview(false);
    setProposedData(null);
    setMintData(null);
    setDisplayData(null);
    setExtractedApiData(null);
    setPendingProofData(null);
    setSubmissionResult(null);
  };

  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return 'fa-file-pdf';
    if (file.type.includes('image')) return 'fa-file-image';
    if (file.type.includes('word') || file.name.includes('doc')) return 'fa-file-word';
    return 'fa-file';
  };

  const currentRequirements = proofType ? proofRequirements[proofType] : null;

  if (loading) {
    return <SkeletonLoader type="upload" />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden flex flex-col">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-grid z-0" />


      {/* Step 1: $0.20 USDT payment gate */}
      <SolanaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          // Do NOT clear mintData here.
          // mintData is the payload required for /api/prepare-mint.
          // Clearing it during/after payment success causes missing required fields.
          setShowPaymentModal(false);
          setDisplayData(null);
          setIsUploading(false);
        }}
        onSuccess={handlePaymentSuccess}
        type="upload"
        description={`Proof upload — ${displayData?.proofName || ''}`}
      />

      {/* Step 2: sign the Anchor PDA transaction */}
      <TransactionSignerModal
        isOpen={showTransactionModal}
        onClose={handleTransactionModalClose}
        onSuccess={handleTransactionSuccess}
        onError={handleTransactionError}
        mintData={mintData}
        displayData={displayData}
        paymentSignature={pendingPaymentSig}
      />

      {/* Syntax-highlighted JSON Preview Modal (matching portfolio.jsx) */}
      <AnimatePresence>
        {showExtractionPreview && proposedData && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => { setShowExtractionPreview(false); setProposedData(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/*
               * Three-zone flex layout — max-h on this wrapper keeps the
               * footer always on-screen on every viewport size.
               */}
              {/* Gradient border */}
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="bg-[#0d1020] rounded-[14px] flex flex-col overflow-hidden max-h-[85vh]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-blue-500/5 pointer-events-none" />

                  {/* ── HEADER (pinned) ── */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#C19A4A]/15 border border-[#C19A4A]/30 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-[#C19A4A]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">Extracted Data Preview</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI Extraction JSON</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {proposedData.raw && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(proposedData.raw, null, 2)).then(() => {
                              addToast('JSON copied!', 'success');
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C19A4A]/10 border border-[#C19A4A]/20 text-[#C19A4A] text-[11px] font-semibold hover:bg-[#C19A4A]/20 transition-colors"
                        >
                          <Copy size={12} />
                          Copy
                        </button>
                      )}
                      <button
                        onClick={() => { setShowExtractionPreview(false); setProposedData(null); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* ── BODY (JSON) ── */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-modal">
                    {proposedData.raw ? (
                      <pre
                        className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: renderSyntaxJson(proposedData.raw) }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                          <FileText size={22} className="text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-sm">No extracted data available</p>
                        <p className="text-gray-600 text-xs">Upload a document to generate AI-extracted metadata.</p>
                      </div>
                    )}
                  </div>

                  {/* ── FOOTER (pinned) ── */}
                  <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 border-t border-white/5 relative z-10">
                    <button
                      onClick={() => {
                        setShowExtractionPreview(false);
                        setProposedData(null);
                        setReferenceFiles([]);
                        // Bug fix: clear any previously accepted extraction data so it can't
                        // be silently attached to the next submission after a rejection.
                        setExtractedApiData(null);
                      }}
                      className="flex-1 py-3.5 rounded-xl border border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 active:scale-[0.98] transition-all text-sm order-2 sm:order-1"
                    >
                      <i className="fa-solid fa-xmark mr-2"></i>Reject &amp; Try Another File
                    </button>
                    <button
                      onClick={() => {
                        if (proposedData.title && !proofName.trim()) setProofName(proposedData.title);
                        if (proposedData.summary && !summary.trim()) {
                          setSummary(proposedData.summary);
                          addToast('Summary auto-filled from extraction!', 'success');
                        } else if (proposedData.summary) {
                          addToast('Using your summary (AI suggestion skipped)', 'info');
                        } else {
                          addToast('Title and extracted data applied!', 'success');
                        }
                        setExtractedApiData(proposedData.raw);
                        setShowExtractionPreview(false);
                        setProposedData(null);

                        // Generate and show smart tag suggestions
                        const suggestions = generateSmartTagSuggestions(proposedData.raw);
                        setSuggestedTags(suggestions);
                        setShowSmartTagModal(true);
                      }}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(193,154,74,0.4)] active:scale-[0.98] transition-all text-sm order-1 sm:order-2"
                    >
                      <i className="fa-solid fa-check mr-2"></i>Accept &amp; Continue
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Tag Selection Modal */}
      <AnimatePresence>
        {showSmartTagModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setShowSmartTagModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 shadow-2xl">
                <div className="bg-[#0d1020] rounded-[14px] p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-blue-500/5 pointer-events-none rounded-[14px]" />

                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                      <h3 className="text-white font-bold text-lg">Select Smart Tags</h3>
                      <p className="text-gray-400 text-xs mt-1">Choose tags that best describe your proof</p>
                    </div>
                    <button
                      onClick={() => setShowSmartTagModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="relative z-10 mb-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#C19A4A] mb-3 block">
                      AI Suggested Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((tag, idx) => {
                        const isSelected = tags.includes(tag);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                removeTag(tag);
                              } else if (tags.length < 5) {
                                setTags([...tags, tag]);
                              }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                ? 'bg-[#C19A4A] text-[#0B0F1B] border-2 border-[#C19A4A]'
                                : 'bg-[#C19A4A]/10 text-[#C19A4A] border-2 border-[#C19A4A]/30 hover:border-[#C19A4A]/60'
                              }`}
                          >
                            {isSelected && <X size={14} className="shrink-0" />}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="relative z-10 mb-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Or Add Custom Tag
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
                            e.preventDefault();
                            if (!tags.includes(tagInput.trim())) {
                              setTags([...tags, tagInput.trim()]);
                            }
                            setTagInput('');
                          }
                        }}
                        placeholder={tagPlaceholder || "Type and press Enter"}
                        className="w-full glass-input rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none"
                        disabled={tags.length >= 5}
                      />
                      {tags.length >= 5 && (
                        <p className="text-xs text-yellow-400 mt-2">Maximum 5 tags reached</p>
                      )}
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div className="relative z-10 mb-6">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                        Selected ({tags.length}/5)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C19A4A]/10 border border-[#C19A4A]/30 rounded-lg text-[#C19A4A] text-xs font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-400 transition-colors"
                            >
                              <i className="fa-solid fa-xmark text-[10px]"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 relative z-10">
                    <button
                      onClick={() => {
                        setShowSmartTagModal(false);
                        setTags([]);
                      }}
                      className="flex-1 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all text-sm"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => {
                        setShowSmartTagModal(false);
                        if (tags.length > 0) {
                          addToast(`${tags.length} tag(s) added!`, 'success');
                        }
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(193,154,74,0.4)] transition-all text-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-grow px-4 py-8 max-w-4xl lg:max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent font-[Inter] mt-[105px]">
            Upload Your Proof
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Add a new proof to your on-chain portfolio
          </p>
        </motion.div>

        {/* Wallet connection banner */}
        <AnimatePresence>
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-xl text-sm bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-wallet text-lg text-yellow-400"></i>
                <span>Connect a wallet &mdash; you'll need it to sign the upload transaction.</span>
              </div>
              <button
                type="button"
                onClick={connectWallet}
                className="shrink-0 px-4 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold text-xs transition-colors border border-yellow-500/30"
              >
                Connect Wallet
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Get test tokens link */}
        <div className="mb-6 text-center">
          <a
            href="https://t.me/ghonsiproofhub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C19A4A] hover:text-[#d9b563] text-sm font-semibold transition-colors underline"
          >
            Get test tokens
          </a>
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 shadow-2xl mb-10 lg:mb-0"
          >
            <div className="bg-[#111625] rounded-[14px] p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-blue-500/5 pointer-events-none" />

              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-3 relative z-10"
                  >
                    <i className="fa-solid fa-circle-exclamation text-lg"></i>
                    {uploadError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                {/* Proof Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Proof Name *</label>
                  <input
                    type="text"
                    value={proofName}
                    onChange={(e) => setProofName(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer Certification"
                    className="w-full glass-input rounded-xl px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none"
                  />
                </div>

                {/* Proof Type Dropdown */}
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Proof Type *</label>
                  <div className={`custom-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full glass-input rounded-xl px-4 py-3.5 text-sm cursor-pointer flex justify-between items-center hover:border-[#aa8944]/60 transition-colors"
                    >
                      <span className={proofType ? 'text-white' : 'text-gray-500'}>
                        {proofType ? proofOptions.find((opt) => opt.value === proofType)?.label : 'Select proof type'}
                      </span>
                      <i className={`fa-solid ${isDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-[#aa8944] text-xs transition-transform duration-300`}></i>
                    </div>
                    {isDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="custom-dropdown-options">
                        {proofOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => handleProofTypeSelect(option.value)}
                            className={`custom-option ${proofType === option.value ? 'selected' : ''}`}
                          >
                            {option.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Display selected tags (read-only) */}
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Selected Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C19A4A]/10 border border-[#C19A4A]/30 rounded-lg text-[#C19A4A] text-xs font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <i className="fa-solid fa-xmark text-[10px]"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center justify-between">
                    <span>Summary *</span>
                    <button
                      type="button"
                      className="text-[#C19A4A] text-xs font-semibold hover:text-[#d9b563] transition-colors flex items-center gap-1.5"
                      onClick={() => setIsProTipsOpen(!isProTipsOpen)}
                    >
                      Pro Tips
                      {isProTipsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </label>

                  {isProTipsOpen && (
                    <div className="mb-3 bg-[#151925] border border-[#C19A4A]/30 rounded-lg p-4 space-y-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        <span className="text-[#C19A4A] font-semibold">Pro tip:</span> Focus on the impact of your work, not just the task. Write in first person, include measurable results and use keywords that reflect your role and skills.
                      </p>

                      {/* See Example Expandable Subsection */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setIsExampleOpen(!isExampleOpen)}
                          className="flex items-center gap-1 text-[#C19A4A] text-xs hover:underline transition-colors"
                        >
                          See example
                          <i className={`fa-solid ${isExampleOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`}></i>
                        </button>

                        {isExampleOpen && (
                          <div className="mt-2 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-lg p-3">
                            <p className="text-gray-400 text-xs leading-relaxed italic">
                              Our product launch campaign had low engagement, so I created a 3-week email and social campaign targeting first-time users. This increased signups by 38% and improved email click-through rate from 2.1% to 5.4%.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows="4"
                      maxLength="1000"
                      className="w-full glass-input rounded-xl px-4 py-3.5 pb-12 text-sm placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
                      placeholder={currentRequirements?.summaryPlaceholder || 'Describe your achievement, skills demonstrated or work completed'}
                    />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <button
                        type="button"
                        className="text-[#C19A4A] text-xs font-semibold hover:text-[#d9b563] transition-colors flex items-center gap-1.5"
                        onClick={() => addToast('AI Rewrite coming soon!', 'info')}
                      >
                        <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                        Rewrite with AI
                      </button>
                      <span className={`text-[10px] font-mono tracking-wider ${summary.length >= 1000 ? 'text-red-400' : 'text-gray-500'}`}>
                        {summary.length}/1000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions panel */}
                <AnimatePresence>
                  {showInstructions && currentRequirements && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-[#C19A4A]/10 to-transparent border border-[#C19A4A]/20 rounded-xl p-5 mb-2">
                        <h4 className="text-[#C19A4A] font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                          <i className="fa-solid fa-clipboard-check"></i> Required Evidence
                        </h4>
                        <p className="text-gray-300 text-xs mb-3 font-medium">Please ensure your Reference Document includes:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
                          {currentRequirements.validEvidences.map((item, idx) => (
                            <li key={idx} className="flex gap-2 items-start">
                              <span className="text-[#C19A4A] mt-0.5">&rarr;</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="bg-red-500/10 border-l-2 border-red-500/50 p-3 rounded-r-lg">
                          <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider block mb-1">Not Allowed:</span>
                          <p className="text-gray-400 text-[11px] italic leading-relaxed">{currentRequirements.notAllowed}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reference Link */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                    Reference Link <span className="text-gray-600 normal-case tracking-normal font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={referenceLink}
                    onChange={(e) => setReferenceLink(e.target.value)}
                    placeholder="https://github.com/project or https://certificate-url.com"
                    className="w-full glass-input rounded-xl px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 ml-1">Optional: Link to GitHub repo, certificate URL, or other relevant documentation</p>
                </div>

                {/* File Upload */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                    <span>Reference Document *</span>
                    <span className="flex items-center gap-1.5 text-[#C19A4A]/80 cursor-help hover:text-[#C19A4A] transition-colors normal-case tracking-normal font-normal">
                      <i className="fa-regular fa-circle-question"></i> Get Help
                    </span>
                  </label>
                  <div
                    onClick={() => referenceFileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={(e) => { e.preventDefault(); handleReferenceFiles(Array.from(e.dataTransfer.files)); }}
                    className="border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#C19A4A]/50 transition-all cursor-pointer group relative"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[#C19A4A]/30 text-[#C19A4A] mb-4 group-hover:bg-gradient-to-br group-hover:from-[#C19A4A] group-hover:to-[#d9b563] group-hover:text-[#0B0F1B] transition-all duration-300 group-hover:scale-110 shadow-lg">
                      <UploadIcon size={24} className="text-[#C19A4A] group-hover:text-[#0B0F1B]" />
                    </div>
                    <p className="text-sm font-semibold mb-1 text-gray-200">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC up to 2MB</p>
                    <input
                      ref={referenceFileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleReferenceFiles(Array.from(e.target.files))}
                    />
                  </div>

                  <AnimatePresence>
                    {referenceFiles.length > 0 && (
                      <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-2 mt-2">
                        {referenceFiles.map((file, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-[#1A1F2E] border border-[#C19A4A]/30 rounded-xl px-4 py-3 shadow-lg">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <i className={`fa-solid ${getFileIcon(file)} text-[#C19A4A] text-lg`}></i>
                              <div className="flex flex-col">
                                <span className="truncate text-sm font-medium text-gray-200 max-w-[200px] sm:max-w-[300px]">{file.name}</span>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[10px] text-gray-500 font-mono">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                  {isExtracting && extractionProgress > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-[#C19A4A] to-[#d9b563] rounded-full transition-all duration-300 ease-out"
                                          style={{ width: `${Math.min(extractionProgress, 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] text-[#C19A4A] font-bold min-w-[32px]">
                                        {Math.round(extractionProgress)}%
                                      </span>
                                    </div>
                                  )}
                                  {isExtracting && extractionProgress === 0 && (
                                    <span className="text-[10px] text-[#C19A4A] flex items-center gap-1.5 font-medium">
                                      <i className="fa-solid fa-spinner fa-spin"></i> Extracting...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setReferenceFiles([])}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#C19A4A] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {supportingError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center mt-3 font-medium">
                        {supportingError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-white text-sm font-medium hover:text-[#C19A4A] transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="group relative px-8 py-3.5 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(193,154,74,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="relative z-10">
                      {isUploading ? 'Uploading...' : connected ? 'Upload' : 'Connect Wallet & Upload'}
                    </span>
                    {!isUploading && (
                      <i className="fa-solid fa-arrow-right relative z-10 text-sm group-hover:translate-x-1 transition-transform"></i>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

              </form>
            </div>
          </motion.div>

          {/* Right Column - Upload Requirements & Pro Tips (Desktop Only) */}
          <div className="hidden lg:block space-y-6">
            {/* Upload Requirements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-[1px] rounded-xl bg-gradient-to-br from-[#C19A4A]/60 to-[#C19A4A]/10 sticky top-[120px]"
            >
              <div className="rounded-xl p-5 bg-[#0d1020]">
                <h4 className="text-[#C19A4A] text-sm font-semibold mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i> Upload Requirements
                </h4>
                <ul className="text-[11px] text-gray-300 space-y-2 list-none">
                  <li className="flex gap-2 items-start"><span className="text-[#C19A4A] text-[6px] mt-1.5">&#8226;</span>Reference document is required</li>
                  <li className="flex gap-2 items-start"><span className="text-[#C19A4A] text-[6px] mt-1.5">&#8226;</span>Maximum file size: 2MB per document</li>
                  <li className="flex gap-2 items-start"><span className="text-[#C19A4A] text-[6px] mt-1.5">&#8226;</span>Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                  <li className="flex gap-2 items-start"><span className="text-[#C19A4A] text-[6px] mt-1.5">&#8226;</span>Documents should clearly show your achievement or work</li>
                  <li className="flex gap-2 items-start"><span className="text-[#C19A4A] text-[6px] mt-1.5">&#8226;</span>A connected wallet is required to sign the upload transaction</li>
                </ul>
              </div>
            </motion.div>

            {/* Pro Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative p-[1px] rounded-xl bg-gradient-to-br from-[#C19A4A]/60 to-[#C19A4A]/10"
            >
              <div className="rounded-xl p-5 bg-[#0d1020]">
                <h4 className="text-[#C19A4A] text-sm font-semibold mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-lightbulb"></i> PRO TIPS
                </h4>
                <div className="space-y-3">
                  <p className="text-gray-300 text-xs leading-relaxed">
                    <span className="text-[#C19A4A] font-semibold">Pro tip:</span> Focus on the impact of your work, not just the task. Write in first person, include measurable results and use keywords that reflect your role and skills.
                  </p>

                  <div className="bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-lg p-3">
                    <p className="text-[#C19A4A] text-[10px] font-semibold uppercase tracking-wider mb-2">Example:</p>
                    <p className="text-gray-400 text-xs leading-relaxed italic">
                      Our product launch campaign had low engagement, so I created a 3-week email and social campaign targeting first-time users. This increased signups by 38% and improved email click-through rate from 2.1% to 5.4%.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Pending Modal */}
      <AnimatePresence>
        {showPendingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B0F1B]/90 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 max-w-sm w-full shadow-2xl"
            >
              <div className="bg-[#111625] rounded-[14px] p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(193,154,74,0.1)_0%,transparent_70%)]" />
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#C19A4A] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white relative z-10">Submitting Proof...</h3>
                <p className="text-gray-400 text-xs leading-relaxed relative z-10">
                  Uploading to IPFS and anchoring on-chain.<br />This may take a few moments.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSubmittedModal && submissionResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B0F1B]/90 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#22c55e] via-[#C19A4A] to-blue-500 max-w-sm w-full shadow-2xl"
            >
              <div className="bg-[#111625] rounded-[14px] p-7 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08)_0%,transparent_70%)]" />

                <button
                  onClick={() => { setShowSubmittedModal(false); setIsUploading(false); resetAll(); }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="relative z-10 text-center mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                  >
                    <i className="fa-solid fa-check-circle text-green-400 text-3xl"></i>
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-1">Proof Submitted!</h3>
                  <p className="text-gray-400 text-xs">Your proof is now on-chain and stored on IPFS.</p>
                </div>

                <div className="relative z-10 space-y-2 mb-6">
                  {submissionResult.txHash && (
                    <a
                      href={`https://solscan.io/tx/${submissionResult.txHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/30 rounded-xl hover:border-[#C19A4A] hover:bg-[#C19A4A]/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#C19A4A]/10 flex items-center justify-center">
                          <i className="fa-solid fa-link text-[#C19A4A] text-xs"></i>
                        </div>
                        <div className="text-left">
                          <p className="text-white text-xs font-semibold">View on Solscan</p>
                          <p className="text-gray-500 text-[10px] font-mono truncate max-w-[160px]">
                            {submissionResult.txHash.slice(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-up-right-from-square text-gray-500 group-hover:text-[#C19A4A] text-xs transition-colors"></i>
                    </a>
                  )}

                  {submissionResult.fileUrl && (
                    <a
                      href={submissionResult.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-[#0B0F1B] border border-blue-500/30 rounded-xl hover:border-blue-400 hover:bg-blue-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <i className="fa-solid fa-file text-blue-400 text-xs"></i>
                        </div>
                        <div className="text-left">
                          <p className="text-white text-xs font-semibold">View Document</p>
                          <p className="text-gray-500 text-[10px]">Stored permanently on IPFS</p>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-up-right-from-square text-gray-500 group-hover:text-blue-400 text-xs transition-colors"></i>
                    </a>
                  )}
                </div>

                <div className="flex gap-3 relative z-10">
                  <button
                    onClick={() => { setShowSubmittedModal(false); setIsUploading(false); resetAll(); }}
                    className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={() => (window.location.href = '/dashboard')}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] text-sm font-bold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Upload;