import { supabase } from '@/lib/supabaseClient';

/**
 * Profile Management API
 */

const generateUID = (userId) => {
  if (!userId) return '000000000';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString().padStart(9, '0').slice(0, 9);
};

/**
 * Fetches profile for the logged-in user
 */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, users(email, wallet_address)')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (data) {
    const updates = {};
    if (!data.uid) {
      updates.uid = generateUID(userId);
      data.uid = updates.uid;
    }
    if (!data.email) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          updates.email = user.email;
          data.email = updates.email;
        }
      } catch {
        // wallet-only user, no Supabase auth session
      }
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('user_id', userId);
    }
  }

  // Prefer wallet_address from the users join (source of truth),
  // fall back to profiles.wallet_address for backwards compatibility
  if (data?.users?.wallet_address) {
    data.wallet_address = data.users.wallet_address;
  }

  return data;
};

export const getProfileByWallet = async (walletAddress) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, users!inner(*)')
    .eq('users.wallet_address', walletAddress)
    .single();
  if (error) return null;
  return data;
};

export const getProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, users(*)')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
};

/**
 * Create or update a profile — uses upsert on user_id to prevent
 * "duplicate key" errors when the profile row already exists.
 * This handles: new users, returning users, and retry after a failed save.
 */
export const createProfile = async (profileData) => {
  let userId = null;
  let email = null;

  // Try Supabase auth session first
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      email = user.email;
    }
  } catch {
    // no Supabase session — wallet user
  }

  // Fall back to profileData for wallet users
  if (!userId) {
    userId = profileData.user_id;
    if (!userId) throw new Error('User not authenticated — no user ID found');
    email = profileData.email || null;
  }

  // profileData email takes priority
  if (profileData.email) email = profileData.email;

  const uid = generateUID(userId);

  // Use upsert with onConflict: user_id so retries and existing profiles
  // never throw a unique constraint violation
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        uid,
        email,
        ...profileData,
        created_at: profileData.created_at || new Date().toISOString(),
      },
      { onConflict: 'user_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select();
  if (error) throw error;
  return data[0];
};

export const fetchProfiles = async () => {
  // First, get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) return [];
  
  // Then, get proof counts for each user
  const { data: proofCounts, error: proofsError } = await supabase
    .from('proofs')
    .select('user_id');
  
  if (proofsError) {
    console.error('Error fetching proof counts:', proofsError);
    // Return profiles with 0 proof count if proofs query fails
    return profiles.map(profile => ({ ...profile, proof_count: 0 }));
  }
  
  // Count proofs per user
  const proofCountMap = {};
  proofCounts.forEach(proof => {
    proofCountMap[proof.user_id] = (proofCountMap[proof.user_id] || 0) + 1;
  });
  
  // Merge proof counts with profiles
  return profiles.map(profile => ({
    ...profile,
    proof_count: proofCountMap[profile.user_id] || 0
  }));
};

export const profileExists = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return !!data;
};