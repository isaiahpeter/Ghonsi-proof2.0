'use client';
// ─────────────────────────────────────────────────────────────────────────────
// FaqAccordion — client component
// Contains the open/close toggle state for FAQ items.
// Extracted from faq/page.js so the page shell can be a Server Component.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'What is Ghonsi Proof?',
    answer: 'Ghonsi proof is the on-chain trust engine for the Web3 workforce. We transform scattered contributions (work histories, career milestones, certificates, career breaks, etc) into a single verifiable professional identity.',
  },
  {
    question: 'How do I get my proofs timestamped on-chain?',
    answer: 'We timestamp your proofs by helping you anchor it to the blockchain and make use of the timestamp nature of the blockchain.',
  },
  {
    question: 'What kind of proof can I upload?',
    answer: 'Anything that validates your work: screenshots of acceptance emails, links to articles, contribution certificates, or records of specific project roles.',
  },
  {
    question: 'Is my data safe and private?',
    answer: 'Yes. Your identity is tied to your wallet, which you control. You decide who sees your portfolio, and your profile. Only privacy optimized data are stored onchain.',
  },
  {
    question: 'Can I share my profile?',
    answer: 'Yes. Every Ghonsi proof profile has a shareable link you can use on social media or in job applications.',
  },
  {
    question: 'Which wallets are supported?',
    answer: 'We are built on Solana and support all major Solana-compatible wallets. Including Phantom and Solflare.',
  },
  {
    question: 'Can companies use this for hiring?',
    answer: 'Yes. Founders, DAOs and Hirers use Ghonsi proof to find and verify talent based on proven work and contributions.',
  },
  {
    question: 'What if I lose access to my wallet?',
    answer: 'We recommend using our email backup feature during sign-up to ensure you can always recover your verified portfolio.',
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, you can delete your account at anytime but data recorded on the blockchain is permanent and immutable.',
  },
];

export default function FaqAccordion() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="max-w-[500px] lg:max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {faqs.map((faq, index) => (
        <article
          key={index}
          className="mb-[15px] bg-[rgba(193,154,74,0.1)] border border-[#C19A4A] rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-[#0B0F1B]"
        >
          <div
            className="flex justify-between items-center p-[18px] cursor-pointer select-none"
            onClick={() => toggleQuestion(index)}
          >
            <p className="text-base font-semibold text-white m-0 flex-1">{faq.question}</p>
            <button
              className="bg-none border-none text-[#C19A4A] text-lg cursor-pointer flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out p-0 hover:scale-110"
              type="button"
              aria-label={openQuestion === index ? 'Collapse answer' : 'Expand answer'}
              aria-expanded={openQuestion === index}
            >
              {openQuestion === index ? (
                <ChevronUp size={18} color="#C19A4A" />
              ) : (
                <ChevronDown size={18} color="#C19A4A" />
              )}
            </button>
          </div>

          {openQuestion === index && (
            <div className="bg-[#C19A4A] pt-2.5 px-5 pb-5 max-h-[1000px] overflow-hidden">
              <p className="text-sm text-white leading-[1.6] m-0">{faq.answer}</p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
