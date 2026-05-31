import { supabase } from '@/lib/supabaseClient';

/**
 * Authentication Utilities using Supabase Auth
 * Includes promise guard to prevent concurrent auth calls causing Navigator Lock timeout
 */

// Promise guard to prevent concurrent auth calls
// This is the key fix for Navigator Lock timeout - only one auth operation at a time
let authPromise = null;
let authPromiseResolve = null;

/**
 * Execute auth operation with promise guard to prevent concurrent calls
 * This prevents Navigator Lock timeout by serializing auth operations
 */
const executeWithAuthGuard = async (operation, operationName = 'auth operation') => {
  // If there's already an auth operation in progress, wait for it
  if (authPromise) {
    console.log(`Waiting for existing ${operationName} to complete...`);
    try {
      await authPromise;
    } catch (error) {
      // Ignore errors from waiting, proceed with our operation
      console.log(`Previous ${operationName} completed/errored, proceeding`);
    }
  }
  
  // Create new promise for this operation
  authPromise = new Promise((resolve) => {
    authPromiseResolve = resolve;
  });
  
  try {
    const result = await operation();
    // Clear the guard
    if (authPromiseResolve) {
      authPromiseResolve(result);
    }
    authPromise = null;
    authPromiseResolve = null;
    return result;
  } catch (error) {
    // Clear the guard on error too
    if (authPromiseResolve) {
      authPromiseResolve(null);
    }
    authPromise = null;
    authPromiseResolve = null;
    throw error;
  }
};

// Generate a UUID (compatible with Supabase's uuid_generate_v4)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// Sign up with email and password
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) throw error;
  return data;
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// Google oauth sign in
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
};

// Sign in with magic link (passwordless)
export const signInWithMagicLink = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

// Sign in with OTP (sends 6-digit code to email via Brevo)
export const sendOTPToEmail = async (email) => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Supabase with expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert([{
        email: email,
        otp_code: otp,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      }]);
    
    if (insertError) throw insertError;
    
    // Send OTP via Brevo
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send OTP email');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP code - Enhanced to check for wallet linking
export const verifyOTP = async (email, token) => {
  try {
    // Verify OTP from our database
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('otp_code', token)
      .single();
    
    if (otpError || !otpRecord) {
      throw new Error('Invalid OTP code');
    }
    
    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      throw new Error('OTP code has expired');
    }
    
    // Delete used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('id', otpRecord.id);
    
    // Check if user exists in users table, create if not
    const { data: existingByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user = existingByEmail;
    let isNewUser = false;

    if (emailError && emailError.code === 'PGRST116') {
      // User doesn't exist with this email - create new user
      isNewUser = true;
      const userId = generateUUID();
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: email,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        throw createError;
      }
      user = newUser;
    }

    // Check if user has a profile with user_type set
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', user.id)
      .single();

    // User needs to select type if: new user OR existing user without user_type
    const needsUserType = isNewUser || !profile || !profile.user_type;

    // Store session info in localStorage (same as wallet auth)
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('auth_method', 'email');
    localStorage.setItem('userLoggedIn', 'true');
    
    // Create a session token for persistence
    const sessionToken = generateUUID();
    localStorage.setItem('session_token', sessionToken);
    localStorage.setItem('session_created', new Date().toISOString());
    localStorage.setItem('last_login', new Date().toISOString());

    console.log('Email user authenticated with session:', user.id);

    return {
      user: user,
      isNewUser: needsUserType,
      error: null
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { error };
  }
};

// Check if email exists in users table (for linking validation)
export const checkEmailExists = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, wallet_address, email')
    .eq('email', email)
    .single();
  
  if (error && error.code === 'PGRST116') {
    return null;
  }
  if (error) throw error;
  return data;
};

// Check if wallet exists in users table (for linking validation)
export const checkWalletExists = async (walletAddress) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, wallet_address, email')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (error && error.code === 'PGRST116') {
    return null;
  }
  if (error) throw error;
  return data;
};

