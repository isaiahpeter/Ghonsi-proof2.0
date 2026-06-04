'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, FileText, Wallet, Mail, Calendar, CheckCircle, Sparkles, ArrowRight, Brain, Search, Pencil, Download, Plus, Bot, X, Loader2, FileCheck, Link as LinkIcon, Share2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Player } from '@lottiefiles/react-lottie-player';
import { faInstagram, faXTwitter, faLinkedinIn, faGithub } from '@fortawesome/free-brands-svg-icons';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { getUserProofs } from '@/utils/proofsApi';
import { getProfile, getProfileById } from '@/utils/profileApi';


// SKILLS PROCESSING ENGINE
// Extracts, validates, deduplicates, and weights skills from
// AI-generated extracted_data.skills_and_expertise across proofs


const MIN_CONFIDENCE_FOR_SKILL = 0.70;
const MIN_SKILL_NAME_LENGTH = 2;
const MAX_SKILL_NAME_LENGTH = 50;

// Normalize skill name to canonical form for deduplication
function normalizeSkillName(name) {
  if (!name || typeof name !== 'string') return null;
  
  // Trim and basic cleanup
  let normalized = name.trim();
  
  // Skip if too short/long
  if (normalized.length < MIN_SKILL_NAME_LENGTH || normalized.length > MAX_SKILL_NAME_LENGTH) {
    return null;
  }
  
  // Skip obvious junk (only special chars, numbers only, etc.)
  if (!/[a-zA-Z]/.test(normalized)) return null;
  
  // Capitalize first letter for consistency
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  
  return normalized;
}

function getProficiencyRank(proficiency) {
  if (!proficiency) return 0;
  const p = proficiency.toLowerCase();
  if (p === 'expert' || p === 'advanced') return 3;
  if (p === 'proficient') return 2;
  if (p === 'working' || p === 'intermediate') return 1;
  return 0;
}

/**
 * Process all proofs to build a deduplicated, weighted skills list.
 * Priority: skills_and_expertise (structured AI) > skills array (legacy fallback)
 */
function processProofsIntoSkills(proofs) {
  if (!proofs || !proofs.length) return [];

  const skillMap = new Map(); // key: normalizedName → { name, proficiency, categories, count, confidences }

  proofs.forEach(proof => {
    const ed = proof.extracted_data;
    if (!ed) return;

    // ── A) skills_and_expertise (new structured format) ──
    const sae = ed.skills_and_expertise;
    if (Array.isArray(sae) && sae.length > 0) {
      sae.forEach(skillObj => {
        // Validate it's an object with name property
        if (!skillObj || typeof skillObj !== 'object' || !skillObj.name) return;
        
        const conf = typeof skillObj.confidence === 'number' ? skillObj.confidence : 0;
        if (conf < MIN_CONFIDENCE_FOR_SKILL) return;
        
        const normalizedName = normalizeSkillName(skillObj.name);
        if (!normalizedName) return;
        
        const key = normalizedName.toLowerCase(); // case-insensitive dedup key
        const cat = skillObj.category || 'unknown';
        const prof = skillObj.proficiency || 'mentioned';
        const existing = skillMap.get(key);

        if (existing) {
          existing.count++;
          existing.confidences.push(conf);
          // Take highest proficiency
          if (getProficiencyRank(prof) > getProficiencyRank(existing.proficiency)) {
            existing.proficiency = prof;
          }
          if (!existing.categories.includes(cat)) {
            existing.categories.push(cat);
          }
        } else {
          skillMap.set(key, {
            name: normalizedName, // Use normalized form as display name
            proficiency: prof,
            categories: [cat],
            count: 1,
            confidences: [conf]
          });
        }
      });
    }

    // ── B) skills array (legacy flat list) — only used if A returned nothing ──
    if ((!sae || sae.length === 0) && Array.isArray(ed.skills) && ed.skills.length > 0) {
      ed.skills.forEach(skillName => {
        if (typeof skillName !== 'string') return;
        const normalized = normalizeSkillName(skillName);
        if (!normalized) return;
        
        const key = normalized.toLowerCase();
        if (!skillMap.has(key)) {
          skillMap.set(key, {
            name: normalized,
            proficiency: 'mentioned',
            categories: ['unknown'],
            count: 1,
            confidences: [0.5]
          });
        }
      });
    }
  });

  // Convert map to array, compute final score, sort, return top 15
  return Array.from(skillMap.values())
    .map(skill => ({
      ...skill,
      avgConfidence: skill.confidences.reduce((s, c) => s + c, 0) / skill.confidences.length,
      // Weighted score: avg confidence * (1 + small bonus for multiple mentions)
      weightedScore: (
        (skill.confidences.reduce((s, c) => s + c, 0) / skill.confidences.length) *
        (1 + Math.min((skill.count - 1) * 0.05, 0.15))
      )
    }))
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 15);
}



