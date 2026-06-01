'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, CheckCircle2, Settings, Upload, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { scanUserProofs, createMiniThemAgent, saveAgentDraft, loadAgentDraft, clearAgentDraft } from '@/utils/miniThemApi';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

function MiniThemHandover() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Agent data
  const [scanResults, setScanResults] = useState(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [aiSummary, setAiSummary] = useState(''); // New state for AI-generated summary
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [settings, setSettings] = useState({
    autoApplyJobs: true,
    requireApproval: true,
    maxDailyTasks: 10,
    notificationPreferences: 'in_app',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null); // 'proof' or 'insights'

  useEffect(() => {
    const initUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      // Load draft if exists
      const draft = loadAgentDraft(currentUser.id);
      if (draft) {
        setScanResults(draft.scanResults);
        setCustomInstructions(draft.customInstructions || '');
        setAiSummary(draft.aiSummary || '');
        setSettings(draft.settings || settings);
      }
      
      setInitialLoading(false);
    };
    initUser();
  }, [router]);

  // Auto-save draft
  useEffect(() => {
    if (user && scanResults) {
      saveAgentDraft(user.id, {
        scanResults,
        customInstructions,
        aiSummary,
        settings,
      });
    }
  }, [user, scanResults, customInstructions, aiSummary, settings]);

  const handleStartScan = async () => {
    if (!user) {
      alert('Please wait, loading your account…');
      return;
    }

    // Show selection modal instead of starting scan immediately
    setShowSelectionModal(true);
  };

  const handleModeSelection = async (mode) => {
    setSelectedMode(mode);
    setShowSelectionModal(false);
    setLoading(true);

    try {
      if (mode === 'proof') {
        // Check if user has proofs
        const { getUserProofs } = await import('@/utils/proofsApi');
        const userProofs = await getUserProofs(user.id);
        
        if (!userProofs || userProofs.length === 0) {
          alert('No proofs uploaded yet. Please upload proofs first or choose "Personalized Insights" mode.');
          setShowSelectionModal(true);
          setLoading(false);
          return;
        }

        // Scan proofs
        const results = await scanUserProofs(user.id);
        setScanResults(results);
        
        // Generate AI summary from scan results
        const summary = `Based on ${results.totalProofsAnalyzed} verified proofs, I've learned that you are a ${results.styleSummary.toLowerCase()} professional with expertise in ${results.learnedSkills.slice(0, 3).join(', ')}${results.learnedSkills.length > 3 ? ', and more' : ''}. Your work consistently demonstrates ${results.commonPatterns.join(', ').toLowerCase()}. I'm ready to replicate your style and handle tasks autonomously while maintaining your high standards.`;
        setAiSummary(summary);
        
      } else if (mode === 'insights') {
        // Scan domain questions for personalized insights
        const { getDomainQuestionsProfessionals } = await import('@/utils/domainQuestionsApi');
        const domainQuestions = await getDomainQuestionsProfessionals(user.id);
        
        if (!domainQuestions) {
          alert('No domain questions responses found. Please complete the domain questions first.');
          setShowSelectionModal(true);
          setLoading(false);
          return;
        }

        // Create scan results from domain questions
        const insights = {
          totalProofsAnalyzed: 0,
          learnedSkills: [
            ...(domainQuestions.market_industry || []),
            'Nigerian Market Specialist',
            'Consumer Insights'
          ],
          styleSummary: `Marketing specialist focused on ${(domainQuestions.market_industry || []).join(', ')} in ${domainQuestions.state_region || 'Nigeria'}`,
          commonPatterns: [
            `Targets ${(domainQuestions.end_consumer || []).slice(0, 2).join(' and ')}`,
            `Operates primarily in ${domainQuestions.state_region || 'Nigeria'}`,
            `Specializes in ${(domainQuestions.market_industry || []).slice(0, 2).join(' and ')}`
          ]
        };
        
        setScanResults(insights);
        
        // Generate AI summary from domain questions
        const platformGoals = (domainQuestions.platform_usage || []).join(', ');
        const markets = (domainQuestions.market_industry || []).join(', ');
        const consumers = (domainQuestions.end_consumer || []).slice(0, 3).join(', ');
        
        const summary = `I'm your AI marketing specialist configured for the Nigerian market. You work in ${markets}${domainQuestions.other_industry ? ` and ${domainQuestions.other_industry}` : ''}, operating primarily in ${domainQuestions.state_region}${domainQuestions.other_state_region ? ` (${domainQuestions.other_state_region})` : ''}. Your target audience includes ${consumers}. Your goals are: ${platformGoals}. I'm ready to provide personalized marketing insights and strategies tailored to your specific market context.`;
        setAiSummary(summary);
      }
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Scan error:', error);
      alert('Failed to scan. Please try again.');
      setShowSelectionModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToActivation = () => {
    setCurrentStep(3);
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      const agentData = {
        learnedSkills: scanResults.learnedSkills,
        styleSummary: aiSummary, // Use edited AI summary instead of original
        commonPatterns: scanResults.commonPatterns,
        customInstructions,
        autoApplyJobs: settings.autoApplyJobs,
        requireApproval: settings.requireApproval,
        maxDailyTasks: settings.maxDailyTasks,
        notificationPreferences: settings.notificationPreferences,
      };

      await createMiniThemAgent(user.id, agentData);
      clearAgentDraft(user.id);
      
      // Show success and redirect
      alert('Success! Your Human + Mini-Them Team is now live.');
      router.push('/mini-them-control');
    } catch (error) {
      console.error('Activation error:', error);
      alert('Failed to activate agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    saveAgentDraft(user.id, {
      scanResults,
      customInstructions,
      aiSummary,
      settings,
    });
    alert('Draft saved! You can continue later.');
    router.push('/dashboard');
  };

  // Screen 1: Start Handover
  if (initialLoading) {
    return <SkeletonLoader type="miniThemHandover" />;
  }

  if (currentStep === 1) {
    return (
      <>
        <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
          <div className="max-w-2xl mx-auto px-5 py-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-[#C19A4A] text-sm mb-8 hover:underline gap-1  mt-[115px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-xl opacity-50" />
              <Bot size={48} className="text-[#0B0F1B] relative z-10" />
              <Sparkles size={20} className="text-[#0B0F1B] absolute top-2 right-2 z-10" />
            </div>
            
            <h1 className="text-4xl font-bold font-[Inter] mb-4 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] bg-clip-text text-transparent">
              Create My Mini-Me Agent
            </h1>
            
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
              Let AI study your on-chain proofs and become your helpful Mini-Them. 
              It will work in your exact style while you focus on bigger things.
            </p>
          </div>

          <div className="bg-[#111625] rounded-2xl p-8 border border-[#C19A4A]/20 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-[#C19A4A]" />
              What You'll Get
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
                <span>10× your productivity with AI that works in your exact style</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
                <span>Automatic job applications and gig completions</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
                <span>All work verified on Solana blockchain</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
                <span>You stay in full control with approval settings</span>
              </li>
              <li className="text-center py-2">
                <span className="text-[#C19A4A] font-semibold text-xl">OR</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
                <span>Personalized insights into the Nigerian market</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleStartScan}
              disabled={loading || !user}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] text-lg font-bold hover:shadow-[0_0_30px_rgba(193,154,74,0.5)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Creating My Mini-Me
                  <ArrowRight size={24} />
                </>
              )}
            </button>

            <button
              onClick={() => window.open('/about', '_blank')}
              className="text-[#C19A4A] text-sm hover:underline"
            >
              Learn More About Mini-Me Agents
            </button>
          </div>
        </div>

        {/* Selection Modal */}
        {showSelectionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-[#111625] rounded-2xl p-8 max-w-2xl w-full border border-[#C19A4A]/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-4">
                  <Sparkles size={32} className="text-[#0B0F1B]" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Choose Your Mini-Me Mode</h2>
                <p className="text-gray-400">Select how you want your AI agent to learn about you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Scan Proof Option */}
                <button
                  onClick={() => handleModeSelection('proof')}
                  className="group relative p-6 rounded-xl border-2 border-white/10 hover:border-[#C19A4A] bg-[#0B0F1B] hover:bg-[#0B0F1B]/80 transition-all text-left"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#C19A4A]/10 flex items-center justify-center group-hover:bg-[#C19A4A]/20 transition-all">
                    <Bot size={20} className="text-[#C19A4A]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Scan Proofs</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    AI learns from your verified on-chain work proofs to replicate your exact style and expertise
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span>Analyzes your work samples</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span>Learns your unique style</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span>Replicates your approach</span>
                    </div>
                  </div>
                </button>

                {/* Personalized Insights Option */}
                <button
                  onClick={() => handleModeSelection('insights')}
                  className="group relative p-6 rounded-xl border-2 border-white/10 hover:border-[#C19A4A] bg-[#0B0F1B] hover:bg-[#0B0F1B]/80 transition-all text-left"
                >
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#C19A4A]/10 flex items-center justify-center group-hover:bg-[#C19A4A]/20 transition-all">
                    <Sparkles size={20} className="text-[#C19A4A]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Personalized Insights</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    AI uses your domain questions responses to provide market-specific insights for Nigeria
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span>Nigerian market expertise</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span>Industry-specific advice</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span>Target audience insights</span>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowSelectionModal(false)}
                className="w-full py-3 rounded-xl border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        </div>
      </>
    );
  }

  // Screen 2: AI Scan & Preview
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
        <div className="max-w-3xl mx-auto px-5 py-12">
          <button
            onClick={() => setCurrentStep(1)}
            className="inline-flex items-center text-[#C19A4A] text-sm mb-8 hover:underline gap-1  mt-[115px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">My Mini-Me is Learning About You</h1>
            <p className="text-gray-400">Based on {scanResults?.totalProofsAnalyzed || 0} verified proofs</p>
          </div>

          {!scanResults ? (
            <div className="bg-[#111625] rounded-2xl p-12 border border-[#C19A4A]/20 text-center">
              <Loader2 size={48} className="animate-spin text-[#C19A4A] mx-auto mb-4" />
              <p className="text-lg text-gray-300">Scanning your on-chain proofs...</p>
              <p className="text-sm text-gray-500 mt-2">This takes about 20 seconds</p>
            </div>
          ) : (
            <>
              <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#C19A4A]" />
                  What I Learned
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Skills I learned:</p>
                    <div className="flex flex-wrap gap-2">
                      {scanResults.learnedSkills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[#C19A4A]/10 border border-[#C19A4A]/30 rounded-full text-sm text-[#C19A4A]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Your style:</p>
                    <p className="text-gray-200">{scanResults.styleSummary}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Common patterns:</p>
                    <ul className="space-y-2">
                      {scanResults.commonPatterns.map((pattern, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-200">
                          <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-1" />
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">AI Summary:</p>
                    <p className="text-gray-200 leading-relaxed">{aiSummary}</p>
                  </div>
                </div>

                {editMode && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <label className="block text-sm text-gray-400 mb-2">
                      Edit AI Summary
                    </label>
                    <textarea
                      value={aiSummary}
                      onChange={(e) => setAiSummary(e.target.value)}
                      placeholder="Edit the AI-generated summary about your work style and expertise..."
                      className="w-full px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A] resize-none mb-4"
                      rows={6}
                    />
                    
                    <label className="block text-sm text-gray-400 mb-2">
                      Add Custom Instructions (Optional)
                    </label>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="E.g., 'Always use my brand colors from proof #3' or 'Make reports shorter'"
                      className="w-full px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A] resize-none"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex-1 py-3 rounded-xl border border-[#C19A4A]/50 text-[#C19A4A] font-semibold hover:bg-[#C19A4A]/10 transition-all flex items-center justify-center gap-2"
                >
                  <Settings size={18} />
                  {editMode ? 'Hide' : 'Edit'} My Instructions
                </button>

                <button
                  onClick={() => document.getElementById('file-upload').click()}
                  className="flex-1 py-3 rounded-xl border border-blue-500/50 text-blue-400 font-semibold hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Add Extra Files
                </button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)])}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="bg-[#111625] rounded-xl p-4 border border-blue-500/20 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Uploaded files:</p>
                  <div className="space-y-1">
                    {uploadedFiles.map((file, idx) => (
                      <p key={idx} className="text-sm text-blue-400">{file.name}</p>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleContinueToActivation}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] text-lg font-bold hover:shadow-[0_0_30px_rgba(193,154,74,0.5)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Looks Good – Continue
                <ArrowRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Screen 3: Activate & Set Rules
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white">
        <div className="max-w-2xl mx-auto px-5 py-12">
          <button
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center text-[#C19A4A] text-sm mb-8 hover:underline gap-1  mt-[115px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Activate Your Mini-Them</h1>
            <p className="text-gray-400">Your Mini-Them is ready! It now knows your style from all your proofs.</p>
          </div>

          <div className="bg-[#111625] rounded-2xl p-6 border border-[#C19A4A]/20 mb-6">
            <h3 className="text-lg font-semibold mb-4">Safety & Permissions</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0B0F1B] rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-white mb-1">Allow Mini-Them to apply to jobs automatically</p>
                  <p className="text-sm text-gray-400">Agent will apply to relevant jobs using your style</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, autoApplyJobs: !settings.autoApplyJobs})}
                  className={`w-14 h-7 rounded-full transition-colors ${settings.autoApplyJobs ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.autoApplyJobs ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0B0F1B] rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-white mb-1">Ask me for approval on big tasks or payments</p>
                  <p className="text-sm text-gray-400">You'll review important work before submission</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, requireApproval: !settings.requireApproval})}
                  className={`w-14 h-7 rounded-full transition-colors ${settings.requireApproval ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.requireApproval ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Maximum daily tasks</label>
                  <select
                    value={settings.maxDailyTasks}
                    onChange={(e) => setSettings({...settings, maxDailyTasks: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white focus:outline-none focus:border-[#C19A4A]"
                  >
                    <option value={5}>5 tasks per day</option>
                    <option value={10}>10 tasks per day</option>
                    <option value={20}>20 tasks per day</option>
                    <option value={999}>Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notification preferences</label>
                  <select
                    value={settings.notificationPreferences}
                    onChange={(e) => setSettings({...settings, notificationPreferences: e.target.value})}
                    className="w-full px-4 py-2 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white focus:outline-none focus:border-[#C19A4A]"
                  >
                    <option value="in_app">In-app only</option>
                    <option value="email">Email notifications</option>
                    <option value="both">Both in-app and email</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mt-4 text-sm text-[#C19A4A] hover:underline flex items-center gap-1"
            >
              <Settings size={14} />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleActivate}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  Activate Mini-Them Now
                </>
              )}
            </button>

            <button
              onClick={handleSaveDraft}
              className="w-full py-3 rounded-xl border border-[#C19A4A]/50 text-[#C19A4A] font-semibold hover:bg-[#C19A4A]/10 transition-all"
            >
              Save as Draft & Activate Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default MiniThemHandover;
