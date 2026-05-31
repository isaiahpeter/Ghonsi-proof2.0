'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import './faq.css';

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Ghonsi Proof?",
      answer: "Ghonsi proof is the on-chain trust engine for the Web3 workforce. We transform scattered contributions (work histories, career milestones, certificates, career breaks, etc) into a single verifiable professional identity."
    },
    {
      question: "How do I get my proofs timestamped on-chain?",
      answer: "We timestamp your proofs by helping you anchor it to the blockchain and make use of the timestamp nature of the blockchain."
    },
    {
      question: "What kind of proof can I upload?",
      answer: "Anything that validates your work: screenshots of acceptance emails, links to articles, contribution certificates, or records of specific project roles."
    },
    {
      question: "Is my data safe and private?",
      answer: "Yes. Your identity is tied to your wallet, which you control. You decide who sees your portfolio, and your profile. Only privacy optimized data are stored onchain. "
    },
    {
      question: "Can I share my profile?",
      answer: "Yes. Every Ghonsi proof profile has a shareable link you can use on social media or in job applications."
    },
    {
      question: "Which wallets are supported?",
      answer: "We are built on Solana and support all major Solana-compatible wallets. Including Phantom and Solflare."
    },
    {
      question: "Can companies use this for hiring?",
      answer: "Yes. Founders, DAOs and Hirers use Ghonsi proof to find and verify talent based on proven work and contributions."
    },
    {
      question: "What if I lose access to my wallet?",
      answer: "We recommend using our email backup feature during sign-up to ensure you can always recover your verified portfolio."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account at anytime but data recorded on the blockchain is permanent and immutable."
    }
  ];

  if (loading) {
    return <SkeletonLoader type="faq" />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)]">
      <main>
        <section className="py-10 px-5 pb-20">
          <div className="text-center mb-10">
            <h1 className="text-[32px] lg:text-[48px] font-bold font-[Inter] mb-[15px] mt-[80px] text-white">Frequently Asked Questions</h1>
            <p className="text-sm lg:text-base text-white leading-[1.6] max-w-2xl mx-auto">Find answers to common questions about Ghonsi Proof and building your on-chain professional identity.</p>
          </div>

          {/* Desktop: Two-column grid | Mobile: Single column */}
          <div className="max-w-[500px] lg:max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {faqs.map((faq, index) => (
              <article key={index} className="mb-[15px] bg-[rgba(193,154,74,0.1)] border border-[#C19A4A] rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-[#0B0F1B]">
                <div className="flex justify-between items-center p-[18px] cursor-pointer select-none" onClick={() => toggleQuestion(index)}>
                  <p className="text-base font-semibold text-white m-0 flex-1">{faq.question}</p>
                  <button className="bg-none border-none text-[#C19A4A] text-lg cursor-pointer flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out p-0 hover:scale-110" type="button">
                    {openQuestion === index ? (
                      <span className="flex items-center justify-center">
                        <ChevronUp size={18} color="#C19A4A" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <ChevronDown size={18} color="#C19A4A" />
                      </span>
                    )}
                  </button>
                </div>
                {openQuestion === index && (
                  <div className="bg-[#C19A4A] pt-2.5 px-5 pb-5 animate-[slideDown_0.3s_ease-out] max-h-[1000px] overflow-hidden">
                    <p className="text-sm text-white leading-[1.6] m-0">{faq.answer}</p>
                  </div>
                )}
              </article>
            ))}
          </div>

         <div className="mt-[75px] mb-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
  <div className="rounded-xl py-6 px-4 bg-[rgba(193,154,74,0.1)] border border-[rgba(193,154,74,0.3)]
  transition-all duration-300 ease-in-out flex flex-col items-center
  hover:bg-[rgba(193,154,74,0.15)] hover:border-[#C19A4A]">

    <FontAwesomeIcon icon={faTelegram} className="text-[36px] text-[#C19A4A]" />
    <h3 className="mt-[17px] text-base font-bold text-white mb-2.5 text-center">
      Telegram community
    </h3>
    <span className="text-xs text-[#CCC] leading-[1.5] mb-[15px] text-center">
      Join our active community for real time supports and discussions
    </span>
    <a href="https://t.me/ghonsiproofhub" target="_blank" rel="noopener noreferrer" className="text-[#C19A4A] text-[13px] font-semibold flex items-center gap-2 hover:text-[#d9b563]">
      Join Telegram <ArrowRight size={15} />
    </a>
  </div>

  <div className="rounded-xl py-6 px-4 bg-[rgba(193,154,74,0.1)] border border-[rgba(193,154,74,0.3)]
  transition-all duration-300 ease-in-out flex flex-col items-center
  hover:bg-[rgba(193,154,74,0.15)] hover:border-[#C19A4A]">

    <FontAwesomeIcon icon={faBook} className="text-[50px] text-[#C19A4A]" />
    <h3 className="mt-[17px] text-base font-bold text-white mb-2.5 text-center">
      Documentation
    </h3>
    <span className="text-xs text-[#CCC] leading-[1.5] mb-[15px] text-center">
      Learn more about Ghonsi proof here by reading our whitepaper.
    </span>
    <a href="https://docs.google.com/document/d/11i4kNIQrShArWAIAWOppRJKZ7Go_rkkgDu2b98cQqT8/edit" target="_blank" rel="noopener noreferrer" className="text-[#C19A4A] text-[13px] font-semibold flex items-center gap-2 hover:text-[#d9b563]">
      View Docs <ArrowRight size={15} />
    </a>
  </div>
         </div>
        </section>
      </main>
    </div>
  );
}

export default FAQ;
