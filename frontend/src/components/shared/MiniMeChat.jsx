'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MiniMeChat = () => {
  const [currentText, setCurrentText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isErasing, setIsErasing] = useState(false);

  const questions = [
    "Would you like to explore more leads in Lagos?",
    "Which audience segment are you targeting on TikTok/Instagram, WhatsApp, or price-sensitive buyers across Jiji?",
    "Should we focus on a full-funnel campaign, quick-win WhatsApp automation, or localized SEO to dominate searches like 'best crypto wallet in Lagos'?"
  ];

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];

    if (isTyping && !isErasing) {
      if (currentText.length < currentQuestion.length) {
        const timer = setTimeout(() => {
          setCurrentText(currentQuestion.slice(0, currentText.length + 1));
        }, 30);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsTyping(false);
          setIsErasing(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }

    if (isErasing) {
      if (currentText.length > 0) {
        const timer = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 20);
        return () => clearTimeout(timer);
      } else {
        setIsErasing(false);
        setIsTyping(true);
        setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
      }
    }
  }, [currentText, currentQuestionIndex, isTyping, isErasing, questions]);

  return (
    <div className="bg-[#151925] rounded-2xl p-6 border border-[#C19A4A]/30 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#C19A4A]/20">
        <div className="w-10 h-10 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Mini Me AI</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <p className="text-gray-400 text-sm">Your AI Co-pilot</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentText && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#0B0F1B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="bg-[#0B0F1B] rounded-2xl rounded-tl-none px-4 py-3 border border-[#C19A4A]/20">
                  <p className="text-white text-sm leading-relaxed">
                    {currentText}
                    {isTyping && !isErasing && (
                      <span className="inline-block w-1 h-4 bg-[#C19A4A] ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no text */}
        {!currentText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <p className="text-sm">Initializing...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-[#C19A4A]/20">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-4 h-4 text-[#C19A4A]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Trained on your domain expertise</span>
        </div>
      </div>
    </div>
  );
};



export default MiniMeChat;
