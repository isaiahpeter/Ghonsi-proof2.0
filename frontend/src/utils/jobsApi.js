import { supabase } from '@/lib/supabaseClient';

/**
 * Job Marketplace API
 * Handles job postings, applications, and AI agent notifications
 */

// Create a new job posting
export const createJob = async (jobData) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: jobData.userId,
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        timeline: jobData.timeline,
        tags: jobData.tags || [],
        attachment_url: jobData.attachmentUrl || null,
        status: 'open',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Notify AI agents about new job
    await notifyAIAgents(data.id);

    return data;
  } catch (error) {
    console.error('Create job error:', error);
    throw error;
  }
};

// Get all jobs (for discovery)
export const getAllJobs = async (filters = {}) => {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      profiles!jobs_user_id_fkey(display_name, avatar_url),
      job_applications(count)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// Get jobs posted by a specific user
export const getUserJobs = async (userId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      job_applications(
        id,
        applicant_type,
        status,
        created_at,
        profiles!job_applications_user_id_fkey(display_name, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get a single job by ID
export const getJob = async (jobId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles!jobs_user_id_fkey(display_name, avatar_url, bio),
      job_applications(
        id,
        applicant_type,
        proposal,
        status,
        created_at,
        profiles!job_applications_user_id_fkey(display_name, avatar_url, bio)
      )
    `)
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
};

// Update job
export const updateJob = async (jobId, updates) => {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete job
export const deleteJob = async (jobId) => {
  // Delete applications first
  await supabase.from('job_applications').delete().eq('job_id', jobId);

  const { error } = await supabase.from('jobs').delete().eq('id', jobId);

  if (error) throw error;
  return true;
};

// Apply to a job
export const applyToJob = async (applicationData) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: applicationData.jobId,
        user_id: applicationData.userId,
        applicant_type: applicationData.applicantType, // 'human', 'ai_agent', 'hybrid'
        proposal: applicationData.proposal,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Apply to job error:', error);
    throw error;
  }
};

// Get applications for a job
export const getJobApplications = async (jobId) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      profiles!job_applications_user_id_fkey(display_name, avatar_url, bio)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  const { data, error } = await supabase
    .from('job_applications')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's applications
export const getUserApplications = async (userId) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      jobs(
        id,
        title,
        budget,
        status,
        profiles!jobs_user_id_fkey(display_name, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Notify AI agents about new job (placeholder for real-time notification system)
const notifyAIAgents = async (jobId) => {
  try {
    // This would integrate with your AI agent system
    // For now, we'll create a notification record
    const { error } = await supabase
      .from('ai_agent_notifications')
      .insert({
        job_id: jobId,
        notification_type: 'new_job',
        created_at: new Date().toISOString(),
      });

    if (error) console.error('AI agent notification error:', error);
  } catch (error) {
    console.error('Notify AI agents error:', error);
  }
};

// Get job statistics
export const getJobStats = async (userId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('status')
    .eq('user_id', userId);

  if (error) throw error;

  const stats = {
    total: data.length,
    open: data.filter((j) => j.status === 'open').length,
    in_progress: data.filter((j) => j.status === 'in_progress').length,
    closed: data.filter((j) => j.status === 'closed').length,
  };

  return stats;
};

// Save job draft
export const saveDraft = async (userId, draftData) => {
  const draftKey = `job_draft_${userId}`;
  localStorage.setItem(draftKey, JSON.stringify({
    ...draftData,
    savedAt: new Date().toISOString(),
  }));
};

// Load job draft
export const loadDraft = (userId) => {
  const draftKey = `job_draft_${userId}`;
  const draft = localStorage.getItem(draftKey);
  return draft ? JSON.parse(draft) : null;
};

// Clear job draft
export const clearDraft = (userId) => {
  const draftKey = `job_draft_${userId}`;
  localStorage.removeItem(draftKey);
};
