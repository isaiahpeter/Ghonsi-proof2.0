'use client';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import JobForm from './JobForm';
import JobCard from './JobCard';
import ApplicantModal from './ApplicantModal';
import { fetchJobs, createJob, getApplicants } from '@/utils/jobService';

const JobBoard = forwardRef((props, ref) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewApplicantsFor, setViewApplicantsFor] = useState(null);

  useEffect(() => { load(); }, []);

  useImperativeHandle(ref, () => ({
    openPostModal: () => setShowPost(true)
  }));

  const load = async () => {
    setLoading(true);
    const data = await fetchJobs();
    setJobs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleCreate = async (job) => {
    const created = await createJob(job);
    setJobs(prev => [created, ...prev]);
    setShowPost(false);
  };

  const openApply = (job) => setSelectedJob(job);
  const openManage = (job) => setViewApplicantsFor(job);

  const filtered = jobs.filter(j => {
    const matchesQuery = !query || [j.title, j.company, j.description, j.tags?.join(' ')].join(' ').toLowerCase().includes(query.toLowerCase());
    const matchesType = filterType === 'All' || j.type === filterType;
    return matchesQuery && matchesType;
  });

  return (
    <section className="bg-transparent">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search jobs, companies, skills..."
            className="w-full bg-[#151925] border border-[#2A2E3D] rounded-xl py-3 px-4 text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#151925] text-white px-4 py-2 rounded-lg border border-[#2A2E3D] text-sm"
          >
            <option>All</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>

          <button
            onClick={() => setShowPost(true)}
            className="bg-[#C19A4A] text-[#0B0F1B] px-4 py-2 rounded-lg font-bold hover:bg-[#d4af37]"
          >
            Post Job
          </button>
        </div>
      </div>

      <div>
        {loading && <div className="text-gray-400 py-12 text-center">Loading jobs...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-gray-400 py-12 text-center">No jobs found. Try posting one!</div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onApply={() => openApply(job)}
              onManage={() => openManage(job)}
            />
          ))}
        </div>
      </div>

      {showPost && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-[#0B0F1B] rounded-2xl w-full max-w-2xl p-6 border border-[#C19A4A]/30">
            <button onClick={() => setShowPost(false)} className="text-gray-400 mb-4">Close</button>
            <JobForm onCreate={handleCreate} />
          </div>
        </div>
      )}

      {selectedJob && (
        <ApplicantModal job={selectedJob} onClose={() => { setSelectedJob(null); load(); }} />
      )}

      {viewApplicantsFor && (
        <ApplicantModal job={viewApplicantsFor} manageMode onClose={() => { setViewApplicantsFor(null); load(); }} />
      )}
    </section>
  );
});

export default JobBoard;
