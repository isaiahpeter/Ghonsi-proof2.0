/**
 * Mini‑Them Agent – Core Functions
 * 
 * This module contains all functions needed to:
 * - Scan user proofs with AI
 * - Activate/deactivate agents
 * - Manage agent tasks
 * - Handle gig marketplace
 * - (Optional) Integrate x402 payments
 * 
 * Dependencies: npm install @supabase/supabase-js
 */

import { supabase } from '@/lib/supabaseClient';

// ----------------------------------------------------------------------
// AI Provider Configuration
// ----------------------------------------------------------------------
const AI_PROVIDER = process.env.NEXT_PUBLIC_AI_PROVIDER || 'anthropic';
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;

if (!AI_API_KEY) {
  console.warn('NEXT_PUBLIC_AI_API_KEY not set - AI features disabled');
}

/**
 * Call AI model using native fetch (no SDKs)
 * @param {string} userPrompt - The main user query
 * @param {string} systemPrompt - System instructions
 * @returns {Promise<string>} AI response text
 */
async function callAI(userPrompt, systemPrompt) {
  let url, headers, body;

  if (AI_PROVIDER === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages';
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY,
      'anthropic-version': '2023-06-01'
    };
    body = JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });
  } else if (AI_PROVIDER === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    };
    body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });
  } else {
    // OpenRouter / OpenAI compatible
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    };
    body = JSON.stringify({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });
  }

  const response = await fetch(url, { method: 'POST', headers, body });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return AI_PROVIDER === 'anthropic' 
    ? data.content[0].text 
    : data.choices[0].message.content;
}

// ----------------------------------------------------------------------
// 1. Agent Scanning & Activation
// ----------------------------------------------------------------------

/**
 * Scan user's on‑chain proofs and return AI style summary
 * @param {string} wallet - User's wallet address
 * @param {Array} proofs - Array of proof objects { title, description, skills }
 * @returns {Promise<Object>} { success, summary, proofsCount }
 */
export async function scanUserProofs(wallet, proofs) {
  if (!proofs || proofs.length === 0) {
    return { success: false, error: 'NO_PROOFS', message: 'No proofs found' };
  }

  const proofText = proofs.map(p =>
    `Title: ${p.title}\nDescription: ${p.description}\nSkills: ${p.skills?.join(', ') || 'N/A'}`
  ).join('\n\n');

  const prompt = `Based on these proofs:\n\n${proofText}\n\nProvide a summary with:\n- Skills I learned\n- Your style\n- Common patterns`;

  const summary = await callAI(prompt, 'You are an expert at analyzing work portfolios and extracting style patterns.');

  return {
    success: true,
    summary,
    proofsCount: proofs.length
  };
}

/**
 * Activate a Mini‑Them agent for a user
 * @param {string} wallet - User's wallet address
 * @param {Object} config - { customInstructions, permissions, attachedFiles }
 * @returns {Promise<Object>} { success, agentId, status }
 */
export async function activateAgent(wallet, config) {
  const { customInstructions, permissions, attachedFiles } = config;

  const { data, error } = await supabase
    .from('agents')
    .upsert({
      wallet,
      custom_instructions: customInstructions,
      permissions: permissions || { autoApply: false, requireApproval: true },
      status: 'active',
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'wallet' })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Optionally store attached files metadata
  if (attachedFiles?.length) {
    // Implementation depends on your file storage
    console.log(`Agent ${data.id} has ${attachedFiles.length} files attached`);
  }

  return {
    success: true,
    agentId: data.id,
    status: data.status
  };
}

/**
 * Get the current agent for a wallet
 * @param {string} wallet - User's wallet address
 * @returns {Promise<Object|null>} Agent object or null
 */
export async function getAgentByWallet(wallet) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('wallet', wallet)
    .single();

  if (error) return null;
  return data;
}

