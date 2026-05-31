'use client';
import React, { useEffect, useState } from 'react';
import { applyToJob, getApplicants, updateApplicantStatus, aiMatch } from '../../utils/jobService';

const ApplicantModal = ({ job, manageMode = false, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [aiResults, setAiResults] = useState(null);

  useEffect(() => {
    if (manageMode) loadApplicants();
  }, [manageMode]);

  const loadApplicants = async () => {
    const list = await getApplicants(job.id);
    setApplicants(Array.isArray(list) ? list : []);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyToJob(job.id, { name, email, resume, coverLetter });
      setSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert('Failed to apply');
    }
  };

  const handleStatus = async (applicantId, status) => {
    try {
      await updateApplicantStatus(job.id, applicantId, status);
      await loadApplicants();
    } catch (err) { console.error(err); }
  };

  const handleAi = async () => {
    const res = await aiMatch(job.id);
    setAiResults(res);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0F1B] rounded-2xl w-full max-w-3xl p-6 border border-[#C19A4A]/30 overflow-y-auto max-h-[85vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{manageMode ? `Applicants for ${job.title}` : `Apply: ${job.title}`}</h3>
          <button onClick={onClose} className="text-gray-400">Close</button>
        </div>

        {!manageMode && (
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="bg-[#151925] border border-[#2A2E3D] rounded px-3 py-2 text-white" />
              <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="bg-[#151925] border border-[#2A2E3D] rounded px-3 py-2 text-white" />
            </div>

            <input value={resume} onChange={e=>setResume(e.target.value)} placeholder="Resume link or text (optional)" className="w-full bg-[#151925] border border-[#2A2E3D] rounded px-3 py-2 text-white" />
            <textarea value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} placeholder="Cover letter (optional)" rows={5} className="w-full bg-[#151925] border border-[#2A2E3D] rounded px-3 py-2 text-white" />

            <div className="flex items-center justify-end gap-3">
              <button type="submit" disabled={submitting} className="bg-[#C19A4A] text-[#0B0F1B] px-4 py-2 rounded-lg font-bold">{submitting ? 'Applying...' : 'Apply'}</button>
            </div>
          </form>
        )}

        {manageMode && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={handleAi} className="bg-[#C19A4A] text-[#0B0F1B] px-3 py-2 rounded">Run AI Match</button>
              <div className="text-sm text-gray-400">{applicants.length} applicants</div>
            </div>

            {aiResults && (
              <div className="bg-[#151925] p-3 rounded">AI Results:
                <pre className="text-xs text-gray-300 overflow-auto p-2">{JSON.stringify(aiResults, null, 2)}</pre>
              </div>
            )}

            <div className="space-y-3">
              {applicants.map(a => (
                <div key={a.id} className="bg-[#151925] p-3 rounded flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold">{a.name} <span className="text-xs text-gray-400">{a.email}</span></div>
                    <div className="text-sm text-gray-300 mt-2">{a.coverLetter || (a.resume ? `Resume: ${a.resume}` : 'No cover letter')}</div>
                    <div className="text-xs text-gray-400 mt-2">Status: {a.status || 'applied'}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleStatus(a.id, 'reviewed')} className="text-sm text-gray-300">Mark Reviewed</button>
                    <button onClick={() => handleStatus(a.id, 'interview')} className="text-sm text-gray-300">Interview</button>
                    <button onClick={() => handleStatus(a.id, 'hired')} className="text-sm text-green-400">Hire</button>
                    <button onClick={() => handleStatus(a.id, 'rejected')} className="text-sm text-red-400">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantModal;
