'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Pause, Play, MessageSquare, CheckCircle2, Clock, XCircle, Settings, ArrowLeft, Loader2, Send, ExternalLink } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { getUserAgent, getAgentTasks, approveAgentTask, rejectAgentTask, toggleAgentStatus, getAgentStats } from '@/utils/miniThemApi';
import { getChatHistory, chatWithAgent, subscribeToChatUpdates } from '@/utils/agentChatApi';
import { Player } from '@lottiefiles/react-lottie-player';
import { getProfile } from '@/utils/profileApi';
import { getUserProofs } from '@/utils/proofsApi';
import { getDomainQuestionsProfessionals } from '@/utils/domainQuestionsApi';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

function MiniThemControl() {
  const router = useRouter();
  const [agent, setAgent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [domainQuestions, setDomainQuestions] = useState(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        const userAgent = await getUserAgent(currentUser.id);

        if (!userAgent) {
          router.push('/professionals/mini-them');
          return;
        }
        setAgent(userAgent);

        const [agentTasks, agentStats, userProfile, userProofs] = await Promise.all([
          getAgentTasks(userAgent.id),
          getAgentStats(userAgent.id),
          getProfile(currentUser.id),
          getUserProofs(currentUser.id),
        ]);

        setTasks(agentTasks);
        setStats(agentStats);
        setProfile(userProfile);
        setProofs(userProofs);

        // Fetch domain questions responses
        try {
          const domainQuestionsData = await getDomainQuestionsProfessionals(currentUser.id);
          setDomainQuestions(domainQuestionsData);
        } catch (error) {
          console.log('No domain questions found:', error);
        }

        // Load chat history using agent.id
        const history = await getChatHistory(userAgent.id);
        setChatHistory(history);
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  // Subscribe to real-time chat updates using agent.id
  useEffect(() => {
    if (!agent) return;

    subscriptionRef.current = subscribeToChatUpdates(agent.id, (newMessage) => {
      console.log('Real-time message received:', newMessage);
      setChatHistory(prev => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [agent]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleToggleStatus = async () => {
    try {
      const newStatus = agent.status === 'active' ? 'paused' : 'active';
      await toggleAgentStatus(agent.id, newStatus);
      setAgent({ ...agent, status: newStatus });
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Failed to update agent status');
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      await approveAgentTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'approved' } : t));
      setStats(prev => ({
        ...prev,
        approved: (prev?.approved || 0) + 1,
        pending_approval: Math.max((prev?.pending_approval || 0) - 1, 0),
      }));
      setSelectedTask(null);
      alert('Task approved and executed!');
    } catch (error) {
      console.error('Approve task error:', error);
      alert('Failed to approve task');
    }
  };

  const handleRejectTask = async (taskId) => {
    const reason = prompt('Why are you rejecting this task?');
    if (!reason) return;

    try {
      await rejectAgentTask(taskId, reason);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'rejected' } : t));
      setStats(prev => ({
        ...prev,
        rejected: (prev?.rejected || 0) + 1,
        pending_approval: Math.max((prev?.pending_approval || 0) - 1, 0),
      }));
      setSelectedTask(null);
    } catch (error) {
      console.error('Reject task error:', error);
      alert('Failed to reject task');
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || sendingMessage || !agent) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setSendingMessage(true);

    try {
      await chatWithAgent(agent.id, userMsg, { profile, proofs, agent, domainQuestions });
      // Response will arrive via real-time subscription
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="miniThemControl" />;
  }

  if (!agent) return null;

  const pendingTasks = tasks.filter(t => t.status === 'pending_approval');

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <button
          onClick={() => router.push('/professionals/dashboard')}
          className="inline-flex items-center text-[#C19A4A] text-sm mb-6 hover:underline gap-1 mt-[115px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <Player
                autoplay
                loop
                src="/assets/animations/lottie_transparent.json"
                style={{ width: 120, height: 120 }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Mini-Them Control Panel</h1>
                <p className="text-sm text-gray-400">
                  Status:{' '}
                  <span className={agent.status === 'active' ? 'text-green-400' : 'text-yellow-400'}>
                    {agent.status === 'active' ? 'Active & Working' : 'Paused'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  agent.status === 'active'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                }`}
              >
                {agent.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                {agent.status === 'active' ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => router.push('/professionals/settings')}
                className="px-4 py-2 rounded-xl bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/30 font-semibold hover:bg-[#C19A4A]/20 transition-all flex items-center gap-2"
              >
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Tasks',  value: stats?.total_tasks || 0,       color: 'text-white' },
              { label: 'Completed',    value: stats?.completed || 0,          color: 'text-green-400' },
              { label: 'Pending',      value: stats?.pending_approval || 0,   color: 'text-yellow-400' },
              { label: 'Approved',     value: stats?.approved || 0,           color: 'text-blue-400' },
              { label: 'Rejected',     value: stats?.rejected || 0,           color: 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0B0F1B] rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasks Panel */}
          <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[#C19A4A]" />
              Tasks Requiring Approval ({pendingTasks.length})
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No tasks pending approval</p>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#0B0F1B] rounded-xl p-4 border border-white/10 hover:border-[#C19A4A]/30 transition-all cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">
                        {task.task_type?.replace(/_/g, ' ') || 'Task'}
                      </h3>
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.task_description}</p>

                    {(task.proposed_output || task.output) && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">
                        {task.proposed_output || task.output}
                      </p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApproveTask(task.id); }}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRejectTask(task.id); }}
                        className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all flex items-center justify-center gap-1"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bot size={32} className="text-[#C19A4A]" />
                Chat with My Mini-Me
              </h2>
              <button
                onClick={() => router.push('/professionals/mini-them-ai')}
                className="p-3 rounded-xl bg-[#C19A4A]/10 border border-[#C19A4A]/30 text-[#C19A4A] hover:bg-[#C19A4A]/20 hover:shadow-[0_0_15px_rgba(193,154,74,0.3)] transition-all group active:scale-95"
                title="Open Mini-Them AI full page"
              >
                <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="flex-1 bg-[#0B0F1B] rounded-xl p-4 mb-4 max-h-[400px] overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Start a conversation with your Mini-Them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-xl ${
                          msg.message_type === 'user'
                            ? 'bg-[#C19A4A] text-[#0B0F1B]'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  {sendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 px-4 py-2 rounded-xl">
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message... (e.g., 'Make reports shorter')"
                className="flex-1 px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
                disabled={sendingMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !chatMessage.trim()}
                className="px-4 py-3 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setSelectedTask(null)}
          >
            <div
              className="bg-[#111625] rounded-2xl p-6 max-w-2xl w-full border border-[#C19A4A]/20 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-2">
                {selectedTask.task_type?.replace(/_/g, ' ') || 'Task'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{selectedTask.task_description}</p>

              {(selectedTask.proposed_output || selectedTask.output) && (
                <div className="bg-[#0B0F1B] rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Agent Proposal:</p>
                  <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedTask.proposed_output || selectedTask.output}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleApproveTask(selectedTask.id)}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Approve & Execute
                </button>
                <button
                  onClick={() => handleRejectTask(selectedTask.id)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Reject
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiniThemControl;
