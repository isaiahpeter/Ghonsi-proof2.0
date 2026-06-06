'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function TrustedEcosystemSection({
  partnerName = "Borderless",
  partnerLogo,
  partnerHref,
  ctaHref = "mailto:partnerships@ghonsiproof.com"
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const CardContent = () => (
    <div
      className="max-w-sm mx-auto mt-14 rounded-2xl p-10 bg-black border border-white/10 hover:border-amber-400/30 transition-all duration-300"
    >
      {partnerLogo ? (
        <img
          src={partnerLogo}
          alt={partnerName}
          className="w-full max-w-[280px] sm:max-w-[220px] h-auto mx-auto block"
        />
      ) : (
        <div className="w-full max-w-[280px] h-16 mx-auto bg-gray-800 rounded flex items-center justify-center text-gray-400 text-sm">
          Logo not provided
        </div>
      )}
      <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] bg-amber-400/10 text-amber-300 border border-amber-400/20 rounded-full px-3 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Early Ecosystem Partner
      </div>
    </div>
  );

  return (
    <section ref={ref} className="bg-[#0a0a0a] py-20 border-t border-b border-white/5 my-20">
      <div className="px-6 md:px-12 lg:px-20 max-w-2xl md:max-w-7xl mx-auto text-center">
        <div>
          <h2 className="text-white font-bold font-[Inter] text-2xl md:text-4xl">Trusted in the Ecosystem</h2>
          <p className="text-white/50 text-base max-w-lg mx-auto mt-3">
            We're proud to partner with communities building the next generation of Web3 talent.
          </p>
        </div>

        <CardContent />

        <p className="text-white/30 text-xs italic mt-10 max-w-sm mx-auto">
          Let's talk about integrating timestamped proofs into your community or protocol.
        </p>

        <a
          href={ctaHref}
          className="mt-6 group inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-amber-400/40 rounded-full px-6 py-2.5 text-sm transition-all duration-200"
        >
          Interested in partnering?
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </a>
      </div>
    </section>
  );
}
