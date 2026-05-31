'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Clock } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { getMessages, markAsRead, respondToRequest, sendResponseMessage } from '@/utils/messagesApi';
import { getProfile } from '@/utils/profileApi';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

function Message() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const data = await getMessages(user.id);
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await markAsRead(message.id);
      setMessages(messages.map(m => m.id === message.id ? { ...m, read: true } : m));
    }
  };

  const handleResponse = async (messageId, status) => {
    try {
      await respondToRequest(messageId, status);
      setMessages(messages.map(m => m.id === messageId ? { ...m, status } : m));
      setSelectedMessage(prev => prev?.id === messageId ? { ...prev, status } : prev);
      
      // Get current user and profile info
      const currentUser = await getCurrentUser();
      const currentProfile = await getProfile(currentUser.id);
      const senderName = currentProfile?.display_name || 'User';
      
      // Send response message to the requester
      if (status === 'accepted') {
        const portfolioUrl = `${window.location.origin}/portfolio?id=${currentUser.id}`;
        const requesterProfile = await getProfile(selectedMessage.sender_id);
        const requesterName = requesterProfile?.display_name || 'User';
        await sendResponseMessage(
          currentUser.id,
          selectedMessage.sender_id,
          `Hi ${requesterName}\n\n${senderName} has accepted your request to view the portfolio:\n\nHere is the portfolio: ${portfolioUrl}`,
          'PORTFOLIO REQUEST UPDATE'
        );
      } else if (status === 'rejected') {
        const requesterProfile = await getProfile(selectedMessage.sender_id);
        const requesterName = requesterProfile?.display_name || 'User';
        const homeUrl = `${window.location.origin}/`;
        await sendResponseMessage(
          currentUser.id,
          selectedMessage.sender_id,
          `Hi ${requesterName}\n\n${senderName} rejected your request to view their portfolio.\n\nYou can explore similar profiles here: ${homeUrl}`,
          'PORTFOLIO REQUEST UPDATE'
        );
      }
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const truncateText = (text, lines = 2) => {
    if (!text) return '';
    const words = text.split(' ');
    const maxWords = lines * 15;
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
  };

  if (loading) {
    return <SkeletonLoader type="message" />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#0B0F1B] text-white font-sans">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => router.push('/dashboard')} className="inline-flex items-center text-[#C19A4A] text-sm mb-6 hover:underline gap-1 mt-[105px]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold font-[Inter] mb-6">Messages</h1>

          {selectedMessage ? (
            <div className="bg-[#151925] rounded-xl p-6 border border-white/5">
              <button onClick={() => setSelectedMessage(null)} className="text-[#C19A4A] text-sm mb-4 hover:underline">
                ← Back to messages
              </button>
              <h2 className="text-xl font-semibold mb-2">{selectedMessage.sender_name || 'Message'}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Clock size={12} />
                {new Date(selectedMessage.created_at).toLocaleDateString()}
              </div>
              <p className="text-gray-300 leading-relaxed">
                {selectedMessage.message.split(' ').map((word, idx) => 
                  word.startsWith('http') ? (
                    <a key={idx} href={word} target="_blank" rel="noopener noreferrer" className="text-[#C19A4A] underline hover:text-[#d4a852]">{word}</a>
                  ) : word + ' '
                )}
              </p>
              
              {selectedMessage.type === 'profile_request' && !selectedMessage.status && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleResponse(selectedMessage.id, 'accepted')}
                    className="flex-1 bg-[#C19A4A] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#A88539] transition-colors"
                  >
                    ACCEPT
                  </button>
                  <button
                    onClick={() => handleResponse(selectedMessage.id, 'rejected')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    REJECT
                  </button>
                </div>
              )}
              
              {selectedMessage.status && (
                <div className={`mt-4 text-sm font-semibold ${selectedMessage.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedMessage.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="bg-[#151925] rounded-xl p-8 text-center border border-white/5">
                  <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`bg-[#151925] rounded-xl p-4 border cursor-pointer transition-all hover:border-[#C19A4A]/50 ${
                      message.read ? 'border-white/5' : 'border-[#C19A4A]/30 bg-[#C19A4A]/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{message.sender_name || 'Message'}</h3>
                      {!message.read && (
                        <span className="w-2 h-2 bg-[#C19A4A] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{truncateText(message.message)}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Clock size={10} />
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Message;
