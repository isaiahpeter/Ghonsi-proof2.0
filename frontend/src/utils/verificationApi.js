import { supabase } from '@/lib/supabaseClient';

/**
 * Verification Request Management API
 */

// Create a verification request
export const createVerificationRequest = async (requestData) => {
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('verification_requests')
    .insert({
      user_id: user.data.user.id,
      proof_id: requestData.proofId,
      verifier_email: requestData.verifierEmail,
      verifier_name: requestData.verifierName,
      relationship: requestData.relationship,
      message: requestData.message,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all verification requests for a user
export const getUserVerificationRequests = async (userId) => {
  const { data, error } = await supabase
    .from('verification_requests')
    .select(`
      *,
      proofs(proof_name, proof_type)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get a single verification request
export const getVerificationRequest = async (requestId) => {
  const { data, error } = await supabase
    .from('verification_requests')
    .select(`
      *,
      proofs(*)
    `)
    .eq('id', requestId)
    .single();

  if (error) throw error;
  return data;
};

// Update verification request status
export const updateVerificationRequestStatus = async (requestId, status, response = null) => {
  const updates = {
    status,
    updated_at: new Date().toISOString()
  };

  if (response) {
    updates.verifier_response = response;
  }

  if (status === 'approved' || status === 'rejected') {
    updates.responded_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('verification_requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete verification request
export const deleteVerificationRequest = async (requestId) => {
  const { error } = await supabase
    .from('verification_requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
  return true;
};
