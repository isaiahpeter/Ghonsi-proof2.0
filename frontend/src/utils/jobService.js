/*
  Lightweight job service with backend API fallback and localStorage persistence.
*/
const API_PREFIX = '/api';
const LS_KEY = 'jobs_v1';

async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchJobs() {
  try {
    const res = await fetch(`${API_PREFIX}/jobs`);
    if (res.ok) {
      const json = await safeJson(res);
      if (json && (json.success || Array.isArray(json))) return json.data || json;
    }
  } catch (err) {
    console.warn('Jobs API not available:', err.message);
  }
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

export async function createJob(job) {
  try {
    const res = await fetch(`${API_PREFIX}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    if (res.ok) {
      const json = await safeJson(res);
      if (json && json.success) return json.data;
    }
  } catch (err) {
    console.warn('createJob API failed:', err.message);
  }

  // fallback to localStorage
  const list = await fetchJobs();
  const id = String(Date.now());
  const newJob = { ...job, id, posted_at: new Date().toISOString(), applicants: [] };
  list.unshift(newJob);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  return newJob;
}

export async function applyToJob(jobId, applicant) {
  try {
    const res = await fetch(`${API_PREFIX}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicant)
    });
    if (res.ok) {
      const json = await safeJson(res);
      if (json && json.success) return json.data;
    }
  } catch (err) {
    console.warn('applyToJob API failed:', err.message);
  }

  // fallback: update localStorage
  const list = await fetchJobs();
  const idx = list.findIndex(j => String(j.id) === String(jobId));
  if (idx === -1) throw new Error('Job not found');
  const id = String(Date.now());
  const appl = { id, status: 'applied', applied_at: new Date().toISOString(), ...applicant };
  list[idx].applicants = list[idx].applicants || [];
  list[idx].applicants.push(appl);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  return appl;
}

export async function getApplicants(jobId) {
  try {
    const res = await fetch(`${API_PREFIX}/jobs/${jobId}/applicants`);
    if (res.ok) {
      const json = await safeJson(res);
      if (json && json.success) return json.data;
    }
  } catch (err) {
    console.warn('getApplicants API failed:', err.message);
  }
  const list = await fetchJobs();
  const job = list.find(j => String(j.id) === String(jobId));
  return (job && job.applicants) ? job.applicants : [];
}

export async function updateApplicantStatus(jobId, applicantId, status) {
  try {
    const res = await fetch(`${API_PREFIX}/jobs/${jobId}/applicants/${applicantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const json = await safeJson(res);
      if (json && json.success) return json.data;
    }
  } catch (err) {
    console.warn('updateApplicantStatus API failed:', err.message);
  }

  // fallback local update
  const list = await fetchJobs();
  const j = list.find(j => String(j.id) === String(jobId));
  if (!j) throw new Error('Job not found');
  const a = (j.applicants || []).find(a => String(a.id) === String(applicantId));
  if (!a) throw new Error('Applicant not found');
  a.status = status;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  return a;
}

export async function aiMatch(jobId) {
  try {
    const res = await fetch(`${API_PREFIX}/jobs/${jobId}/ai-match`, { method: 'POST' });
    if (res.ok) {
      const json = await safeJson(res);
      if (json && json.success) return json.data;
    }
  } catch (err) {
    console.warn('aiMatch API failed:', err.message);
  }

  // fallback simple heuristic scoring
  const jobs = await fetchJobs();
  const job = jobs.find(j => String(j.id) === String(jobId));
  if (!job) return [];
  const applicants = job.applicants || [];
  const reqText = ((job.requirements || '') + ' ' + (job.description || '')).toLowerCase();
  const keywords = (job.tags || []).concat((job.requirements || '').split(/[,\n]/)).map(s => s.trim()).filter(Boolean);
  const results = applicants.map(a => {
    const text = ((a.coverLetter || '') + ' ' + (a.resume || '') + ' ' + (a.profile || '')).toLowerCase();
    let score = 0;
    keywords.forEach(k => {
      if (!k) return;
      if (text.includes(k.toLowerCase())) score += 10;
    });
    if (a.resume) score += 10;
    score = Math.min(100, Math.round((score / (Math.max(1, keywords.length) * 10)) * 100));
    return { applicantId: a.id, score, reasons: `Matched keywords: ${keywords.filter(k => text.includes(k.toLowerCase())).join(', ')}` };
  });
  return results;
}

export default {
  fetchJobs,
  createJob,
  applyToJob,
  getApplicants,
  updateApplicantStatus,
  aiMatch
};
