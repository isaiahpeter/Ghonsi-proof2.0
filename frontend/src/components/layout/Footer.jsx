'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedinIn, faTelegram } from '@fortawesome/free-brands-svg-icons';


function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOfferingsClick = (e) => {
    e.preventDefault();
    if (pathname === '/') {
      scrollToSection('offerings');
    } else {
      router.push('/#offerings');
    }
  };

  return (
    <footer className="bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3 mt-[-28px]">
            <Image src="/assets/ghonsi-proof-logos/transparent-png-logo/4.png" alt="Ghonsi Proof Logo" width={90} height={90} className="object-contain" />
          </div>
          <p className="text-gray-400 text-sm mt-[-29px]">Prove Your Work Permanently.</p>
        </div>

        {/* Four-Column Navigation Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Product */}
          <div>
            <h1 className="text-white font-bold text-sm mb-2">Product</h1>
            <ul className="space-y-[-3px]">
              <li>
                <Link href="/portfolio" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  For Professionals
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  For Hiring Teams
                </Link>
              </li>
              <li>
                <Link href="/#offerings" onClick={handleOfferingsClick} className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Offerings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Company */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2">Company</h3>
            <ul className="space-y-[-3px]">
              <li>
                <Link href="/about" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="https://medium.com/@ghonsiproof" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#partners" onClick={(e) => { e.preventDefault(); scrollToSection('partners'); }} className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2">Resources</h3>
            <ul className="space-y-[-3px]">
              <li>
                <Link href="/faq" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="https://docs.google.com/document/d/11i4kNIQrShArWAIAWOppRJKZ7Go_rkkgDu2b98cQqT8/edit" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://t.me/ghonsiproof" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2">Legal</h3>
            <ul className="space-y-[-3px]">
              <li>
                <Link href="/terms" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/policy" className="text-gray-400 text-sm hover:text-[#C19A4A] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright and Built on Solana */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-gray-400">
              <p>&copy; {currentYear} Ghonsi Proof. All rights reserved.</p>
              <span className="hidden md:inline text-gray-600">|</span>
              <p>Built on Solana.</p>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a 
                href="https://x.com/Ghonsiproof" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#C19A4A] hover:text-[#d4af37] transition-colors"
                aria-label="Twitter/X"
              >
                <FontAwesomeIcon icon={faXTwitter} className="text-xl" />
              </a>
              <a 
                href="https://linkedin.com/company/ghonsiproof" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#C19A4A] hover:text-[#d4af37] transition-colors"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedinIn} className="text-xl" />
              </a>
              <a 
                href="https://t.me/ghonsiproofhub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#C19A4A] hover:text-[#d4af37] transition-colors"
                aria-label="Telegram"
              >
                <FontAwesomeIcon icon={faTelegram} className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
