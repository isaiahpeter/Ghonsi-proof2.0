'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OurStorySection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="p-4 max-w-6xl mx-auto mt-20 mb-20 relative z-10">
      <h2 className="text-white text-3xl md:text-4xl font-bold font-[Inter] text-center mb-12">
        Our Story
      </h2>

      {/* Desktop */}
      <div className="hidden lg:flex gap-8 items-start">
        <div className="flex-shrink-0 w-[45%]">
          <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
              <img
                src="/assets/ghonsi-proof-logos/transparent-png-logo/Get-noticed.PNG"
                alt="Ghonsi proof platform diagram"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 text-white/80 text-base leading-relaxed space-y-4">
          <p>It started with a clear problem: In Web3, genuine builders struggle to prove their value. Portfolios are scattered, claims are hard to verify, and recruiters waste time sorting truth from hype.</p>
          <p>We began as proofHub — a simple tool to help professionals document their work as it happens. Then we rebuilt everything on Solana to create a tamper-proof professional identity layer.</p>
          <p>Today, that foundation has grown into something bigger. We saw that the same pain — lost credit and disappearing expertise — exists far beyond Web3. So we evolved Ghonsi proof into a workforce intelligence platform. We built Mini Me, a personal AI agent grounded in deep Nigerian market research, to help professionals execute work and grow their expertise. It also supports founders who struggle to understand the Nigerian market and international companies looking to enter it successfully. We added a knowledge retention layer so hirers don&apos;t lose the expertise they paid for after every engagement, while the permanent on-chain proof layer remains the foundation of trust.</p>
          <p>What began as a way to give builders lasting credit has become infrastructure that captures professional knowledge, proves real work, and makes both talent and hirers smarter with every engagement.</p>
        </div>
      </div>

      {/* Mobile & Tablet */}
      <div className="lg:hidden space-y-8">
        <div className="text-white/80 text-base leading-relaxed space-y-4">
          <p>It started with a clear problem: In Web3, genuine builders struggle to prove their value. Portfolios are scattered, claims are hard to verify, and recruiters waste time sorting truth from hype.</p>
          <p>We began as proofHub — a simple tool to help professionals document their work as it happens. Then we rebuilt everything on Solana to create a tamper-proof professional identity layer.</p>
          
          {/* Collapsible content */}
          <div className={`space-y-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <p>Today, that foundation has grown into something bigger. We saw that the same pain — lost credit and disappearing expertise — exists far beyond Web3. So we evolved Ghonsi proof into a workforce intelligence platform. We built Mini Me, a personal AI agent grounded in deep Nigerian market research, to help professionals execute work and grow their expertise. It also supports founders who struggle to understand the Nigerian market and international companies looking to enter it successfully. We added a knowledge retention layer so hirers don&apos;t lose the expertise they paid for after every engagement, while the permanent on-chain proof layer remains the foundation of trust.</p>
            <p>What began as a way to give builders lasting credit has become infrastructure that captures professional knowledge, proves real work, and makes both talent and hirers smarter with every engagement.</p>
          </div>

          {/* Read More / See Less Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-[#C19A4A] hover:text-[#d4af37] transition-colors font-semibold text-sm mt-4"
          >
            {isExpanded ? (
              <>
                See Less <ChevronUp size={16} />
              </>
            ) : (
              <>
                Read More <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>

        <div className="w-full">
          <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
              <img
                src="/assets/ghonsi-proof-logos/transparent-png-logo/Get-noticed.PNG"
                alt="Ghonsi proof platform diagram"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
