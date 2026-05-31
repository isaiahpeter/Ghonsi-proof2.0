import { supabase } from '@/lib/supabaseClient';

// ----------------------------------------------------------------------
// Extraction API Configuration
// ----------------------------------------------------------------------
const EXTRACTION_API_URL =
  process.env.NEXT_PUBLIC_EXTRACTION_API_URL
    ? `${process.env.NEXT_PUBLIC_EXTRACTION_API_URL}/api/extract`
    : '/api/extract';

const mapProofTypeToAPI = (proofType) => {
  const mapping = {
    certificates: 'certificate',
    certificate: 'certificate',
    job_history: 'job',
    job: 'job',
    skills: 'skill',
    skill: 'skill',
    milestones: 'milestone',
    milestone: 'milestone',
    community_contributions: 'contribution',
    contribution: 'contribution',
  };
  return mapping[proofType] || 'skill';
};

// ----------------------------------------------------------------------
// Agent CRUD
// ----------------------------------------------------------------------
export const getUserAgent = async (userId) => {
  const { data, error } = await supabase
    .from('mini_them_agents')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createMiniThemAgent = async (userId, agentData) => {
  const existing = await getUserAgent(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('mini_them_agents')
    .insert({
      user_id: userId,
      agent_name: agentData.agentName || 'Mini-Them',
      learned_skills: agentData.learnedSkills || [],
      style_summary: agentData.styleSummary || '',
      common_patterns: agentData.commonPatterns || [],
      custom_instructions: agentData.customInstructions || '',
      status: 'active',
      settings: {
        auto_apply_jobs: agentData.autoApplyJobs ?? true,
        require_approval: agentData.requireApproval ?? true,
        max_daily_tasks: agentData.maxDailyTasks || 10,
        notification_preferences: agentData.notificationPreferences || 'in_app',
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAgent = async (agentId, updates) => {
  const { data, error } = await supabase
    .from('mini_them_agents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleAgentStatus = async (agentId, status) =>
  updateAgent(agentId, { status });

export const deleteAgent = async (agentId) => {
  const { error } = await supabase
    .from('mini_them_agents')
    .delete()
    .eq('id', agentId);

  if (error) throw error;
  return true;
};

// ----------------------------------------------------------------------
// Proof Scanning with Extraction API + Claude
// ----------------------------------------------------------------------
export const scanUserProofs = async (userId) => {
  // 1. Fetch verified proofs
  const { data: proofs, error } = await supabase
    .from('proofs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'verified')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!proofs || proofs.length === 0)
    throw new Error('No verified proofs found. Upload some work first.');

  // 2. Extract text from each proof via Extraction API
  const extractedDocs = [];
  for (const proof of proofs) {
    try {
      const fileUrl = proof.file_ipfs_url || proof.file_url;
      if (!fileUrl) {
        extractedDocs.push({
          proof_id: proof.id,
          raw_text: proof.summary || proof.description || '',
          skills: [],
        });
        continue;
      }

      let downloadUrl = fileUrl;
      if (downloadUrl && downloadUrl.startsWith('ipfs://')) {
        downloadUrl = `https://ipfs.io/ipfs/${downloadUrl.slice(7)}`;
      }
      const fileResp = await fetch(downloadUrl);
      if (!fileResp.ok) throw new Error(`Download failed: ${fileResp.status}`);
      const fileBlob = await fileResp.blob();

      const formData = new FormData();
      formData.append(
        'file',
        fileBlob,
        `proof-${proof.id}.${fileBlob.type.split('/')[1] || 'bin'}`
      );
      formData.append('proof_type', mapProofTypeToAPI(proof.proof_type));

      const extractRes = await fetch(EXTRACTION_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (extractRes.ok) {
        const result = await extractRes.json();
        extractedDocs.push({
          proof_id: proof.id,
          raw_text: JSON.stringify(result.extracted_data),
          skills: result.extracted_data.skills_and_expertise || [],
        });
      } else {
        console.warn(`Extraction failed for proof ${proof.id}, using fallback`);
        extractedDocs.push({
          proof_id: proof.id,
          raw_text: proof.summary || proof.description || '',
          skills: [],
        });
      }
    } catch (err) {
      console.error(`Proof ${proof.id} extraction error:`, err);
      extractedDocs.push({
        proof_id: proof.id,
        raw_text: proof.summary || proof.description || '',
        skills: [],
      });
    }
  }

  // 3. Call Claude for style analysis (Edge Function)
  try {
    const analysis = await callClaudeForScan(extractedDocs);
    return {
      learnedSkills: analysis.skills || [],
      styleSummary: analysis.style || '',
      commonPatterns: analysis.patterns || [],
      totalProofsAnalyzed: proofs.length,
    };
  } catch (aiError) {
    console.error('Claude style analysis failed:', aiError);
    const aggregatedSkills = [
      ...new Set(extractedDocs.flatMap((d) => d.skills)),
    ];
    return {
      learnedSkills: aggregatedSkills.length ? aggregatedSkills : ['General'],
      styleSummary: 'Professional, detail‑oriented',
      commonPatterns: ['Clear communication'],
      totalProofsAnalyzed: proofs.length,
    };
  }
};

const callClaudeForScan = async (extractedDocs) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  const prompt = [
    'Analyze the following extracted text from a user’s proofs and return a JSON object with:',
    '"skills": array of strings (specific skills like "Community Management", "Solidity"),',
    '"style": string describing tone and visual style,',
    '"patterns": array of recurring elements (e.g., "uses bullet points", "includes verification links").',
    '',
    'Extracted content:',
    ...extractedDocs.map((d) => d.raw_text),
  ].join('\n');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system:
          'You are an expert portfolio analyst. Reply only with a valid JSON object.',
        messages: [{ role: 'user', content: prompt }],
      }),
    }
  );

  if (!response.ok)
    throw new Error(`Claude Edge Function error: ${await response.text()}`);

  const data = await response.json();
  const text = data.content[0].text;

  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    }
    return JSON.parse(text);
  } catch {
    return { skills: [], style: text, patterns: [] };
  }
};

// ----------------------------------------------------------------------
// Task Management
// ----------------------------------------------------------------------
export const createAgentTask = async (taskData) => {
  const { data, error } = await supabase
    .from('agent_tasks')
    .insert({
      agent_id: taskData.agentId,
      gig_id: taskData.gigId || null,
      task_type: taskData.taskType,
      task_description: taskData.taskDescription,
      status: 'pending_approval',
      requires_approval: taskData.requiresApproval || false,
      output: taskData.output || null,
      proposed_output: taskData.output || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAgentTasks = async (agentId, filters = {}) => {
  let query = supabase
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const approveAgentTask = async (taskId) => {
  const { data, error } = await supabase
    .from('agent_tasks')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  await executeApprovedTask(data);
  return data;
};

export const rejectAgentTask = async (taskId, reason) => {
  const { data, error } = await supabase
    .from('agent_tasks')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const executeApprovedTask = async (task) => {
  try {
    if (task.task_type === 'job_application') {
      await supabase.from('job_applications').insert({
        gig_id: task.gig_id,
        agent_id: task.agent_id,
        applicant_type: 'hybrid',
        proposal: task.proposed_output || task.output,
        status: 'pending',
      });
    } else if (task.task_type === 'gig_completion') {
      await supabase.from('suggested_proofs').insert({
        agent_id: task.agent_id,
        proof_name: 'Completed by Human + Mini-Them Team',
        summary: task.proposed_output || task.output,
        source: 'mini_them_agent',
        gig_id: task.gig_id,
      });
    }
  } catch (error) {
    console.error('Execute approved task error:', error);
  }
};

export const getAgentStats = async (agentId) => {
  const { data: tasks, error } = await supabase
    .from('agent_tasks')
    .select('status, task_type')
    .eq('agent_id', agentId);

  if (error) throw error;

  return {
    total_tasks: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending_approval: tasks.filter((t) => t.status === 'pending_approval')
      .length,
    approved: tasks.filter((t) => t.status === 'approved').length,
    rejected: tasks.filter((t) => t.status === 'rejected').length,
  };
};

// ----------------------------------------------------------------------
// Drafts
// ----------------------------------------------------------------------
export const saveAgentDraft = (userId, draftData) => {
  localStorage.setItem(
    `agent_draft_${userId}`,
    JSON.stringify({ ...draftData, savedAt: new Date().toISOString() })
  );
};

export const loadAgentDraft = (userId) => {
  const draft = localStorage.getItem(`agent_draft_${userId}`);
  return draft ? JSON.parse(draft) : null;
};

export const clearAgentDraft = (userId) => {
  localStorage.removeItem(`agent_draft_${userId}`);
};

// ----------------------------------------------------------------------
// Chat (uses claude-chat Edge Function)
// ----------------------------------------------------------------------
export const chatWithAgent = async (agentId, message) => {
  await supabase.from('agent_chats').insert({
    agent_id: agentId,
    message_type: 'user',
    message,
  });

  const response = await getAgentResponse(agentId, message);

  await supabase.from('agent_chats').insert({
    agent_id: agentId,
    message_type: 'agent',
    message: response,
  });

  return response;
};

export const getAgentChatHistory = async (agentId, limit = 50) => {
  const { data, error } = await supabase
    .from('agent_chats')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse();
};

const getAgentResponse = async (agentId, message) => {
  const { data: agent, error: agentError } = await supabase
    .from('mini_them_agents')
    .select('style_summary, custom_instructions, learned_skills, agent_name')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) throw new Error('Agent not found');

   const marketingDirective = [
    "You are Mini-Them, a specialized AI assistant for marketing in Nigeria.",
    "You ONLY answer questions about marketing within the Nigerian market.",
    "Marketing includes: digital advertising, social media strategy, consumer behaviour,",
    "brand building, market entry, pricing, distribution, local regulations, and case studies",
    "of brands operating in Nigeria (e.g., Flutterwave, Paystack, Kuda, PiggyVest, Jumia).",
    "",
    "If a question is about general marketing topics (like SEO, email marketing) you MUST",
    "adapt your answer to the Nigerian context (local examples, naira, mobile money, etc.).",
    "",
    "If a question is not about marketing in Nigeria, reply with:",
    '"I specialize in Nigerian marketing. Please ask me something related to that, like how to launch a product in Lagos or how to use WhatsApp for customer engagement in Nigeria."',
    "",
    "Always be practical, data‑aware, and grounded in the realities of the Nigerian market.",
    "Use naira (₦) for monetary values if relevant."
  ].join('\n');

  // Build the full system prompt (style + skills + directive)
  const systemPrompt = [
    marketingDirective,
    "",
    `Your name: ${agent.agent_name || 'Mini-Them'}`,
    `Communication style: ${agent.style_summary || 'Professional, concise'}`,
    `Skills: ${agent.learned_skills?.join(', ') || 'marketing'}`,
    `Custom instructions: ${agent.custom_instructions || ''}`,
  ].join('\n');



  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    }
  );

  if (!response.ok)
    throw new Error(`Claude API error (${response.status}): ${await response.text()}`);

  const result = await response.json();
  return result.content[0].text;
};

// ----------------------------------------------------------------------
// AI Proposal Generator (also uses claude-chat)
// ----------------------------------------------------------------------
export const generateProposalForGig = async (agentId, gigId) => {
  // 1. Agent context
  const { data: agent, error: agentError } = await supabase
    .from('mini_them_agents')
    .select('style_summary, custom_instructions, learned_skills, agent_name')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) throw new Error('Agent not found');

  // 2. Gig details
  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('*')
    .eq('id', gigId)
    .single();

  if (gigError || !gig) throw new Error('Gig not found');

  const systemPrompt = [
    `You are a Mini‑Them agent named "${agent.agent_name || 'Mini-Them'}".`,
    `You work in the same style as the user who trained you.`,
    `Style: ${agent.style_summary || 'Professional, clear, concise.'}`,
    `Skills: ${agent.learned_skills?.join(', ') || 'General problem solving'}.`,
    `Custom instructions: ${agent.custom_instructions || 'Be persuasive and specific.'}`,
  ].join('\n');

  const userPrompt = [
    `Write a winning proposal for this job. Adopt the exact tone and format the user would use.`,
    ``,
    `Job title: ${gig.title}`,
    `Description: ${gig.description}`,
    `Budget: $${gig.budget ?? 'Not specified'}`,
    `Required skills: ${gig.skills?.join(', ') || 'Not specified'}`,
    ``,
    `The proposal should highlight relevant skills, mention past work,`,
    `and end with a clear call to action.`,
  ].join('\n');

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    }
  );

  if (!response.ok)
    throw new Error(`Claude proposal error (${response.status}): ${await response.text()}`);

  const result = await response.json();
  const proposalText = result.content[0].text;

  const { data: task, error: taskError } = await supabase
    .from('agent_tasks')
    .insert({
      agent_id: agentId,
      gig_id: gigId,
      task_type: 'gig_completion',
      task_description: `Proposal for "${gig.title}"`,
      proposed_output: proposalText,
      output: proposalText,
      status: 'pending_approval',
      requires_approval: true,
    })
    .select()
    .single();

  if (taskError) throw taskError;
  return task;
};

// ----------------------------------------------------------------------
// Team Stats
// ----------------------------------------------------------------------
export const getTeamStats = async (userId) => {
  const { data: agent } = await supabase
    .from('mini_them_agents')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!agent)
    return { agentAssistedProofs: 0, averageRating: 0, totalTasks: 0 };

  const [{ count: executedCount }, { count: totalCount }, { data: ratings }] =
    await Promise.all([
      supabase
        .from('agent_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id)
        .eq('status', 'approved'),
      supabase
        .from('agent_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id),
      supabase.from('team_ratings').select('rating').eq('agent_id', agent.id),
    ]);

  const avg = ratings?.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    agentAssistedProofs: executedCount || 0,
    totalTasks: totalCount || 0,
    averageRating: avg,
  };
};

// ----------------------------------------------------------------------
// Gig Marketplace
// ----------------------------------------------------------------------
export const getGigs = async (filters = {}) => {
  let query = supabase
    .from('gigs')
    .select('*')
    .eq('status', filters.status || 'open');

  if (filters.skills) query = query.contains('skills', filters.skills);

  const { data, error } = await query.order('created_at', {
    ascending: false,
  });
  if (error) throw error;
  return data;
};

export const getGigById = async (gigId) => {
  const { data, error } = await supabase
    .from('gigs')
    .select('*')
    .eq('id', gigId)
    .single();
  if (error) throw error;
  return data;
};

export const createGig = async (gigData, userId) => {
  const { data, error } = await supabase
    .from('gigs')
    .insert({
      title: gigData.title,
      description: gigData.description,
      budget: gigData.budget || null,
      skills: gigData.skills || [],
      posted_by: userId,
      status: 'open',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGigStatus = async (gigId, status) => {
  const { data, error } = await supabase
    .from('gigs')
    .update({ status })
    .eq('id', gigId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

