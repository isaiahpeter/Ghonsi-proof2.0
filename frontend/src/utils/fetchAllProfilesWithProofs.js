import { supabase } from '@/lib/supabaseClient';

/**
 * Fetch all profiles with proofs and files data from the view
 * This joins profiles, users, proofs, files for complete bubble data
 */
export const fetchAllProfilesWithProofs = async () => {
  const { data, error } = await supabase
    .from('profiles_with_proofs_files')
    .select(`
      *,
      users (wallet_address, email),
      proofs (id, proof_name, proof_type, status, verified_at, created_at),
      files (file_url, filename)
    `);

  if (error) {
    console.error('Error fetching profiles with proofs:', error);
    return { profiles: [], total: 0, hasMore: false };
  }

  // Transform data structure expected by useFilteredProfiles
  const profiles = data.map(profile => ({
    ...profile,
    proofs: profile.proofs || [],
    proofCount: profile.proofs?.length || 0,
    users: profile.users || {}
  }));

  return {
    profiles,
    total: profiles.length,
    hasMore: false  // Single page fetch for client-side pagination
  };
};

