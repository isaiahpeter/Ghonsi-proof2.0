'use client';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

const WhatYouGetSection = () => {
  const router = useRouter();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const leftFeatures = [
    '✓ 10 AI credits daily',
    '✓ Get core Marketing expert',
    '✓ Advance portfolio & knowledge capture',
    '✓ Run marketing assessments & skill tests',
    '✓ Chat with Mini Me (limited daily)',
    '✓ Shareable portfolio links'
  ];

  const rightFeaturesTop = [
    '✓ Browse all marketer profiles',
    '✓ View timestamped proofs & portfolios',
    '✓ Basic AI agent for your team',
    '✓ 1 active job post'
  ];

  const rightFeaturesBottom = [
    '✓ Unlimited job posts & portfolio requests',
    '✓ Full AI knowledge capture from every engagement',
    '✓ Advance AI agent for your team',
    '✓ Advanced analytics & hiring insights',
    '✓ Priority support'
  ];

  const leftDelays = [0.5, 0.58, 0.66, 0.74, 0.82, 0.90];
  const rightDelaysTop = [0.65, 0.73, 0.81, 0.89];
  const rightDelaysBottom = [0.97, 1.05, 1.13, 1.21, 1.29];

  const featureVariants = (delay) => ({
    hidden: { opacity: 0, x: -12 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { delay, duration: 0.4, ease: 'easeOut' }
    }
  });

  return (
    <section id="offerings" ref={sectionRef} className="bg-[#0f0f0f] py-20 my-20">
      {/* Mobile View */}
      <div className="md:hidden px-6">
        <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.h2
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-4xl md:text-3xl font-bold font-[Inter] text-white text-center mb-4"
        >
          What You Get –{' '}
          <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">
            Free for Now
          </span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-gray-400 text-center text-base mb-16 max-w-3xl mx-auto"
        >
          Everything you need to prove your work or find real talent — available at no cost today.
        </motion.p>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 mb-10">
          {/* Left Column - For Marketers */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="border border-[#C19A4A]/30 bg-[#151925] rounded-2xl p-8 hover:border-[#C19A4A]/50 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#C19A4A] mb-2">FOR MARKETERS</h3>
              <p className="text-white text-lg font-semibold mb-1">Build your expertise with Mini Me</p>
              <p className="text-gray-400 text-sm">Free to join.</p>
            </div>
            <ul className="space-y-3 mb-6">
              {leftFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  variants={featureVariants(leftDelays[index])}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="flex items-start gap-3 text-white text-sm"
                >
                  <span className="text-[#C19A4A] flex-shrink-0">•</span>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
            <div className="border-t border-white/10 pt-6">
              <p className="text-white font-semibold mb-2">Pay only when you need more</p>
              <p className="text-[#C19A4A] text-lg font-bold mb-1">$0.10 per extra credit</p>
              <p className="text-gray-400 text-xs">Instant top-up • No subscription required</p>
            </div>
          </motion.div>

          {/* Right Column - For Hirers & Teams */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="border border-[#C19A4A]/30 bg-[#151925] rounded-2xl p-8 hover:border-[#C19A4A]/50 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#C19A4A] mb-2">FOR HIRERS & TEAMS</h3>
              <p className="text-white text-lg font-semibold mb-4">Find talent. Grow your knowledge base.</p>
              <p className="text-white font-semibold text-sm mb-3">FREE TO START</p>
            </div>
            <ul className="space-y-3 mb-6">
              {rightFeaturesTop.map((feature, index) => (
                <motion.li
                  key={index}
                  variants={featureVariants(rightDelaysTop[index])}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="flex items-start gap-3 text-white text-sm"
                >
                  <span className="text-[#C19A4A] flex-shrink-0">•</span>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-[#C19A4A] text-lg font-bold mb-3">$39 / month flat rate</p>
              <ul className="space-y-3">
                {rightFeaturesBottom.map((feature, index) => (
                  <motion.li
                    key={index}
                    variants={featureVariants(rightDelaysBottom[index])}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="flex items-start gap-3 text-white text-sm"
                  >
                    <span className="text-[#C19A4A] flex-shrink-0">•</span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <p className="text-gray-400 text-xs">No commission on hires • Cancel anytime</p>
          </motion.div>
        </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block px-5 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.h2
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-5xl font-bold font-[Inter] text-white text-center mb-4"
        >
          What You Get –{' '}
          <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">
            Free for Now
          </span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-gray-400 text-center text-lg mb-16 max-w-3xl mx-auto"
        >
          Everything you need to prove your work or find real talent — available at no cost today.
        </motion.p>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* Left Column - For Marketers */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="border border-[#C19A4A]/30 bg-[#151925] rounded-2xl p-8 hover:border-[#C19A4A]/50 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#C19A4A] mb-2">FOR MARKETERS</h3>
              <p className="text-white text-lg font-semibold mb-1">Build your expertise with Mini Me</p>
              <p className="text-gray-400 text-sm">Free to join.</p>
            </div>
            <ul className="space-y-3 mb-6">
              {leftFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  variants={featureVariants(leftDelays[index])}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="flex items-start gap-3 text-white text-sm"
                >
                  <span className="text-[#C19A4A] flex-shrink-0">•</span>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
            <div className="border-t border-white/10 pt-6">
              <p className="text-white font-semibold mb-2">Pay only when you need more</p>
              <p className="text-[#C19A4A] text-lg font-bold mb-1">$0.10 per extra credit</p>
              <p className="text-gray-400 text-xs">Instant top-up • No subscription required</p>
            </div>
          </motion.div>

          {/* Right Column - For Hirers & Teams */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="border border-[#C19A4A]/30 bg-[#151925] rounded-2xl p-8 hover:border-[#C19A4A]/50 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#C19A4A] mb-2">FOR HIRERS & TEAMS</h3>
              <p className="text-white text-lg font-semibold mb-4">Find talent. Grow your knowledge base.</p>
              <p className="text-white font-semibold text-sm mb-3">FREE TO START</p>
            </div>
            <ul className="space-y-3 mb-6">
              {rightFeaturesTop.map((feature, index) => (
                <motion.li
                  key={index}
                  variants={featureVariants(rightDelaysTop[index])}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="flex items-start gap-3 text-white text-sm"
                >
                  <span className="text-[#C19A4A] flex-shrink-0">•</span>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-[#C19A4A] text-lg font-bold mb-3">$39 / month flat rate</p>
              <ul className="space-y-3">
                {rightFeaturesBottom.map((feature, index) => (
                  <motion.li
                    key={index}
                    variants={featureVariants(rightDelaysBottom[index])}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="flex items-start gap-3 text-white text-sm"
                  >
                    <span className="text-[#C19A4A] flex-shrink-0">•</span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <p className="text-gray-400 text-xs">No commission on hires • Cancel anytime</p>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
