'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/**
 * ProtectedRoute — wraps pages that require authentication.
 * In Next.js App Router, this is a client component that redirects
 * unauthenticated users to /login.
 */
export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const viewingUserId = searchParams.get('id');
        if (viewingUserId && pathname === '/professionals/portfolio') {
          if (isMounted) { setIsAuthenticated(true); setLoading(false); }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) { setIsAuthenticated(true); setLoading(false); return; }

        const userId = localStorage.getItem('user_id');
        const sessionToken = localStorage.getItem('session_token');
        if (userId && sessionToken) {
          const { data: user, error } = await supabase.from('users').select('id').eq('id', userId).single();
          if (!error && user && isMounted) { setIsAuthenticated(true); } 
          else if (isMounted) { setIsAuthenticated(false); }
        } else if (isMounted) { setIsAuthenticated(false); }
      } catch (error) {
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => { if (isMounted) checkAuth(); });
    return () => { isMounted = false; authListener?.subscription?.unsubscribe(); };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login');
  }, [loading, isAuthenticated, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C19A4A] mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return null;
  return children;
}
