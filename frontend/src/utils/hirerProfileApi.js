import { supabase } from '@/lib/supabaseClient';

/**
 * Hirer Profile Management API
 */

/**
 * Fetches hirer profile for the logged-in user
 */
export const getHirerProfile = async (userId) => {
  const { data, error } = await supabase
    .from('hirer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create or update a hirer profile
 */
export const createHirerProfile = async (profileData) => {
  let userId = null;

  // Try Supabase auth session first
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
    }
  } catch {
    // no Supabase session — wallet user
  }

  // Fall back to profileData for wallet users
  if (!userId) {
    userId = profileData.user_id;
    if (!userId) throw new Error('User not authenticated — no user ID found');
  }

  // Use upsert with onConflict: user_id
  const { data, error } = await supabase
    .from('hirer_profiles')
    .upsert(
      {
        user_id: userId,
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

/**
 * Update hirer profile
 */
export const updateHirerProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('hirer_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select();
  if (error) throw error;
  return data[0];
};

/**
 * Check if hirer profile exists
 */
export const hirerProfileExists = async (userId) => {
  const { data } = await supabase
    .from('hirer_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return !!data;
};

/**
 * Get hirer's job postings
 */
export const getHirerJobs = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('hirer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('job_postings table not found:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching jobs:', err);
    return [];
  }
};

/**
 * Get applicants for hirer's jobs
 */
export const getHirerApplicants = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_postings!inner(hirer_id, title),
        profiles(display_name, profession, avatar_url, social_links)
      `)
      .eq('job_postings.hirer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('job_applications table not found:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching applicants:', err);
    return [];
  }
};
