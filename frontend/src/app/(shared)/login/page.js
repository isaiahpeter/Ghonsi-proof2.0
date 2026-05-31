'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@/hooks/useWallet';
import { sendOTPToEmail, verifyOTP, signInWithWallet } from '@/utils/supabaseAuth';
import { supabase } from '@/lib/supabaseClient';

function Login() {
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
  const { connected, sign, getWalletAddress } = useWallet();

  useEffect(() => {
    const params = new URLSearchParams('');
    setIsGetStarted(params.get('mode') === 'getstarted');
  }, [location]);

  // Check for existing wallet session on mount
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

  // When wallet connects, automatically trigger sign message
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

      console.log('Starting wallet authentication for:', walletAddress);

      // Sign a message to prove wallet ownership
      const messageToSign = `Sign this message to verify your Ghonsi Proof account.\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
      const signResult = await sign(messageToSign);

      if (!signResult) {
        setMessage('Failed to sign message. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('Message signed successfully');

      // Authenticate with Supabase using wallet signature
      const authResult = await signInWithWallet(walletAddress, {
        signature: signResult.signature,
        publicKey: signResult.publicKey,
        walletName: localStorage.getItem('connected_wallet') || 'Phantom'
      });

      if (authResult && authResult.userId) {
        console.log('Wallet authentication successful:', authResult.userId);
        
        // Check if user has a profile with user_type set
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', authResult.userId)
          .single();

        // User needs to select type if: new user OR existing user without user_type
        const needsUserType = authResult.isNewUser || !profile || !profile.user_type;
        
        setHasSigned(true);
        setMessage('✅ Wallet verified! Redirecting...');

        // Store additional session info
        localStorage.setItem('auth_method', 'wallet');
        localStorage.setItem('last_login', new Date().toISOString());

        // Dispatch custom event to notify Header of auth change
        window.dispatchEvent(new Event('auth-state-changed'));

        // Redirect based on whether user needs to select type
        if (needsUserType) {
          setTimeout(() => router.push('/user-type'), 1000);
        } else {
          setTimeout(() => router.push('home'), 1000);
        }
      } else {
        console.error('Authentication returned invalid result:', authResult);
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
    if (!trimmed || !validateEmail(trimmed)) { setMessage('Please enter a valid email address'); return; }
    if (!otpSent) { setMessage('Please request an OTP code first'); return; }
    if (!otpCode || otpCode.length !== 6) { setMessage('Please enter the complete 6-digit code'); return; }

    setIsLoading(true);
    setMessage('');
    try {
      const result = await verifyOTP(trimmed, otpCode);
      console.log('OTP verified, user:', result.user?.id, 'isNewUser:', result.isNewUser);
      setMessage('Successfully signed in!');
      
      // Dispatch custom event to notify Header of auth change
      window.dispatchEvent(new Event('auth-state-changed'));
      
      // Redirect new email users to user type selection
      if (result.isNewUser) {
        setTimeout(() => router.push('/user-type'), 1000);
      } else {
        setTimeout(() => router.push('/'), 1000);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage('Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSuccess = message.startsWith('✅') || message.startsWith('Wallet verified') || message.startsWith('Successfully') || message.startsWith('OTP sent');

  return (
    <main>
      <div className="mx-auto py-10 px-5 text-center flex flex-col">
        <h2 className="mt-[115px] text-2xl font-bold text-white mb-2.5">
          {isGetStarted ? 'Get Started' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-[#ccc] leading-[1.5] mb-[30px]">
          Connect your wallet or sign in to access your proof portfolio
        </p>

        {/* Tabs */}
        <div className="flex flex-row gap-2.5 justify-center items-center mt-5">
          {['wallet', 'email'].map((tab) => (
            <button
              key={tab}
              className={`flex items-center justify-center flex-1 max-w-[150px] py-3 px-[15px] rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 ease-in-out box-border whitespace-nowrap ${activeTab === tab
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

      {/* WALLET TAB */}
      {activeTab === 'wallet' && (
        <section>
          <div className="bg-white/5 py-[30px] px-5 my-5 mx-5 rounded-xl border border-white/10 flex flex-col items-center gap-5">
            <h3 className="text-lg font-bold text-white text-center">Connect your wallet</h3>

            <p className="text-sm text-[#aaa] text-center max-w-xs">
              Click the button below to choose your wallet. On mobile, it will open your wallet app.
              After connecting you'll be asked to <strong className="text-white">sign a message</strong> to
              verify ownership — no transaction fees.
            </p>

            {/*
              WalletMultiButton from @solana/wallet-adapter-react-ui handles everything:
              - Desktop: shows extension picker modal
              - Mobile: deeplinks to Phantom / Solflare / Backpack / Glow
              - After connect: our useEffect fires signMessage via useWallet hook
            */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <WalletMultiButton />
            </div>

            {isLoading && activeTab === 'wallet' && (
              <p className="text-[#C19A4A] text-sm text-center animate-pulse">
                Please sign the message in your wallet app...
              </p>
            )}

            {connected && !isLoading && !message && activeTab === 'wallet' && (
              <p className="text-green-400 text-sm text-center">
                Wallet connected — requesting signature...
              </p>
            )}

            {message && (
              <div className={`w-full p-3 rounded-lg text-sm text-center ${isSuccess
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                {message}
              </div>
            )}

            {/* Let user retry if they rejected the signature */}
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

      {/* EMAIL TAB */}
      {activeTab === 'email' && (
        <section>
          <div className="bg-white/5 py-[30px] px-5 my-5 mx-5 rounded-xl border border-[#C19A4A]">
            <h2 className="text-lg font-bold text-white mb-[25px]">Sign in with Email</h2>
            <p className="text-sm text-[#ccc] mb-5">We'll send you a 6-digit code to verify your email.</p>

            {message && (
              <div className={`mb-5 p-3 rounded-lg text-sm ${isSuccess
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
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
          <a href="https://x.com/Ghonsiproof" className="text-[#C19A4A] no-underline hover:underline">Learn how to get one</a>
        </p>
        <p className="text-xs text-[#ccc] leading-[1.8] mb-[15px]">
          By connecting you agree to our{' '}
          <a href="/terms" className="text-[#C19A4A] no-underline hover:underline">Terms of Service</a>{' '}and{' '}
          <a href="/policy" className="text-[#C19A4A] no-underline hover:underline">Privacy Policy</a>
        </p>
      </div>
    </main>
  );
}

export default Login;
