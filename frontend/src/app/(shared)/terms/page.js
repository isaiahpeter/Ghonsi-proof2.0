'use client';
import React, { useState, useEffect } from 'react';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

function Terms() {
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
      title: '1. About Ghonsi Proof',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            Ghonsi Proof is an AI-powered workforce intelligence platform that allows professionals to build timestamped work records, deploy personal AI agents called Mini Me, and get discovered by hirers.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            Hirers use the platform to discover talent, request portfolios, post jobs, and retain knowledge from every engagement.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            These Terms govern your use of the platform at{' '}
            <a href="https://ghonsiproof.com" className="text-[#C19A4A] hover:underline">ghonsiproof.com</a>{' '}
            and all associated services.
          </p>
        </>
      )
    },
    {
      title: '2. Eligibility',
      content: (
        <>
          <ul className="list-none pl-0 mt-0 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must be at least 18 years old to use Ghonsi Proof
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must be a human individual as automated account creation is not permitted
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must provide accurate and truthful information when registering
            </li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            By using the platform you represent that you meet these requirements.
          </p>
        </>
      )
    },
    {
      title: '3. Your Account',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            Notify us immediately at{' '}
            <a href="mailto:support@ghonsiproof.com" className="text-[#C19A4A] hover:underline">support@ghonsiproof.com</a>{' '}
            if you suspect unauthorised access.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            We reserve the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in behaviour that harms other users or the platform.
          </p>
        </>
      )
    },
    {
      title: '4. Acceptable Use',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>4.1 What You May Do</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Upload genuine work records, certificates, and professional achievements that you created or contributed to
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Use Mini Me to generate proposals, reports, resumes, and professional outputs
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Share your portfolio with potential hirers and employers
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Browse and request portfolios of other users as a hirer
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Post genuine job opportunities as a hirer
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>4.2 What You Must Not Do</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Upload false, fabricated, or misleading work records
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Claim credit for work primarily created by someone else without appropriate attribution
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Use Mini Me to generate content intended to deceive or defraud hirers or employers
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Attempt to manipulate, reverse engineer, or interfere with the platform or its AI systems
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Upload content that is illegal, defamatory, harassing, or infringes the intellectual property rights of others
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Create multiple accounts to circumvent restrictions or bans
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Use the platform for any purpose other than genuine professional networking and talent discovery
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            <strong>Ghonsi Proof timestamps the existence of uploaded records but does not verify their authenticity. You are solely responsible for the accuracy and legitimacy of everything you upload. Uploading false credentials may constitute fraud under applicable Nigerian law.</strong>
          </p>
        </>
      )
    },
    {
      title: '5. On-Chain Records and Permanence',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            When you choose to anchor a work record on the Solana blockchain, the timestamp and a cryptographic reference to your record are written permanently to the blockchain.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            <strong>This record cannot be edited, deleted, or removed by Ghonsi Proof or anyone else.</strong>
          </p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You accept full responsibility for the content of any record you anchor on-chain
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You confirm you have the right to anchor that content and that it does not infringe any third-party rights
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              By anchoring a record on-chain, you irrevocably waive any right to request deletion of that on-chain entry
            </li>
          </ul>
        </>
      )
    },
    {
      title: '6. Mini Me — Your AI Agent',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>6.1 What Mini Me Is</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Mini Me is your personal AI agent grounded in proprietary research conducted by the Ghonsi Proof team on your professional domain and market, and further personalised by your onboarding inputs and work records.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Mini Me operates as an assistant that helps you execute tasks, as an expert that provides domain-grounded guidance, and as a co-pilot that improves with sustained use.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>6.2 Your Responsibility for AI Outputs</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You are responsible for reviewing all Mini Me outputs before submitting them to any third party
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Ghonsi Proof does not guarantee the accuracy, completeness, or fitness for purpose of any Mini Me output
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Mini Me outputs do not constitute professional legal, financial, medical, or regulatory advice
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must not represent AI-generated content as entirely your own original work without appropriate disclosure where required
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>6.3 Credit System</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Every talent account receives 10 free AI credits daily
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Credits reset every day and unused credits do not roll over
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Billable Mini Me actions cost 1 credit each and include job applications, proposals, resumes, reports, and structured document outputs
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Simple Mini Me conversations of up to 20 messages per day are always free
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              When daily credits are exhausted, additional credits can be purchased at $0.10 per credit via X402
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Credit purchases are non-refundable once processed
            </li>
          </ul>
        </>
      )
    },
    {
      title: '7. Payments and Subscriptions',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>7.1 Talent Credits</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            When you purchase additional credits via X402, payment is processed in USDC on the Solana blockchain. All credit purchases are final and non-refundable.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>7.2 Hirer Subscription</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Hirers may subscribe at $39 per month
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Subscriptions are billed monthly
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You may cancel at any time and your access will continue until the end of the current billing period
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              We do not offer prorated refunds for partial months
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>7.3 Proof Upload Charges</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Talents are charged via X402 at a rate published on our pricing page. Upload charges are non-refundable.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>7.4 No Commission</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Ghonsi Proof does not charge commission on any hire, contract, or engagement resulting from connections made on the platform. Our revenue comes from subscriptions and credit purchases only.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>7.5 Regulatory Notice</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Payments processed via X402 use USDC stablecoin on the Solana blockchain. Users are responsible for complying with applicable financial regulations in their jurisdiction including CBN virtual asset regulations in Nigeria.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Ghonsi Proof is not a licensed financial services provider. If you are unsure whether using crypto payments is permitted in your jurisdiction, seek independent legal advice before making a payment.
          </p>
        </>
      )
    },
    {
      title: '8. Intellectual Property',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>8.1 Your Content</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You retain all intellectual property rights in the work records, certificates, portfolios, and other content you upload to Ghonsi Proof
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              By uploading content, you grant Ghonsi Proof a non-exclusive, worldwide, royalty-free licence to store, display, and process that content solely for the purpose of operating the platform
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You represent that you have the right to upload all content you submit and that it does not infringe any third-party intellectual property rights
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>8.2 Our Platform</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              All intellectual property rights in the Ghonsi Proof platform, including its design, code, branding, Mini Me system, and proprietary research, belong to Ghonsi Proof or its licensors
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You may not copy, modify, reverse engineer, or create derivative works based on the platform without our written permission
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>8.3 Mini Me Outputs</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You own the outputs generated by your Mini Me agent
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Ghonsi Proof retains no rights in Mini Me outputs except as necessary to operate the service
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You are responsible for ensuring that Mini Me outputs do not infringe third-party rights
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>8.4 Proprietary Research</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Mini Me is grounded in proprietary research conducted by the Ghonsi Proof team. This research, including domain insights, market intelligence, and training methodologies, is confidential and proprietary to Ghonsi Proof. You may not attempt to extract, reverse engineer, or replicate this research.
          </p>
        </>
      )
    },
    {
      title: '9. Hirers — Additional Terms',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>9.1 Portfolio Requests</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              When you request a portfolio from a talent, you agree to use that information solely for legitimate hiring and evaluation purposes
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must not share, sell, or redistribute talent portfolios to third parties without the talent's explicit consent
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must not use portfolio data to train AI models, build competing services, or engage in any form of data scraping
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>9.2 Job Postings</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              All job postings must be genuine opportunities with real intent to hire
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must not post jobs for the purpose of collecting resumes, market research, or competitive intelligence
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Job postings must comply with applicable employment and anti-discrimination laws
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              We reserve the right to remove job postings that violate these Terms or appear fraudulent
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>9.3 Engagement and Payment</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Ghonsi Proof is a discovery and connection platform. We do not mediate contracts, escrow payments, or enforce agreements between hirers and talents. All engagements, negotiations, and payments occur directly between you and the talent. You are solely responsible for compliance with employment law, tax obligations, and payment terms.
          </p>
        </>
      )
    },
    {
      title: '10. Academy Partners — Additional Terms',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            If you operate an academy, bootcamp, or training institution and wish to partner with Ghonsi Proof to issue verifiable certificates to your graduates, additional terms apply.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3"><strong>10.1 Verification Responsibility</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You are solely responsible for verifying that students have completed your programme before issuing certificates
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Ghonsi Proof timestamps the issuance of certificates but does not verify the underlying training or competence
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must not issue certificates to individuals who have not genuinely completed your programme
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>10.2 Branding and Representation</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You may represent that your certificates are timestamped on Ghonsi Proof
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You must not misrepresent the nature of the partnership or suggest that Ghonsi Proof endorses the quality of your training
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              We reserve the right to terminate academy partnerships that issue fraudulent or misleading certificates
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>10.3 Data Sharing</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            When you issue a certificate to a student via Ghonsi Proof, you share that student's name, programme details, and completion date with the platform. You represent that you have obtained the necessary consents from students to share this data.
          </p>
        </>
      )
    },
    {
      title: '11. Disclaimers and Limitation of Liability',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>11.1 Service Provided "As Is"</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Ghonsi Proof is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the platform's availability, accuracy, reliability, or fitness for any particular purpose.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>11.2 No Verification of User Content</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              We do not verify the authenticity, accuracy, or completeness of work records, certificates, or portfolios uploaded by users
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              We do not conduct background checks on talents or hirers
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              We are not responsible for false, misleading, or fraudulent content uploaded by users
            </li>
          </ul>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>11.3 Third-Party Interactions</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Ghonsi Proof is not a party to any agreement, contract, or engagement between talents and hirers. We are not responsible for disputes, non-payment, breach of contract, or any other issue arising from interactions between users.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>11.4 Limitation of Liability</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            To the maximum extent permitted by law, Ghonsi Proof and its officers, directors, employees, and affiliates shall not be liable for:
          </p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Any indirect, incidental, special, consequential, or punitive damages
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Loss of profits, revenue, data, or business opportunities
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Damages arising from user misuse, false uploads, or fraudulent activity
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Service downtime, technical issues, or data loss
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Interactions between users including hiring disputes, non-payment, or breach of contract
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Errors, inaccuracies, or omissions in Mini Me outputs
            </li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            In any event, our total liability to you for all claims arising from your use of Ghonsi Proof shall not exceed the amount you paid us in the 12 months preceding the claim, or $100 USD, whichever is greater.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>11.5 Indemnification</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            You agree to indemnify and hold harmless Ghonsi Proof from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, your violation of these Terms, or your infringement of any third-party rights.
          </p>
        </>
      )
    },
    {
      title: '12. Termination',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>12.1 Termination by You</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            You may terminate your account at any time by contacting us at{' '}
            <a href="mailto:support@ghonsiproof.com" className="text-[#C19A4A] hover:underline">support@ghonsiproof.com</a>.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            Upon termination, we will delete your account data in accordance with our Privacy Policy. However, any records you have anchored on the blockchain will remain permanently on-chain and cannot be deleted.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>12.2 Termination by Us</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            We reserve the right to suspend or terminate your account immediately if:
          </p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You violate these Terms
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You upload false, fraudulent, or misleading content
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              You engage in behaviour that harms other users or the platform
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              We are required to do so by law or regulatory authority
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Your account has been inactive for more than 24 months
            </li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            We will make reasonable efforts to notify you before termination, but we are not obligated to do so in cases of serious violations or legal requirements.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>12.3 Effect of Termination</strong></p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Upon termination, your access to the platform will cease immediately
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Unused credits and subscription fees are non-refundable
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Sections of these Terms that by their nature should survive termination (including intellectual property, disclaimers, limitation of liability, and governing law) will continue to apply
            </li>
          </ul>
        </>
      )
    },
    {
      title: '13. Governing Law and Disputes',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>13.1 Governing Law</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>13.2 Dispute Resolution</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            If you have a dispute with Ghonsi Proof, we encourage you to contact us first at{' '}
            <a href="mailto:support@ghonsiproof.com" className="text-[#C19A4A] hover:underline">support@ghonsiproof.com</a>{' '}
            to seek an informal resolution.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            If we cannot resolve the dispute informally, any legal action arising from these Terms or your use of the platform must be brought in the courts of Nigeria, and you consent to the exclusive jurisdiction of those courts.
          </p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>13.3 Class Action Waiver</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            To the extent permitted by law, you agree that any dispute with Ghonsi Proof will be resolved on an individual basis and you waive any right to participate in a class action lawsuit or class-wide arbitration.
          </p>
        </>
      )
    },
    {
      title: '14. Changes to These Terms',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            We may update these Terms from time to time to reflect changes in our services, legal requirements, or business practices.
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            When we make material changes, we will notify you by:
          </p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Posting the updated Terms on this page with a new "Last updated" date
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Sending you an email notification at least 14 days before the changes take effect
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Displaying a prominent notice on the platform
            </li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">
            Your continued use of Ghonsi Proof after the changes take effect constitutes your acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the platform and may terminate your account.
          </p>
        </>
      )
    },
    {
      title: '15. Contact',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">
            If you have questions, concerns, or feedback about these Terms, please contact us:
          </p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Email:{' '}
              <a href="mailto:support@ghonsiproof.com" className="text-[#C19A4A] hover:underline">support@ghonsiproof.com</a>
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Legal:{' '}
              <a href="mailto:legal@ghonsiproof.com" className="text-[#C19A4A] hover:underline">legal@ghonsiproof.com</a>
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Company: Ghonsi Proof Technologies
            </li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">
              Location: Nigeria
            </li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4">
            <strong>Effective Date:</strong> May 1, 2026
          </p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">
            By using Ghonsi Proof, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </>
      )
    }
  ];

  if (loading) {
    return <SkeletonLoader type="terms" />;
  }

  return (
    <>
      
      
      <main className="flex-grow px-4 pb-12 w-full max-w-[500px] lg:max-w-5xl mx-auto bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white selection:bg-[#C19A4A] selection:text-[#0B0F1B] min-h-screen">
        
        <div className="text-center mb-8 pt-4">
          <h1 className="text-[28px] lg:text-[40px] font-semibold font-[Inter] mb-2 text-[#C19A4A] mt-[105px]">Terms of Service</h1>
          <p className="text-sm text-[#CCC] font-light leading-[1.5] max-w-[520px] mx-auto">These Terms govern the use of our platform and services. By creating an account, you agree to these rules.</p>
        </div>

        <div className="mb-8 text-center">
          <p className="text-xs text-[#CCC] font-light">Last updated: 1st May, 2026.</p>
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
              <h4 className="text-[#C19A4A] font-medium text-sm mb-1">Terms Updates</h4>
              <p className="text-xs text-[#CCC] leading-relaxed font-light">We may update these Terms of Service from time to time. We will notify you of any material changes by posting the updated terms with a new date and requesting your acceptance if required.</p>
            </div>
          </div>
        </div>

      </main>

    </>
  );
}

export default Terms;
