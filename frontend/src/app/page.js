'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Reviews from '@/components/shared/Reviews';
import WhatYouGetSection from '@/components/shared/WhatYouGetSection';
import TrustedEcosystemSection from '@/components/shared/TrustedEcosystemSection';
import FinalCTASection from '@/components/shared/FinalCTASection';
import MiniMeChat from '@/components/shared/MiniMeChat';

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-12">
        {/* Background elements */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10">
          {/* Mobile Skeleton */}
          <div className="md:hidden px-5">
            {/* Hero Section - Mobile */}
            <div className="mb-16 animate-pulse">
              <div className="h-10 bg-gray-700/50 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-10 bg-gray-700/50 rounded w-2/3 mx-auto mb-6"></div>
              <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-4/5 mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-6"></div>
              
              {/* Credential Card Skeleton */}
              <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]/30 mt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-700/50 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-700/50 rounded w-16"></div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-700/50 rounded w-16"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-24"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-700/50 rounded w-16"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-24"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-700/50 rounded w-20"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-28"></div>
                  </div>
                </div>
                <div className="h-1 bg-gray-700/50 rounded-full mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-32 ml-auto"></div>
              </div>
            </div>

            {/* CTA Buttons - Mobile */}
            <div className="space-y-3 mb-20 animate-pulse">
              <div className="h-12 bg-gray-700/50 rounded-xl"></div>
              <div className="h-12 bg-gray-700/50 rounded-xl"></div>
            </div>

            {/* Introducing Section - Mobile */}
            <div className="mb-16 animate-pulse">
              <div className="h-8 bg-gray-700/50 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-full mx-auto mb-8"></div>
              
              {/* Three Cards Skeleton */}
              <div className="space-y-16">
                <div className="bg-[#0B0F1B] rounded-xl p-6 border-2 border-[#C19A4A]/30">
                  <div className="h-64 bg-gray-700/50 rounded"></div>
                </div>
                <div className="bg-[#0B0F1B] rounded-xl p-6 border-2 border-[#C19A4A]/30">
                  <div className="h-64 bg-gray-700/50 rounded"></div>
                </div>
                <div className="bg-[#0B0F1B] rounded-xl p-6 border-2 border-[#C19A4A]/30">
                  <div className="h-64 bg-gray-700/50 rounded"></div>
                </div>
              </div>
            </div>

            {/* Upload Button Skeleton */}
            <div className="mb-20 animate-pulse">
              <div className="h-12 bg-gray-700/50 rounded-xl"></div>
            </div>

            {/* Additional Sections Skeleton */}
            <div className="space-y-20 animate-pulse">
              <div>
                <div className="h-8 bg-gray-700/50 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-full mx-auto mb-8"></div>
                <div className="h-64 bg-gray-700/50 rounded-2xl"></div>
              </div>
              <div>
                <div className="h-8 bg-gray-700/50 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-full mx-auto mb-8"></div>
                <div className="h-96 bg-gray-700/50 rounded-2xl"></div>
              </div>
            </div>
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden md:block px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section - Desktop */}
              <div className="mb-16 animate-pulse">
                <div className="grid grid-cols-2 gap-16 items-start mt-16">
                  {/* Left Column */}
                  <div>
                    <div className="h-12 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                    <div className="h-12 bg-gray-700/50 rounded w-2/3 mb-6"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-4/5 mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                  </div>
                  
                  {/* Right Column - Card */}
                  <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]/30">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-700/50 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-gray-700/50 rounded w-16"></div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-700/50 rounded w-20"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-700/50 rounded w-20"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-32"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-700/50 rounded w-24"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-36"></div>
                      </div>
                    </div>
                    <div className="h-1 bg-gray-700/50 rounded-full mb-2"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-32 ml-auto"></div>
                  </div>
                </div>

                {/* CTA Buttons - Desktop */}
                <div className="flex gap-3 mt-12">
                  <div className="flex-1 h-12 bg-gray-700/50 rounded-xl"></div>
                  <div className="flex-1 h-12 bg-gray-700/50 rounded-xl"></div>
                </div>
              </div>

              {/* Introducing Section - Desktop */}
              <div className="mb-16 animate-pulse">
                <div className="h-10 bg-gray-700/50 rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-3/4 mx-auto mb-8"></div>
                
                {/* Three Cards Grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#0B0F1B] rounded-xl p-6 border-2 border-[#C19A4A]/30">
                    <div className="h-96 bg-gray-700/50 rounded"></div>
                  </div>
                  <div className="bg-[#0B0F1B] rounded-xl p-6 border-2 border-[#C19A4A]/30">
                    <div className="h-96 bg-gray-700/50 rounded"></div>
                  </div>
                  <div className="bg-[#0B0F1B] rounded-xl p-6 border-2 border-[#C19A4A]/30">
                    <div className="h-96 bg-gray-700/50 rounded"></div>
                  </div>
                </div>

                {/* Upload Button - Centered */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-start-2">
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                  </div>
                </div>
              </div>

              {/* Two Column Sections */}
              <div className="space-y-20 animate-pulse">
                {/* Section 1 */}
                <div className="grid grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="h-10 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-6"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                  </div>
                  <div className="h-80 bg-gray-700/50 rounded-2xl"></div>
                </div>

                {/* Section 2 */}
                <div className="grid grid-cols-2 gap-12 items-center">
                  <div className="h-96 bg-gray-700/50 rounded-2xl"></div>
                  <div>
                    <div className="h-10 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-5/6 mb-6"></div>
                    <div className="h-12 bg-gray-700/50 rounded-xl"></div>
                  </div>
                </div>

                {/* Section 3 - Three Cards */}
                <div>
                  <div className="h-10 bg-gray-700/50 rounded w-1/2 mx-auto mb-8"></div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="h-80 bg-gray-700/50 rounded-2xl"></div>
                    <div className="h-80 bg-gray-700/50 rounded-2xl"></div>
                    <div className="h-80 bg-gray-700/50 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-12 scroll-smooth overflow-visible relative">
      
      {/* Background elements - matching about page */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(193,154,74,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(193,154,74,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="relative z-10">
      {/* Hero Section - Full Width on Desktop */}
      <div className="mb-16 px-5 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Mobile View - Keep original */}
          <div className="md:hidden text-left">
            <h1 className="text-4xl text-center font-bold font-[Inter] mb-4">
              Your Marketing Expertise,
              <br />
              <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">Now Carried Forward Forever</span>
            </h1>
            <p className="text-base leading-relaxed mb-4">
              <span className="font-bold">Mini Me is your personal AI co-pilot and consultant, trained on your domain knowledge to help you work smarter on every campaign, so you never start from scratch again.</span>
            </p>

            {/* MiniMe Chat - Mobile */}
            <div className="mt-6">
              <MiniMeChat />
            </div>
          </div>

          {/* Desktop View - Centered */}
          <div className="hidden md:block text-center mt-[65px]">
            <h1 className="text-4xl lg:text-5xl font-bold font-[Inter] mb-6">
              Your Marketing Expertise,
              <br />
              <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">Now Carried Forward Forever</span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-base leading-relaxed mb-8">
                <span className="font-bold">Mini Me is your personal AI co-pilot and consultant, trained on your domain knowledge to help you work smarter on every campaign, so you never start from scratch again.</span>
              </p>
            </div>

            {/* MiniMe Chat - Desktop Centered */}
            <div className="max-w-2xl mx-auto mt-8">
              <MiniMeChat />
            </div>

            {/* CTA Buttons - Desktop Stacked */}
            <div className="max-w-2xl mx-auto mt-8 space-y-3">
              <button onClick={() => router.push('/login')} className="w-full bg-[#C19A4A] text-[#0B0F1B] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors">
                Start For Free
                <ArrowRight size={20} />
              </button>
              <button onClick={() => router.push('/search')} className="w-full bg-transparent border-2 border-white text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                Hire Smarter
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Rest of content with original container */}
      <div className="max-w-4xl mx-auto px-5">
        {/* CTA Buttons - Mobile Only */}
        <div className="flex flex-col md:hidden gap-3 mb-20">
          <button onClick={() => router.push('/login')} className="w-full bg-[#C19A4A] text-[#0B0F1B] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors">
            Start For Free
            <ArrowRight size={20} />
          </button>
          <button onClick={() => router.push('/search')} className="w-full bg-transparent border-2 border-white text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
            Hire Smarter
          </button>
        </div>
      </div>

      {/* Problem Statement Section - Full Width on Desktop */}
      <div className="mb-16 px-5 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold font-[Inter] mb-4">
              You've spent years mastering marketing.
            </h2>
            <p className="text-xl md:text-2xl text-gray-300">
              Every new engagement forces you to start over.
            </p>
          </div>

          {/* Two Column Layout - Marketers & Hirers */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
            {/* Marketers Column */}
            <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
              <h3 className="text-2xl font-bold text-[#C19A4A] mb-6">Marketers</h3>
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                You pour everything into campaigns — then the project ends and it vanishes.
              </p>
              <ul className="space-y-4 text-gray-300 text-base">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Re-explaining your thinking to every new client</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Rebuilding context and strategy from scratch</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Watching your best work disappear when the contract ends</span>
                </li>
              </ul>
            </div>

            {/* Hirers Column */}
            <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
              <h3 className="text-2xl font-bold text-[#C19A4A] mb-6">Hirers</h3>
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                You pay for top talent, but when they leave, the expertise leaves with them.
              </p>
              <ul className="space-y-4 text-gray-300 text-base">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Nothing stays in the organization</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Every new hire requires a full onboarding of text</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
                  <span>High knowledge cost with zero retention</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="text-center">
            <h3 className="text-sm font-bold text-white italic">
              That silent frustration ends here.
            </h3>
          </div>
        </div>
      </div>

      {/* Meet Mini Me Section - Full Width on Desktop */}
      <div className="mb-20 px-5 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
      
          {/* Mobile View - Original Vertical Layout */}
          <div className="md:hidden">
            <h2 className="text-2xl font-bold font-[Inter] text-center mb-4">Meet Mini Me — Your Personal Marketing Expert</h2>
            <p className="text-gray-300 text-center text-base mb-4">A domain-trained AI that learns your unique strategies, instincts, and decision-making. Your private consultant that thinks like a 10-year marketing veteran.</p>
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden mb-10">
              <div className="bg-[#151925] rounded-2xl overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                onContextMenu={(e) => e.preventDefault()}
                controlsList="nodownload"
                disablePictureInPicture
                className="w-full h-full"
              >
                <source src="/assets/ghonsi-home-motion/Minimechat.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              </div>
            </div>
            <div className="p-6">
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden">
                <button onClick={() => router.push('/mini-them-ai')} className="w-full bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors">
                  Claim yours now
                </button>
              </div>
            </div>
          </div>

          {/* Desktop View - Two Column Layout */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-12 md:items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              <h2 className="text-3xl lg:text-4xl font-bold font-[Inter] mb-6">Meet Mini Me — Your Personal Marketing Expert</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">A domain-trained AI that learns your unique strategies, instincts, and decision-making. Your private consultant that thinks like a 10-year marketing veteran.</p>
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden">
                <button onClick={() => router.push('/login')} className="w-full bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors">
                  Claim yours now
                </button>
              </div>
            </div>

            {/* Right Column - Video */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden">
              <div className="bg-[#151925] rounded-2xl overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                onContextMenu={(e) => e.preventDefault()}
                controlsList="nodownload"
                disablePictureInPicture
                className="w-full h-full"
              >
                <source src="/assets/ghonsi-home-motion/Minimechat.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Everything You Need Section */}
      <div className="mb-20 px-5 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold font-[Inter] mb-4">
              Everything you need to never start from scratch again
            </h2>
          </div>

          {/* Three Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {/* Card 1 */}
            <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
              <div className="w-12 h-12 bg-[#C19A4A] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Your Best Work Becomes Your Living Portfolio
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Every insight and campaign mini me helps you create its captured as a shareable proof that tells you 24/7, even when you are off-line.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
              <div className="w-12 h-12 bg-[#C19A4A] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Turn Every Project Into Deeper Expertise
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Run marketing assessment, test your instincts get personalized skill gap analysis, and received targeted lessons drawn from real campaigns on expert frameworks.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
              <div className="w-12 h-12 bg-[#C19A4A] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Stop Guessing What You Don't Know
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Mini-Me surfaces the gaps you didn't know existed, then feel there with created lessons from real campaigns. Start mastering what actually moves the needle.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden w-full md:w-auto">
              <button onClick={() => router.push('/portfolio')} className="w-full md:w-auto md:px-12 bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors">
                Build Your Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Show Real Proof Section */}
      <div className="mb-20 px-5 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
        <div className="mb-1 mt-[-40px]">
          <h2 className="text-2xl md:text-4xl font-bold font-[Inter] text-center mb-4">Hire Talent. Grow your knowledge base.</h2>
          <p className="text-gray-300 text-center text-base mb-4">Find marketers with real track record.</p>
          <p className="text-gray-300 text-center text-base mb-6">Your own AI agent learns your brand and captures insight from every output, so you never start afresh with every hire</p>
          
          {/* Unordered List */}
          <ul className="text-gray-300 text-base leading-relaxed mb-8 space-y-3 max-w-3xl mx-auto">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
              <span>Browse portfolios with timestamped results.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
              <span>Your AI Agent onboard instantly on any new hires knowledge base.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0"></span>
              <span>Every engagements build your team knowledge base.</span>
            </li>
          </ul>

          {/* Stacked Card Images */}
          <div className="max-w-4xl mx-auto mb-8">
            <img 
              src="/assets/ghonsi-home-motion/cards-1.png"
              alt="Card 1" 
              className="w-full block"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
              style={{ display: 'block', marginTop: -65, padding: 0, verticalAlign: 'bottom' }}
            />
            <img 
              src="/assets/ghonsi-home-motion/cards-2.png"
              alt="Card 2" 
              className="w-full block"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
              style={{ display: 'block', marginTop: -180, padding: 0, verticalAlign: 'bottom' }}
            />
            <img 
              src="/assets/ghonsi-home-motion/cards-3.png"
              alt="Card 3" 
              className="w-full block"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
              style={{ display: 'block', marginTop: -180, padding: 0, verticalAlign: 'bottom' }}
            />
            <img 
              src="/assets/ghonsi-home-motion/cards-4.png"
              alt="Card 4" 
              className="w-full block"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
              style={{ display: 'block', marginTop: -180, padding: 0, verticalAlign: 'bottom' }}
            />
          </div>
        </div>
        <div className="flex justify-center mt-[-45px] mb-20">
          <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden w-full md:w-auto">
            <button onClick={() => router.push('/mini-them-handover')} className="w-full md:w-auto md:px-12 bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors">
              Activate Your Team
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* What You Get Section */}
      <WhatYouGetSection />

      {/* Reviews Section - Desktop Full Width */}
      <div className="mb-20 px-5 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
        <Reviews />
        </div>
      </div>

      {/* Trusted Ecosystem Section */}
      <TrustedEcosystemSection 
        partnerName="Borderless"
        partnerLogo="/assets/partners-logo/BLOGO3.png"
        partnerHref="https://borderless.community"
        ctaHref="mailto:partnerships@ghonsiproof.com"
      />

      {/* Final CTA Section */}
      <FinalCTASection 
        primaryHref="/login"
        secondaryHref="/mini-them-ai"
      />
      </div>
      
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
