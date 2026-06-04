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
    answer: 'Ghonsi proof is an AI-powered workforce intelligence platform that helps professionals capture, structure, and leverage their domain expertise while helping hirers retain the knowledge from every engagement. It combines a personal AI agent (Mini Me), permanent work portfolio on Solana, and a knowledge retention layer for hirers.',
  },
  {
    question: 'What problem does Ghonsi proof solve?',
    answer: 'Professional knowledge is consistently lost when contracts end. Professionals lose credit for their work, and hirers lose the expertise they paid for. Ghonsi proof captures both the deliverable and the knowledge behind it, making expertise permanent and compounding for both parties.',
  },
  {
    question: 'What is Mini Me?',
    answer: 'Mini Me is your personal AI agent. It is trained on proprietary research on the Nigerian market and your own domain inputs and work records. It functions as an assistant, an expert, and a co-pilot depending on how you engage with it.',
  },
  {
    question: 'How do I get started as a talent?',
    answer: 'Sign up and get Mini Me activated immediately. You can start generating proposals, campaign plans, reports, and other professional outputs with Mini Me, then save completed work as on-chain proof records with one click',
  },
  {
    question: 'Do I need to upload my proof of work on-chain before using the platform?',
    answer: 'No. You can start using Mini Me right away to generate proposals, campaign plans, reports, and other professional outputs without uploading anything on-chain. Putting your work on-chain is completely optional. However, we strongly recommend it. Talents with verified on-chain proof records get priority visibility in the talent discovery layer, making it easier for hirers to find and trust your work.',
  },
  {
    question: 'How does the on-chain proof work?',
    answer: 'When you save a proof record, key metadata (including a cryptographic hash and timestamp) is anchored on the Solana blockchain. This creates an immutable, traceable record of your work. The full files and context remain private to you and off-chain unless you choose to share them.',
  },
  {
    question: 'How does knowledge retention work for hirers?',
    answer: 'After every completed engagement, reusable outputs such as templates, workflows, campaign structures, and best practices are added to your knowledge base. This institutional memory compounds with every new hire, so you don’t lose expertise when a contract ends.',
  },
  {
    question: 'Can hirers browse and request portfolios?',
    answer: 'Yes, hirers can browse talent by expertise, send portfolio requests directly to talents (which they must approve before sharing). You can also post job opportunities on Ghonsi.',
  },
  {
    question: 'Is there a commission on hires?',
    answer: 'No, we does not charge any commission on hires or engagements.',
  },
  {
    question: 'Is my work and data private?',
    answer: 'Yes, you control what is private, what is shared, and what becomes public. Portfolio sharing is always consent-based. On-chain records only store cryptographic hashes and timestamps, not your full work or personal information.',
  },
  {
    question: 'Do I need to understand blockchain to use Ghonsi proof?',
    answer: 'No. The blockchain layer works in the background. Your interaction with the platform is simple and chat-like, you don&apos;t need technical knowledge.',
  },
  {
    question: 'Can Mini Me make mistakes?',
    answer: 'Mini Me is a powerful assistant, but like any AI, its outputs should be reviewed before use. You remain in control of all final work and decisions',
  },
  {
    question: 'How do payments work for talents?',
    answer: 'Every talent receives free AI credits daily, once exhausted additional credits can be purchased in bits (check pricing page for more details). There is no subscription required.',
  },
  {
    question: 'How much does it cost for hirers?',
    answer: 'Hirers can start with one free job post and three portfolio requests. After that, hirer access is available through a flat monthly subscription fee (check pricing page for more details), which includes unlimited talent discovery, portfolio requests, job posts, and access to the knowledge retention layer.',
  },
  {
    question: 'Can training institutions, academies and job marketplaces integrate with Ghonsi proof?',
    answer: 'Yes, academies, institutions and job marketplace can integrate via our enterprise API custom to their needs (contact us for more details).',
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