// Merge wallet user with email user
export const mergeWalletToEmail = async (walletUserId, emailUserId) => {
  try {
    const { data: walletUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', walletUserId)
      .single();

    if (!walletUser) {
      throw new Error('Wallet user not found');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_address: walletUser.wallet_address })
      .eq('id', emailUserId);

    if (updateError) throw updateError;

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', walletUserId);

    if (deleteError) {
      console.error('Error deleting old wallet user:', deleteError);
    }

    await supabase
      .from('profiles')
      .update({ user_id: emailUserId })
      .eq('user_id', walletUserId);

    await supabase
      .from('proofs')
      .update({ user_id: emailUserId })
      .eq('user_id', walletUserId);

    return { success: true };
  } catch (error) {
    console.error('Error merging accounts:', error);
    throw error;
  }
};

// Merge email user with wallet user
export const mergeEmailToWallet = async (emailUserId, walletUserId) => {
  try {
    const { data: emailUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', emailUserId)
      .single();

    if (!emailUser) {
      throw new Error('Email user not found');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ email: emailUser.email })
      .eq('id', walletUserId);

    if (updateError) throw updateError;

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', emailUserId);

    if (deleteError) {
      console.error('Error deleting old email user:', deleteError);
    }

    await supabase
      .from('profiles')
      .update({ user_id: walletUserId })
      .eq('user_id', emailUserId);

    await supabase
      .from('proofs')
      .update({ user_id: walletUserId })
      .eq('user_id', emailUserId);

    return { success: true };
  } catch (error) {
    console.error('Error merging accounts:', error);
    throw error;
  }
};

// Link wallet to existing email user
export const linkWalletToUser = async (userId, walletAddress) => {
  try {
    const { data: existingWallet } = await supabase
      .from('users')
      .select('id, email')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingWallet && existingWallet.id !== userId) {
      if (existingWallet.email) {
        throw new Error('This wallet is already linked to another account. Please use a different wallet.');
      }
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', existingWallet.id);
      
      if (deleteError) throw deleteError;
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', userId)
      .single();

    if (currentUser?.wallet_address) {
      throw new Error('You already have a wallet linked. Please disconnect your current wallet first.');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: walletAddress })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Error linking wallet:', error);
    throw error;
  }
};

// Link email to existing wallet user
export const linkEmailToUser = async (userId, email) => {
  try {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('email', email)
      .single();

    if (existingEmail && existingEmail.id !== userId) {
      throw new Error('This email is already in use. Please use a different email.');
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (currentUser?.email) {
      throw new Error('You already have an email linked. Please contact support to change your email.');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ email: email })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Error linking email:', error);
    throw error;
  }
};

// Sign in with wallet (Solana) - Web3 authentication
export const signInWithWallet = async (walletAddress, signatureData) => {
  try {
    console.log('Signing in with wallet:', walletAddress);

    // Check if user exists with this wallet
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    let user = existingUser;
    let isNewUser = false;
    let userId = null;

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist with this wallet - create new user with UUID
      isNewUser = true;
      userId = generateUUID();
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            wallet_address: walletAddress,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
      console.log('Created new user with wallet:', walletAddress, 'ID:', userId);
    } else if (fetchError) {
      throw fetchError;
    } else if (existingUser) {
      userId = existingUser.id;
      console.log('Existing user found:', userId);
    }

    // Store wallet connection info in localStorage for reference
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', signatureData?.walletName || 'Phantom');
    localStorage.setItem('user_id', userId);
    localStorage.setItem('wallet_signature', signatureData?.signature || '');
    localStorage.setItem('wallet_public_key', signatureData?.publicKey || '');

    // Create a JWT-like token for session persistence
    const sessionToken = generateUUID();
    localStorage.setItem('session_token', sessionToken);
    localStorage.setItem('session_created', new Date().toISOString());

    console.log('User authenticated with session:', userId);

    return {
      user,
      walletAddress,
      isNewUser,
      userId,
      signature: signatureData?.signature,
      sessionToken
    };
  } catch (error) {
    console.error('Wallet sign-in error:', error);
    throw error;
  }
};

