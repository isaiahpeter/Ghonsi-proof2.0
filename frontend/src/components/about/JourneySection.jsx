'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const timelineItems = [
  {
    period: 'Q4 2025',
    title: 'Foundation',
    desc: 'Strategic partnerships and waitlist launch.',
    isLast: false,
  },
  {
    period: 'Q1 2026',
    title: 'MVP Launch',
    desc: 'Beta and Public MVP launch (open signup & onboarding).',
    isLast: false,
  },
  {
    period: 'Q2 2026',
    title: 'Community Growth',
    desc: 'Discovery layer, hiring features, and Human + Mini-Them rollout.',
    isLast: false,
  },
  {
    period: 'Q3 2026',
    title: 'Ecosystem Expansion',
    desc: 'Deeper team capabilities and ecosystem growth.',
    isLast: true,
  },
];

export default function JourneySection() {
  const router = useRouter();

  return (
    <section id="journey" className="py-16 px-5 text-center rounded-lg m-4 relative max-w-5xl mx-auto">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-white text-[1.875rem] mb-8 font-[Inter] font-bold">Our Journey</h2>
        <p className="text-white/80 mb-8">
          From concept to reality here&apos;s how we&apos;re building the future of Proof of Work.
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.25 } },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {timelineItems.map((item) => (
          <motion.div
            key={item.title}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
              className="text-sm text-white/60"
            >
              {item.period}
            </motion.div>

            <div className="relative h-full flex justify-center">
              <motion.span
                variants={{ hidden: { scale: 0 }, visible: { scale: 1, transition: { duration: 0.5, ease: 'easeOut' } } }}
                className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"
              />
              {!item.isLast && (
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20" />
              )}
            </div>

            <motion.div
              variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
              className="pl-5"
            >
              <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">{item.title}</h3>
              <hr className="border-0 border-t border-white/15 my-2" />
              <p className="m-0 text-white/80 text-sm leading-[1.6] text-left mb-8">{item.desc}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Closing paragraph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 1.0 }}
      >
        <p className="text-white/80 mb-8">
          We&apos;re still early, but our focus is clear: make proof of work visible, verifiable, and
          scalable — forever.
          <br />
          Ready to showcase your work and unlock your team&apos;s full potential?
        </p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 1.2 }}
        className="flex flex-col md:flex-row gap-3 mb-20"
      >
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-[#C19A4A] text-[#0B0F1B] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors"
        >
          Create My Portfolio
          <ArrowRight size={20} />
        </button>
        <button
          onClick={() => router.push('/professionals/mini-them')}
          className="w-full bg-transparent border-2 border-white text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
        >
          Launch My Mini-Them Agent
        </button>
      </motion.div>
    </section>
  );
}
