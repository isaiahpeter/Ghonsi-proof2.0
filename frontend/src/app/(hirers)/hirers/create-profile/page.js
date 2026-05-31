'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Building2, Briefcase, Shield, FileText, 
  Upload, Check, ChevronDown, X, CheckCircle2, Globe, MapPin, Users, Clock
} from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { createHirerProfile, getHirerProfile, updateHirerProfile } from '@/utils/hirerProfileApi';
import { supabase } from '@/lib/supabaseClient';

function CreateProfileHirers() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: null,
    website: '',
    companySize: '',
    location: '',
    timezone: '',
    description: '',
    skills: [],
    engagementTypes: [],
    kycVerified: false
  });
  
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [isCompanySizeOpen, setIsCompanySizeOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [customSkills, setCustomSkills] = useState({});

  const totalSteps = 4;

  // Load existing profile data on mount
  useEffect(() => {
    const loadHirerProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const profile = await getHirerProfile(user.id);
        
        if (profile) {
          // Profile exists - populate form with existing data
          setIsEditMode(true);
          setExistingProfileId(profile.id);
          
          setFormData({
            companyName: profile.company_name || '',
            companyLogo: null,
            website: profile.website || '',
            companySize: profile.company_size || '',
            location: profile.location || '',
            timezone: profile.timezone || '',
            description: profile.description || '',
            skills: profile.skills || [],
            engagementTypes: profile.engagement_types || [],
            kycVerified: profile.kyc_verified || false
          });

          // Load logo if exists
          if (profile.logo_url) {
            setLogoPreview(profile.logo_url);
          }
        }
      } catch (error) {
        console.error('Error loading hirer profile:', error);
      }
    };
    loadHirerProfile();
  }, []);

  // Company sizes
  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  // Timezones
  const timezones = [
    'UTC-12:00 (Baker Island)',
    'UTC-11:00 (American Samoa)',
    'UTC-10:00 (Hawaii)',
    'UTC-09:00 (Alaska)',
    'UTC-08:00 (Pacific Time)',
    'UTC-07:00 (Mountain Time)',
    'UTC-06:00 (Central Time)',
    'UTC-05:00 (Eastern Time)',
    'UTC-04:00 (Atlantic Time)',
    'UTC-03:00 (Buenos Aires, São Paulo)',
    'UTC-02:00 (Mid-Atlantic)',
    'UTC-01:00 (Azores)',
    'UTC+00:00 (London, Dublin)',
    'UTC+01:00 (Paris, Berlin, Lagos)',
    'UTC+02:00 (Cairo, Johannesburg)',
    'UTC+03:00 (Moscow, Nairobi)',
    'UTC+04:00 (Dubai)',
    'UTC+05:00 (Pakistan)',
    'UTC+05:30 (India, Sri Lanka)',
    'UTC+06:00 (Bangladesh)',
    'UTC+07:00 (Bangkok, Jakarta)',
    'UTC+08:00 (Singapore, Beijing)',
    'UTC+09:00 (Tokyo, Seoul)',
    'UTC+10:00 (Sydney)',
    'UTC+11:00 (Solomon Islands)',
    'UTC+12:00 (New Zealand)'
  ];

  // Job categories with skills
  const jobCategoriesWithSkills = {
    'Engineering': ['JavaScript / TypeScript', 'React / Next.js', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'C / C++', 'SQL', 'GraphQL', 'REST API design', 'System design', 'Microservices', 'Mobile (iOS / Android)', 'Testing & QA', 'Others'],
    'Design': ['UI Design', 'UX Research', 'Figma', 'Prototyping', 'Design Systems', 'Motion / Animation', 'Brand Identity', 'Illustration', '3D Design', 'User Testing', 'Accessibility (a11y)', 'Framer', 'Others'],
    'Marketing': ['SEO / SEM', 'Content Marketing', 'Email Marketing', 'Paid Ads (Meta / Google)', 'Social Media Management', 'Influencer Marketing', 'Marketing Analytics', 'Brand Strategy', 'Copywriting', 'Growth Hacking', 'CRM / HubSpot', 'Others'],
    'Product': ['Product Strategy', 'Roadmap Planning', 'User Story Writing', 'Agile / Scrum', 'Wireframing', 'A/B Testing', 'Stakeholder Management', 'OKR Setting', 'Competitor Analysis', 'Customer Discovery', 'Jira / Linear', 'Others'],
    'Data & AI': ['Data Analysis', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Python (Pandas / NumPy)', 'SQL', 'Data Visualization', 'Tableau / Power BI', 'Statistics', 'Prompt Engineering', 'LLM Fine-tuning', 'MLOps', 'Others'],
    'DevOps': ['CI/CD Pipelines', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform / IaC', 'Linux / Bash', 'Monitoring (Datadog / Grafana)', 'Networking', 'Security / DevSecOps', 'Site Reliability Engineering', 'Others'],
    'Web3 / Blockchain': ['Solidity', 'Smart Contracts', 'Ethereum', 'Solana', 'DeFi Protocols', 'NFT Development', 'Web3.js / Ethers.js', 'Hardhat / Foundry', 'Layer 2 (Optimism / Arbitrum)', 'DAO Governance', 'Tokenomics', 'IPFS', 'Others'],
    'Content': ['Copywriting', 'Technical Writing', 'Scriptwriting', 'Blogging', 'Video Production', 'Podcast Production', 'Newsletter Writing', 'Editing & Proofreading', 'Documentation', 'Social Content', 'Ghostwriting', 'Others'],
    'Finance': ['Financial Modeling', 'Accounting', 'Budgeting & Forecasting', 'Fundraising / VC', 'Tax & Compliance', 'Payroll', 'Audit', 'Investment Analysis', 'Excel / Google Sheets', 'QuickBooks / Xero', 'Due Diligence', 'Others'],
    'Legal': ['Contract Drafting', 'IP & Copyright', 'Corporate Law', 'Employment Law', 'Data Privacy (GDPR)', 'Terms & Privacy Policy', 'Regulatory Compliance', 'Litigation', 'Legal Research', 'Nigerian Law', 'International Law', 'Others']
  };

  // Engagement types
  const engagementTypes = [
    'One-off project',
    'Part-time contract',
    'Full-time hire',
    'DAO bounty',
    'Long-term retainer'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, companyLogo: 'File too large. Max size is 2MB.' }));
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
        setErrors(prev => ({ ...prev, companyLogo: 'Invalid file type. Only PNG, JPG, and SVG are allowed.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
        setFormData(prev => ({ ...prev, companyLogo: file }));
        setErrors(prev => ({ ...prev, companyLogo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getCompanyInitials = (name) => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.website.trim()) {
        newErrors.website = 'Website URL is required';
      } else if (!/^https?:\/\/.+\..+/.test(formData.website.trim())) {
        newErrors.website = 'Please enter a valid URL';
      }
      if (!formData.companySize) {
        newErrors.companySize = 'Company size is required';
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      if (!formData.timezone) {
        newErrors.timezone = 'Timezone is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Company description is required';
      } else if (formData.description.trim().length < 50) {
        newErrors.description = 'Description must be at least 50 characters';
      }
    }
    
    if (step === 2) {
      // Check if any skills are selected
      if (formData.skills.length === 0) {
        // No skills selected - validation passes (both fields optional)
        return true;
      }
      
      // Skills are selected - engagement type becomes required
      if (formData.engagementTypes.length === 0) {
        newErrors.engagementTypes = 'Please select at least one engagement type when skills are selected';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step - submit
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('You must be logged in to create a profile');
        }

        let logoUrl = null;

        // Upload logo if provided and it's a new file
        if (formData.companyLogo) {
          const fileExt = formData.companyLogo.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `company-logos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('proof-files')
            .upload(filePath, formData.companyLogo, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload company logo');
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('proof-files')
            .getPublicUrl(filePath);

          logoUrl = publicUrl;
        } else if (logoPreview && !formData.companyLogo) {
          // Keep existing logo URL if no new file uploaded
          logoUrl = logoPreview;
        }

        // Prepare profile data
        const profileData = {
          company_name: formData.companyName,
          company_logo_url: logoUrl,
          website: formData.website,
          company_size: formData.companySize,
          location: formData.location,
          timezone: formData.timezone,
          description: formData.description,
          skills: formData.skills,
          engagement_types: formData.engagementTypes,
          kyc_verified: formData.kycVerified
        };

        // Update existing profile or create new one
        if (isEditMode && existingProfileId) {
          await updateHirerProfile(user.id, profileData);
        } else {
          await createHirerProfile({ user_id: user.id, ...profileData });
        }
        
        setShowSuccess(true);
        
        // Redirect to domain questions after 2 seconds
        setTimeout(() => {
          router.push('/domain-questions');
        }, 2000);
      } catch (error) {
        console.error('Profile save error:', error);
        setSubmitError(error.message || 'Failed to save profile');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKYCVerification = () => {
    // TODO: Implement actual KYC verification flow
    setFormData(prev => ({ ...prev, kycVerified: !prev.kycVerified }));
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white font-sans selection:bg-[#C19A4A] selection:text-black">
      <main className="flex-grow max-w-full mx-auto px-6 py-8">
        <button 
          onClick={() => router.push('/dashboardHirers')} 
          className="inline-flex items-center text-[#C19A4A] text-sm mb-8 hover:underline gap-1 font-light tracking-wide mt-[75px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {!showSuccess && (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-semibold font-[Inter] mb-3 text-white tracking-tight">{isEditMode ? 'Edit Company Profile' : 'Create Company Profile'}</h1>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Set up your company profile to start hiring verified Web3 talent
              </p>
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-start mb-12 w-full px-1">
              {[1, 2, 3, 4].map((step, idx) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2 bg-[#0B0F1B] z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                      step < currentStep ? 'border-[#C19A4A] text-[#C19A4A]' :
                      step === currentStep ? 'bg-[#C19A4A] border-[#C19A4A] text-white' :
                      'border-white/20 text-white/40 bg-[#0B0F1B]'
                    }`}>
                      {step === 1 && <Building2 className="w-4 h-4" />}
                      {step === 2 && <Briefcase className="w-4 h-4" />}
                      {step === 3 && <Shield className="w-4 h-4" />}
                      {step === 4 && <FileText className="w-4 h-4" />}
                    </div>
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold mt-1 ${
                      step <= currentStep ? 'text-[#C19A4A]' : 'text-white/40'
                    }`}>
                      {step === 1 && 'Company'}
                      {step === 2 && 'Hiring Needs'}
                      {step === 3 && 'Verification'}
                      {step === 4 && 'Review'}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`h-[1px] flex-auto mt-4 mx-1 transition-colors duration-500 ${
                      currentStep > step ? 'bg-white' : 'bg-white/10'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-[scaleIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 ring-1 ring-green-500/30 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-semibold text-white mb-3">{isEditMode ? 'Profile Updated!' : 'Company Profile Created!'}</h2>
            <p className="text-white/60 text-sm mb-10 max-w-xs mx-auto leading-relaxed">
              {isEditMode ? 'Your company profile has been successfully updated.' : 'Your company profile is now live. Start posting jobs and finding talent.'}
            </p>
            <button 
              onClick={() => router.push('/dashboardHirers')} 
              className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-bold px-8 py-3.5 rounded-lg shadow-lg shadow-[#C19A4A]/20 transition-all transform hover:scale-105 active:scale-95 w-full max-w-xs flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Company Identity */}
            {currentStep === 1 && (
              <div className="animate-[fadeIn_0.4s_ease-in-out]">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-white mb-1">Company Identity</h2>
                  <p className="text-xs text-white/50 font-light">Tell us about your company and what you do.</p>
                </div>

                <div className="space-y-6">
                  {/* Company Name & Logo Preview */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">
                      Company Name *
                    </label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter your company name"
                      className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all ${
                        errors.companyName ? 'border-red-500 animate-[shake_0.5s]' : 'border-white/20'
                      }`}
                    />
                    {errors.companyName && <span className="text-red-500 text-[10px] mt-1 block">{errors.companyName}</span>}
                    
                    {/* Logo Preview with Initials */}
                    {formData.companyName && !logoPreview && (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center text-white font-bold text-xl">
                          {getCompanyInitials(formData.companyName)}
                        </div>
                        <span className="text-xs text-white/40">Company logo preview</span>
                      </div>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-4">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex-shrink-0 hover:border-[#C19A4A]/50 transition-colors cursor-pointer group relative overflow-hidden bg-cover bg-center"
                        style={logoPreview ? { backgroundImage: `url(${logoPreview})` } : {}}
                        onClick={() => document.getElementById('logoInput').click()}
                      >
                        {!logoPreview && formData.companyName && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C19A4A] to-[#d9b563] text-white font-bold text-lg">
                            {getCompanyInitials(formData.companyName)}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="logoInput"
                          className="hidden"
                          accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                          onChange={handleLogoUpload}
                        />
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('logoInput').click()} 
                          className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-xs font-semibold px-5 py-2.5 rounded transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          Upload Logo <Upload className="w-3 h-3" />
                        </button>
                        <p className="text-[10px] text-white/40 mt-2.5 font-light">
                          PNG, JPG or SVG. Max size 2MB
                        </p>
                        {errors.companyLogo && <p className="text-red-500 text-[10px] mt-1">{errors.companyLogo}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Website & Company Size */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">
                        Website URL *
                      </label>
                      <div className="flex items-center bg-transparent border rounded-lg overflow-hidden focus-within:border-[#C19A4A] focus-within:ring-1 focus-within:ring-[#C19A4A] transition-all">
                        <span className="px-3 py-3 text-sm text-white/40 bg-white/5 border-r border-white/10 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                        </span>
                        <input
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          type="text"
                          placeholder="https://yourcompany.com"
                          className={`flex-1 bg-transparent py-3 px-4 text-sm text-white placeholder-white/50 outline-none ${
                            errors.website ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      {errors.website && <span className="text-red-500 text-[10px] mt-1 block">{errors.website}</span>}
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">
                        Company Size *
                      </label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsCompanySizeOpen(!isCompanySizeOpen)} 
                          className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white cursor-pointer flex justify-between items-center hover:border-[#C19A4A]/50 transition-colors ${
                            errors.companySize ? 'border-red-500' : 'border-white/20'
                          }`}
                        >
                          <span className={`flex items-center gap-2 ${formData.companySize ? 'text-white' : 'text-white/50'}`}>
                            <Users className="w-4 h-4" />
                            {formData.companySize || 'Select company size'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isCompanySizeOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {isCompanySizeOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-[#0B0F1B] border border-white/20 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                            {companySizes.map(size => (
                              <div 
                                key={size} 
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, companySize: size }));
                                  setIsCompanySizeOpen(false);
                                  if (errors.companySize) setErrors(prev => ({ ...prev, companySize: '' }));
                                }} 
                                className="px-4 py-3 text-sm text-white hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
                              >
                                {size}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.companySize && <span className="text-red-500 text-[10px] mt-1 block">{errors.companySize}</span>}
                    </div>
                  </div>

                  {/* Location & Timezone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">
                        Location *
                      </label>
                      <div className="flex items-center bg-transparent border rounded-lg overflow-hidden focus-within:border-[#C19A4A] focus-within:ring-1 focus-within:ring-[#C19A4A] transition-all">
                        <span className="px-3 py-3 text-sm text-white/40 bg-white/5 border-r border-white/10 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                        </span>
                        <input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          type="text"
                          placeholder="City, Country"
                          className={`flex-1 bg-transparent py-3 px-4 text-sm text-white placeholder-white/50 outline-none ${
                            errors.location ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      {errors.location && <span className="text-red-500 text-[10px] mt-1 block">{errors.location}</span>}
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">
                        Timezone *
                      </label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsTimezoneOpen(!isTimezoneOpen)} 
                          className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white cursor-pointer flex justify-between items-center hover:border-[#C19A4A]/50 transition-colors ${
                            errors.timezone ? 'border-red-500' : 'border-white/20'
                          }`}
                        >
                          <span className={`flex items-center gap-2 ${formData.timezone ? 'text-white' : 'text-white/50'}`}>
                            <Clock className="w-4 h-4" />
                            {formData.timezone || 'Select timezone'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isTimezoneOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {isTimezoneOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-[#0B0F1B] border border-white/20 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                            {timezones.map(tz => (
                              <div 
                                key={tz} 
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, timezone: tz }));
                                  setIsTimezoneOpen(false);
                                  if (errors.timezone) setErrors(prev => ({ ...prev, timezone: '' }));
                                }} 
                                className="px-4 py-3 text-sm text-white hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
                              >
                                {tz}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.timezone && <span className="text-red-500 text-[10px] mt-1 block">{errors.timezone}</span>}
                    </div>
                  </div>

                  {/* Company Description */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">
                      Company Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Tell us about your company, your mission, and what makes you unique..."
                      maxLength="500"
                      className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all resize-none ${
                        errors.description ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    <div className="flex justify-between mt-1.5">
                      {errors.description && <span className="text-red-500 text-[10px]">{errors.description}</span>}
                      <div className="text-[10px] text-white/40 ml-auto">{formData.description.length}/500 characters</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Hiring Needs */}
            {currentStep === 2 && (
              <div className="animate-[fadeIn_0.4s_ease-in-out]">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-white mb-1">Hiring Needs</h2>
                  <p className="text-xs text-white/50 font-light">What type of talent are you looking for?</p>
                </div>

                <div className="space-y-8">
                  {/* Skills by Category */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-3">
                      Skills by Category *
                    </label>
                    <p className="text-xs text-white/40 mb-4">Select categories and choose specific skills you're looking for</p>
                    
                    <div className="space-y-3">
                      {Object.keys(jobCategoriesWithSkills).map(category => {
                        const isExpanded = expandedCategory === category;
                        const categorySkills = jobCategoriesWithSkills[category];
                        const selectedCount = categorySkills.filter(skill => formData.skills.includes(skill)).length;
                        
                        return (
                          <div key={category} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                            <div
                              onClick={() => setExpandedCategory(isExpanded ? null : category)}
                              className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                <span className="text-sm font-medium text-white">{category}</span>
                                {selectedCount > 0 && (
                                  <span className="px-2 py-0.5 bg-[#C19A4A]/20 border border-[#C19A4A]/30 rounded-full text-[#C19A4A] text-xs font-semibold">
                                    {selectedCount}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {categorySkills.map(skill => {
                                    const isSelected = formData.skills.includes(skill);
                                    const isOthers = skill === 'Others';
                                    
                                    return (
                                      <div key={skill}>
                                        <div
                                          onClick={() => {
                                            if (!isOthers) {
                                              toggleSelection('skills', skill);
                                            }
                                          }}
                                          className={`px-3 py-2 rounded border cursor-pointer transition-all text-xs font-medium ${
                                            isSelected
                                              ? 'bg-[#C19A4A]/20 border-[#C19A4A] text-[#C19A4A]'
                                              : 'bg-white/5 border-white/20 text-white hover:border-white/40'
                                          } ${isOthers ? 'cursor-default' : ''}`}
                                        >
                                          {isSelected && !isOthers && <Check className="w-3 h-3 inline mr-1" />}
                                          {skill}
                                        </div>
                                        
                                        {isOthers && (
                                          <input
                                            type="text"
                                            placeholder="Specify other skills..."
                                            value={customSkills[category] || ''}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              setCustomSkills(prev => ({ ...prev, [category]: value }));
                                              if (value.trim()) {
                                                const customSkill = `${category}: ${value.trim()}`;
                                                if (!formData.skills.includes(customSkill)) {
                                                  setFormData(prev => ({ ...prev, skills: [...prev.skills.filter(s => !s.startsWith(`${category}:`)), customSkill] }));
                                                }
                                              } else {
                                                setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => !s.startsWith(`${category}:`)) }));
                                              }
                                            }}
                                            className="w-full mt-2 bg-transparent border border-white/20 rounded px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none"
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {errors.skills && <span className="text-red-500 text-[10px] mt-2 block">{errors.skills}</span>}
                  </div>

                  {/* Live Summary Bar */}
                  {formData.skills.length > 0 && (
                    <div className="sticky bottom-0 bg-[#0B0F1B] border border-[#C19A4A]/30 rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#C19A4A]">Selected Skills ({formData.skills.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, skills: [] }));
                            setCustomSkills({});
                          }}
                          className="text-xs text-white/60 hover:text-white transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {formData.skills.map(skill => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-[#C19A4A]/20 border border-[#C19A4A]/30 rounded-full text-[#C19A4A] text-xs font-medium flex items-center gap-1.5"
                          >
                            {skill}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-white transition-colors"
                              onClick={() => {
                                toggleSelection('skills', skill);
                                // Clear custom skill if it's a custom one
                                Object.keys(customSkills).forEach(cat => {
                                  if (skill.startsWith(`${cat}:`)) {
                                    setCustomSkills(prev => ({ ...prev, [cat]: '' }));
                                  }
                                });
                              }}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engagement Types */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-3">
                      Engagement Type *
                    </label>
                    <p className="text-xs text-white/40 mb-4">What type of work arrangements are you offering?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {engagementTypes.map(type => {
                        const isSelected = formData.engagementTypes.includes(type);
                        return (
                          <div
                            key={type}
                            onClick={() => toggleSelection('engagementTypes', type)}
                            className={`px-4 py-3 rounded-lg border-2 cursor-pointer transition-all text-center text-sm font-medium ${
                              isSelected
                                ? 'bg-[#C19A4A]/20 border-[#C19A4A] text-[#C19A4A]'
                                : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                            {type}
                          </div>
                        );
                      })}
                    </div>
                    {errors.engagementTypes && <span className="text-red-500 text-[10px] mt-2 block">{errors.engagementTypes}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <div className="animate-[fadeIn_0.4s_ease-in-out]">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-white mb-1">Verification</h2>
                  <p className="text-xs text-white/50 font-light">Verify your company to build trust with candidates.</p>
                </div>

                <div className="space-y-6">
                  {/* KYC Verification Block */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#C19A4A]/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        formData.kycVerified 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-[#C19A4A]/20 text-[#C19A4A]'
                      }`}>
                        <Shield className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-1">
                          Company KYC Verification
                        </h3>
                        <p className="text-sm text-white/60 mb-4">
                          Verify your company identity to increase trust and attract top talent. 
                          This process typically takes 2-3 business days.
                        </p>
                        
                        <button
                          type="button"
                          onClick={handleKYCVerification}
                          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                            formData.kycVerified
                              ? 'bg-green-500/20 text-green-500 border-2 border-green-500'
                              : 'bg-[#C19A4A] text-black hover:bg-[#A8863D]'
                          }`}
                        >
                          {formData.kycVerified ? (
                            <>
                              <Check className="w-4 h-4" />
                              Verified ✓
                            </>
                          ) : (
                            'Start KYC'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Information Note */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-300 font-medium mb-1">
                          Powered by on-chain attestations
                        </p>
                        <p className="text-xs text-blue-300/70">
                          Your data is never stored on Ghonsi servers. All verification is handled through 
                          secure, decentralized attestation protocols.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="animate-[fadeIn_0.4s_ease-in-out]">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-white mb-1">Review Your Profile</h2>
                  <p className="text-xs text-white/50 font-light">Review all information before submitting.</p>
                </div>

                <div className="space-y-6">
                  {/* Company Identity Section */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-[#C19A4A]" />
                        <h3 className="text-base font-semibold text-white">Company Identity</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEdit(1)}
                        className="text-[#C19A4A] text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Company logo" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center text-white font-bold text-xl">
                            {getCompanyInitials(formData.companyName)}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-semibold text-lg">{formData.companyName}</p>
                          <p className="text-white/60 text-sm">{formData.companySize}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Website</p>
                          <p className="text-white text-sm">{formData.website}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Location</p>
                          <p className="text-white text-sm">{formData.location}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Timezone</p>
                          <p className="text-white text-sm">{formData.timezone}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Description</p>
                        <p className="text-white/80 text-sm leading-relaxed">{formData.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hiring Needs Section */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-[#C19A4A]" />
                        <h3 className="text-base font-semibold text-white">Hiring Needs</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEdit(2)}
                        className="text-[#C19A4A] text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Skills</p>
                        {formData.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map(skill => (
                              <span key={skill} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/40 text-sm">No skills selected</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Engagement Types</p>
                        {formData.engagementTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.engagementTypes.map(type => (
                              <span key={type} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-medium">
                                {type}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/40 text-sm">No engagement types selected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verification Section */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#C19A4A]" />
                        <h3 className="text-base font-semibold text-white">Verification Status</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEdit(3)}
                        className="text-[#C19A4A] text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {formData.kycVerified ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">KYC Verified</p>
                            <p className="text-white/60 text-sm">Your company has been verified</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <X className="w-5 h-5 text-white/40" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Not Verified</p>
                            <p className="text-white/60 text-sm">Complete KYC to verify your company</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {submitError}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
              <button 
                type="button" 
                onClick={handlePrev} 
                className={`text-[#C19A4A] text-sm font-medium flex items-center gap-1 transition-all hover:-translate-x-1 ${
                  currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-6">
                <button 
                  type="button" 
                  onClick={() => router.push('/job-marketplace')}
                  className="text-[#C19A4A] hover:text-[#A8863D] text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={isSubmitting}
                  className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#C19A4A]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>Submit <Check className="w-4 h-4" /></>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default CreateProfileHirers;
