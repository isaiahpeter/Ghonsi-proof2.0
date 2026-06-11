'use client';
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@/hooks/useWallet';
import { sendOTPToEmail, verifyOTP, signInWithWallet } from '@/utils/supabaseAuth';
import { supabase } from '@/lib/supabaseClient';

function LoginInner() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isGetStarted, setIsGetStarted] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const router = useRouter();
  const location = usePathname();
  const searchParams = useSearchParams();
  const { connected, sign, getWalletAddress } = useWallet();

  const roleParam = (() => {
    const raw = searchParams?.get?.('role');
    if (!raw) return null;
    const normalized = String(raw).toLowerCase().trim();
    if (normalized === 'talent') return 'talent';
    if (normalized === 'professional') return 'professional';
    if (normalized === 'hirer') return 'hirer';
    return null;
  })();

  const routeAfterUserType = async ({ userId, currentUserType }) => {
    if (!userId) return;

    try {
      if (currentUserType === 'hirer') {
        const { data: domainHirerRow } = await supabase
          .from('domain_questions_hirers')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!domainHirerRow) {
          router.push('/hirers/create-profile');
        } else {
          router.push('/hirers/dashboard');
        }
        return;
      }

      if (currentUserType === 'professional' || currentUserType === 'talent') {
        const { data: domainTalentRow } = await supabase
          .from('domain_questions_professionals')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!domainTalentRow) {
          router.push('/professionals/create-profile');
        } else {
          router.push('/professionals/dashboard');
        }
        return;
      }

      router.push('/');
    } catch (e) {
      console.warn('routeAfterUserType failed:', e);
      router.push('/');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams('');
    setIsGetStarted(params.get('mode') === 'getstarted');
  }, [location]);

  useEffect(() => {
    const checkExistingSession = async () => {
      const walletAddress = localStorage.getItem('wallet_address');
      const sessionToken = localStorage.getItem('session_token');

      if (walletAddress && sessionToken) {
        console.log('Existing wallet session found, redirecting...');
        setTimeout(() => router.push('/'), 500);
      }
    };
    checkExistingSession();
  }, [router]);

  useEffect(() => {
    if (connected && activeTab === 'wallet' && !hasSigned) {
      handleWalletAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const handleWalletAuth = async () => {
    setMessage('');
    setIsLoading(true);

    try {
      const walletAddress = getWalletAddress();
      if (!walletAddress) {
        setMessage('Wallet not connected');
        setIsLoading(false);
        return;
      }

      const messageToSign = `Sign this message to verify your Ghonsi Proof account.\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
      const signResult = await sign(messageToSign);

      if (!signResult) {
        setMessage('Failed to sign message. Please try again.');
        setIsLoading(false);
        return;
      }

      const authResult = await signInWithWallet(walletAddress, {
        signature: signResult.signature,
        publicKey: signResult.publicKey,
        walletName: localStorage.getItem('connected_wallet') || 'Phantom',
      });

      if (authResult && authResult.userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', authResult.userId)
          .single();

        const needsUserType = authResult.isNewUser || !profile || !profile.user_type;

        let resolvedUserType = profile?.user_type || null;
        if (needsUserType && roleParam) {
          try {
            const updated = await supabase
              .from('profiles')
              .update({ user_type: roleParam })
              .eq('user_id', authResult.userId)
              .select('user_type')
              .maybeSingle();

            resolvedUserType = updated?.user_type ?? roleParam;
          } catch (e) {
            console.warn('Failed to set user_type from role param:', e);
            resolvedUserType = roleParam;
          }
        }

        setHasSigned(true);
        setMessage('✅ Wallet verified! Redirecting...');

        localStorage.setItem('auth_method', 'wallet');
        localStorage.setItem('last_login', new Date().toISOString());

        window.dispatchEvent(new Event('auth-state-changed'));

        setTimeout(() => {
          routeAfterUserType({ userId: authResult.userId, currentUserType: resolvedUserType });
        }, 800);
      } else {
        setMessage('Failed to authenticate. Please try again.');
      }
    } catch (err) {
      console.error('Wallet auth error:', err);
      setMessage('Error: ' + (err.message || 'Unknown error during wallet authentication'));
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSendOTP = async () => {
    const trimmed = email.trim();
    if (!trimmed || !validateEmail(trimmed)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      await sendOTPToEmail(trimmed);
      setOtpSent(true);
      setMessage('OTP sent! Check your email for the 6-digit code.');
    } catch (err) {
      setMessage('Failed to send OTP: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !validateEmail(trimmed)) {
      setMessage('Please enter a valid email address');
      return;
    }
    if (!otpSent) {
      setMessage('Please request an OTP code first');
      return;
    }
    if (!otpCode || otpCode.length !== 6) {
      setMessage('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await verifyOTP(trimmed, otpCode);

      setMessage('Successfully signed in!');

      window.dispatchEvent(new Event('auth-state-changed'));

      const userId = result.user?.id;
      let resolvedUserType = result.user?.user_type || null;

      if (result.isNewUser) {
        if (roleParam) {
          try {
            const updated = await supabase
              .from('profiles')
              .update({ user_type: roleParam })
              .eq('user_id', userId)
              .select('user_type')
              .maybeSingle();

            resolvedUserType = updated?.user_type ?? roleParam;
          } catch (e2) {
            console.warn('Failed to set user_type from role param (email):', e2);
            resolvedUserType = roleParam;
          }

          setTimeout(() => {
            routeAfterUserType({ userId, currentUserType: resolvedUserType });
          }, 800);
        } else {
          setTimeout(() => router.push('/user-type'), 1000);
        }
      } else {
        setTimeout(() => {
          supabase
            .from('profiles')
            .select('user_type')
            .eq('user_id', userId)
            .maybeSingle()
            .then(({ data }) => {
              const currentType = data?.user_type || resolvedUserType;
              routeAfterUserType({ userId, currentUserType: currentType });
            })
            .catch(() => router.push('/'));
        }, 800);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage('Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSuccess =
    message.startsWith('✅') ||
    message.startsWith('Wallet verified') ||
    message.startsWith('Successfully') ||
    message.startsWith('OTP sent');

  return (
    <main>
      <div className="mx-auto py-10 px-5 text-center flex flex-col">
        <h2 className="mt-[115px] text-2xl font-bold text-white mb-2.5">
          {isGetStarted ? 'Get Started' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-[#ccc] leading-[1.5] mb-[30px]">
          Connect your wallet or sign in to access your proof portfolio
        </p>

        <div className="flex flex-row gap-2.5 justify-center items-center mt-5">
          {['wallet', 'email'].map((tab) => (
            <button
              key={tab}
              className={`flex items-center justify-center flex-1 max-w-[150px] py-3 px-[15px] rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 ease-in-out box-border whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#C19A4A] text-[#1a1a2e] border-none'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'wallet' ? 'Wallet Connect' : 'Email Login'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'wallet' && (
        <section>
          <div className="bg-white/5 py-[30px] px-5 my-5 mx-5 rounded-xl border border-white/10 flex flex-col items-center gap-5">
            <h3 className="text-lg font-bold text-white text-center">Connect your wallet</h3>

            <p className="text-sm text-[#aaa] text-center max-w-xs">
              Click the button below to choose your wallet. On mobile, it will open your wallet app.
              After connecting you'll be asked to <strong className="text-white">sign a message</strong> to
              verify ownership — no transaction fees.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <WalletMultiButton />
            </div>

            {isLoading && activeTab === 'wallet' && (
              <p className="text-[#C19A4A] text-sm text-center animate-pulse">
                Please sign the message in your wallet app...
              </p>
            )}

            {connected && !isLoading && !message && activeTab === 'wallet' && (
              <p className="text-green-400 text-sm text-center">Wallet connected — requesting signature...</p>
            )}

            {message && (
              <div
                className={`w-full p-3 rounded-lg text-sm text-center ${
                  isSuccess
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {message}
              </div>
            )}

            {!message.startsWith('✅') && connected && !isLoading && message && activeTab === 'wallet' && (
              <button
                onClick={handleWalletAuth}
                className="py-2 px-6 bg-[#C19A4A] text-[#0B0F1B] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Retry Signature
              </button>
            )}
          </div>
        </section>
      )}

      {activeTab === 'email' && (
        <section>
          <div className="bg-white/5 py-[30px] px-5 my-5 mx-5 rounded-xl border border-[#C19A4A]">
            <h2 className="text-lg font-bold text-white mb-[25px]">Sign in with Email</h2>
            <p className="text-sm text-[#ccc] mb-5">We'll send you a 6-digit code to verify your email.</p>

            {message && (
              <div
                className={`mb-5 p-3 rounded-lg text-sm ${
                  isSuccess
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {message}
              </div>
            )}

            <label className="text-sm font-bold text-[#ccc] mb-3 block">Email Address</label>
            <form onSubmit={handleEmailSignIn} className="mb-5">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || otpSent}
                className="w-full py-3 px-[15px] bg-white/[0.08] border border-[#C19A4A] rounded-lg text-white text-sm box-border transition-all placeholder:text-white/50 focus:outline-none focus:bg-[#0B0F1B] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              />

              <div className="relative mb-4">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading || !otpSent}
                  maxLength={6}
                  className="w-full py-3 px-[15px] pr-[110px] bg-white/[0.08] border border-[#C19A4A] rounded-lg text-white text-sm box-border transition-all placeholder:text-white/50 focus:outline-none focus:bg-[#0B0F1B] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading || otpSent}
                  className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 bg-transparent text-[#C19A4A] border-none rounded text-sm font-semibold cursor-pointer hover:text-[#d9b563] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpSent ? 'Sent ✓' : 'Get Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 bg-[#C19A4A] text-[#0B0F1B] border-none rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-black hover:text-[#C19A4A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          </div>
        </section>
      )}

      <div className="py-[30px] px-5 text-center">
        <p className="text-xs text-[#ccc] leading-[1.8] mb-[15px]">
          Don't have a wallet?{' '}
          <a href="https://x.com/Ghonsiproof" className="text-[#C19A4A] no-underline hover:underline">
            Learn how to get one
          </a>
        </p>
        <p className="text-xs text-[#ccc] leading-[1.8] mb-[15px]">
          By connecting you agree to our{' '}
          <a href="/terms" className="text-[#C19A4A] no-underline hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/policy" className="text-[#C19A4A] no-underline hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}