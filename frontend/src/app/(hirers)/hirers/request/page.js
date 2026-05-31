'use client';
import React, { useState, useEffect } from 'react';
import { X, Share2, Mail, Wallet, ExternalLink, ShieldCheck, Info, Check, Calendar } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { createPortfolioRequestMessage } from '@/utils/messagesApi';
import { getProfileById } from '@/utils/profileApi';
import { getUserProofs, getProofStats } from '@/utils/proofsApi';
import { saveFormData, getFormData, clearFormData } from '@/utils/formPersistence';
import { useToast } from '@/components/ui/Toast';
import ToastContainer from '@/components/ui/Toast';
import { supabase } from '@/lib/supabaseClient';
// Image moved to public: /assets/ghonsi-proof-logos/transparent-png-logo/4.png;

// ─── Gradient border wrapper — mirrors portfolio's p-[2px] card pattern ───────
// variant: 'hero'   = gold→blue full gradient  (profile card)
//          'gold'   = full gold gradient        (achievements stat)
//          'subtle' = faint gold fade           (total stat, skills, proofs wrapper)
//          'dim'    = white/10 fade             (individual proof cards)
const GradientCard = ({ children, variant = 'subtle', className = '', innerClassName = '' }) => {
  const gradients = {
    hero:   'bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500',
    gold:   'bg-gradient-to-br from-[#C19A4A] to-[#d9b563]',
    subtle: 'bg-gradient-to-br from-[#C19A4A]/30 to-transparent',
    dim:    'bg-gradient-to-br from-white/10 to-transparent',
  };
  return (
    <div className={`relative p-[2px] rounded-2xl ${gradients[variant]} ${className}`}>
      <div className={`bg-[#111625] rounded-2xl ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

// ─── Section heading with portfolio's gold left-bar accent ────────────────────
const SectionTitle = ({ children }) => (
  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
    <span className="w-1 h-4 bg-gradient-to-b from-[#C19A4A] to-[#d9b563] rounded-full shrink-0" />
    {children}
  </h3>
);

function Request() {
  const { toasts, addToast, removeToast } = useToast();
  const [profileData, setProfileData]           = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData]                 = useState({ name: '', email: '' });
  const [copied, setCopied]                     = useState(false);
  const [currentUserId, setCurrentUserId]       = useState(null);

  useEffect(() => {
    // Restore form data on mount
    const savedData = getFormData('portfolioRequest');
    if (savedData) {
      console.log('Restoring portfolio request form data');
      setFormData(savedData);
    }

    const fetchProfile = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId    = urlParams.get('id');
      if (!userId) { setLoading(false); return; }

      try {
        const profile = await getProfileById(userId);
        if (!profile) { setLoading(false); return; }

        const proofs = await getUserProofs(userId);
        const stats  = await getProofStats(userId);

        const mappedData = {
          profilePhotoUrl: profile.avatar_url,
          name:   profile.display_name,
          role:   profile.profession || 'Web3 Professional',
          email:  profile.users?.email
            ? `${profile.users.email.substring(0, 8)}***`
            : '',
          wallet: profile.users?.wallet_address || '',
          bio:    profile.bio || 'No bio available.',
          stats: {
            proofs:       stats.verified,
            achievements: stats.verified,
          },
          skills: profile.skills || [],
          proofs: proofs.map(proof => ({
            id:     `GH-${proof.proof_type?.charAt(0).toUpperCase()}-${String(proof.id).padStart(3, '0')}`,
            title:  proof.proof_name,
            status: proof.status === 'verified' ? 'Verifiable' : 'Pending',
            type:   proof.proof_type,
            date:   new Date(proof.created_at).toLocaleDateString(),
            desc:   proof.summary,
            hash:   proof.blockchain_tx || 'Pending...',
          })),
        };
        setProfileData(mappedData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setLoading(false);
    };

    const loadUserEmail = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          if (user.email) setFormData(prev => ({ ...prev, email: user.email }));
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .or(`id.eq.${user.id},wallet_address.eq.${user.wallet_address || user.id}`)
            .single();
          if (userData) setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    fetchProfile();
    loadUserEmail();
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-save form data
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveFormData('portfolioRequest', formData);
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(saveTimeout);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const profileOwnerUserId = urlParams.get('id');
      if (!profileOwnerUserId) { 
        addToast('Invalid profile. Please try again.', 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return; 
      }
      if (!currentUserId) { 
        addToast('Please log in to send a request.', 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return; 
      }

      await createPortfolioRequestMessage(
        profileOwnerUserId,
        formData.name,
        currentUserId,
        profileData.name
      );
      clearFormData('portfolioRequest');
      setShowRequestModal(false);
      setShowSuccessModal(true);
      setFormData({ name: '', email: '' });
      addToast('Request sent successfully!', 'success');
    } catch (error) {
      console.error('Error sending request:', error);
      addToast('Error: ' + error.message, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowRequestModal(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-t-[#C19A4A] border-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] text-white flex items-center justify-center p-4">
        <GradientCard variant="subtle" innerClassName="p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">An Error Occurred</h2>
          <p className="text-gray-400">
            User not found. Try another user or go{' '}
            <a href="/" className="text-[#C19A4A] underline">home</a>.
          </p>
        </GradientCard>
      </div>
    );
  }

  const shortWallet  = profileData.wallet
    ? `${profileData.wallet.substring(0, 4)}...${profileData.wallet.substring(profileData.wallet.length - 4)}`
    : 'Not connected';
  const proofsToShow = profileData.proofs.slice(0, 3);

  return (
    <div
      className="max-w-full mx-auto bg-[#0B0F1B] text-white font-sans selection:bg-[#C19A4A]/30 relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Blob animation keyframes + pulse */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0   rgba(193,154,74,0.7); }
          50%       { box-shadow: 0 0 0 10px rgba(193,154,74,0);   }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0)   scale(1);    }
          25%       { transform: translate(20px, -50px) scale(1.1); }
          50%       { transform: translate(-20px, 20px) scale(0.9); }
          75%       { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* ── Ambient blobs — identical to portfolio ──────────────────────────── */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>

      {/* ── Gold grid overlay — identical to portfolio ──────────────────────── */}
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

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/5 bg-[#0B0F1B]/95 backdrop-blur-sm">
        <a href="/">
          <img src="/assets/ghonsi-proof-logos/transparent-png-logo/4.png" alt="Logo" style={{ width: 'auto', height: '75px' }} />
        </a>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-gray-400 hover:text-[#C19A4A] transition-colors">Home</a>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share Profile'}
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="relative z-10 px-4 pb-28 w-full space-y-6 mt-[100px]">

        {/* Profile card — hero gradient border (gold→blue) */}
        <GradientCard variant="hero">
          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-2xl pointer-events-none" />

          <div className="relative z-10 p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar with blur glow ring */}
              <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-lg opacity-40" />
                <div className="relative w-16 h-16 rounded-full border-2 border-[#C19A4A] bg-[#C19A4A]/15 flex items-center justify-center overflow-hidden">
                  {profileData.profilePhotoUrl ? (
                    <img src={profileData.profilePhotoUrl} alt={profileData.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[#C19A4A]">{profileData.name.charAt(0)}</span>
                  )}
                </div>
              </div>

              <div className="space-y-0.5 min-w-0">
                <h1 className="text-xl font-bold text-white">{profileData.name}</h1>
                <p className="text-xs text-[#C19A4A] font-medium">{profileData.role}</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">{profileData.bio}</p>

            {/* Email & wallet info pills — match portfolio style */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs bg-[#0B0F1B]/60 px-3 py-2 rounded-xl border border-white/5">
                <Mail className="w-3 h-3 text-[#C19A4A] shrink-0" />
                <span className="text-gray-300">{profileData.email}</span>
              </div>
              <a
                href={`https://solscan.io/account/${profileData.wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs bg-[#0B0F1B]/60 px-3 py-2 rounded-xl border border-white/5 hover:border-[#C19A4A]/30 transition-colors"
              >
                <Wallet className="w-3 h-3 text-[#C19A4A] shrink-0" />
                <span className="font-mono text-gray-300">{shortWallet}</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            </div>

            {/* Gold divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C19A4A]/25 to-transparent" />

            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] px-6 py-2.5 rounded-xl text-sm font-bold hover:from-[#d9b563] hover:to-[#C19A4A] hover:shadow-[0_0_24px_rgba(193,154,74,0.4)] transition-all active:scale-[0.98] w-full sm:w-auto"
            >
              Request Portfolio
            </button>
          </div>
        </GradientCard>

        {/* Stats row - matches portfolio styling */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Proofs — faint gold gradient border (matches portfolio) */}
          <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
            <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
              <div className="text-2xl font-bold text-white mb-1">{profileData.stats.proofs}</div>
              <div className="text-xs text-gray-400">Total Proofs</div>
            </div>
          </div>

          {/* Achievements — full gold gradient border + gold number (matches portfolio) */}
          <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563]">
            <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
              <div className="text-2xl font-bold text-[#C19A4A] mb-1">{profileData.stats.achievements}</div>
              <div className="text-xs text-white">Achievements</div>
            </div>
          </div>
        </div>

        {/* Skills & Expertise */}
        <GradientCard variant="subtle" innerClassName="p-5">
          <div className="mb-3">
            <SectionTitle>Skills & Expertise</SectionTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.length > 0 ? (
              profileData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs text-[#C19A4A] bg-[#1A1F2E] border border-[#C19A4A]/20 px-3 py-1.5 rounded-full hover:bg-[#C19A4A]/10 transition-colors"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-600 italic">No skills listed</span>
            )}
          </div>
        </GradientCard>

        {/* Verifiable Proofs section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <SectionTitle>Verifiable Proofs</SectionTitle>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C19A4A]" />
              <span>All proofs are verifiable</span>
            </div>
          </div>

          <div className="space-y-3">
            {proofsToShow.map((proof, idx) => (
              // Each proof — dim (white/10) gradient border, same as portfolio proof cards
              <div key={idx} className="relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent group">
                <div className="bg-[#111625] rounded-2xl border border-white/5 hover:border-[#C19A4A]/30 group-hover:shadow-[0_0_30px_rgba(193,154,74,0.12)] transition-all duration-300 p-4">

                  {/* Title + status badge */}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm text-white group-hover:text-[#C19A4A] transition-colors truncate max-w-[calc(100%-80px)]">
                      {proof.title}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                        proof.status === 'Verifiable'
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : 'text-[#C19A4A] bg-[#C19A4A]/10 border-[#C19A4A]/20'
                      }`}>
                        {proof.status}
                      </span>
                      <Share2 className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-[#C19A4A] transition-colors" />
                    </div>
                  </div>

                  {/* Type & date */}
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#C19A4A]">◈</span>
                      <span>{proof.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{proof.date}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{proof.desc}</p>

                  {/* Proof ID tag — matches portfolio's mono tag */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[10px] bg-[#1A1F2E] border border-[#C19A4A]/20 text-[#C19A4A] px-2 py-1 rounded-md font-mono">
                      {proof.id}
                    </span>
                  </div>

                  {/* On-chain verification row */}
                  <a
                    href={`https://solscan.io/tx/${proof.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex w-full"
                  >
                    <div className="flex items-center gap-2 bg-[#1A1F2E] border border-white/10 hover:border-[#C19A4A]/30 rounded-xl px-3 py-2 w-full transition-colors">
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                        <span>🔗</span>
                        <span>On-chain:</span>
                      </div>
                      <code className="text-[10px] text-[#C19A4A] font-mono truncate flex-1">{proof.hash}</code>
                      <ExternalLink className="w-2.5 h-2.5 text-gray-500 group-hover/link:text-[#C19A4A] shrink-0 transition-colors" />
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {profileData.proofs.length > 3 && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="w-full text-center text-sm text-[#C19A4A] font-semibold py-3 rounded-xl border border-[#C19A4A]/20 hover:bg-[#C19A4A]/5 transition-colors"
            >
              Show more
            </button>
          )}
        </div>
      </main>

      {/* ── Floating bottom bar — matches portfolio's floating action bar ─────── */}
      <div className="fixed bottom-2 left-3 right-3 z-40">
        <div className="max-w-xl mx-auto relative p-[2px] rounded-xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
          <div className="bg-[#1C1C1C]/95 backdrop-blur-md p-3 rounded-xl shadow-2xl flex items-center justify-between gap-4">
            <p className="text-sm text-white min-w-0 truncate">
              View {profileData.name}'s full credentials
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] text-xs font-bold hover:shadow-[0_0_16px_rgba(193,154,74,0.5)] transition-all active:scale-[0.97] whitespace-nowrap shrink-0"
            >
              Request Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* ── Request Portfolio Modal ───────────────────────────────────────────── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#0B0F1B]/80 backdrop-blur-sm"
            onClick={() => setShowRequestModal(false)}
          />

          <div className="relative w-full max-w-sm animate-[scaleIn_0.2s_ease-out]">
            <GradientCard variant="hero" innerClassName="p-6">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Request Portfolio</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Request access to {profileData.name}'s verified portfolio
                    </p>
                  </div>
                  <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-medium">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-[#0B0F1B]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#C19A4A] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full bg-[#0B0F1B]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#C19A4A] transition-colors"
                    />
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C19A4A]/50" />
                      Your email will never be shared with the portfolio owner
                    </div>
                  </div>

                  {/* How it works box — subtle gradient border */}
                  <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
                    <div className="bg-[#111625] rounded-xl p-4">
                      <div className="flex items-center gap-2 text-[#C19A4A] mb-2">
                        <Info className="w-4 h-4" />
                        <span className="font-semibold text-sm">How it works</span>
                      </div>
                      <ol className="text-xs text-gray-400 space-y-1.5 list-decimal pl-4 leading-relaxed">
                        <li>We'll notify the portfolio owner of your request</li>
                        <li>They can approve and export their portfolio</li>
                        <li>You'll receive the link directly via the app</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] text-sm font-bold hover:from-[#d9b563] hover:to-[#C19A4A] hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all active:scale-[0.98]"
                    >
                      Send Request
                    </button>
                  </div>
                </form>
              </div>
            </GradientCard>
          </div>
        </div>
      )}

      {/* ── Success Modal ─────────────────────────────────────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#0B0F1B]/80 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className="relative w-full max-w-sm animate-[scaleIn_0.2s_ease-out]">
            <GradientCard variant="gold" innerClassName="relative overflow-hidden p-8 text-center">
              <div className="absolute inset-0 bg-[#000000] rounded-2xl pointer-events-none" />

              <div className="relative z-10">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Gold glow check icon */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-500 blur-lg opacity-40" />
                  <div className="relative w-16 h-16 rounded-full border-2 border-green-400 text-green-400 flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">Request Sent</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We've notified {profileData.name}. You'll receive their portfolio via email once they approve.
                </p>
              </div>
            </GradientCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default Request;
