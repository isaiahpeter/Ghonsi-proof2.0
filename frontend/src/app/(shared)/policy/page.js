'use client';
import React, { useState, useEffect } from 'react';

function Policy() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: '1. Who We Are',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            Ghonsi Proof is an AI-powered workforce intelligence platform operated by Ghonsi Proof and accessible at{' '}
            <a href="https://ghonsiproof.com" className="text-[#C19A4A] hover:underline">ghonsiproof.com</a>.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            We help professionals build timestamped work records, deploy personal AI agents, and get discovered by hirers.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            For any privacy-related questions, contact us at{' '}
            <a href="mailto:privacy@ghonsiproof.com" className="text-[#C19A4A] hover:underline">privacy@ghonsiproof.com</a>.
          </p>
        </>
      )
    },
    {
      title: '2. What Data We Collect',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>2.1 Data You Give Us Directly</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Full name and email address at registration</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Profile information including professional title, bio, and social media links</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Work records, certificates, project descriptions, and any files you upload</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Domain expertise and professional background provided during onboarding to configure your Mini Me</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Payment information processed via X402 micropayments in USDC on Solana</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Communications you send to us including support requests</li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>2.2 Data We Collect Automatically</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Device type, browser, and operating system</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">IP address and approximate location</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Pages visited, time spent, and actions taken on the platform</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">How you arrived at Ghonsi Proof</li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>2.3 Blockchain Data</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Any work record you anchor on-chain is permanently recorded on the Solana blockchain. This data cannot be edited, deleted, or removed by us or anyone else after it has been written to the blockchain.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            <strong>By uploading and anchoring a work record, you acknowledge this permanence and consent to it.</strong>
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Personal identifying information is not written directly to the blockchain. Only a cryptographic reference hash and timestamp are anchored on-chain.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>2.4 AI Interaction Data</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Conversations and requests you send to Mini Me</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Outputs generated by Mini Me including proposals, reports, resumes, and campaign plans</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Domain knowledge inputs you provide to configure Mini Me</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            Mini Me interactions are used to improve the quality and personalisation of your AI agent. We do not use your Mini Me conversations to train general AI models for use by other users without your explicit consent.
          </p>
        </>
      )
    },
    {
      title: '3. How We Use Your Data',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We store metadata that cannot identify any person. This includes:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Issuer name</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Program or certificate type</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Internal certificate ID</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Completion date</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Extracted text summary</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Metadata hash</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">This information is public and permanent once committed.</p>
        </>
      )
    },
    {
      title: '3. How We Use Your Data',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We use your data to:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Create and manage your account</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Operate and personalise your Mini Me AI agent</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Timestamp and anchor your work records on the Solana blockchain</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Make your profile discoverable to hirers</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Process payments via X402 and hirer subscriptions</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Send platform notifications, credit alerts, and service updates</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Improve the platform based on usage patterns and feedback</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Comply with legal obligations under the Nigeria Data Protection Regulation and other applicable laws</li>
          </ul>
        </>
      )
    },
    {
      title: '4. Legal Basis for Processing',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            Under the Nigeria Data Protection Regulation 2019 and where applicable the EU General Data Protection Regulation, we process your personal data on the following bases:
          </p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Contract:</strong> processing necessary to provide the services you signed up for
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Consent:</strong> where you have explicitly agreed, for example making your profile publicly discoverable
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Legitimate interests:</strong> improving the platform, preventing fraud, and ensuring security
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Legal obligation:</strong> complying with Nigerian law and applicable regulations
            </li>
          </ul>
        </>
      )
    },
    {
      title: '5. Who We Share Your Data With',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>5.1 Other Users</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Your public profile, work records, and portfolio are visible to hirers on the platform according to your privacy settings. Portfolio requests from hirers require your acceptance before your full portfolio is shared.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>5.2 Service Providers</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            We share your data with our service providers only as necessary for optimal service delivery.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>5.3 Academy Partners</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            If you are a student of an academy integrating with Ghonsi Proof via our API, that academy may push certificate data to your portfolio. The academy is responsible for obtaining your consent before doing so.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>5.4 Legal Requirements</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            We may disclose your data if required by law, court order, or regulatory authority in Nigeria or any applicable jurisdiction.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>5.5 What We Never Do</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">We never sell your personal data to third parties</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">We never share your Mini Me conversations with other users</li>
          </ul>
        </>
      )
    },
    {
      title: '6. Blockchain Data and Your Right to Deletion',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            <strong>On-chain records cannot be deleted.</strong> Once a work record is anchored on the Solana blockchain, it exists permanently on a decentralised public ledger. Neither Ghonsi Proof nor anyone else can remove it.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            <strong>By choosing to anchor a record on-chain, you permanently waive the right to deletion of that specific on-chain entry.</strong>
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            We can and will delete your account, your off-chain profile data, and any platform-side records upon valid request. Your on-chain timestamp will remain but without your personal identity attached to it on our platform.
          </p>
        </>
      )
    },
    {
      title: '7. Your Rights',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">You have the following rights:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Right to access:</strong> request a copy of the personal data we hold about you
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Right to correction:</strong> request correction of inaccurate data
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Right to deletion:</strong> request deletion of your account and off-chain personal data, subject to the blockchain exception above
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Right to object:</strong> object to processing of your data for certain purposes
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Right to portability:</strong> request your data in a portable format
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              <strong>Right to withdraw consent:</strong> withdraw consent where processing is based on consent
            </li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:support@ghonsiproof.com" className="text-[#C19A4A] hover:underline">support@ghonsiproof.com</a>.
            We will respond within 30 days.
          </p>
        </>
      )
    },
    {
      title: '8. Data Retention',
      content: (
        <>
          <ul className="list-none pl-0 mt-0 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Account data is retained for as long as your account is active
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              After account deletion, off-chain data is deleted within 30 days
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              On-chain records are permanent and cannot be deleted
            </li>
          </ul>
        </>
      )
    },
    {
      title: '9. Data Security',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security reviews.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            No internet-based system is completely secure. You are responsible for keeping your login credentials confidential.
          </p>
        </>
      )
    },
    {
      title: '10. Children',
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
          Ghonsi Proof is not intended for users under the age of 18. We do not knowingly collect data from minors. If you believe a minor has created an account, contact us at{' '}
          <a href="mailto:support@ghonsiproof.com" className="text-[#C19A4A] hover:underline">support@ghonsiproof.com</a>{' '}
          and we will delete the account promptly.
        </p>
      )
    },
    {
      title: '11. Changes to This Policy',
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by a prominent notice on the platform at least 14 days before changes take effect. Continued use of the platform after changes take effect constitutes your acceptance of the updated policy.
        </p>
      )
    },
    {
      title: '12. Contact',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>Ghonsi Proof</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Email: <a href="mailto:support@ghonsiproof.com" className="text-[#C19A4A] hover:underline">support@ghonsiproof.com</a>
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">Nigeria</p>
        </>
      )
    }
  ];

  if (loading) {
    return (
      <main className="flex-grow px-4 pb-12 w-full max-w-[500px] lg:max-w-5xl mx-auto bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white selection:bg-[#C19A4A] selection:text-[#0B0F1B] min-h-screen">
        <div className="text-center mb-8 pt-4 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mx-auto mb-4 mt-[105px]"></div>
          <div className="h-4 bg-gray-700 rounded w-96 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-80 mx-auto"></div>
        </div>

        <div className="mb-8 text-center animate-pulse">
          <div className="h-3 bg-gray-700 rounded w-40 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-700 rounded-lg h-16"></div>
          ))}
        </div>

        <div className="mt-12 animate-pulse">
          <div className="bg-gray-700 rounded-lg h-32"></div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-grow px-4 pb-12 w-full max-w-[500px] lg:max-w-5xl mx-auto bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white selection:bg-[#C19A4A] selection:text-[#0B0F1B] min-h-screen">
        
        <div className="text-center mb-8 pt-4">
          <h1 className="text-[28px] lg:text-[40px] font-semibold font-[Inter] mb-2 mt-[105px] text-[#C19A4A]">Privacy Policy</h1>
          <p className="text-sm text-[#CCC] font-light leading-[1.5] max-w-[520px] mx-auto">This Privacy Policy explains how we collect, use, and protect information on our platform. We are committed to privacy and we store only the minimum data required for verification and portfolio features</p>
        </div>

        <div className="mb-8 text-center">
          <p className="text-xs text-[#CCC] font-light">Effective Date: May 2026</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {accordionData.map((item, index) => (
            <div key={index} className="border border-[#C19A4A]/30 rounded-lg mb-3 overflow-hidden">
              <div
                className={`${activeIndex === index ? 'bg-[#C19A4A]/10' : 'bg-[#131825]/80'} p-4 cursor-pointer flex justify-between items-center transition-all duration-300 ease-in-out select-none hover:bg-[#131825]`}
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-sm font-semibold text-white m-0">{item.title}</h3>
                <svg
                  className={`w-5 h-5 text-[#C19A4A] transition-transform duration-300 ease-in-out ${activeIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
              {activeIndex === index && (
                <div className="bg-[#131825]/50 p-4 border-t border-[#C19A4A]/20">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 rounded-lg border border-[#C19A4A]/30 bg-[#C19A4A]/5">
          <div className="flex gap-3 items-start">
            <svg className="w-5 h-5 text-[#C19A4A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 -10a8 8 0 1 1 0 16A8 8 0 0 1 12 3z"></path>
            </svg>
            <div>
              <h4 className="text-[#C19A4A] font-medium text-sm mb-1">Policy Updates</h4>
              <p className="text-xs text-[#CCC] leading-relaxed font-light">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy with a new date and requesting your consent if required.</p>
            </div>
          </div>
        </div>

      </main>

    </>
  );
}

export default Policy;
