'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Bell, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { logout } from '@/utils/supabaseAuth';
import { getUnreadCount } from '@/utils/messagesApi';
import { useWallet } from '@/hooks/useWallet';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { connected, getWalletAddress, wallet, disconnectWallet } = useWallet();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const walletMenuRef = useRef(null);
  const walletButtonRef = useRef(null);
  const isCheckingAuth = useRef(false);

  // Wallet address may not be immediately available on first client render; support both
  // the Solana adapter publicKey source and persisted localStorage values (legacy + current keys).
  const walletAddress =
    getWalletAddress() ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('walletAddress') || localStorage.getItem('wallet_address')
      : null);

  const walletName =
    wallet?.adapter?.name ||
    (typeof window !== 'undefined' ? localStorage.getItem('wallet_name') || localStorage.getItem('walletName') : null);

  const checkAuthStatus = async () => {
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        const count = await getUnreadCount(session.user.id);
        setUnreadCount(count);
        const { data: profile } = await supabase.from('profiles').select('user_type').eq('user_id', session.user.id).maybeSingle();
        setUserType(profile?.user_type || null);
      } else {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
        const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
        if (userId && sessionToken) {
          setIsLoggedIn(true);
          const count = await getUnreadCount(userId);
          setUnreadCount(count);
          const { data: profile } = await supabase.from('profiles').select('user_type').eq('user_id', userId).maybeSingle();
          setUserType(profile?.user_type || null);
        } else {
          setIsLoggedIn(false);
          setUserType(null);
        }
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      isCheckingAuth.current = false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') checkAuthStatus();
    });
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') return;
      if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) setIsMenuOpen(false);
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target) && walletButtonRef.current && !walletButtonRef.current.contains(event.target)) setIsWalletMenuOpen(false);
    };
    if (isMenuOpen || isWalletMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isWalletMenuOpen]);

  const handleSignOut = async () => {
    try {
      await logout();
      if (connected) await disconnectWallet();
      setIsLoggedIn(false);
      setIsMenuOpen(false);
      setIsWalletMenuOpen(false);
      router.push('/');
    } catch (error) { console.error('Logout error:', error); }
  };

  const shortenAddress = (address) => address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

  const dashboardHref = userType === 'hirer' ? '/hirers/dashboard' : '/professionals/dashboard';

  return (
    <header className="p-[0px_20px] fixed top-0 w-full z-[100] bg-black/30 backdrop-blur-[10px] box-border">
      <div className="flex justify-between items-center">
        <Link href="/">
          <Image src="/assets/ghonsi-proof-logos/transparent-png-logo/4.png" alt="Ghonsi Proof Logo" width={90} height={90} className="object-contain" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Home</Link>
          <Link href="/about" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">About</Link>
          {isLoggedIn && userType === 'professional' && (
            <>
              <Link href="/professionals/portfolio" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Portfolio</Link>
              <Link href="/professionals/upload" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Upload Proof</Link>
              <Link href="/professionals/dashboard" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Dashboard</Link>
            </>
          )}
          {isLoggedIn && userType === 'hirer' && (
            <>
              <Link href="/hirers/search" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Explore Proof</Link>
              <Link href="/hirers/dashboard" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Dashboard</Link>
            </>
          )}
          <Link href="/professionals/job-marketplace" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Jobs</Link>
          <Link href="/contact" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">Contact</Link>
          <Link href="/faq" className="text-white text-[15px] font-medium hover:text-[#C19A4A] transition-colors">FAQ</Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3" suppressHydrationWarning>
          {walletAddress && (
            <div className="hidden lg:block relative">
              <button ref={walletButtonRef} onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)} className="flex items-center gap-2 px-3 py-2 bg-[#151925] rounded-lg border border-[#C19A4A]/30 hover:border-[#C19A4A] transition-all cursor-pointer">
                <Wallet size={16} className="text-[#C19A4A]" />
                <span className="text-[#C19A4A] text-sm font-medium">{shortenAddress(walletAddress)}</span>
                {walletName && <span className="text-xs text-gray-400">({walletName})</span>}
              </button>
              {isWalletMenuOpen && (
                <div ref={walletMenuRef} className="absolute right-0 mt-2 w-64 bg-[#0B0F1B] border border-[#C19A4A]/30 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-[#C19A4A]/20">
                    <div className="text-xs text-gray-300 break-all font-mono">{walletAddress}</div>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { navigator.clipboard.writeText(walletAddress); setIsWalletMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#151925] rounded transition-colors">📋 Copy Address</button>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsWalletMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      🔌 Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {isLoggedIn && (
            <button onClick={() => router.push('/message')} className="relative p-2 rounded-lg hover:bg-[#151925] transition-colors">
              <Bell size={20} className="text-[#C19A4A]" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
            </button>
          )}
          {isLoggedIn ? (
            <button onClick={handleSignOut} className="hidden lg:block py-2 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 hover:text-[#C19A4A]">Sign Out</button>
          ) : walletAddress ? null : (
            <button onClick={() => router.push('/login?mode=getstarted')} className="hidden lg:block py-2 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 hover:text-[#C19A4A]">Sign Up / Login</button>
          )}
          <button ref={buttonRef} className="lg:hidden text-[#C19A4A]" onClick={() => setIsMenuOpen(!isMenuOpen)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Menu size={24} style={{ transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="lg:hidden absolute top-[70px] right-0 w-full bg-[#0B0F1B] flex flex-col gap-0 p-5 z-[200]">
          <nav>
            <ul className="p-0 m-0">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                ...(isLoggedIn && userType === 'professional' ? [
                  { href: '/professionals/portfolio', label: 'Portfolio' },
                  { href: '/professionals/upload', label: 'Upload Proof' },
                  { href: '/professionals/dashboard', label: 'Dashboard' },
                ] : []),
                ...(isLoggedIn && userType === 'hirer' ? [
                  { href: '/hirers/search', label: 'Explore Proof' },
                  { href: '/hirers/dashboard', label: 'Dashboard' },
                ] : []),
                { href: '/professionals/job-marketplace', label: 'Jobs' },
                { href: '/contact', label: 'Contact' },
                { href: '/faq', label: 'FAQ' },
              ].map(({ href, label }) => (
                <li key={href} className="py-3 font-bold list-none">
                  <Link href={href} onClick={() => setIsMenuOpen(false)} className="text-white text-[19px] hover:text-[#C19A4A] block transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-3 mt-10 pt-[30px]">
            {isLoggedIn ? (
              <button onClick={handleSignOut} className="mt-1 mx-auto py-2.5 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] w-4/5 max-w-[200px]">Sign Out</button>
            ) : (
              <>
                <button onClick={() => { setIsMenuOpen(false); router.push('/login?mode=signin'); }} className="mt-1 mx-auto py-2.5 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] w-4/5 max-w-[200px]">Sign In</button>
                <button onClick={() => { setIsMenuOpen(false); router.push('/login?mode=getstarted'); }} className="mt-1 mx-auto mb-2.5 py-2.5 px-5 text-white border-none bg-[#C19A4A] rounded-lg text-[13px] w-4/5 max-w-[200px]">Get Started</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