/**
 * Pause or resume an agent
 * @param {string} agentId - Agent UUID
 * @param {string} status - 'active' or 'paused'
 */
export async function setAgentStatus(agentId, status) {
  const { error } = await supabase
    .from('agents')
    .update({
      status,
      paused_at: status === 'paused' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', agentId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ----------------------------------------------------------------------
// 2. Task Management (Control Panel)
// ----------------------------------------------------------------------

/**
 * Get tasks for an agent
 * @param {string} agentId - Agent UUID
 * @param {string} statusFilter - Optional status filter
 * @returns {Promise<Array>} Tasks with joined gig data
 */
export const getAgentTasks = async (agentId, filters = {}) => {
  let query = supabase
    .from('agent_tasks')
    .select('*')                    // no join with jobs
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Approve a pending task (and optionally edit output)
 * @param {string} taskId - Task UUID
 * @param {string} modifications - Edited output (optional)
 */
export async function approveTask(taskId, modifications = null) {
  // 1. Fetch the task
  const { data: task, error: fetchError } = await supabase
    .from('agent_tasks')
    .select('*, agents(*)')
    .eq('id', taskId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (task.status !== 'pending_approval') {
    throw new Error(`Task is not pending approval (current status: ${task.status})`);
  }

  // 2. Update task status
  const finalOutput = modifications || task.proposed_output;
  const { error: updateError } = await supabase
    .from('agent_tasks')
    .update({
      status: 'executed',
      final_output: finalOutput,
      executed_at: new Date().toISOString()
    })
    .eq('id', taskId);

  if (updateError) throw new Error(updateError.message);

  // 3. Here you could trigger on‑chain proof creation
  // await createOnChainProof(task.agents.wallet, finalOutput, task.gig_id);

  return { success: true, taskId };
}

/**
 * Reject a pending task
 * @param {string} taskId - Task UUID
 * @param {string} reason - Reason for rejection
 */
export async function rejectTask(taskId, reason = '') {
  const { error } = await supabase
    .from('agent_tasks')
    .update({
      status: 'rejected',
      final_output: reason || null
    })
    .eq('id', taskId);

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Send a chat message to the agent (updates custom instructions)
 * @param {string} agentId - Agent UUID
 * @param {string} message - User instruction
 */
export async function sendChatMessage(agentId, message) {
  // Fetch current instructions
  const { data: agent, error: fetchError } = await supabase
    .from('agents')
    .select('custom_instructions')
    .eq('id', agentId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const updated = agent.custom_instructions
    ? `${agent.custom_instructions}\nUser: ${message}`
    : message;

  const { error: updateError } = await supabase
    .from('agents')
    .update({ custom_instructions: updated })
    .eq('id', agentId);

  if (updateError) throw new Error(updateError.message);
  return { success: true };
}

// ----------------------------------------------------------------------
// 3. Job Marketplace (Gigs)
// ----------------------------------------------------------------------

/**
 * List gigs with optional filters
 * @param {Object} options - { limit, offset, status, skills, sort }
 */
export async function getGigs(options = {}) {
  const {
    limit = 20,
    offset = 0,
    status = 'open',
    skills,
    sort = 'newest'
  } = options;

  let query = supabase
    .from('gigs')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .range(offset, offset + limit - 1);

  if (skills && skills.length) {
    query = query.contains('skills', skills);
  }

  query = query.order('created_at', { ascending: sort === 'oldest' });

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data,
    total: count,
    offset,
    limit
  };
}

/**
 * Get a single gig by ID
 */
export async function getGigById(gigId) {
  const { data, error } = await supabase
    .from('gigs')
    .select('*')
    .eq('id', gigId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Create a new gig
 */
export async function createGig(gigData) {
  const { title, description, budget, skills, posted_by } = gigData;

  const { data, error } = await supabase
    .from('gigs')
    .insert({
      title,
      description,
      budget: budget || null,
      skills: skills || [],
      posted_by: posted_by || null,
      status: 'open'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update a gig
 */
export async function updateGig(gigId, updates) {
  const { data, error } = await supabase
    .from('gigs')
    .update(updates)
    .eq('id', gigId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a gig
 */
export async function deleteGig(gigId) {
  const { error } = await supabase
    .from('gigs')
    .delete()
    .eq('id', gigId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ----------------------------------------------------------------------
// 4. AI Proposal Generation (Background Worker)
// ----------------------------------------------------------------------

/**
 * Generate a proposal for a gig using the agent's style
 * @param {string} agentId - Agent UUID
 * @param {string} gigDescription - Gig description
 * @returns {Promise<Object>} Created task
 */
export async function generateProposalForGig(agentId, gigDescription) {
  // 1. Get agent style
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('custom_instructions')
    .eq('id', agentId)
    .single();

  if (agentError) throw new Error(agentError.message);

  const stylePrompt = agent?.custom_instructions || 'Professional, clear, concise.';
  const prompt = `Write a professional proposal for this gig in the user's exact style and tone:\n\nGig: ${gigDescription}`;

  // 2. Call AI
  const proposal = await callAI(prompt, stylePrompt);

  // 3. Save as pending task
  const { data: task, error: insertError } = await supabase
    .from('agent_tasks')
    .insert({
      agent_id: agentId,
      proposed_output: proposal,
      status: 'pending_approval'
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);
  return task;
}

// ----------------------------------------------------------------------
// 5. Team Statistics
// ----------------------------------------------------------------------

/**
 * Get combined Human+Agent team stats for a wallet
 */
export async function getTeamStats(wallet) {
  // Get agent
  const agent = await getAgentByWallet(wallet);
  if (!agent) {
    return {
      agentAssistedProofs: 0,
      averageRating: 0,
      totalTasks: 0
    };
  }

  // Count executed tasks
  const { count: executedCount } = await supabase
    .from('agent_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id)
    .eq('status', 'executed');

  // Count total tasks
  const { count: totalCount } = await supabase
    .from('agent_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id);

  // Get average rating
  const { data: ratings } = await supabase
    .from('team_ratings')
    .select('rating')
    .eq('agent_id', agent.id);

  const avg = ratings?.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    agentId: agent.id,
    agentAssistedProofs: executedCount || 0,
    totalTasks: totalCount || 0,
    averageRating: avg
  };
}

// ----------------------------------------------------------------------
// 6. (Optional) x402 Payment Integration for Monetized Gigs
// ----------------------------------------------------------------------

/**
 * Server‑side: Verify an x402 payment header

 * Call this before serving premium gig content.
 * 
 * @param {Object} req - HTTP request object (with headers)
 * @returns {Promise<boolean>} True if payment is valid
 */
export async function verifyX402Payment(req) {
  // Support both req object and direct header string
  const paymentHeader = typeof req === 'string' 
    ? req 
    : (req.headers?.['payment-signature'] || req.headers?.['x-payment'] || req.headers?.['payment']);

  if (!paymentHeader) {
    return { valid: false, error: 'No payment header provided' };
  }

  const facilitatorUrl = process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator';

  try {
    const response = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x402Version: 2,
        paymentHeader,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[x402] Facilitator rejected payment:', response.status, errorBody);
      return { valid: false, error: `Facilitator returned ${response.status}` };
    }

    const result = await response.json();
    return { valid: result.valid === true, result };
  } catch (err) {
    console.error('[x402] Facilitator verification error:', err.message);
    return { valid: false, error: err.message };
  }
}


// ----------------------------------------------------------------------
// Export all functions as a module
// ----------------------------------------------------------------------
export default {
  scanUserProofs,
  activateAgent,
  getAgentByWallet,
  setAgentStatus,
  getAgentTasks,
  approveTask,
  rejectTask,
  sendChatMessage,
  getGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  generateProposalForGig,
  getTeamStats,
  verifyX402Payment
};
