'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, Send, ChevronRight, ArrowLeft, Loader2, User } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { getUserAgent } from '@/utils/miniThemApi';
import { Player } from '@lottiefiles/react-lottie-player';
import { getChatHistory, chatWithAgent, subscribeToChatUpdates } from '@/utils/agentChatApi';
import { getProfile } from '@/utils/profileApi';
import { getUserProofs } from '@/utils/proofsApi';
import { getDomainQuestionsProfessionals } from '@/utils/domainQuestionsApi';

// ─── Time formatter ───────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ─── Suggestion pills ─────────────────────────────────────────────────────────
const SuggestionPill = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="whitespace-nowrap text-xs text-gray-300 bg-[#111625] border border-white/10 px-4 py-2 rounded-full hover:border-[#C19A4A]/40 hover:text-[#C19A4A] transition-all active:scale-[0.97] shrink-0"
  >
    {label}
  </button>
);

// ─── Chat message bubble ──────────────────────────────────────────────────────
const MessageBubble = ({ msg, isFirstInGroup }) => {
  if (msg.message_type === 'agent') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {isFirstInGroup && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-sm opacity-60" />
              <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center">
                <Bot size={12} strokeWidth={2} className="text-[#0B0F1B]" />
              </div>
            </div>
            <span className="text-xs font-semibold font-[Inter] text-[#C19A4A]">Mini-Them AI</span>
          </div>
        )}
        <div className="flex gap-2 items-start">
          {!isFirstInGroup && <div className="w-6 shrink-0" />}
          <div className="relative p-[1.5px] rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#C19A4A]/40 to-transparent max-w-[85%]">
            <div className="bg-[#111625] rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
            </div>
          </div>
        </div>
        <div className="ml-8 mt-1">
          <span className="text-[10px] text-gray-600">{msg.created_at ? formatTime(msg.created_at) : ''}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {isFirstInGroup && (
        <div className="flex justify-end items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-gray-400">You</span>
          <div className="w-5 h-5 rounded-full bg-[#1A1F2E] border border-white/10 flex items-center justify-center">
            <User size={10} className="text-gray-400" />
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <div className="bg-[#C19A4A] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <p className="text-sm text-[#0B0F1B] leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</p>
        </div>
      </div>
      <div className="text-right mt-1 mr-1">
        <span className="text-[10px] text-gray-600">{msg.created_at ? formatTime(msg.created_at) : ''}</span>
      </div>
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="animate-in fade-in duration-200">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-sm opacity-60" />
        <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center">
          <Bot size={12} strokeWidth={2} className="text-[#0B0F1B]" />
        </div>
      </div>
      <span className="text-xs font-semibold text-[#C19A4A]">Mini-Them AI</span>
    </div>
    <div className="flex gap-2 items-start">
      <div className="relative p-[1.5px] rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#C19A4A]/40 to-transparent">
        <div className="bg-[#111625] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#C19A4A] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Draft proposal for motion design brief',
  'Apply to the De-Fi job for me',
  'Summarize my skill for a recruiter',
];

// ─── Main Component ───────────────────────────────────────────────────────────
function MiniThemAI() {
  const router = useRouter();
  const [agent, setAgent]                     = useState(null);
  const [chatHistory, setChatHistory]         = useState([]);
  const [chatMessage, setChatMessage]         = useState('');
  const [sendingMessage, setSendingMessage]   = useState(false);
  const [profile, setProfile]                 = useState(null);
  const [proofs, setProofs]                   = useState([]);
  const [domainQuestions, setDomainQuestions] = useState(null);
  const [loading, setLoading]                 = useState(true);
  const messagesEndRef                        = useRef(null);
  const messagesContainerRef                  = useRef(null);
  const subscriptionRef                       = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) { router.push('/login'); return; }

        const userAgent = await getUserAgent(currentUser.id);
        if (!userAgent) { router.push('/professionals/mini-them'); return; }
        setAgent(userAgent);

        const [history, userProfile, userProofs] = await Promise.all([
          getChatHistory(userAgent.id),
          getProfile(currentUser.id),
          getUserProofs(currentUser.id),
        ]);
        setChatHistory(history);
        setProfile(userProfile);
        setProofs(userProofs);

        // Fetch domain questions responses
        try {
          const domainQuestionsData = await getDomainQuestionsProfessionals(currentUser.id);
          setDomainQuestions(domainQuestionsData);
        } catch (error) {
          console.log('No domain questions found:', error);
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  useEffect(() => {
    if (!agent) return;
    subscriptionRef.current = subscribeToChatUpdates(agent.id, (newMessage) => {
      setChatHistory(prev => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    });
    return () => { if (subscriptionRef.current) subscriptionRef.current.unsubscribe(); };
  }, [agent]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatHistory, sendingMessage]);

  const handleSendMessage = async (overrideText) => {
    const text = (overrideText || chatMessage).trim();
    if (!text || sendingMessage || !agent) return;
    setChatMessage('');
    setSendingMessage(true);
    try {
      await chatWithAgent(agent.id, text, { profile, proofs, agent, domainQuestions });
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] text-white flex items-center justify-center pt-[105px]">
        <Loader2 size={48} className="animate-spin text-[#C19A4A]" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <>
      <div
        className="text-white pt-[105px] relative overflow-hidden flex flex-col h-[100dvh]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Ambient blobs */}
        <div className="fixed inset-0 opacity-25 pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
        </div>

        {/* Gold grid */}
        <div className="fixed inset-0 pointer-events-none opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(193,154,74,0.1) 1px, transparent 1px),
                linear-gradient(0deg,  rgba(193,154,74,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 flex flex-col flex-1 min-h-0 w-full">

          {/* Back button */}
          <div className="py-3 shrink-0">
            <button
              onClick={() => router.push('/professionals/mini-them-control')}
              className="inline-flex items-center text-[#C19A4A] text-sm hover:underline gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Control Panel
            </button>
          </div>

          {/* Messages container */}
          <div
            className="flex-1 overflow-y-auto min-h-0"
            ref={messagesContainerRef}
          >
            {chatHistory.length === 0 ? (
              <div className="min-h-full flex flex-col items-center justify-center text-center px-2">
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-2xl opacity-30" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center">
                    <Sparkles size={32} strokeWidth={1.5} className="text-[#0B0F1B]" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Mini-Them AI</h1>
                <p className="text-gray-400 text-sm mb-10">
                  Your AI-powered Mini Me — trained on your verified proofs
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mb-8">
                  {SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-left p-4 rounded-xl border border-white/10 bg-[#111625]/80 hover:border-[#C19A4A]/30 hover:bg-[#111625] transition-all group"
                    >
                      <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {suggestion}
                      </p>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-[#C19A4A] mt-2 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5 py-2">
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 flex items-center justify-center">
                        <Player
                        autoplay
                        loop
                        src="/assets/animations/lottie_transparent.json"
                        style={{ width: 100, height: 100 }}
                        />
                    </div>
                    <span className="text-m text-[#C19A4A] font-semibold">Mini-Them AI</span>
                  </div>
                </div>

                {chatHistory.map((msg, idx) => {
                  const isFirstInGroup = idx === 0 || chatHistory[idx - 1].message_type !== msg.message_type;
                  return <MessageBubble key={msg.id || idx} msg={msg} isFirstInGroup={isFirstInGroup} />;
                })}

                {sendingMessage && <TypingIndicator />}
                <div ref={messagesEndRef} />

                {chatHistory.length < 3 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 justify-center">
                    {SUGGESTIONS.map(s => (
                      <SuggestionPill key={s} label={s} onClick={() => handleSendMessage(s)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="py-3 shrink-0">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
              <div className="bg-[#111625] rounded-2xl flex items-center gap-3 px-4 py-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Mini-Them AI..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!chatMessage.trim() || sendingMessage}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center text-[#0B0F1B] hover:from-[#d9b563] hover:to-[#C19A4A] hover:shadow-[0_0_14px_rgba(193,154,74,0.5)] transition-all active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">
              Mini-Them AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25%       { transform: translate(20px, -50px) scale(1.1); }
            50%       { transform: translate(-20px, 20px) scale(0.9); }
            75%       { transform: translate(50px, 50px) scale(1.05); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </>
  );
}

export default MiniThemAI;
