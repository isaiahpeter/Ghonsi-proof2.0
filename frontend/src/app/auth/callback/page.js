'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');

  const handleAuthCallback = useCallback(async () => {
    try {
      // Get the current session (works for both magic link and Google OAuth)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        setStatus('❌ Authentication failed: ' + error.message);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!session) {
        setStatus('⚠️ No session found. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // User is authenticated - create/update user record
      console.log('User authenticated:', session.user.email);
      setStatus('✅ Authentication successful! Setting up your account...');

      // Ensure user row exists (handles both magic link and Google sign-in)
      const { error: upsertError } = await supabase
        .from('users')
        .upsert(
          { 
            id: session.user.id, 
            email: session.user.email 
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error('Error creating user record:', upsertError);
      }

      // Check if profile exists to decide redirect destination
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('user_id', session.user.id)
        .maybeSingle(); // Use maybeSingle() to avoid errors if no profile exists

      if (profileError) {
        console.error('Error checking profile:', profileError);
      }

      // Redirect based on whether profile exists (and route structure)
      // Existing app routes are nested under:
      //  - /professionals/*
      //  - /hirers/*
      setStatus('✅ Redirecting...');
      setTimeout(() => {
        if (!profile) {
          // No profile yet: user must pick/complete profile first
          router.push('/user-type');
          return;
        }

        if (profile.user_type === 'hirer') router.push('/hirers/dashboard');
        else router.push('/professionals/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Unexpected error:', error);
      setStatus('❌ An error occurred. Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [router]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  return (
    <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center px-4">
      <div className="bg-[#151925] rounded-2xl p-8 max-w-md w-full border border-white/10 text-center">
        <div className="mb-6">
          {status.includes('✅') ? (
            <div className="text-6xl mb-4">✅</div>
          ) : status.includes('❌') ? (
            <div className="text-6xl mb-4">❌</div>
          ) : status.includes('⚠️') ? (
            <div className="text-6xl mb-4">⚠️</div>
          ) : (
            <div className="w-16 h-16 border-4 border-[#C19A4A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Authentication</h1>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  );
}

export default AuthCallback;