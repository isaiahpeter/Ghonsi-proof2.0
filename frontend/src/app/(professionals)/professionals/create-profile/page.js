'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { createProfile, getProfile, updateProfile } from '@/utils/profileApi';
import { saveFormData, getFormData, clearFormData } from '@/utils/formPersistence';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, ArrowRight, User, Award, Share2, Settings, Camera, Upload, ChevronDown, Check } from 'lucide-react';

function CreateProfile() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', emailAddress: '', phoneNumber: '', location: '',
    professionalTitle: '', professionalBio: '', skills: '', expertise: [], experience: '',
    website: '', github: '', twitter: '', linkedin: '',
    visibility: 'Public - Anyone can view', emailNotifications: false
  });
  const [errors, setErrors] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isExpertiseOpen, setIsExpertiseOpen] = useState(false);
  const [selectedExpertiseCategory, setSelectedExpertiseCategory] = useState('');
  const [isProfessionCategoryOpen, setIsProfessionCategoryOpen] = useState(false);
  const [isProfessionSubOpen, setIsProfessionSubOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const expertiseRef = React.useRef(null);

  const professionCategories = {
    'Engineering (Build & Infrastructure)': [
      'Frontend Engineer',
      'Backend Engineer',
      'Fullstack Engineer',
      'Smart Contract Developer (Web3)',
      'Blockchain Protocol Engineer',
      'DevOps / Cloud Engineer',
      'Mobile App Development',
      'QA / Test Engineer',
      'Security Engineer (Cybersecurity)'
    ],
    'Product & Design (Build User Experience)': [
      'Product Manager',
      'UI/UX Designer',
      'Product Designer',
      'UX Researcher',
      'Interaction Designer',
      'Design Systems',
      'Design Engineer'
    ],
    'Marketing & Growth (Acquire & Retain Users)': [
      'Growth Marketer',
      'Performance Marketer (Paid Ads)',
      'Content Marketer',
      'Social Media Manager',
      'SEO / Search Marketer',
      'Community Manager',
      'Brand Strategist',
      'Influencer / Partnerships Marketer'
    ],
    'Data & Analytics (Understand & Optimize Systems)': [
      'Data Analyst',
      'Data Scientist',
      'Business Intelligence (BI)',
      'Product Analytics',
      'Machine Learning Engineer',
      'Data Engineer',
      'Market Research Analyst'
    ],
    'Creative (Content & Media Production)': [
      'Graphic Designer',
      'Motion Designer / Animator',
      'Video Editor',
      '2D/3D Animator',
      'Copywriter',
      'Scriptwriter',
      'Content Creator (General)',
      'Art Director'
    ],
    'Finance / Web3 (Capital, Value & Systems)': [
      'Financial Analyst',
      'Investment Analyst',
      'Accountant',
      'Treasury Manager',
      'DeFi Strategist / Researcher',
      'Crypto Trader',
      'Tokenomics Designer',
      'Risk Analyst (Finance/Web3)',
      'Compliance (Crypto/Finance)'
    ],
    'Operations (Execution & Systems)': [
      'Operations Manager',
      'Project Manager',
      'Program Manager',
      'Business Operator',
      'Supply Chain Operator',
      'Customer Success',
      'Process Optimization',
      'Administrative Operator'
    ]
  };

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

  const totalSteps = 3;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, try to restore saved form data (in case of page refresh)
        const savedFormData = getFormData('createProfile');
        if (savedFormData) {
          console.log('Restoring saved form data');
          setFormData(savedFormData.formData);
          setCurrentStep(savedFormData.currentStep || 1);
          if (savedFormData.profilePhoto) {
            setProfilePhoto(savedFormData.profilePhoto);
          }
          return; // Don't load from DB if we have recent form data
        }

        const user = await getCurrentUser();
        if (!user) return;

        // Load email (may be null for wallet-only users)
        setFormData(prev => ({ ...prev, emailAddress: user.email || '' }));

        // Try to load existing profile
        const profile = await getProfile(user.id);
        
        // Only set edit mode if profile has actual data (not just user_type)
        // Check if profile has display_name or bio to determine if it's a real profile
        const hasProfileData = profile && (profile.display_name || profile.bio || profile.profession);
        
        if (hasProfileData) {
          // Profile exists with data - populate form for editing
          setIsEditMode(true);
          setExistingProfileId(profile.id);
          
          setFormData({
            fullName: profile.display_name || '',
            emailAddress: user.email || '',
            phoneNumber: profile.social_links?.phone || '',
            location: profile.location || '',
            professionalTitle: profile.profession || '',
            professionalBio: profile.bio || '',
            skills: profile.social_links?.skills || '',
            expertise: profile.social_links?.expertise || [],
            experience: profile.social_links?.experience || '',
            website: profile.social_links?.website || '',
            github: profile.social_links?.github || '',
            twitter: profile.social_links?.twitter || '',
            linkedin: profile.social_links?.linkedin || '',
            visibility: profile.is_public ? 'Public - Anyone can view' : 'Private - Only you can view',
            emailNotifications: false
          });

          // Load avatar if exists
          if (profile.avatar_url) {
            setProfilePhoto({ preview: profile.avatar_url, file: null });
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadUserData();
  }, []);

  // Handle click outside expertise dropdown to collapse it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expertiseRef.current && !expertiseRef.current.contains(event.target)) {
        setIsExpertiseOpen(false);
        setSelectedExpertiseCategory('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Auto-save form data whenever it changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveFormData('createProfile', {
        formData,
        currentStep,
        profilePhoto: profilePhoto ? { preview: profilePhoto.preview, file: null } : null,
      });
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(saveTimeout);
  }, [formData, currentStep, profilePhoto]);

  const handlePhotoUpload = (e) => {
    setPhotoError('');
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPhotoError('File too large. Max size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          if (img.width < 200 || img.height < 200) {
            setPhotoError('Image too small. Minimum dimensions are 200x200px.');
          } else {
            // Store both the preview URL and the file
            setProfilePhoto({ preview: event.target.result, file });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      const nameValue = formData.fullName.trim();
      const parts = nameValue.split(' ').filter(part => part.length > 0);
      const nameRegex = /^[a-zA-Z\u00C0-\u00FF]+(['-][a-zA-Z\u00C0-\u00FF]+)*$/;
      if (parts.length < 2 || parts.some(part => part.length < 2 || !nameRegex.test(part))) {
        newErrors.fullName = 'Please enter a valid full name (e.g. First Last)';
      }
      // Email is optional for wallet-only users
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.emailAddress.trim() && !emailRegex.test(formData.emailAddress.trim())) {
        newErrors.emailAddress = 'Please enter a valid email address';
      }
    }
    if (step === 2) {
      if (formData.professionalBio.trim().length < 10) {
        newErrors.professionalBio = 'Bio must be at least 10 characters';
      }
      if (formData.expertise.length === 0) {
        newErrors.expertise = 'Please select at least one expertise';
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
      // Final step - save profile to Supabase
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('You must be logged in to create a profile');
        }

        let avatarUrl = null;

        // Upload profile photo if provided and it's a new file
        if (profilePhoto && profilePhoto.file) {
          const fileExt = profilePhoto.file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('proof-files')
            .upload(filePath, profilePhoto.file, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload profile photo');
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('proof-files')
            .getPublicUrl(filePath);

          avatarUrl = publicUrl;
        } else if (profilePhoto && profilePhoto.preview && !profilePhoto.file) {
          // Keep existing avatar URL if no new file uploaded
          avatarUrl = profilePhoto.preview;
        }

        // Prepare profile data matching the database schema
        const profileData = {
          display_name: formData.fullName,
          email: formData.emailAddress || user.email || null,
          bio: formData.professionalBio || null,
          profession: formData.professionalTitle || null,
          location: formData.location || null,
          avatar_url: avatarUrl,
          social_links: {
            website: formData.website || null,
            github: formData.github || null,
            twitter: formData.twitter || null,
            linkedin: formData.linkedin || null,
            phone: formData.phoneNumber || null,
            skills: formData.skills || null,
            expertise: formData.expertise || [],
            experience: formData.experience || null
          },
          is_public: formData.visibility === 'Public - Anyone can view'
        };

        // Update existing profile or create new one
        if (isEditMode && existingProfileId) {
          await updateProfile(user.id, profileData);
        } else {
          await createProfile({ user_id: user.id, ...profileData });
        }
        
        clearFormData('createProfile'); // Clear saved form data after successful submission
        
        // Dispatch event to notify header of profile completion
        window.dispatchEvent(new Event('auth-state-changed'));
        
        setShowSuccess(true);
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

  return (
    <>
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white font-sans selection:bg-[#C19A4A] selection:text-black">
        <main className="flex-grow max-w-full mx-auto px-6 py-8">
          <a href="/dashboard" className="inline-flex items-center text-[#C19A4A] text-sm mb-8 hover:underline gap-1 font-light tracking-wide mt-[75px]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>

          {!showSuccess && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-white tracking-tight">{isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}</h1>
                <p className="text-white/60 text-sm font-light leading-relaxed">{isEditMode ? 'Update your professional Web3 identity and credentials' : 'Build your professional Web3 identity and showcase your verified credentials'}</p>
              </div>

              <div className="flex justify-between items-start mb-12 w-full px-1">
                {[1, 2, 3].map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2 bg-[#0B0F1B] z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                        step < currentStep ? 'border-[#C19A4A] text-[#C19A4A]' :
                        step === currentStep ? 'bg-[#C19A4A] border-[#C19A4A] text-white' :
                        'border-white/20 text-white/40 bg-[#0B0F1B]'
                      }`}>
                        {step === 1 && <User className="w-4 h-4" />}
                        {step === 2 && <Award className="w-4 h-4" />}
                        {step === 3 && <Share2 className="w-4 h-4" />}
                        {step === 4 && <Settings className="w-4 h-4" />}
                      </div>
                      <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold mt-1 ${
                        step <= currentStep ? 'text-[#C19A4A]' : 'text-white/40'
                      }`}>
                        {step === 1 && 'Basic Info'}
                        {step === 2 && 'Professional'}
                        {step === 3 && 'Social Links'}
                      </span>
                    </div>
                    {idx < 2 && (
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
              <h2 className="text-3xl font-semibold text-white mb-3">{isEditMode ? 'Profile Updated!' : 'Profile Created!'}</h2>
              <p className="text-white/60 text-sm mb-10 max-w-xs mx-auto leading-relaxed">
                {isEditMode 
                  ? 'Your Web3 identity has been successfully updated.' 
                  : 'Your profile is ready! Next, answer a few questions to help us personalize your experience.'}
              </p>
              <button 
                onClick={() => {
                const nextRoute = isEditMode
  ? '/professionals/dashboard'
  : '/hirers/domain-questions';

router.push(nextRoute);
                }} 
                className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-bold px-8 py-3.5 rounded-lg shadow-lg shadow-[#C19A4A]/20 transition-all transform hover:scale-105 active:scale-95 w-full max-w-xs flex items-center justify-center gap-2"
              >
                {isEditMode ? 'Go to Dashboard' : 'Continue to Questions'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()}>
              {currentStep === 1 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-white mb-1">Basic Information</h2>
                    <p className="text-xs text-white/50 font-light">Tell us about yourself. This information will be visible on your public profile.</p>
                  </div>

                  <div className="mb-8">
  <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-4">Profile Photo</label>
  <div className="flex items-center gap-6">
    <div 
      className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex-shrink-0 hover:border-[#C19A4A]/50 transition-colors cursor-pointer group relative overflow-hidden bg-cover bg-center"
      style={profilePhoto?.preview ? { backgroundImage: `url(${profilePhoto.preview})` } : {}}
      onClick={() => document.getElementById('fileInput').click()}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <Camera className="w-6 h-6 text-white" />
      </div>
    </div>
    <div>
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/gif"
        onChange={handlePhotoUpload}
      />
      <button type="button" onClick={() => document.getElementById('fileInput').click()} className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-xs font-semibold px-5 py-2.5 rounded transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
        Upload Photo <Upload className="w-3 h-3" />
      </button>
      <p className="text-[10px] text-white/40 mt-2.5 font-light">JPG, PNG or GIF. Max size 2MB. Recommended: 400x400px</p>
      {photoError && <p className="text-red-500 text-[10px] mt-1">{photoError}</p>}
    </div>
  </div>
</div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Full Name *</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Enter your full name" className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation ${errors.fullName ? 'border-red-500 animate-[shake_0.5s]' : 'border-white/20'}`} />
                      {errors.fullName && <span className="text-red-500 text-[10px] mt-1 block">{errors.fullName}</span>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Email Address</label>
                      <input name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} type="email" placeholder="Youremail@example.com (optional for wallet users)" className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation ${errors.emailAddress ? 'border-red-500 animate-[shake_0.5s]' : 'border-white/20'}`} />
                      {errors.emailAddress && <span className="text-red-500 text-[10px] mt-1 block">{errors.emailAddress}</span>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Phone Number</label>
                      <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type="tel" placeholder="+234890124832" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Location</label>
                      <input name="location" value={formData.location} onChange={handleInputChange} type="text" placeholder="Enter your city, country" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-white mb-1">Professional Information</h2>
                    <p className="text-xs text-white/50 font-light">Showcase your expertise and experience in the Web3 space.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Professional Title</label>
                      <div className="relative">
                        {/* Category Dropdown */}
                        <div 
                          onClick={() => setIsProfessionCategoryOpen(!isProfessionCategoryOpen)} 
                          className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white cursor-pointer flex justify-between items-center hover:border-[#C19A4A]/50 transition-colors"
                        >
                          <span className={selectedCategory ? 'text-white' : 'text-white/50'}>
                            {selectedCategory || 'Select a category'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isProfessionCategoryOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {/* Category Options */}
                        {isProfessionCategoryOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-[#0B0F1B] border border-white/20 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                            {Object.keys(professionCategories).map(category => (
                              <div 
                                key={category} 
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setIsProfessionCategoryOpen(false);
                                  setIsProfessionSubOpen(true);
                                  setFormData(prev => ({ ...prev, professionalTitle: '' }));
                                }} 
                                className="px-4 py-3 text-sm text-white hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
                              >
                                {category}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Sub-category Dropdown */}
                      {selectedCategory && (
                        <div className="relative mt-3">
                          <div 
                            onClick={() => setIsProfessionSubOpen(!isProfessionSubOpen)} 
                            className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white cursor-pointer flex justify-between items-center hover:border-[#C19A4A]/50 transition-colors"
                          >
                            <span className={formData.professionalTitle ? 'text-white' : 'text-white/50'}>
                              {formData.professionalTitle || 'Select your specific role'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isProfessionSubOpen ? 'rotate-180' : ''}`} />
                          </div>
                          
                          {isProfessionSubOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-[#0B0F1B] border border-white/20 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                              {professionCategories[selectedCategory].map(role => (
                                <div 
                                  key={role} 
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, professionalTitle: role }));
                                    setIsProfessionSubOpen(false);
                                  }} 
                                  className="px-4 py-3 text-sm text-white hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
                                >
                                  {role}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-white/40 mt-2">Select a category first, then choose your specific role</p>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Bio *</label>
                      <textarea name="professionalBio" value={formData.professionalBio} onChange={handleInputChange} rows="4" placeholder="Tell us about yourself, your experience, and what you are passionate about...." className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all resize-none ${errors.professionalBio ? 'border-red-500' : 'border-white/20'}`} />
                      <div className="flex justify-between mt-1.5">
                        {errors.professionalBio && <span className="text-red-500 text-[10px]">{errors.professionalBio}</span>}
                        <div className="text-[10px] text-white/40 ml-auto">{formData.professionalBio.length}/1000 characters</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Skills</label>
                      <input name="skills" value={formData.skills} onChange={handleInputChange} type="text" placeholder="e.g., solidity, Rust, React, web3.js" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                      <div className="text-right text-[10px] text-white/40 mt-1.5">Separate skills with commas</div>
                    </div>
                    
                    {/* Expertise Section */}
                    <div ref={expertiseRef}>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Expertise *</label>
                      <p className="text-xs text-white/40 mb-3">These expertise define how your portfolio is segmented and how you appear in search. Select the expertise that best represent your work.</p>
                      
                      {/* Category Dropdown */}
                      <div className="relative">
                        <div 
                          onClick={() => setIsExpertiseOpen(!isExpertiseOpen)} 
                          className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white cursor-pointer flex justify-between items-center hover:border-[#C19A4A]/50 transition-colors ${errors.expertise ? 'border-red-500' : 'border-white/20'}`}
                        >
                          <span className={selectedExpertiseCategory ? 'text-white' : 'text-white/50'}>
                            {selectedExpertiseCategory || 'Select a category'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isExpertiseOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {isExpertiseOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-[#0B0F1B] border border-white/20 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                            {Object.keys(SMART_TAG_CATEGORIES).map(category => (
                              <div 
                                key={category} 
                                onClick={() => {
                                  setSelectedExpertiseCategory(category);
                                  setIsExpertiseOpen(false);
                                }} 
                                className="px-4 py-3 text-sm text-white hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
                              >
                                {category}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Tags Dropdown */}
                      {selectedExpertiseCategory && (
                        <div className="relative mt-3">
                          <div className="w-full bg-transparent border border-white/20 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                            <div className="px-4 py-2 bg-white/5 text-[#C19A4A] text-xs font-semibold uppercase tracking-wider sticky top-0">
                              {selectedExpertiseCategory}
                            </div>
                            {SMART_TAG_CATEGORIES[selectedExpertiseCategory].map(tag => {
                              const isSelected = formData.expertise.includes(tag);
                              return (
                                <div 
                                  key={tag} 
                                  onClick={() => {
                                    if (isSelected) {
                                      setFormData(prev => ({ ...prev, expertise: prev.expertise.filter(t => t !== tag) }));
                                    } else {
                                      setFormData(prev => ({ ...prev, expertise: [...prev.expertise, tag] }));
                                    }
                                    if (errors.expertise) setErrors(prev => ({ ...prev, expertise: '' }));
                                  }} 
                                  className={`px-4 py-2.5 text-sm cursor-pointer border-b border-white/5 last:border-b-0 flex items-center justify-between ${
                                    isSelected ? 'bg-[#C19A4A]/10 text-[#C19A4A]' : 'text-white hover:bg-white/5'
                                  }`}
                                >
                                  <span>{tag}</span>
                                  {isSelected && <Check className="w-4 h-4" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {errors.expertise && <span className="text-red-500 text-[10px] mt-1 block">{errors.expertise}</span>}
                      
                      {formData.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.expertise.map((tag, index) => (
                            <div key={index} className="bg-white/5 border border-white/20 rounded-full px-4 py-2 text-sm text-white flex items-center gap-2">
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, expertise: prev.expertise.filter((_, i) => i !== index) }))}
                                className="text-white/60 hover:text-red-400 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Years of Experience</label>
                      <div className="relative">
                        <div onClick={() => setIsExperienceOpen(!isExperienceOpen)} className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white cursor-pointer flex justify-between items-center">
                          <span className={formData.experience ? 'text-white' : 'text-white/50'}>{formData.experience || 'Select years of experience'}</span>
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        </div>
                        {isExperienceOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-[#0B0F1B] border border-white/20 rounded-lg overflow-hidden">
                            {['0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'].map(exp => (
                              <div key={exp} onClick={() => { setFormData(prev => ({ ...prev, experience: exp })); setIsExperienceOpen(false); }} className="px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer">
                                {exp}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-white mb-1">Social Links</h2>
                    <p className="text-xs text-white/50 font-light">Connect your social profiles to build credibility and expand your network.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Personal Website</label>
                      <div className="flex items-center bg-transparent border border-white/20 rounded-lg overflow-hidden focus-within:border-[#C19A4A] focus-within:ring-1 focus-within:ring-[#C19A4A] transition-all">
                        <span className="px-4 py-3 text-sm text-white/40 bg-white/5 border-r border-white/10">https://</span>
                        <input 
                          name="website" 
                          value={formData.website} 
                          onChange={handleInputChange} 
                          type="text" 
                          placeholder="yourwebsite.com" 
                          className="flex-1 bg-transparent py-3 px-4 text-sm text-white placeholder-white/50 outline-none touch-manipulation" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">GitHub</label>
                      <div className="flex items-center bg-transparent border border-white/20 rounded-lg overflow-hidden focus-within:border-[#C19A4A] focus-within:ring-1 focus-within:ring-[#C19A4A] transition-all">
                        <span className="px-4 py-3 text-sm text-white/40 bg-white/5 border-r border-white/10">github.com/</span>
                        <input 
                          name="github" 
                          value={formData.github} 
                          onChange={handleInputChange} 
                          type="text" 
                          placeholder="username" 
                          className="flex-1 bg-transparent py-3 px-4 text-sm text-white placeholder-white/50 outline-none touch-manipulation" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Twitter / X</label>
                      <div className="flex items-center bg-transparent border border-white/20 rounded-lg overflow-hidden focus-within:border-[#C19A4A] focus-within:ring-1 focus-within:ring-[#C19A4A] transition-all">
                        <span className="px-4 py-3 text-sm text-white/40 bg-white/5 border-r border-white/10">x.com/</span>
                        <input 
                          name="twitter" 
                          value={formData.twitter} 
                          onChange={handleInputChange} 
                          type="text" 
                          placeholder="username" 
                          className="flex-1 bg-transparent py-3 px-4 text-sm text-white placeholder-white/50 outline-none touch-manipulation" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">LinkedIn</label>
                      <div className="flex items-center bg-transparent border border-white/20 rounded-lg overflow-hidden focus-within:border-[#C19A4A] focus-within:ring-1 focus-within:ring-[#C19A4A] transition-all">
                        <span className="px-4 py-3 text-sm text-white/40 bg-white/5 border-r border-white/10">linkedin.com/in/</span>
                        <input 
                          name="linkedin" 
                          value={formData.linkedin} 
                          onChange={handleInputChange} 
                          type="text" 
                          placeholder="yourusername" 
                          className="flex-1 bg-transparent py-3 px-4 text-sm text-white placeholder-white/50 outline-none touch-manipulation" 
                        />
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

              <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
                <button type="button" onClick={handlePrev} className={`text-[#C19A4A] text-sm font-medium flex items-center gap-1 transition-all hover:-translate-x-1 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-6">
                  <button type="button" className="text-[#C19A4A] hover:text-[#A8863D] text-sm font-medium transition-colors">Cancel</button>
                  <button 
                    type="button" 
                    onClick={handleNext} 
                    disabled={isSubmitting}
                    className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#C19A4A]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : currentStep === totalSteps ? (
                      <>{isEditMode ? 'Update' : 'Submit'} <Check className="w-4 h-4" /></>
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
    </>
  );
}

export default CreateProfile;
