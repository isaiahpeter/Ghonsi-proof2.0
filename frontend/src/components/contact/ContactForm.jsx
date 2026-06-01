'use client';
// ─────────────────────────────────────────────────────────────────────────────
// ContactForm — client component
// Contains all interactive state: form fields, dropdown, success modal.
// Extracted from contact/page.js so the page shell can be a Server Component.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

const messageTemplates = {
  default: '',
  verification:
    "Hi team, I'm having trouble with the verification process for my Solana project. Specifically...",
  feedback: 'I really like the platform, but I think it could be improved by...',
  partnership:
    'Hello! We are interested in exploring partnership opportunities with Ghonsi Proof. Our project focuses on...',
  other: 'I have a question about something not listed above...',
};

const subjects = [
  { value: 'verification', label: 'Verification help' },
  { value: 'feedback', label: 'General feedback' },
  { value: 'partnership', label: 'Partnership Inquiry' },
  { value: 'other', label: 'Other' },
];

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubjectChange = (value, label) => {
    setSelectedSubject(label);
    setIsDropdownOpen(false);
    const newMessage = messageTemplates[value] || messageTemplates.default;
    setMessage(newMessage);
    setCharCount(newMessage.length);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
    setName('');
    setEmail('');
    setSelectedSubject('');
    setMessage('');
    setCharCount(0);
  };

  return (
    <>
      <div className="bg-[#131825] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-xl mb-8 lg:mb-3">
        <h2 className="font-semibold text-lg mb-6">Send us a Message</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Name *</label>
            <input
              type="text"
              placeholder="Your full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Email *</label>
            <input
              type="email"
              placeholder="Your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors"
            />
          </div>

          {/* Subject dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Subject *</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors cursor-pointer flex justify-between items-center"
              >
                <span className={!selectedSubject ? 'text-gray-400' : ''}>
                  {selectedSubject || 'Select a subject'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                  className="w-5 h-5 transition-transform duration-200"
                  style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path
                    stroke="#9CA3AF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M6 8l4 4 4-4"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#131825] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {subjects.map((subject) => (
                    <div
                      key={subject.value}
                      onClick={() => handleSubjectChange(subject.value, subject.label)}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-colors"
                    >
                      {subject.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Message *</label>
            <textarea
              rows="4"
              required
              value={message}
              onChange={handleMessageChange}
              placeholder="Tell us how we can help you build your verified portfolio on Ghonsi proof"
              maxLength="500"
              className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors resize-none"
            />
            <div className="text-right text-[10px] text-gray-600">{charCount}/500 characters</div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#C19A4A] text-[#0B0F1B] font-bold py-3.5 rounded-lg hover:bg-[#d4a852] transition-colors mt-2"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#131825] rounded-2xl p-8 border border-gray-800 shadow-xl text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#C19A4A]/10 mb-5">
              <Check className="w-10 h-10 text-[#C19A4A]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
            <p className="text-sm text-[#9CA3AF] mb-6">
              Thank you for contacting us. We will reach out to you via email within 24 hours.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#C19A4A] text-[#0B0F1B] font-bold py-3 rounded-lg hover:bg-[#d4a852] transition-colors"
            >
              Great!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
