'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, User, ArrowRight, CheckCircle } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { supabase } from '@/lib/supabaseClient';

const UserType = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        // Check if user already has a type selected
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        // If profile exists and has a user_type, redirect to home
        if (!profileError && profile?.user_type) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSelectType = async (type) => {
    if (isSubmitting) return;

    setSelectedType(type);
    setIsSubmitting(true);

    try {
      // Check if user already has a different user_type
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile?.user_type && existingProfile.user_type !== type) {
        alert(`You already have a ${existingProfile.user_type} account. You cannot create multiple account types.`);
        setIsSubmitting(false);
        setSelectedType(null);
        return;
      }

      // Update user profile with selected type
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          user_type: type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Dispatch event to notify header of user type change
      window.dispatchEvent(new Event('auth-state-changed'));

      // Create entry in appropriate table
      if (type === 'hirer') {
        // Create hirer entry
        const { data, error: hirerError } = await supabase
          .from('hirer_profiles')
          .insert({
            user_id: user.id,
            company_name: 'My Company', // Placeholder, will be updated in hirer setup
            created_at: new Date().toISOString()
          });

        console.log('Insert result:', { data, error: hirerError });

        if (hirerError && hirerError.code !== '23505') { // Ignore duplicate key error
          throw hirerError;
        }
      }
      // For professionals, no additional table needed - profiles table handles everything

      // Navigate based on user type
      setTimeout(() => {
        if (type === 'hirer') {
          router.push('/createProfileHirers');
        } else {
          router.push('/createProfile');
        }
      }, 800);
    } catch (error) {
      console.error('Error saving user type:', error);
      setIsSubmitting(false);
      setSelectedType(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#C19A4A] rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-grid z-0" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent font-[Inter]">
            Continue As A
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Choose how you want to use Ghonsi Proof to get started
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Hirer Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => handleSelectType('hirer')}
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedType === 'hirer' ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            <div className={`relative p-[2px] rounded-2xl transition-all duration-300 ${
              selectedType === 'hirer'
                ? 'bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-[#C19A4A]'
                : 'bg-gradient-to-br from-[#C19A4A]/50 via-[#d9b563]/50 to-blue-500/50 group-hover:from-[#C19A4A] group-hover:via-[#d9b563] group-hover:to-blue-500'
            }`}>
              <div className="bg-[#111625] rounded-[14px] p-8 md:p-10 relative overflow-hidden h-full">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-blue-500/5 pointer-events-none" />
                
                {/* Selected Indicator */}
                {selectedType === 'hirer' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10"
                  >
                    <CheckCircle size={20} className="text-white" />
                  </motion.div>
                )}

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    selectedType === 'hirer'
                      ? 'bg-gradient-to-br from-[#C19A4A] to-[#d9b563]'
                      : 'bg-[#C19A4A]/10 border border-[#C19A4A]/30 group-hover:bg-gradient-to-br group-hover:from-[#C19A4A] group-hover:to-[#d9b563]'
                  }`}>
                    <Briefcase size={32} className={`transition-colors duration-300 ${
                      selectedType === 'hirer' ? 'text-[#0B0F1B]' : 'text-[#C19A4A] group-hover:text-[#0B0F1B]'
                    }`} />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                    I'm a Hirer
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                    Stop guessing who's actually good. Mini Me already knows. <br /> Find marketers with verified, real-world proof. Then keep a co-pilot on your team that never forgets what's been learned, even when people move on.
                  </p>

                  {/* Button */}
                  <button
                    disabled={isSubmitting}
                    className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                      selectedType === 'hirer'
                        ? 'bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B]'
                        : 'bg-white/5 text-white border border-white/10 group-hover:bg-white/10'
                    }`}
                  >
                    {isSubmitting && selectedType === 'hirer' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#0B0F1B]/30 border-t-[#0B0F1B] rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <span>Hire Smarter</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => handleSelectType('professional')}
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedType === 'professional' ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            <div className={`relative p-[2px] rounded-2xl transition-all duration-300 ${
              selectedType === 'professional'
                ? 'bg-gradient-to-br from-blue-500 via-[#d9b563] to-[#C19A4A]'
                : 'bg-gradient-to-br from-blue-500/50 via-[#d9b563]/50 to-[#C19A4A]/50 group-hover:from-blue-500 group-hover:via-[#d9b563] group-hover:to-[#C19A4A]'
            }`}>
              <div className="bg-[#111625] rounded-[14px] p-8 md:p-10 relative overflow-hidden h-full">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-[#C19A4A]/5 pointer-events-none" />
                
                {/* Selected Indicator */}
                {selectedType === 'professional' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10"
                  >
                    <CheckCircle size={20} className="text-white" />
                  </motion.div>
                )}

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    selectedType === 'professional'
                      ? 'bg-gradient-to-br from-blue-500 to-[#C19A4A]'
                      : 'bg-blue-500/10 border border-blue-500/30 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-[#C19A4A]'
                  }`}>
                    <User size={32} className={`transition-colors duration-300 ${
                      selectedType === 'professional' ? 'text-white' : 'text-blue-400 group-hover:text-white'
                    }`} />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                    I'm a Marketer
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                    Like having a senior strategist in your corner, one who already knows Lagos, Abuja, and every market in between. <br /> Get campaign ideas, copy, targeting strategies, and honest feedback on your thinking. Mini Me works alongside you so every brief you touch is sharper than the last.  
                  </p>


                  {/* Button */}
                  <button
                    disabled={isSubmitting}
                    className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                      selectedType === 'professional'
                        ? 'bg-gradient-to-r from-blue-500 to-[#C19A4A] text-white'
                        : 'bg-white/5 text-white border border-white/10 group-hover:bg-white/10'
                    }`}
                  >
                    {isSubmitting && selectedType === 'professional' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Working</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8 md:mt-12"
        >
          <p className="text-gray-500 text-xs md:text-sm">
            You can change your account type later in settings
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserType;
