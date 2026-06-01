// ─────────────────────────────────────────────────────────────────────────────
// SERVER COMPONENT (SSR)
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import FaqAccordion from '@/components/faq/FaqAccordion';

export const metadata = {
  title: 'FAQ — Ghonsi Proof',
  description: 'Find answers to common questions about Ghonsi Proof and building your on-chain professional identity on Solana.',
  openGraph: {
    title: 'FAQ — Ghonsi Proof',
    description: 'Frequently asked questions about Ghonsi Proof, on-chain credential verification, wallet support, and hiring.',
    url: 'https://ghonsiproof.com/faq',
    siteName: 'Ghonsi Proof',
  },
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)]">
      <main>
        <section className="py-10 px-5 pb-20">

          {/* ── Page heading (static — server rendered) ── */}
          <div className="text-center mb-10">
            <h1 className="text-[32px] lg:text-[48px] font-bold font-[Inter] mb-[15px] mt-[80px] text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-sm lg:text-base text-white leading-[1.6] max-w-2xl mx-auto">
              Find answers to common questions about Ghonsi Proof and building your on-chain professional identity.
            </p>
          </div>

          {/* ── FAQ Accordion (client — needs useState for open/close) ── */}
          <FaqAccordion />

          {/* ── Support cards (static — server rendered) ── */}
          <div className="mt-[75px] mb-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">

            {/* Telegram */}
            <div className="rounded-xl py-6 px-4 bg-[rgba(193,154,74,0.1)] border border-[rgba(193,154,74,0.3)] transition-all duration-300 ease-in-out flex flex-col items-center hover:bg-[rgba(193,154,74,0.15)] hover:border-[#C19A4A]">
              <FontAwesomeIcon icon={faTelegram} className="text-[36px] text-[#C19A4A]" />
              <h3 className="mt-[17px] text-base font-bold text-white mb-2.5 text-center">
                Telegram community
              </h3>
              <span className="text-xs text-[#CCC] leading-[1.5] mb-[15px] text-center">
                Join our active community for real time supports and discussions
              </span>
              <a
                href="https://t.me/ghonsiproofhub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C19A4A] text-[13px] font-semibold flex items-center gap-2 hover:text-[#d9b563]"
              >
                Join Telegram <ArrowRight size={15} />
              </a>
            </div>

            {/* Documentation */}
            <div className="rounded-xl py-6 px-4 bg-[rgba(193,154,74,0.1)] border border-[rgba(193,154,74,0.3)] transition-all duration-300 ease-in-out flex flex-col items-center hover:bg-[rgba(193,154,74,0.15)] hover:border-[#C19A4A]">
              <FontAwesomeIcon icon={faBook} className="text-[50px] text-[#C19A4A]" />
              <h3 className="mt-[17px] text-base font-bold text-white mb-2.5 text-center">
                Documentation
              </h3>
              <span className="text-xs text-[#CCC] leading-[1.5] mb-[15px] text-center">
                Learn more about Ghonsi proof here by reading our whitepaper.
              </span>
              <a
                href="https://docs.google.com/document/d/11i4kNIQrShArWAIAWOppRJKZ7Go_rkkgDu2b98cQqT8/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C19A4A] text-[13px] font-semibold flex items-center gap-2 hover:text-[#d9b563]"
              >
                View Docs <ArrowRight size={15} />
              </a>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
