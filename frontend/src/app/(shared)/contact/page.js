// ─────────────────────────────────────────────────────────────────────────────
// SERVER COMPONENT (SSR)
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { Mail, MessageSquare, ArrowRight } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Ghonsi proof team. Ask about verification, partnerships, or anything else. We respond within 24 hours.',
  keywords: [
    'Mini Me AI Agent',
    'AI Agent for Nigerians',
    'Proof of work',
    'Talent discovery platform',
    'AI co-pilot for freelancers',
    'contact Ghonsi proof',
    'partnership inquiry',
  ],
  openGraph: {
    title: 'Contact Us — Ghonsi proof',
    description: 'Have questions about verification or partnership opportunities? We are here to help.',
    url: 'https://ghonsiproof.com/contact',
    siteName: 'Ghonsi proof',
    images: [{ url: '/assets/ghonsi-proof-logos/transparent-png-logo/4.png', width: 800, height: 600, alt: 'Ghonsi proof' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — Ghonsi proof',
    description: 'Have questions about verification or partnership opportunities? We are here to help.',
    images: ['/assets/ghonsi-proof-logos/transparent-png-logo/4.png'],
  },
};

export default function ContactPage() {
  return (
    <div className="selection:bg-[#C19A4A] selection:text-[#0B0F1B] min-h-screen flex flex-col bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">

      <main className="max-w-full lg:max-w-7xl mx-auto mt-[105px] px-5">

        {/* ── Page heading (static — server rendered) ── */}
        <div className="text-center mb-8 space-y-3 pt-4">
          <h1 className="text-4xl font-bold font-[Inter] text-white">Get in Touch</h1>
          <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-sm mx-auto">
            Have questions about verification, a partnership inquiry, or just want to explore
            partnership opportunities? We&apos;re here to help you build your on-chain portfolio.
          </p>
        </div>

        {/* ── Desktop: two-column grid | Mobile: single column ── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">

          {/* Left — Contact form (client component — needs useState) */}
          <ContactForm />

          {/* Right — static contact info + FAQ link */}
          <div>
            {/* Other Ways to Reach Us */}
            <div className="bg-[#131825] rounded-2xl p-6 border border-gray-800 shadow-xl mb-6">
              <h3 className="font-semibold text-white mb-4">Other Ways to Reach Us</h3>

              <div className="space-y-3">
                {/* Email */}
                <a
                  href="mailto:support@ghonsiproof.com"
                  className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4 hover:bg-[#0B0F1B] transition-colors cursor-pointer group block focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50"
                >
                  <div className="bg-[#C19A4A]/10 p-2 rounded-lg text-[#C19A4A] mt-1 group-hover:bg-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Email Support</div>
                    <div className="text-xs text-[#9CA3AF] mt-1">
                      Send us an email and we&apos;ll respond within 24 hours
                    </div>
                    <span className="text-[10px] text-[#C19A4A] mt-1 block hover:underline">
                      support@ghonsiproof.com
                    </span>
                  </div>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.gg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4 hover:bg-[#0B0F1B] transition-colors cursor-pointer group block focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50"
                >
                  <div className="bg-[#C19A4A]/10 p-2 rounded-lg text-[#C19A4A] mt-1 group-hover:bg-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Discord Community</div>
                    <div className="text-xs text-[#9CA3AF] mt-1">
                      Join our active community for real-time support and discussions
                    </div>
                    <span className="text-[10px] text-[#C19A4A] mt-1 block hover:underline">
                      Ghonsi Proof Discord
                    </span>
                  </div>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://x.com/Ghonsiproof"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4 hover:bg-[#0B0F1B] transition-colors cursor-pointer group block focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50"
                >
                  <div className="bg-[#C19A4A]/10 p-2 rounded-lg text-[#C19A4A] mt-1 group-hover:bg-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors flex items-center justify-center">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Follow Us</div>
                    <div className="text-xs text-[#9CA3AF] mt-1">
                      Get the latest updates and announcements
                    </div>
                    <span className="text-[10px] text-[#C19A4A] mt-1 block hover:underline">
                      @Ghonsiproof
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* FAQ quick link */}
            <Link
              href="/faq"
              className="block bg-[#1A1810] border border-[#C19A4A]/20 rounded-xl p-5 hover:border-[#C19A4A]/50 transition-colors group focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50 mb-5 lg:mt-[121px]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[#C19A4A] text-sm font-semibold mb-1">Quick Answers</h4>
                  <p className="text-xs text-[#9CA3AF] max-w-[250px]">
                    Looking for immediate answers? Check out our comprehensive FAQ section.
                  </p>
                  <div className="text-xs text-[#C19A4A] mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Visit FAQ <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
