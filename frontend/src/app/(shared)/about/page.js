// ─────────────────────────────────────────────────────────────────────────────
// SERVER COMPONENT (SSR)
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight, GraduationCap, Users, Building2, Blocks } from 'lucide-react';
import ValuesCarousel from '@/components/about/ValuesCarousel';
import TeamSection from '@/components/about/TeamSection';
import JourneySection from '@/components/about/JourneySection';
import DiscoverabilityButton from '@/components/about/DiscoverabilityButton';
import OurStorySection from '@/components/about/OurStorySection';

export const metadata = {
  title: 'About',
  description: 'Access research-backed insights into the Nigerian market. Built for marketers, business owners, founders and hirers who want to grow with confidence.',
  keywords: [
    'Mini Me AI Agent',
    'AI Agent for Nigerians',
    'Proof of work',
    'Talent discovery platform',
    'AI co-pilot for freelancers',
    'Nigerian professionals',
    'Web3 platform Nigeria',
    'on-chain work history',
    'blockchain portfolio Nigeria',
  ],
  openGraph: {
    title: 'Expert market insights for Nigerian professionals | Ghonsi Proof',
    description: 'Access research-backed insights into the Nigerian market. Built for marketers, business owners, founders and hirers who want to grow with confidence.',
    url: 'https://ghonsiproof.com/about',
    siteName: 'Ghonsi Proof',
    images: [{ url: '/assets/ghonsi-proof-logos/transparent-png-logo/4.png', width: 800, height: 600, alt: 'Ghonsi Proof' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expert market insights for Nigerian professionals | Ghonsi Proof',
    description: 'Access research-backed insights into the Nigerian market. Built for marketers, business owners, founders and hirers who want to grow with confidence.',
    images: ['/assets/ghonsi-proof-logos/transparent-png-logo/4.png'],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden">

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

      <div className="max-w-full mx-auto mt-[70px] min-h-screen relative z-10">

        {/* ── ABOUT SECTION ── */}
        <section id="about" className="p-4 text-center max-w-[100%] my-0 mx-auto mt-[110px] relative z-10">
          <div className="opacity-85 font-bold font-[Inter] mb-8 text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">
              About Us
            </span>
          </div>

          {/* Mobile */}
          <h1 className="md:hidden text-base text-left leading-[1.4] mb-3 font-normal text-gray-300">
            Ghonsi proof is an AI-powered workforce intelligence platform that helps professionals capture, structure, and leverage their domain expertise, and helps hirers retain the knowledge from every engagement.
            <br /><br />
            The platform combines three interconnected layers: a personal AI agent called Mini Me trained on proprietary market research and the user&apos;s own domain inputs, a timestamped work record layer that anchors proof of professional output on the Solana blockchain, and a talent discovery and knowledge retention layer for hirers.
            <br /><br />
            Ghonsi proof addresses a fundamental problem in the global workforce. Knowledge built through professional engagement is consistently lost when contracts end. Professionals lose credit for what they have done. Hirers lose the expertise they paid for. We are the infrastructure that captures both sides of that value permanently.
            <br /><br />
            We are starting with marketing professionals, where local expertise is deepest, most undervalued, and most consistently lost after every contract. Additional domains will follow.
            <br /><br />
            Making the Workforce Smarter.
          </h1>

          {/* Desktop */}
          <div className="hidden md:block max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
              <p className="text-white/80 text-base md:text-lg leading-relaxed text-left">
                Ghonsi proof is an AI-powered workforce intelligence platform that helps professionals capture, structure, and leverage their domain expertise, and helps hirers retain the knowledge from every engagement.
                <br /><br />
                The platform combines three interconnected layers: a personal AI agent called Mini Me trained on proprietary market research and the user&apos;s own domain inputs, a timestamped work record layer that anchors proof of professional output on the Solana blockchain, and a talent discovery and knowledge retention layer for hirers.
                <br /><br />
                Ghonsi proof addresses a fundamental problem in the global workforce. Knowledge built through     professional engagement is consistently lost when contracts end. Professionals lose credit for what     they have done. Hirers lose the expertise they paid for. We are the infrastructure that captures    both  sides of that value permanently.
                <br /><br />
                We are starting with marketing professionals, where local expertise is deepest, most undervalued,    and  most consistently lost after every contract. Additional domains will follow.
                <br /><br />
                Making the Workforce Smarter.
              </p>
            </div>
          </div>
        </section>

        {/* ── NAME ORIGIN ── */}
        <section className="p-4 text-center max-w-5xl my-0 mx-auto mt-16 mb-16 relative z-10">
          <h2 className="text-white text-2xl md:text-3xl mb-8 font-bold font-[Inter]">
            Where does the name &quot;Ghonsi&quot; come from?
          </h2>

          <div className="relative max-w-4xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 relative">
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                The name &quot;Ghonsi&quot; comes from the Ika language spoken in Igbanke and Agbor, Nigeria. It means &quot;to showcase&quot; or &quot;to prove
                something.&quot; It is pronounced as &quot;hon-see&quot; with a silent &quot;g&quot;.
                <br /><br />
                We chose this name because it perfectly captures our mission: helping professionals showcase their real work with permanent, tamper-proof evidence. Born from African roots, built for the global workforce.
              </p>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[24px] border-t-white/10" />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-full blur-lg opacity-40" />
              <img
                src="/assets/team/Prosper.png"
                alt="Prosper Ayere"
                className="relative w-full h-full rounded-full border-4 border-[#C19A4A] object-cover"
              />
            </div>
            <h3 className="text-white text-lg font-bold mb-1">Prosper Ayere</h3>
            <p className="text-[#C19A4A] text-sm">Founder at Ghonsi proof</p>
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <OurStorySection />

        {/* ── DISCOVERABILITY ── */}
        <section className="p-4 max-w-6xl mx-auto mt-20 mb-20 relative z-10">
          <div className="hidden md:flex items-center justify-between gap-12">
            <div className="flex-1">
              <h2 className="text-[#0B0F1B] bg-[#C19A4A] rounded-lg px-6 py-4 text-3xl lg:text-4xl font-bold font-[Inter] mb-4 inline-block">
                Discoverability and Hiring
              </h2>
              <p className="text-white/70 text-base leading-relaxed max-w-2xl">
                Hirers can browse professionals by domain expertise and timestamped, uneditable work history. They can send portfolio requests directly to talents and post project opportunities.
                <br /><br />
                With each completed engagement, the hirer&apos;s knowledge base is automatically updated with reusable outputs derived from real work.
              </p>
            </div>
            <div className="flex-shrink-0">
              <DiscoverabilityButton />
            </div>
          </div>

          <div className="md:hidden space-y-6">
            <div className="text-center">
              <h2 className="text-[#0B0F1B] bg-[#C19A4A] rounded-lg px-6 py-4 text-2xl font-bold font-[Inter] mb-4 inline-block">
                Discoverability and Hiring
              </h2>
              <p className="text-white/70 text-base leading-relaxed">
                Hirers can browse professionals by domain expertise and timestamped, uneditable work history. They can send portfolio requests directly to talents and post project opportunities.
                <br /><br />
                With each completed engagement, the hirer&apos;s knowledge base is automatically updated with reusable outputs derived from real work.
              </p>
            </div>
            <DiscoverabilityButton fullWidth />
          </div>
        </section>

        {/* ── VALUES (client — needs carousel state) ── */}
        <ValuesCarousel />

        {/* ── TEAM (client — needs modal state) ── */}
        <TeamSection />

        {/* ── JOURNEY (client — needs router for CTA buttons) ── */}
        <JourneySection />

        {/* ── PARTNER WITH US ── */}
        <section id="partner" className="py-20 px-5 text-center rounded-lg m-4 relative bg-[#0a0a0a] mt-[-60px]">
          <div className="max-w-5xl mx-auto relative z-10">
            <h2 className="text-[#C19A4A] text-[1.875rem] mb-4 font-[Inter] font-bold">Partner With Us</h2>
            <p className="text-white text-lg mb-4 max-w-3xl mx-auto">
              Partner with us to embed verifiable proof of work directly into your ecosystem.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-12 max-w-3xl mx-auto">
              We work with partners to bring expert marketing intelligence and timestamped proof of work into their ecosystems.
            </p>

            <p className="text-white text-base mb-6 font-semibold">We collaborate with:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              {[
                { icon: <GraduationCap size={24} />, title: 'Academies and Training Institutions', desc: 'Issue verifiable certificates to student portfolios via API. Graduates leave with on-chain proof of skills and an AI companion trained on real market knowledge.' },
                { icon: <Users size={24} />, title: 'Talent Platforms and Hiring Marketplaces', desc: 'Add tamper-proof work records and research-backed marketing intelligence to your users.' },
                { icon: <Building2 size={24} />, title: 'Businesses and Marketing Teams', desc: 'Access domain AI trained on the Nigerian market. Brief smarter and evaluate better.' },
                { icon: <Blocks size={24} />, title: 'Web3 Projects and Communities', desc: 'Permanent proof of contribution plus AI tools that help members perform better. Verified records of what was built and the intelligence to do it again.' },
              ].map((card) => (
                <div key={card.title} className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/30 to-white/10">
                  <div className="bg-[#0B0F1B]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-left h-full">
                    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-4 w-fit">
                      <div className="bg-[#0B0F1B] rounded-xl p-3 text-[#C19A4A]">
                        {card.icon}
                      </div>
                    </div>
                    <h3 className="text-white text-lg font-bold mb-2">{card.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="mailto:partnerships@ghonsiproof.com"
              className="inline-flex gap-2 bg-[#C19A4A] text-[#0B0F1B] py-3 px-6 rounded-lg font-bold cursor-pointer border-none shadow-[0_6px_18px_rgba(193,154,74,0.12)] hover:bg-[#a8853b] transition-all hover:shadow-[0_8px_24px_rgba(193,154,74,0.25)] text-base"
            >
              Discuss a Partnership
            </a>
          </div>
        </section>

        {/* ── CLOSING LINE ── */}
        <div className="py-4 italic font-[Inter]">
          <p className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent text-lg text-center mb-4 max-w-3xl mx-auto">
            Welcome to Ghonsi proof! Where your real work gets proved on-chain, and professional knowledge compounds instead of disappearing.
          </p>
        </div>

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
