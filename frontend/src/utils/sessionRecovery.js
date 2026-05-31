/**
 * Session Recovery Utility
 * Handles persistent wallet sessions and recovery from page refreshes
 * Ensures users stay logged in across browser sessions
 */

import { verifyWalletSession, getWalletSession } from './supabaseAuth';
import { supabase } from '@/lib/supabaseClient';

/**
 * Initialize session recovery on app load
 * Restores user session if it exists
 */
export const initializeSessionRecovery = async () => {
  try {
    console.log('Initializing session recovery...');

    // Check Supabase session first
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Supabase session found, user authenticated');
      return { authenticated: true, type: 'supabase' };
    }

    // Check wallet session
    const walletSession = getWalletSession();
    if (walletSession.walletAddress && walletSession.userId) {
      const isValid = await verifyWalletSession();
      if (isValid) {
        console.log('Wallet session recovered:', walletSession.userId);
        return { authenticated: true, type: 'wallet', session: walletSession };
      } else {
        console.log('Wallet session invalid, clearing...');
        clearWalletSession();
        return { authenticated: false, type: 'wallet_invalid' };
      }
    }

    console.log('No valid session found');
    return { authenticated: false, type: 'none' };
  } catch (error) {
    console.error('Session recovery error:', error);
    return { authenticated: false, type: 'error', error };
  }
};

/**
 * Clear wallet session data
 */
export const clearWalletSession = () => {
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('connected_wallet');
  localStorage.removeItem('user_id');
  localStorage.removeItem('wallet_signature');
  localStorage.removeItem('wallet_public_key');
  localStorage.removeItem('session_token');
  localStorage.removeItem('session_created');
  localStorage.removeItem('auth_method');
  console.log('Wallet session cleared');
};

/**
 * Check if user has an active session
 * Used for route protection and UI decisions
 */
export const hasActiveSession = async () => {
  try {
    // Check Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;

    // Check wallet session
    return await verifyWalletSession();
  } catch (error) {
    console.error('Error checking active session:', error);
    return false;
  }
};

/**
 * Get current user from either Supabase or wallet session
 */
export const getCurrentAuthenticatedUser = async () => {
  try {
    // Try Supabase session first
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      return user || { id: session.user.id, email: session.user.email };
    }

    // Fall back to wallet session
    const walletSession = getWalletSession();
    if (walletSession.userId) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', walletSession.userId)
        .single();
      
      return user;
    }

    return null;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
};

/**
 * Validate session on every critical operation
 * Re-verifies session validity
 */
export const validateSession = async () => {
  try {
    // Check Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Supabase session valid');
      return true;
    }

    // Check and validate wallet session
    const isValid = await verifyWalletSession();
    if (isValid) {
      console.log('Wallet session valid');
      return true;
    }

    console.log('Session validation failed');
    clearWalletSession();
    return false;
  } catch (error) {
    console.error('Session validation error:', error);
    clearWalletSession();
    return false;
  }
};

/**
 * Log detailed session information (for debugging)
 */
export const debugSessionInfo = () => {
  const walletSession = getWalletSession();
  
  console.log('=== SESSION DEBUG INFO ===');
  console.log('Wallet Address:', walletSession.walletAddress);
  console.log('User ID:', walletSession.userId);
  console.log('Connected Wallet:', walletSession.connectedWallet);
  console.log('Session Token:', walletSession.sessionToken);
  console.log('Auth Method:', localStorage.getItem('auth_method'));
  console.log('Last Login:', localStorage.getItem('last_login'));
  console.log('========================');
};
