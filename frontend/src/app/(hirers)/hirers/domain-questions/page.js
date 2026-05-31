'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { saveDomainQuestions } from '@/utils/domainQuestionsApi';

function DomainQuestions() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showActivation, setShowActivation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const [formData, setFormData] = useState({
    platformUsage: [],
    marketingTypes: [],
    hiringFor: '',
    evaluationCriteria: [],
    otherMarketingType: ''
  });

  const totalSteps = 4;

  // Step 1 options
  const platformUsageOptions = [
    'Finding marketing talent for a specific campaign or project',
    'Building a marketing team for my brand or startup',
    'Getting marketing support on a budget',
    'Discovering marketers who understand my local market',
    'Retaining marketing knowledge from talent I work with',
    'Posting marketing roles and receiving applications'
  ];

  // Step 2 options
  const marketingTypeOptions = [
    'Social media marketing and management',
    'Content creation and copywriting',
    'Paid advertising and media buying',
    'Influencer and creator marketing',
    'Brand strategy and identity',
    'Email and WhatsApp marketing',
    'Community management and growth',
    'PR and media relations',
    'Campaign planning and execution',
    'Market research and consumer insights',
    'Other (please specify)'
  ];

  // Step 3 options
  const hiringForOptions = [
    'My personal brand or side business',
    'An early stage startup',
    'A growing SME',
    'An established company or agency',
    'A non-profit or community organisation',
    'A one-off project or contract'
  ];

  // Step 4 options
  const evaluationCriteriaOptions = [
    'Proven results from past campaigns',
    'Deep knowledge of my local market',
    'Experience in my specific industry',
    'Understanding of my target audience',
    'Budget efficiency — delivering results with limited spend',
    'Speed and availability',
    'Strong communication and reporting habits',
    'Strategic thinking not just execution',
    'Platform-specific expertise such as TikTok or Meta'
  ];

  const toggleSelection = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Save to Supabase before showing activation screen
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('You must be logged in to save your responses');
        }

        await saveDomainQuestions(user.id, formData);
        
        // Show activation screen
        setShowActivation(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Error saving domain questions:', error);
        setSubmitError(error.message || 'Failed to save your responses. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.platformUsage.length > 0;
    if (currentStep === 2) return formData.marketingTypes.length > 0;
    if (currentStep === 3) return formData.hiringFor !== '';
    if (currentStep === 4) return formData.evaluationCriteria.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white font-sans selection:bg-[#C19A4A] selection:text-black">
      <main className="flex-grow max-w-3xl mx-auto px-6 py-8">
        {!showActivation ? (
          <>
            <div className="mb-10 mt-[75px]">
              <h1 className="text-3xl font-semibold font-[Inter] mb-3 text-white tracking-tight">
                Help us personalize your experience
              </h1>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Answer a few questions so we can connect you with the right marketing talent
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#C19A4A]">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-xs text-white/40">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C19A4A] to-[#d9b563] transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1 */}
              {currentStep === 1 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <h2 className="text-xl font-medium text-white mb-3">
                    What will you be using this platform for?
                  </h2>
                  <p className="text-sm text-white/50 mb-6">Select all that apply</p>
                  
                  <div className="space-y-3">
                    {platformUsageOptions.map(option => {
                      const isSelected = formData.platformUsage.includes(option);
                      return (
                        <div
                          key={option}
                          onClick={() => toggleSelection('platformUsage', option)}
                          className={`px-5 py-4 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                            isSelected
                              ? 'bg-[#C19A4A]/20 border-[#C19A4A] text-white'
                              : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-[#C19A4A] border-[#C19A4A]' : 'border-white/30'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <h2 className="text-xl font-medium text-white mb-3">
                    What type of marketing do you most commonly hire for?
                  </h2>
                  <p className="text-sm text-white/50 mb-6">Select all that apply</p>
                  
                  <div className="space-y-3">
                    {marketingTypeOptions.map(option => {
                      const isSelected = formData.marketingTypes.includes(option);
                      const isOther = option === 'Other (please specify)';
                      
                      return (
                        <div key={option}>
                          <div
                            onClick={() => !isOther && toggleSelection('marketingTypes', option)}
                            className={`px-5 py-4 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                              isSelected
                                ? 'bg-[#C19A4A]/20 border-[#C19A4A] text-white'
                                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
                            } ${isOther ? 'cursor-default' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              {!isOther && (
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'bg-[#C19A4A] border-[#C19A4A]' : 'border-white/30'
                                }`}>
                                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                              )}
                              <span>{option}</span>
                            </div>
                          </div>
                          
                          {isOther && (
                            <input
                              type="text"
                              placeholder="Please specify other marketing types..."
                              value={formData.otherMarketingType}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFormData(prev => ({ ...prev, otherMarketingType: value }));
                                if (value.trim() && !formData.marketingTypes.includes('Other (please specify)')) {
                                  setFormData(prev => ({ ...prev, marketingTypes: [...prev.marketingTypes, 'Other (please specify)'] }));
                                } else if (!value.trim() && formData.marketingTypes.includes('Other (please specify)')) {
                                  setFormData(prev => ({ ...prev, marketingTypes: prev.marketingTypes.filter(t => t !== 'Other (please specify)') }));
                                }
                              }}
                              className="w-full mt-3 bg-transparent border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {currentStep === 3 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <h2 className="text-xl font-medium text-white mb-3">
                    What best describes who you are hiring for?
                  </h2>
                  <p className="text-sm text-white/50 mb-6">Select one</p>
                  
                  <div className="space-y-3">
                    {hiringForOptions.map(option => {
                      const isSelected = formData.hiringFor === option;
                      return (
                        <div
                          key={option}
                          onClick={() => setFormData(prev => ({ ...prev, hiringFor: option }))}
                          className={`px-5 py-4 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                            isSelected
                              ? 'bg-[#C19A4A]/20 border-[#C19A4A] text-white'
                              : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-[#C19A4A]' : 'border-white/30'
                            }`}>
                              {isSelected && <div className="w-3 h-3 rounded-full bg-[#C19A4A]" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {currentStep === 4 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <h2 className="text-xl font-medium text-white mb-3">
                    What matters most to you when evaluating a marketing candidate?
                  </h2>
                  <p className="text-sm text-white/50 mb-6">Select all that apply</p>
                  
                  <div className="space-y-3">
                    {evaluationCriteriaOptions.map(option => {
                      const isSelected = formData.evaluationCriteria.includes(option);
                      return (
                        <div
                          key={option}
                          onClick={() => toggleSelection('evaluationCriteria', option)}
                          className={`px-5 py-4 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                            isSelected
                              ? 'bg-[#C19A4A]/20 border-[#C19A4A] text-white'
                              : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-[#C19A4A] border-[#C19A4A]' : 'border-white/30'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {submitError}
                </div>
              )}

              {/* Navigation Button */}
              <div className="flex justify-end mt-12 pt-6 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#C19A4A]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>Complete <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          // Activation Screen
          <div className="flex flex-col items-center justify-center text-center py-12 animate-[scaleIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] mt-[75px]">
            <div className="w-24 h-24 bg-[#C19A4A]/10 rounded-full flex items-center justify-center mb-8 ring-1 ring-[#C19A4A]/30 shadow-[0_0_30px_-10px_rgba(193,154,74,0.3)]">
              <Sparkles className="w-12 h-12 text-[#C19A4A]" />
            </div>
            <h2 className="text-3xl font-semibold text-white mb-4">
              Find the marketer who already knows your market.
            </h2>
            <p className="text-white/60 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Based on what you told us, we have configured your discovery experience to show you marketers with proven, timestamped work in your space.
            </p>
            <button 
              onClick={() => router.push('/search')} 
              className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-bold px-8 py-3.5 rounded-lg shadow-lg shadow-[#C19A4A]/20 transition-all transform hover:scale-105 active:scale-95 w-full max-w-xs flex items-center justify-center gap-2"
            >
              Browse Marketing Talent <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default DomainQuestions;