// END SKILLS PROCESSING ENGINE


const Portfolio = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest first');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [error, setError] = useState(null);
  const [showBotTooltip, setShowBotTooltip] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pdfLoadErrors, setPdfLoadErrors] = useState({});

  /* MOCK DATA - Commented out for future AI agents feature
  const aiAgents = [
    {
      id: 'ai1',
      type: 'AI Agent',
      name: 'DefiScan Pro',
      subtitle: 'DeFi Analytics · GPT-4o',
      description: 'Real-time portfolio risk assessments, yield optimization, and protocol safety scores on Solana.',
      badge: 'Superteam',
      isLive: true,
      metrics: { 
        queries: '8.4k',
        queriesLabel: 'queries/mo',
        accuracy: '94%',
        accuracyLabel: 'accuracy'
      },
      tags: ['Risk scoring', 'Yield analysis', 'NL queries'],
      footer: {
        wallet: '7x9k...mN2p',
        date: 'Feb 2025'
      },
      gradient: 'from-purple-900 via-purple-800 to-purple-900'
    },
    {
      id: 'ai2',
      type: 'AI Agent',
      name: 'AuditBot v2',
      subtitle: 'Smart Contact AUdit · Claude 3.5',
      description: 'Automated security audits for Solidity and Rust contracts. Finds vulnerabilities, writes reports.',
      badge: 'Solana Fdn',
      isLive: true,
      metrics: { 
        audits: '2.1k',
        auditsLabel: 'audits',
        bugs: '312',
        bugsLabel: 'bugs found'
      },
      tags: ['Reentrancy', 'Access control', 'PDF report'],
      footer: {
        wallet: '3x9k...mN2p',
        date: 'Feb 2025'
      },
      gradient: 'from-teal-900 via-teal-800 to-teal-900'
    },
    {
      id: 'ai3',
      type: 'AI Agent',
      name: 'Web3Scribe',
      subtitle: 'Content Generation · GPT-4o',
      description: 'Generates Twitter threads, blog posts, and Discord announcements for Web3 protocols and DAOs.',
      badge: null,
      isLive: true,
      metrics: { 
        audits: '2.1k',
        auditsLabel: 'audits',
        bugs: '312',
        bugsLabel: 'bugs found'
      },
      tags: ['Threads', 'Blog posts', 'Discord'],
      footer: {
        wallet: '3x9k...mN2p',
        date: 'Feb 2025'
      },
      gradient: 'from-blue-900 via-purple-900 to-purple-900'
    }
  ];
  */

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setLoading(true);
        
        // Check if viewing another user's portfolio via ?id= parameter
        const urlParams = new URLSearchParams(window.location.search);
        const viewingUserId = urlParams.get('id');
        
        if (viewingUserId) {
          // Viewing another user's portfolio (public view)
          const userProfile = await getProfileById(viewingUserId);
          if (!userProfile) {
            setError('User not found');
            setLoading(false);
            return;
          }
          
          setProfile(userProfile);
          setUser({ id: viewingUserId, email: userProfile.users?.email }); // Set minimal user object
          
          const userProofs = await getUserProofs(viewingUserId);
          setProofs(userProofs || []);
        } else {
          // Viewing own portfolio (requires login)
          const currentUser = await getCurrentUser();
          if (!currentUser) {
            setError('Please log in to view your portfolio');
            setLoading(false);
            router.push('/login');
            return;
          }
          
          setUser(currentUser);
          const userProfile = await getProfile(currentUser.id);
          setProfile(userProfile);
          
          const userProofs = await getUserProofs(currentUser.id);
          setProofs(userProofs || []);
        }
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };
    
    loadPortfolioData();
  }, [router]);

  // Get all smart tags from proofs and count occurrences
  const smartTagCounts = useMemo(() => {
    const tagMap = new Map();
    proofs.forEach(proof => {
      const tags = proof.extracted_data?.smart_tags || [];
      tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    // Only include tags that appear in 2+ proofs
    return new Map([...tagMap.entries()].filter(([_, count]) => count >= 2));
  }, [proofs]);

  // Build filter tabs: 'All' + tags with 2+ occurrences
  const filterTabs = useMemo(() => {
    const tabs = ['All'];
    const tagNames = Array.from(smartTagCounts.keys()).sort();
    return [...tabs, ...tagNames];
  }, [smartTagCounts]);

  // Filter proofs by selected tag
  const filteredProofs = useMemo(() => {
    if (activeFilter === 'All') return proofs;
    return proofs.filter(p => {
      const tags = p.extracted_data?.smart_tags || [];
      return tags.includes(activeFilter);
    });
  }, [proofs, activeFilter]);
  // Sort proofs
  const sortedProofs = useMemo(() => {
    return [...filteredProofs].sort((a, b) => {
      if (sortBy === 'Newest first') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'Oldest first') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return 0;
    });
  }, [filteredProofs, sortBy]);

  
  // ── REPLACED: Old flat `skills` array with AI-powered weighted skills ──
  // Original:
  //   const skills = proofs
  //     .filter(p => p.extracted_data?.skills)
  //     .flatMap(p => Array.isArray(p.extracted_data.skills) ? p.extracted_data.skills : [p.extracted_data.skills])
  //     .filter((skill, index, self) => skill && self.indexOf(skill) === index)
  //     .slice(0, 10);
  //
  // New: uses processProofsIntoSkills() that reads skills_and_expertise + legacy fallback
  const skills = useMemo(() => processProofsIntoSkills(proofs), [proofs]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getPortfolioUrl = () => {
    // Get the current user ID from URL params or user state
    const urlParams = new URLSearchParams(window.location.search);
    const viewingUserId = urlParams.get('id');
    const userId = viewingUserId || user?.id;
    
    if (userId) {
      return `${window.location.origin}/portfolio?id=${userId}`;
    }
    return window.location.href;
  };

  const handleSharePortfolio = () => {
    const portfolioUrl = getPortfolioUrl();
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareLink = () => {
    const filterTag = activeFilter === 'All' ? 'all' : activeFilter.toLowerCase().replace(' ', '');
    const username = profile?.display_name?.toLowerCase().replace(/\s+/g, '') || user?.id?.slice(0, 8) || 'user';
    return `ghonsiproof.com/${username}?tag=${filterTag}`;
  };
  
  const truncateAddress = (address) => {
    if (!address || address === 'Not connected') return 'Not connected';
    return `${address.slice(0, 4)}•${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-28 px-5">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Skeleton */}
          <div className="lg:hidden">
            {/* Profile Card */}
            <div className="mb-8 animate-pulse">
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#151925] rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="h-8 bg-gray-700/50 rounded-md w-32"></div>
                    <div className="h-8 bg-gray-700/50 rounded-md w-28"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                    <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                    <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8 animate-pulse">
              <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]">
                <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
              </div>
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#151925] rounded-[14px] p-6">
                  <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-8 animate-pulse">
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                <div className="bg-[#111625] rounded-xl p-5">
                  <div className="h-5 bg-gray-700/50 rounded w-32 mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-7 bg-gray-700/50 rounded-full w-20"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 animate-pulse">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-700/50 rounded-full w-24 flex-shrink-0"></div>
                ))}
              </div>
            </div>

            {/* Sort and Count */}
            <div className="flex flex-col gap-3 mb-6 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-48"></div>
              <div className="h-10 bg-gray-700/50 rounded w-full"></div>
            </div>

            {/* Proofs Grid */}
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#151925] rounded-2xl overflow-hidden border border-[#C19A4A]/20">
                  <div className="h-64 bg-gray-700/50"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-32 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-4"></div>
                    <div className="bg-[#0B0F1B] rounded-lg p-3 border border-[#C19A4A]/20">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_400px] lg:gap-6">
            {/* Left Column */}
            <div>
              {/* Profile Card */}
              <div className="mb-8 animate-pulse">
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                  <div className="bg-[#151925] rounded-2xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-7 bg-gray-700/50 rounded w-1/2 mb-2"></div>
                        <div className="h-5 bg-gray-700/50 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="h-8 bg-gray-700/50 rounded-md w-40"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-32"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                      <div className="h-8 bg-gray-700/50 rounded-md w-10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]">
                  <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                </div>
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                  <div className="bg-[#151925] rounded-[14px] p-6">
                    <div className="h-10 bg-gray-700/50 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-24 mx-auto"></div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="animate-pulse">
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                  <div className="bg-[#111625] rounded-xl p-5">
                    <div className="h-5 bg-gray-700/50 rounded w-32 mb-3"></div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-7 bg-gray-700/50 rounded-full w-20"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Proofs - Full width below */}
          <div className="mt-8">
            {/* Filter Tabs */}
            <div className="mb-6 animate-pulse">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-gray-700/50 rounded-full w-28 flex-shrink-0"></div>
                ))}
              </div>
            </div>

            {/* Sort and Count */}
            <div className="flex items-center justify-between mb-6 animate-pulse">
              <div className="h-4 bg-gray-700/50 rounded w-48"></div>
              <div className="h-10 bg-gray-700/50 rounded w-40"></div>
            </div>

            {/* Proofs Grid - 3 columns desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#151925] rounded-2xl overflow-hidden border border-[#C19A4A]/20">
                  <div className="h-64 bg-gray-700/50"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-32 mb-3"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-4"></div>
                    <div className="bg-[#0B0F1B] rounded-lg p-3 border border-[#C19A4A]/20">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                          <div className="h-8 bg-gray-700/50 rounded w-12"></div>
                          <div className="h-8 bg-gray-700/50 rounded w-8"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Action Bar */}
          <div className="fixed bottom-2 left-3 right-3 z-50 animate-pulse">
            <div className="w-full max-w-7xl mx-auto relative p-[2px] rounded-xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
              <div className="bg-[#1C1C1C]/95 backdrop-blur-md p-2 rounded-xl flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-700/50 rounded w-48 mb-1"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-64"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-700/50 rounded-lg w-32"></div>
                  <div className="h-9 bg-gray-700/50 rounded-lg w-32"></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Bot Button */}
          <div className="fixed bottom-24 right-6 z-50 animate-pulse">
            <div className="w-14 h-14 bg-gray-700/50 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-28 px-5">
      <div className="max-w-7xl mx-auto">
        
        {/* Desktop: Two-column layout | Mobile: Stack vertically */}
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-6">

        {/* File Viewer Modal (PDF / image) */}
        {selectedFile && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedFile(null)}
          >
            <div
              className="relative max-w-[90vw] max-h-[85vh] bg-[#111625] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d1020]">
                <div className="flex items-center gap-2">
                  <FileCheck size={14} className="text-blue-400" />
                  <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                    {selectedFile.proof_name || 'Document'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedFile.file_ipfs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold hover:bg-blue-500/20 transition-colors"
                  >
                    <ExternalLink size={11} /> Open
                  </a>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Content */}
              {selectedFile.file_ipfs_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={selectedFile.file_ipfs_url}
                  alt="Proof document"
                  className="max-h-[75vh] w-auto object-contain"
                />
              ) : selectedFile.file_ipfs_url?.match(/\.pdf$/i) ? (
                <iframe
                  src={selectedFile.file_ipfs_url}
                  className="w-[85vw] h-[75vh] max-w-4xl"
                  title="Proof PDF"
                />
              ) : (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                  <FileCheck size={32} className="text-gray-600" />
                  <p className="text-sm">Preview not available for this file type.</p>
                  <a
                    href={selectedFile.file_ipfs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={11} /> Open file directly
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata JSON Modal */}
        {selectedProof && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="bg-[#0d1020] rounded-[14px] flex flex-col overflow-hidden max-h-[85vh]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#C19A4A]/15 border border-[#C19A4A]/30 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-[#C19A4A]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{selectedProof.proof_name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {selectedProof.metadata_ipfs_url ? 'IPFS Metadata JSON' : 'Extracted Data'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedProof.extracted_data && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(selectedProof.extracted_data, null, 2));
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C19A4A]/10 border border-[#C19A4A]/20 text-[#C19A4A] text-[11px] font-semibold hover:bg-[#C19A4A]/20 transition-colors"
                        >
                          <Copy size={12} /> Copy
                        </button>
                      )}
                      {selectedProof.metadata_ipfs_url && (
                        <a
                          href={selectedProof.metadata_ipfs_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold hover:bg-blue-500/20 transition-colors"
                        >
                          <ExternalLink size={12} /> IPFS
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedProof(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* JSON Body */}
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {selectedProof.extracted_data ? (
                      <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words text-gray-300">
                        {JSON.stringify(selectedProof.extracted_data, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                          <FileText size={22} className="text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-sm">No metadata available for this proof.</p>
                        <p className="text-gray-600 text-xs">Upload a document to generate extracted metadata.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Profile Section - Full width mobile, left column desktop */}
        <div className="mb-8 lg:mb-0">
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
          <div className="bg-[#151925] rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || 'Profile'} className="w-16 h-16 rounded-full object-cover border-2 border-[#C19A4A] flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 bg-[#C19A4A] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{profile?.display_name || 'User Profile'}</h1>
              <p className="text-gray-400 mb-4 font-normal">{profile?.headline || 'Web3 Professional'}</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {profile?.bio || 'Building the future of decentralized applications.'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
            {(user?.email || profile?.email) && (
              <div className="flex items-center gap-1.5 bg-[#0B0F1B] rounded-md px-3 py-1.5">
                <Mail size={14} className="text-[#C19A4A] flex-shrink-0" />
                <span className="text-gray-300 font-normal">{user?.email || profile?.email}</span>
              </div>
            )}
            {profile?.wallet_address && profile.wallet_address !== 'Not connected' && (
              <div className="flex items-center gap-1.5 bg-[#0B0F1B] rounded-md px-3 py-1.5">
                <Wallet size={14} className="text-[#C19A4A] flex-shrink-0" />
                <span className="text-[#C19A4A] font-normal">{truncateAddress(profile.wallet_address)}</span>
                <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {profile?.social_links?.twitter && (
              <a
                href={profile.social_links.twitter.startsWith('http') ? profile.social_links.twitter : `https://twitter.com/${profile.social_links.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#0B0F1B] rounded-md px-3 py-1.5 hover:bg-[#0B0F1B]/80 transition-colors"
              >
                <FontAwesomeIcon icon={faXTwitter} className="w-[14px] h-[14px] text-[#C19A4A]" />
              </a>
            )}
            {profile?.social_links?.linkedin && (
              <a
                href={profile.social_links.linkedin.startsWith('http') ? profile.social_links.linkedin : `https://linkedin.com/in/${profile.social_links.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#0B0F1B] rounded-md px-3 py-1.5 hover:bg-[#0B0F1B]/80 transition-colors"
              >
                <FontAwesomeIcon icon={faLinkedinIn} className="w-[14px] h-[14px] text-[#C19A4A]" />
              </a>
            )}
            {profile?.social_links?.github && (
              <a
                href={profile.social_links.github.startsWith('http') ? profile.social_links.github : `https://github.com/${profile.social_links.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#0B0F1B] rounded-md px-3 py-1.5 hover:bg-[#0B0F1B]/80 transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} className="w-[14px] h-[14px] text-[#C19A4A]" />
              </a>
            )}
            {profile?.social_links?.website && (
              <a
                href={profile.social_links.website.startsWith('http') ? profile.social_links.website : `https://${profile.social_links.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#0B0F1B] rounded-md px-3 py-1.5 hover:bg-[#0B0F1B]/80 transition-colors"
              >
                <LinkIcon size={14} className="text-[#C19A4A]" />
              </a>
            )}
          </div>
          </div>
        </div>
        </div>

        {/* Stats + Skills - Stack mobile, right sidebar desktop */}
        <div className="space-y-6 mb-8 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Proofs */}
          <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{proofs.length}</div>
              <div className="text-sm text-gray-400">Total Proofs</div>
            </div>
          </div>

          {/* Verifiable */}
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
            <div className="bg-[#151925] rounded-[14px] p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{proofs.length}</div>
                <div className="text-sm text-gray-400">Verifiable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Expertise Section */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
          <div className="bg-[#111625] rounded-xl p-5">
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-[#C19A4A] to-[#d9b563] rounded-full" />
              Skills & Expertise
            </h2>
            <p className="text-[10px] text-gray-500 mb-3 pl-3">
              {skills.length > 0 ? 'AI extracted from your documents' : 'Upload proofs to enable AI extraction'}
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? skills.map((skill, index) => (
                <span key={index}
                  className="text-xs text-[#C19A4A] bg-[#1A1F2E] border border-[#C19A4A]/20 px-3 py-1.5 rounded-full hover:bg-[#C19A4A]/10 transition-colors">
                  {skill.name}
                </span>
              )) : (
                <span className="text-xs text-gray-600 italic">No skills detected yet</span>
              )}
            </div>
          </div>
        </div>
        </div>
        </div>

        {/* Filters and Proofs - Full width below */}
        <div className="mt-8">
        {/* Filter Tabs */}
        <div className="overflow-x-auto pb-2 -mx-5 px-5 mt-[35px]">
          <div className="flex gap-3 min-w-max">
            {filterTabs.map((filter) => {
              const count = filter === 'All' ? proofs.length : smartTagCounts.get(filter) || 0;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeFilter === filter
                      ? 'bg-[#C19A4A] text-[#0B0F1B]'
                      : 'bg-[#151925] text-white hover:bg-[#1a1f2e]'
                  }`}
                >
                  {filter}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeFilter === filter
                      ? 'bg-[#0B0F1B]/20 text-[#0B0F1B]'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort and Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p className="text-gray-400 text-sm">
            Showing {sortedProofs.length} proofs — {activeFilter === 'All' ? 'All Work' : activeFilter}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#151925] text-white px-4 py-2 rounded-lg border border-[#C19A4A]/30 text-sm cursor-pointer w-full sm:w-auto"
          >
            <option>Newest first</option>
            <option>Oldest first</option>
          </select>
        </div>

        {/* Proofs Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedProofs.length === 0 ? (
            <div className="bg-[#151925] rounded-2xl p-12 text-center border border-[#C19A4A]/20">
              <FileText size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Proofs Yet</h3>
              <p className="text-gray-400 mb-6">Start building your on-chain portfolio by uploading your first proof.</p>
              <button
                onClick={() => router.push('/upload')}
                className="px-6 py-3 bg-[#C19A4A] text-[#0B0F1B] rounded-lg font-semibold hover:bg-[#d4af37] transition-colors"
              >
                Upload Your First Proof
              </button>
            </div>
          ) : (
            sortedProofs.map((proof) => (
              <div
                key={proof.id}
                className="bg-[#151925] rounded-2xl overflow-hidden border border-[#C19A4A]/20 hover:border-[#C19A4A]/50 transition-all"
              >
                {/* Proof Image */}
                {(proof.file_ipfs_url || proof.files?.[0]?.file_url) && (
                  <div className="relative h-64 bg-gradient-to-br from-[#1a1f2e] to-[#0B0F1B] overflow-hidden">
                    {(proof.files?.[0]?.mime_type?.includes('image') || proof.file_ipfs_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                      <img 
                        src={proof.files?.[0]?.file_url || proof.file_ipfs_url} 
                        alt={proof.proof_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (proof.files?.[0]?.mime_type?.includes('pdf') || proof.file_ipfs_url?.match(/\.pdf$/i)) ? (
                      !pdfLoadErrors[proof.id] ? (
                        <div className="relative w-full h-full">
                          <iframe 
                            key={`pdf-${proof.id}`}
                            src={`${proof.files?.[0]?.file_url || proof.file_ipfs_url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full pointer-events-none border-0"
                            title={proof.proof_name}
                            onLoad={(e) => {
                              // Check if iframe loaded successfully
                              try {
                                if (!e.target.contentDocument && !e.target.contentWindow) {
                                  setPdfLoadErrors(prev => ({ ...prev, [proof.id]: true }));
                                }
                              } catch (err) {
                                // Cross-origin or load error
                                setPdfLoadErrors(prev => ({ ...prev, [proof.id]: true }));
                              }
                            }}
                            onError={() => setPdfLoadErrors(prev => ({ ...prev, [proof.id]: true }))}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#1a1f2e] to-[#0B0F1B]">
                          <div className="text-center">
                            <div className="relative inline-block">
                              <FileText size={56} className="text-[#C19A4A] mb-3" />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">PDF</span>
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm font-medium">{proof.proof_name}</p>
                            <p className="text-gray-600 text-xs mt-1">Click PDF button to view</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileText size={48} className="text-gray-600" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#C19A4A] text-[#0B0F1B] rounded-full text-xs font-bold">
                      <span className="w-2 h-2 bg-[#0B0F1B] rounded-full"></span>
                      {proof.proof_type?.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                )}

                {/* Proof Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2">{proof.proof_name}</h3>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar size={14} /> {new Date(proof.created_at).toLocaleDateString()}
                    </span>
                    {proof.status === 'verified' && (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle size={14} /> Verified
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                    {proof.summary || 'No description provided.'}
                  </p>

                  {/* Smart Tags */}
                  {proof.extracted_data?.smart_tags && proof.extracted_data.smart_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {proof.extracted_data.smart_tags.slice(0, 5).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 bg-[#C19A4A]/10 border border-[#C19A4A]/30 rounded-full text-[#C19A4A] text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {proof.extracted_data.smart_tags.length > 5 && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-white/5 border border-white/20 rounded-full text-gray-400 text-[10px] font-medium">
                          +{proof.extracted_data.smart_tags.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Actions Bar - Matching the image design */}
                  <div className="bg-[#0B0F1B] rounded-lg p-3 border border-[#C19A4A]/20">
                    <div className="flex items-center justify-between gap-2">
                      {/* On-chain section */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-gray-400 text-xs whitespace-nowrap">🔗 On-chain:</span>
                        {proof.blockchain_tx ? (
                          <a
                            href={`https://solscan.io/tx/${proof.blockchain_tx}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#C19A4A] font-mono text-xs hover:underline truncate"
                          >
                            {proof.blockchain_tx.slice(0, 8)}...{proof.blockchain_tx.slice(-6)}
                          </a>
                        ) : (
                          <span className="text-gray-500 text-xs">Not submitted</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* PDF Button */}
                        {(proof.file_ipfs_url || proof.files?.[0]?.file_url) && (
                          <button
                            onClick={() => setSelectedFile({
                              file_ipfs_url: proof.files?.[0]?.file_url || proof.file_ipfs_url,
                              mime_type: proof.files?.[0]?.mime_type,
                              proof_name: proof.proof_name
                            })}
                            className="flex items-center gap-1 px-2 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors shrink-0"
                            title="View uploaded document"
                          >
                            <FileText size={14} />
                            <span className="text-[10px] font-semibold hidden sm:inline">PDF</span>
                          </button>
                        )}

                        {/* JSON Button */}
                        {(proof.metadata_ipfs_url || proof.extracted_data) && (
                          <button
                            onClick={() => setSelectedProof(proof)}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors shrink-0 ${
                              proof.metadata_ipfs_url || proof.extracted_data
                                ? 'text-[#C19A4A] bg-[#C19A4A]/10 border border-[#C19A4A]/20 hover:bg-[#C19A4A]/20'
                                : 'text-gray-600 bg-white/5 cursor-default'
                            }`}
                            title="View metadata JSON"
                          >
                            <FileText size={14} />
                            <span className="text-[10px] font-semibold hidden sm:inline">JSON</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this proof?')) {
                              // Add delete functionality here
                              console.log('Delete proof:', proof.id);
                            }
                          }}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          title="Delete proof"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>

        {/* Floating action bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }} className="fixed bottom-2 left-3 right-3 z-50">
          <div className="w-full max-w-7xl mx-auto relative p-[2px] rounded-xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
            <div className="bg-[#1C1C1C]/95 backdrop-blur-md p-2 rounded-xl shadow-2xl flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white">Ready to Build Your Portfolio?</h4>
                <p className="text-[11px] text-gray-400 truncate">Start uploading your proofs and build your on-chain reputation</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleSharePortfolio}
                  className="px-3 py-2 rounded-lg border border-[#C19A4A] text-[#C19A4A] text-xs font-semibold hover:bg-[#C19A4A]/10 transition-colors flex items-center gap-1.5">
                  {copied ? (
                    <>
                      <CheckCircle size={14} />
                      <span className="hidden sm:inline">Copied!</span>
                      <span className="sm:hidden">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span className="hidden sm:inline">Share Portfolio</span>
                      <span className="sm:hidden">Share</span>
                    </>
                  )}
                </button>
                <button onClick={() => router.push('/upload')}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-black text-xs font-semibold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all flex items-center gap-1.5">
                  <Plus size={14} />
                  <span className="hidden sm:inline">Add New Proof</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Bot Assistant - Fixed position bottom right */}
        <div className="fixed bottom-24 right-6 z-50">
          <div className="relative">
            {/* Tooltip */}
            {showBotTooltip && (
              <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-[#1C1C1C] border border-[#C19A4A]/30 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-sm text-white font-medium">Hi, How can I help you today?</p>
                <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-[#1C1C1C] border-r border-b border-[#C19A4A]/30"></div>
              </div>
            )}
            
            {/* Bot Button */}
            <button
              onClick={() => router.push('/professionals/mini-them-control')}
              onMouseEnter={() => setShowBotTooltip(true)}
              onMouseLeave={() => setShowBotTooltip(false)}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(193,154,74,0.6)] transition-all duration-300 hover:scale-110 group"
            >
              <Player
                autoplay
                loop
                src="/assets/animations/lottie_transparent.json"
                style={{ width: 100, height: 100 }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;