// Sign out - clears all session data
export const logout = async () => {
  try {
    try {
      const session = await getSession();
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) console.log('Supabase signout error:', error);
      }
    } catch (error) {
      console.log('No Supabase session to sign out from');
    }

    // Clear all wallet and session data
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('user_id');
    localStorage.removeItem('wallet_signature');
    localStorage.removeItem('wallet_public_key');
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_created');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');

    console.log('User logged out, session cleared');
  } catch (error) {
    console.error('Logout error:', error);
    // Force clear all data anyway
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('user_id');
    localStorage.removeItem('wallet_signature');
    localStorage.removeItem('wallet_public_key');
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_created');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
  }
};

// Get current session - wrapped with auth guard to prevent concurrent calls
export const getSession = async () => {
  return executeWithAuthGuard(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }, 'getSession');
};

// Get current user - Supports both Supabase session and wallet session
export const getCurrentUser = async () => {
  try {
    // First check Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('Error getting session:', sessionError);
    }

    if (session?.user) {
      // Get user profile from users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Error fetching user profile:', error);
      }

      // Return the user data with session info
      return {
        ...user,
        id: session.user.id,
        email: session.user.email || user?.email || null,
        wallet_address: user?.wallet_address || null,
      };
    }

    // Check for email OTP session
    console.log('No Supabase session, checking email/wallet session');
    const userId = localStorage.getItem('user_id');
    const userEmail = localStorage.getItem('userEmail');
    const walletAddress = localStorage.getItem('wallet_address');
    const sessionToken = localStorage.getItem('session_token');

    if (!userId || !sessionToken) {
      console.log('No valid session found');
      return null;
    }

    // Get user profile from users table using userId
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('Error fetching user profile:', error);
      return null;
    }

    console.log('Session user found:', userId);
    return {
      ...user,
      id: userId,
      email: user?.email || userEmail || null,
      wallet_address: user?.wallet_address || walletAddress || null,
    };
  } catch (error) {
    console.log('No authenticated user found:', error);
    return null;
  }
};

// Check if user is authenticated - supports both Supabase session and wallet session
// Wrapped with auth guard to prevent concurrent calls causing Navigator Lock timeout
export const isAuthenticated = async () => {
  return executeWithAuthGuard(async () => {
    try {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return true;
      }

      // Check for email OTP or wallet session
      const userId = localStorage.getItem('user_id');
      const sessionToken = localStorage.getItem('session_token');

      if (userId && sessionToken) {
        // Verify user still exists in database
        const { data: user, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (!error && user) {
          console.log('Valid session found for user:', userId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.log('Error checking authentication:', error);
      return false;
    }
  }, 'isAuthenticated');
};

// Get wallet session info
export const getWalletSession = () => {
  return {
    walletAddress: localStorage.getItem('wallet_address'),
    userId: localStorage.getItem('user_id'),
    sessionToken: localStorage.getItem('session_token'),
    connectedWallet: localStorage.getItem('connected_wallet'),
  };
};

// Verify wallet session is valid
export const verifyWalletSession = async () => {
  const session = getWalletSession();
  
  if (!session.walletAddress || !session.userId) {
    return false;
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('id', session.userId)
      .eq('wallet_address', session.walletAddress)
      .single();

    if (error || !user) {
      console.log('Wallet session verification failed');
      return false;
    }

    console.log('Wallet session verified');
    return true;
  } catch (error) {
    console.error('Error verifying wallet session:', error);
    return false;
  }
};

// Password reset
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) throw error;
  return data;
};

// Update user password
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return data;
};

// Update user metadata
export const updateUserMetadata = async (metadata) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });

  if (error) throw error;
  return data;
};

// Legacy compatibility functions
export const login = async (email, walletAddress) => {
  if (walletAddress) {
    return signInWithWallet(walletAddress);
  } else if (email) {
    return signInWithMagicLink(email);
  }
  throw new Error('Either email or wallet address is required');
};

export const updateUserEmail = async (email) => {
  const { data, error } = await supabase.auth.updateUser({ email });
  return { data, error };
};

// Update user email in both Supabase Auth and users table
export const updateUserEmailWithSync = async (userId, email) => {
  try {
    // First update Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.updateUser({ email });
    if (authError) throw authError;

    // Then update users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ email: email })
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;

    return { success: true, authData, userData };
  } catch (error) {
    console.error('Error updating email with sync:', error);
    throw error;
  }
};
