'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function FinalCTASection({
  primaryHref = "/login",
  secondaryHref = "/mini-them-ai"
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#0a0a0a] relative overflow-hidden py-20 px-6 border-t border-white/5 mt-20">
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
        >
          <h2 className="text-2xl md:text-4xl font-bold font-[Inter] text-white leading-tight">
            Making the workforce smarter — <span className="bg-gradient-to-r from-gray-400 to-[#C19A4A] bg-clip-text text-transparent">starting with you.</span>
          </h2>
        </motion.div>

        <motion.p
          className="text-white/50 text-base md:text-lg max-w-xl mx-auto mt-5 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          Carry your expertise forward. Build teams that never lose knowledge.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          <motion.a
            href={primaryHref}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm px-8 py-3.5 rounded-full transition-all duration-200"
            whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
          >
            Start for Free
          </motion.a>

          <motion.a
            href={secondaryHref}
            className="w-full sm:w-auto group border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm px-8 py-3.5 rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
          >
            Build Team Intelligence
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </motion.a>
        </motion.div>

        <motion.p
          className="text-white/40 text-sm max-w-xl mx-auto mt-3"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          Start free today. No credit card required
        </motion.p>
      </div>

      {/* Ambient glow */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none w-[280px] h-[160px] sm:w-[480px] sm:h-[240px] rounded-full bg-amber-400/[0.07]"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
    </section>
  );
}
