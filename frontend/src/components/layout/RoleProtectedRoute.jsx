'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RoleProtectedRoute({ children, allowedRole }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isMounted = true;
    const checkAuthAndRole = async () => {
      try {
        const viewingUserId = searchParams.get('id');
        if (viewingUserId && pathname === '/professionals/portfolio') {
          if (isMounted) { setIsAuthenticated(true); setUserRole('professional'); setLoading(false); }
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        let userId = session ? session.user.id : localStorage.getItem('user_id');
        if (!userId) { if (isMounted) { setIsAuthenticated(false); setLoading(false); } return; }

        const { data: profileData } = await supabase.from('profiles').select('user_type').eq('user_id', userId).maybeSingle();
        if (profileData && isMounted) { setIsAuthenticated(true); setUserRole(profileData.user_type); }
        else if (isMounted) { setIsAuthenticated(false); }
      } catch (error) {
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    checkAuthAndRole();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => { if (isMounted) checkAuthAndRole(); });
    return () => { isMounted = false; authListener?.subscription?.unsubscribe(); };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) { router.replace('/login'); return; }
      if (allowedRole && userRole !== allowedRole) {
        if (userRole === 'hirer') router.replace('/hirers/dashboard');
        else if (userRole === 'professional') router.replace('/professionals/dashboard');
        else router.replace('/user-type');
      }
    }
  }, [loading, isAuthenticated, userRole, allowedRole, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C19A4A]"></div>
    </div>
  );
  if (!isAuthenticated || (allowedRole && userRole !== allowedRole)) return null;
  return children;
}
