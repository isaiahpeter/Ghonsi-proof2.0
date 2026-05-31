import * as agent from '@/lib/agent.js';
import { supabase } from '@/lib/supabaseClient';
import { getProfile } from './profileApi';
import { getUserProofs } from './proofsApi';

/**
 * Agent API Wrapper - Integrates agent.js with existing profile/proofs
 * Maps user_id <-> wallet_address
 */

export const scanUserProofsWithAgent = async (userId) => {
  try {
    const profile = await getProfile(userId);
    if (!profile?.wallet_address) {
      throw new Error('No wallet linked to profile');
    }

    const proofs = await getUserProofs(userId);
    const proofData = proofs.map(p => ({
      title: p.proof_name,
      description: p.summary || '',
      skills: p.proof_type ? [p.proof_type.replace(/_/g, ' ')] : []
    }));

    const wallet = profile.wallet_address;
    return await agent.scanUserProofs(wallet, proofData);
  } catch (error) {
    console.error('scanUserProofsWithAgent error:', error);
    throw error;
  }
};

export const activateAgentForUser = async (userId, config = {}) => {
  try {
    const profile = await getProfile(userId);
    if (!profile?.wallet_address) {
      throw new Error('No wallet linked to profile');
    }

    return await agent.activateAgent(profile.wallet_address, config);
  } catch (error) {
    console.error('activateAgentForUser error:', error);
    throw error;
  }
};

export const getAgentForUser = async (userId) => {
  try {
    const profile = await getProfile(userId);
    if (!profile?.wallet_address) return null;

    return await agent.getAgentByWallet(profile.wallet_address);
  } catch (error) {
    console.error('getAgentForUser error:', error);
    return null;
  }
};

export const setAgentStatusForUser = async (userId, status) => {
  try {
    const profile = await getProfile(userId);
    const agentData = await agent.getAgentByWallet(profile.wallet_address);
    if (!agentData?.id) {
      throw new Error('No active agent found');
    }
    return await agent.setAgentStatus(agentData.id, status);
  } catch (error) {
    console.error('setAgentStatusForUser error:', error);
    throw error;
  }
};

// Re-export core functions for direct use
export const getGigs = agent.getGigs;
export const createGig = agent.createGig;
export const getGigById = agent.getGigById;
export const updateGig = agent.updateGig;
export const deleteGig = agent.deleteGig;
export const getAgentTasks = agent.getAgentTasks;
export const approveTask = agent.approveTask;
export const rejectTask = agent.rejectTask;
export const generateProposalForGig = agent.generateProposalForGig;
export const getTeamStats = agent.getTeamStats;

// Convenience: Get agent summary for dashboard
export const getAgentSummary = async (userId) => {
  const agentData = await getAgentForUser(userId);
  if (!agentData) return { active: false, proofsCount: 0 };

  const scanResult = await scanUserProofsWithAgent(userId);
  const stats = await getTeamStats(agentData.wallet);

  return {
    ...agentData,
    active: agentData.status === 'active',
    scanSummary: scanResult.summary,
    ...stats
  };
};

