'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, linkWalletToUser, sendOTPToEmail, verifyOTP } from '@/utils/supabaseAuth';
import { getUserProofs, getProofStats } from '@/utils/proofsApi';
import { getProfile, updateProfile } from '@/utils/profileApi';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import {
  CheckCircle2, ExternalLink, Award, Plus, Briefcase,
  Share2, Settings, Copy, User, Clock, Wallet, Mail, X, Loader2,
  Link, FileCheck, ChevronRight, Bot, Sparkles
} from 'lucide-react';

// ─── Gradient border wrapper ──────────────────────────────────────────────────
const GradientCard = ({ children, variant = 'subtle', className = '', innerClassName = '' }) => {
  const gradients = {
    hero: 'bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500',
    gold: 'bg-gradient-to-br from-[#C19A4A] to-[#d9b563]',
    subtle: 'bg-gradient-to-br from-[#C19A4A]/30 to-transparent',
    dim: 'bg-gradient-to-br from-white/10 to-transparent',
  };
  return (
    <div className={`relative p-[2px] rounded-2xl ${gradients[variant]} ${className}`}>
      <div className={`bg-[#111625] rounded-2xl ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

// ─── Section heading ──────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-bold text-white flex items-center gap-2">
    <span className="w-1 h-4 bg-gradient-to-b from-[#C19A4A] to-[#d9b563] rounded-full shrink-0" />
    {children}
  </h3>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
        Verified <CheckCircle2 size={10} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold text-[#C19A4A] bg-[#C19A4A]/10 border border-[#C19A4A]/20 px-2 py-0.5 rounded-full whitespace-nowrap">
      Pending
    </span>
  );
};

// ─── Proof Detail Modal ───────────────────────────────────────────────────────
const ProofDetailModal = ({ proof, onClose }) => {
  if (!proof) return null;

  const solscanUrl = proof.blockchain_tx
    ? `https://solscan.io/tx/${proof.blockchain_tx}?cluster=devnet`
    : null;
  const documentUrl = proof.file_ipfs_url || null;

  return (
    <div
      className="fixed inset-0 bg-[#0B0F1B]/90 backdrop-blur-sm z-[70] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#111625] rounded-[14px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-blue-500/5 pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5 relative z-10">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-base font-bold text-white truncate">{proof.proof_name}</h3>
              <p className="text-[11px] text-[#C19A4A] mt-0.5 capitalize">{proof.proof_type?.replace(/_/g, ' ')}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge status={proof.status} />
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Summary */}
          {proof.summary && (
            <div className="mb-4 relative z-10">
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-4">{proof.summary}</p>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-[10px] text-gray-500 mb-5 relative z-10">
            <div className="flex items-center gap-1.5">
              <Clock size={11} />
              {new Date(proof.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            {proof.reference_link && (
              <a
                href={proof.reference_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Link size={11} /> Ref Link
              </a>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C19A4A]/20 to-transparent mb-4" />

          {/* Links */}
          <div className="space-y-2 relative z-10">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">On-Chain & Documents</p>

            {/* Solscan */}
            {solscanUrl ? (
              <a
                href={solscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-3 py-2.5 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl hover:border-[#C19A4A]/60 hover:bg-[#C19A4A]/5 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#C19A4A]/10 flex items-center justify-center">
                    <i className="fa-solid fa-link text-[#C19A4A] text-[10px]"></i>
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-semibold">View on Solscan</p>
                    <p className="text-gray-500 text-[10px] font-mono">{proof.blockchain_tx.slice(0, 20)}...</p>
                  </div>
                </div>
                <ExternalLink size={12} className="text-gray-500 group-hover:text-[#C19A4A] transition-colors" />
              </a>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#0B0F1B] border border-white/5 rounded-xl opacity-40">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <i className="fa-solid fa-link text-gray-500 text-[10px]"></i>
                </div>
                <p className="text-gray-500 text-[11px]">Not yet anchored on-chain</p>
              </div>
            )}

            {/* Document */}
            {documentUrl ? (
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-3 py-2.5 bg-[#0B0F1B] border border-blue-500/20 rounded-xl hover:border-blue-400/60 hover:bg-blue-500/5 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileCheck size={12} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-semibold">View Document</p>
                    <p className="text-gray-500 text-[10px]">Stored on IPFS</p>
                  </div>
                </div>
                <ExternalLink size={12} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
              </a>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#0B0F1B] border border-white/5 rounded-xl opacity-40">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <FileCheck size={12} className="text-gray-500" />
                </div>
                <p className="text-gray-500 text-[11px]">No document stored</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Profile Section ──────────────────────────────────────────────────────────
const ProfileSection = ({ user, profile, onProfileUpdate }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [uidCopied, setUidCopied] = useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const walletAddress = profile?.wallet_address;
  const hasWallet = walletAddress && walletAddress !== 'Not connected';
  const truncatedAddress = hasWallet
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Not connected';

  const generateUID = useCallback((userId) => {
    if (!userId) return '000000000';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString().padStart(9, '0').slice(0, 9);
  }, []);

  const userUID = generateUID(user?.id);

  const handleCopy = useCallback(() => {
    if (!hasWallet) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress, hasWallet]);

  const handleUIDCopy = useCallback(() => {
    navigator.clipboard.writeText(userUID);
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 2000);
  }, [userUID]);

  const handleLinkWallet = async () => {
    setIsLinkingWallet(true);
    try {
      const provider = window.phantom?.solana ?? window.solana;

      if (!provider) {
        alert('Phantom wallet not found. Please install Phantom at phantom.app');
        return;
      }

      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      if (!address) throw new Error('No wallet address returned from Phantom');

      await linkWalletToUser(user.id, address);
      await updateProfile(user.id, { wallet_address: address });

      localStorage.setItem('wallet_address', address);
      localStorage.setItem('user_id', user.id);

      await onProfileUpdate();

      alert('Solana wallet linked successfully!');
    } catch (error) {
      console.error('Wallet linking failed:', error);
      if (error.code === 4001 || error.message?.toLowerCase().includes('user rejected')) {
        alert('Connection cancelled. Please try again.');
      } else if (error.message?.includes('already linked')) {
        alert(error.message);
      } else if (error.message?.includes('duplicate') || error.code === '23505') {
        alert('This wallet is already linked to another account. Please use a different wallet.');
      } else {
        alert('Failed to link wallet: ' + error.message);
      }
    } finally {
      setIsLinkingWallet(false);
    }
  };

  const handleSendOTP = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    setIsSavingEmail(true);
    try {
      await sendOTPToEmail(emailInput);
      setOtpSent(true);
      alert('OTP sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Error sending OTP: ' + error.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleVerifyOTPAndSaveEmail = async () => {
    if (!otpCode || otpCode.trim().length === 0) {
      alert('Please enter the OTP code.');
      return;
    }
    setIsVerifyingOTP(true);
    try {
      const { error: verifyError } = await verifyOTP(emailInput, otpCode);
      if (verifyError) throw verifyError;
      await updateProfile(user.id, { email: emailInput });
      onProfileUpdate();
      setIsAddingEmail(false);
      setOtpSent(false);
      setOtpCode('');
      setEmailInput('');
      alert('Email verified and saved successfully!');
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('Error verifying OTP: ' + error.message);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  return (
    <GradientCard variant="hero">
      <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center p-5">
        <div className="relative mb-3">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-lg opacity-40" />
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name || 'Profile'} className="relative w-16 h-16 rounded-full object-cover border-2 border-[#C19A4A]" />
          ) : (
            <div className="relative w-16 h-16 rounded-full border-2 border-[#C19A4A] bg-[#C19A4A]/15 flex items-center justify-center">
              <User size={30} strokeWidth={1.5} className="text-[#C19A4A]" />
            </div>
          )}
        </div>
        <h2 className="text-lg font-bold text-white mb-1">{profile?.display_name || 'Profile Not Set'}</h2>
        <p className="text-xs text-gray-400 mb-5 font-light">{profile?.bio || 'Complete your profile'}</p>

        <div className="w-full space-y-2 mb-6">
          {/* Wallet row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5">
            <Wallet size={12} className="text-[#C19A4A] shrink-0" />
            <span className="text-[11px] text-gray-500 font-medium">Wallet</span>
            <div className="flex-1" />
            {hasWallet ? (
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-gray-200 font-mono text-[11px] hover:text-[#C19A4A] transition-colors">
                {copied ? 'Copied!' : truncatedAddress}
                <Copy size={11} className={copied ? 'text-green-400' : 'text-gray-500'} />
              </button>
            ) : (
              <button onClick={handleLinkWallet} disabled={isLinkingWallet} className="px-2.5 py-1 bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/20 rounded-lg text-[11px] hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all flex items-center gap-1.5">
                {isLinkingWallet ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />} Connect
              </button>
            )}
          </div>

          {/* Email row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5 min-w-0">
            <Mail size={12} className="text-[#C19A4A] shrink-0" />
            <span className="text-[11px] text-gray-500 font-medium shrink-0">Email</span>
            <div className="flex-1 min-w-0" />
            {user?.email || profile?.email ? (
              <span className="text-[11px] text-gray-200 font-mono truncate max-w-[150px]">{user?.email || profile?.email}</span>
            ) : isAddingEmail ? (
              <div className="flex flex-col items-end gap-2 w-full">
                <div className="flex items-center gap-1.5 w-full justify-end">
                  <input type="email" placeholder="name@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} disabled={otpSent} className="bg-[#0B0F1B] border border-[#C19A4A]/20 text-white px-2 py-0.5 rounded text-[11px] w-40 focus:outline-none focus:border-[#C19A4A] disabled:opacity-50" autoFocus />
                  <button onClick={handleSendOTP} disabled={isSavingEmail || otpSent} className="text-blue-400 hover:text-blue-300">
                    {isSavingEmail ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                  </button>
                  <button onClick={() => { setIsAddingEmail(false); setOtpSent(false); setOtpCode(''); }} className="text-gray-500 hover:text-white"><X size={13} /></button>
                </div>
                {otpSent && (
                  <div className="flex items-center gap-1.5 w-full justify-end">
                    <input type="text" placeholder="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="bg-[#0B0F1B] border border-[#C19A4A]/20 text-white px-2 py-0.5 rounded text-[11px] w-32 focus:outline-none focus:border-[#C19A4A]" maxLength="6" />
                    <button onClick={handleVerifyOTPAndSaveEmail} disabled={isVerifyingOTP} className="text-green-400 hover:text-green-300">
                      {isVerifyingOTP ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsAddingEmail(true)} className="px-2.5 py-1 bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/20 rounded-lg text-[11px] hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all flex items-center gap-1.5">
                <Plus size={11} /> Add Email
              </button>
            )}
          </div>

          {/* UID row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5">
            <User size={12} className="text-[#C19A4A] shrink-0" />
            <span className="text-[11px] text-gray-500 font-medium">UID</span>
            <div className="flex-1" />
            <button onClick={handleUIDCopy} className="flex items-center gap-1.5 text-gray-200 font-mono text-[11px] hover:text-[#C19A4A] transition-colors">
              {uidCopied ? 'Copied!' : userUID}
              <Copy size={11} className={uidCopied ? 'text-green-400' : 'text-gray-500'} />
            </button>
          </div>

          {/* Status row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5">
            <span className="text-[11px] text-gray-500 font-medium">Status</span>
            <div className="flex-1" />
            <span className="text-green-400 flex items-center gap-1.5 text-[11px] font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]" /> Active
            </span>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C19A4A]/30 to-transparent mb-5" />

        <button
          onClick={() => router.push('/createProfile')}
          className="w-full py-3 rounded-xl border border-[#C19A4A]/50 text-[#C19A4A] text-sm font-semibold hover:bg-gradient-to-r hover:from-[#C19A4A] hover:to-[#d9b563] hover:text-[#0B0F1B] hover:border-transparent hover:shadow-[0_0_24px_rgba(193,154,74,0.35)] transition-all duration-300 active:scale-[0.98]"
        >
          {profile?.display_name ? 'Edit Profile Details' : 'Create Profile'}
        </button>
      </div>
    </GradientCard>
  );
};

// ─── Stats Row ────────────────────────────────────────────────────────────────
const StatsRow = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
      <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
        <div className="text-2xl font-bold text-white mb-1">{stats?.total || 0}</div>
        <div className="text-xs text-gray-400">Total Proofs</div>
      </div>
    </div>
    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563]">
      <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
        <div className="text-2xl font-bold text-[#C19A4A] mb-1">{stats?.verified || 0}</div>
        <div className="text-xs text-white">Verifiable</div>
      </div>
    </div>
  </div>
);

// ─── Proof Item Card ──────────────────────────────────────────────────────────
const ProofItem = ({ proof, onClick }) => {
  const hasSolscan = !!proof.blockchain_tx;

  return (
    <div
      className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent group cursor-pointer"
      onClick={() => onClick(proof)}
    >
      <div className="bg-[#111625] rounded-xl border border-white/5 hover:border-[#C19A4A]/30 group-hover:shadow-[0_0_20px_rgba(193,154,74,0.1)] transition-all duration-300 p-4 flex flex-col gap-3">

        {/* Title row */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white tracking-tight truncate">{proof.proof_name}</h3>
            <Badge status={proof.status} />
          </div>
          <ChevronRight size={14} className="text-gray-500 group-hover:text-[#C19A4A] transition-colors shrink-0 ml-2" />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Award size={12} className="text-[#C19A4A]" />
            <span className="capitalize">{proof.proof_type?.replace(/_/g, ' ') || 'Proof'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            {new Date(proof.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Preview links */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          {hasSolscan ? (
            <a
              href={`https://solscan.io/tx/${proof.blockchain_tx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[10px] text-[#C19A4A] bg-[#C19A4A]/10 border border-[#C19A4A]/20 px-2.5 py-1 rounded-full hover:bg-[#C19A4A]/20 transition-colors"
            >
              <i className="fa-solid fa-link text-[8px]"></i> Solscan
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-white/5 px-2.5 py-1 rounded-full">
              <i className="fa-solid fa-link text-[8px]"></i> Not on-chain
            </span>
          )}

          <span className="ml-auto text-[10px] text-gray-500 group-hover:text-[#C19A4A] transition-colors">View details →</span>
        </div>
      </div>
    </div>
  );
};

// ─── Recent Proofs ────────────────────────────────────────────────────────────
const RecentProofs = ({ proofs, onProofClick }) => {
  const router = useRouter();
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <SectionTitle>Recent Proofs</SectionTitle>
        <button onClick={() => router.push('/portfolio')} className="text-xs text-[#C19A4A]/70 hover:text-[#C19A4A] transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-2.5">
        {proofs && proofs.length > 0 ? (
          proofs.slice(0, 3).map((proof) => (
            <ProofItem key={proof.id} proof={proof} onClick={onProofClick} />
          ))
        ) : (
          <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent">
            <div className="bg-[#111625] rounded-xl p-6 text-center">
              <p className="text-sm text-gray-400">No proofs yet. Upload your first proof!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] p-5 rounded-xl font-semibold text-xs hover:from-[#d9b563] hover:to-[#C19A4A] hover:shadow-[0_0_24px_rgba(193,154,74,0.4)] transition-all duration-200 active:scale-[0.97] touch-manipulation"
  >
    <Icon size={22} strokeWidth={1.5} />
    <span className="tracking-wide text-center leading-tight">{label}</span>
  </button>
);

// ─── My Mini-Me ───────────────────────────────────────────────────────────────
const MyMiniMe = () => {
  const router = useRouter();
  return (
    <div className="space-y-3">
      <div className="px-1"><SectionTitle>My Mini-Me</SectionTitle></div>
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-[#C19A4A] to-blue-500">
        <div className="bg-[#111625] rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center shrink-0">
              <Bot size={24} className="text-[#0B0F1B]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Create My Mini-Me Agent
                <Sparkles size={14} className="text-[#C19A4A]" />
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">10× your productivity with AI that works in your style</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/mini-them-handover')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] font-bold hover:shadow-[0_0_30px_rgba(193,154,74,0.5)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Bot size={18} />
            Create My Mini-Me
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QuickActions = () => {
  const router = useRouter();
  return (
    <div className="space-y-3">
      <div className="px-1"><SectionTitle>Quick Actions</SectionTitle></div>
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
        <div className="bg-[#111625] rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-3">
            <ActionButton icon={Plus} label="Upload New Proof" onClick={() => router.push('/upload')} />
            <ActionButton icon={Briefcase} label="View Portfolio" onClick={() => router.push('/portfolio')} />
            <ActionButton icon={Share2} label="Share Profile" onClick={() => router.push('/portfolio')} />
            <ActionButton icon={Settings} label="Profile Settings" onClick={() => router.push('/settingsPage')} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('Dashboard - Current user:', currentUser);
      if (!currentUser) {
        setLoading(false);
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      // Check user type - redirect hirers to their dashboard
      const userProfile = await getProfile(currentUser.id);
      if (userProfile?.user_type === 'hirer') {
        router.push('/dashboardHirers');
        return;
      }
      
      setProfile(userProfile);
      const userProofs = await getUserProofs(currentUser.id);
      setProofs(userProofs || []);
      const proofStats = await getProofStats(currentUser.id);
      setStats(proofStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);



  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  if (loading) {
    return <SkeletonLoader type="dashboard" />;
  }

  return (
    <>

      <div
        className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] font-sans text-white selection:bg-[#C19A4A]/30 relative overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Ambient blobs */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
        </div>

        {/* Gold grid overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(90deg, rgba(193,154,74,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(193,154,74,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />
        </div>

        {/* Proof Detail Modal */}
        {selectedProof && (
          <ProofDetailModal proof={selectedProof} onClose={() => setSelectedProof(null)} />
        )}

        <div className="max-w-full lg:max-w-7xl mx-auto min-h-screen relative z-10 flex flex-col mt-[105px]">
          <main className="flex-1 px-5 py-6">
            {/* Desktop: Two-column grid, Mobile: Single column */}
            <div className="lg:grid lg:grid-cols-[400px_1fr] lg:gap-8">
              {/* Left Column: Profile + Stats + My Mini-Me */}
              <div className="space-y-8">
                <ProfileSection user={user} profile={profile} onProfileUpdate={loadDashboardData} />
                <StatsRow stats={stats} />
                <div className="hidden lg:block">
                  <MyMiniMe />
                </div>
              </div>

              {/* Right Column: Recent Proofs + Quick Actions */}
              <div className="mt-8 lg:mt-0 lg:flex lg:flex-col lg:min-h-[600px]">
                <div className="lg:flex-1">
                  <RecentProofs proofs={proofs} onProofClick={setSelectedProof} />
                </div>
                
                {/* Mobile: My Mini-Me */}
                <div className="lg:hidden mt-8">
                  <MyMiniMe />
                </div>
                
                {/* Desktop: Quick Actions at bottom, Mobile: after My Mini-Me */}
                <div className="mt-8">
                  <QuickActions />
                </div>
              </div>
            </div>
          </main>
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
        `}</style>
      </div>

    </>
  );
}

export default Dashboard;