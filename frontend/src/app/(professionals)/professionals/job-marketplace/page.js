'use client';
import React, { useRef } from 'react';
import { Briefcase, TrendingUp, Users, Building2 } from 'lucide-react';
import JobBoard from '@/components/professionals/JobBoard';

const JobMarketplace = () => {
  const jobBoardRef = useRef(null);

  const handlePostJobClick = () => {
    if (jobBoardRef.current) {
      jobBoardRef.current.openPostModal();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] text-white">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-5 pt-24 sm:pt-32 pb-12 sm:pb-20">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#C19A4A]/10 border border-[#C19A4A]/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
            <Briefcase className="text-[#C19A4A]" size={16} />
            <span className="text-[#C19A4A] text-xs sm:text-sm font-medium">Web3 Job Marketplace</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
            Find Your Next Web3 Opportunity
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Connect with verified Web3 companies and professionals. Post jobs, discover talent, and manage applications with AI-powered matching.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {[
            { icon: Briefcase, label: 'Active Jobs', value: '234', color: 'text-blue-400' },
            { icon: Users, label: 'Job Seekers', value: '1.2k', color: 'text-green-400' },
            { icon: Building2, label: 'Companies', value: '89', color: 'text-purple-400' },
            { icon: TrendingUp, label: 'Hired This Week', value: '47', color: 'text-[#C19A4A]' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#151925] rounded-lg sm:rounded-xl p-3 sm:p-5 border border-[#C19A4A]/20 hover:border-[#C19A4A]/40 transition-all">
              <stat.icon className={`${stat.color} mb-2 sm:mb-3`} size={24} />
              <p className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{stat.value}</p>
              <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Banner */}
        <div className="bg-gradient-to-r from-[#C19A4A]/10 to-transparent border border-[#C19A4A]/20 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="flex flex-wrap gap-3 sm:gap-6 items-center justify-center text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl">🤖</span>
              <span className="text-gray-300">AI-Powered Matching</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl">✅</span>
              <span className="text-gray-300">Verified Profiles</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl">⚡</span>
              <span className="text-gray-300">Instant Applications</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl">🔒</span>
              <span className="text-gray-300">Blockchain Verified</span>
            </div>
          </div>
        </div>

        {/* Job Board Component */}
        <JobBoard ref={jobBoardRef} />

        {/* Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center bg-[#151925] rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-[#C19A4A]/20">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Ready to Build the Future?</h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-xl mx-auto px-2">
            Join thousands of Web3 professionals finding their dream jobs and building the decentralized future.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <button 
              onClick={handlePostJobClick}
              className="w-full sm:w-auto bg-[#C19A4A] text-[#0B0F1B] px-6 py-3 rounded-xl font-bold hover:bg-[#d4af37] transition-colors"
            >
              Post a Job
            </button>
            <button className="w-full sm:w-auto bg-transparent border border-[#C19A4A] text-[#C19A4A] px-6 py-3 rounded-xl font-bold hover:bg-[#C19A4A]/10 transition-colors">
              Browse All Jobs
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default JobMarketplace;
