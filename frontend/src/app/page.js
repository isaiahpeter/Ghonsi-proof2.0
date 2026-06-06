// ─────────────────────────────────────────────────────────────────────────────
// SERVER COMPONENT (SSR)
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight } from 'lucide-react';
import HeroButtons from '@/components/home/HeroButtons';
import MiniMeChatWrapper from '@/components/home/MiniMeChatWrapper';
import MiniMeVideoSection from '@/components/home/MiniMeVideoSection';
import CardsSection from '@/components/home/CardsSection';
import EverythingYouNeedSection from '@/components/home/EverythingYouNeedSection';
import Reviews from '@/components/shared/Reviews';
import WhatYouGetSection from '@/components/shared/WhatYouGetSection';
import TrustedEcosystemSection from '@/components/shared/TrustedEcosystemSection';
import FinalCTASection from '@/components/shared/FinalCTASection';

export const metadata = {
  metadataBase: new URL('https://ghonsiproof.com'),
  title: 'Gain deeper insights into the Nigerian market | Ghonsi proof',
  description: 'Understand Nigerian consumers better. Make smarter marketing decisions. Built for marketers, business owners, founders, and hirers who want to perform at a higher level. Get started for free!',
  keywords: [
    'Mini Me AI Agent',
    'AI Agent for Nigerians',
    'Proof of work',
    'Talent discovery platform',
    'AI co-pilot for freelancers',
    'on-chain portfolio',
    'blockchain credential verification',
    'Solana professional identity',
    'Nigerian market insights',
    'Web3 talent platform',
  ],
  openGraph: {
    title: 'Gain deeper insights into the Nigerian market | Ghonsi proof',
    description: 'Understand Nigerian consumers better. Make smarter marketing decisions. Built for marketers, business owners, founders, and hirers who want to perform at a higher level. Get started for free!',
    url: 'https://ghonsiproof.com',
    siteName: 'Ghonsi proof',
    images: [{ url: '/assets/ghonsi-proof-logos/transparent-png-logo/4.png', width: 800, height: 600, alt: 'Ghonsi proof' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gain deeper insights into the Nigerian market | Ghonsi proof',
    description: 'Understand Nigerian consumers better. Make smarter marketing decisions. Built for marketers, business owners, founders, and hirers who want to perform at a higher level.',
    images: ['/assets/ghonsi-proof-logos/transparent-png-logo/4.png'],
  },
  icons: {
    icon: '/assets/ghonsi-proof-logos/transparent-png-logo/4.png',
    shortcut: '/assets/ghonsi-proof-logos/transparent-png-logo/4.png',
    apple: '/assets/ghonsi-proof-logos/transparent-png-logo/4.png',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white pt-24 pb-12 scroll-smooth overflow-visible relative">

      {/* ── Background blobs ── */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>

      {/* ── Gold grid overlay ── */}
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

        {/* ── HERO ── */}
        <section className="mb-20 px-5 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">

            {/* Mobile */}
            <div className="md:hidden text-left">
              <h1 className="text-4xl text-center font-bold font-[Inter] mb-4">
                Your Marketing Expertise,
                <br />
                <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">
                  Now Carried Forward Forever
                </span>
              </h1>
              <p className="text-base leading-relaxed mb-4">
                Mini Me is your personal AI co-pilot and consultant, trained on your domain
                knowledge to help you work smarter on every campaign, so you never start from
                scratch again.
              </p>
              <div className="mt-6">
                <MiniMeChatWrapper />
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block text-center mt-[65px]">
              <h1 className="text-4xl lg:text-5xl font-bold font-[Inter] mb-6">
                Your Marketing Expertise,
                <br />
                <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">
                  Now Carried Forward Forever
                </span>
              </h1>
              <div className="max-w-3xl mx-auto">
                <p className="text-base leading-relaxed mb-8">
                  Mini Me is your personal AI co-pilot and consultant, trained on your domain
                  knowledge to help you work smarter on every campaign, so you never start from
                  scratch again.
                </p>
              </div>
              <div className="max-w-2xl mx-auto mt-8">
                <MiniMeChatWrapper />
              </div>
              <div className="max-w-2xl mx-auto mt-8 space-y-3">
                <HeroButtons />
              </div>
            </div>

          </div>
        </section>

        {/* ── CTA buttons mobile only ── */}
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex flex-col md:hidden gap-3 mb-20">
            <HeroButtons />
          </div>
        </div>

        {/* ── PROBLEM STATEMENT ── */}
        <section className="mb-20 px-5 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold font-[Inter] mb-4">
                You&apos;ve spent years mastering marketing.
              </h2>
              <p className="text-base text-gray-300">
                Every new engagement forces you to start over.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Marketers */}
              <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
                <h3 className="text-2xl font-bold text-[#C19A4A] mb-6">Marketers</h3>
                <p className="text-gray-300 text-base leading-relaxed mb-6">
                  You pour everything into campaigns — then the project ends and it vanishes.
                </p>
                <ul className="space-y-4 text-gray-300 text-base">
                  {[
                    'Re-explaining your thinking to every new client',
                    'Rebuilding context and strategy from scratch',
                    'Watching your best work disappear when the contract ends',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hirers */}
              <div className="bg-[#151925] rounded-2xl p-8 border border-[#C19A4A]/30">
                <h3 className="text-2xl font-bold text-[#C19A4A] mb-6">Hirers</h3>
                <p className="text-gray-300 text-base leading-relaxed mb-6">
                  You pay for top talent, but when they leave, the expertise leaves with them.
                </p>
                <ul className="space-y-4 text-gray-300 text-base">
                  {[
                    'Nothing stays in the organization',
                    'Every new hire requires a full onboarding of text',
                    'High knowledge cost with zero retention',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>


          </div>
        </section>

        {/* ── MEET MINI ME ── */}
        <section className="mb-20 px-5 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <MiniMeVideoSection />
          </div>
        </section>

        {/* ── EVERYTHING YOU NEED ── */}
        <section className="mb-20 px-5 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold font-[Inter] mb-4">
                Everything you need to never start from scratch again
              </h2>
            </div>

            <EverythingYouNeedSection />

            <div className="flex justify-center">
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden w-full md:w-auto">
                <a href="/professionals/portfolio" className="block w-full md:w-auto md:px-12 bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors text-center">
                  Build Your Portfolio
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── HIRE TALENT ── */}
        <section className="mb-20 px-5 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl md:text-4xl font-bold font-[Inter] text-center mb-4">
                Hire Talent. Grow your knowledge base.
              </h2>
              <p className="text-gray-300 text-center text-base mb-4">
                Find marketers with real track record.
              </p>
              <p className="text-gray-300 text-center text-base mb-6">
                Your own AI agent learns your brand and captures insight from every output, so you
                never start afresh with every hire
              </p>
              <ul className="text-gray-300 text-base leading-relaxed mb-8 space-y-3 max-w-3xl mx-auto">
                {[
                  'Browse portfolios with timestamped results.',
                  'Your AI Agent onboards instantly on any new hire\'s knowledge base.',
                  'Every engagement builds your team knowledge base.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#C19A4A] rounded-full mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <CardsSection />
            </div>

            <div className="flex justify-center mt-8">
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 overflow-hidden w-full md:w-auto">
                <a href="/hirers/dashboard" className="block w-full md:w-auto md:px-12 bg-[#0B0F1B] text-white py-3 rounded-xl font-semibold hover:bg-[#151925] transition-colors text-center">
                  Activate Your Team
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <WhatYouGetSection />

        {/* ── REVIEWS ── */}
        <section className="mb-20 px-5 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <Reviews />
          </div>
        </section>

        {/* ── TRUSTED ECOSYSTEM ── */}
        <TrustedEcosystemSection
          partnerName="Borderless"
          partnerLogo="/assets/partners-logo/BLOGO3.png"
          partnerHref="https://borderless.community"
          ctaHref="mailto:partnerships@ghonsiproof.com"
        />

        {/* ── FINAL CTA ── */}
        <FinalCTASection
          primaryHref="/login"
          secondaryHref="/professionals/mini-them"
        />

      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
