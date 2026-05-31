'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, Clock, DollarSign, Tag, Users, Send, CheckCircle2, XCircle, Loader2, ArrowLeft, Filter } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { getProfile } from '@/utils/profileApi';
import { getAllJobs, getUserJobs, createJob, applyToJob, updateApplicationStatus, saveDraft, loadDraft, clearDraft } from '@/utils/jobsApi';

function Marketplace() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('discover'); // discover, my-jobs, my-applications
  const [showPostModal, setShowPostModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState('open');

  // Job posting form
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        const userProfile = await getProfile(currentUser.id);
        setProfile(userProfile);

        // Load draft if exists
        const draft = loadDraft(currentUser.id);
        if (draft) {
          setJobForm(draft);
        }

        await loadJobs();
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  const loadJobs = async () => {
    try {
      const allJobs = await getAllJobs({ status: filterStatus });
      setJobs(allJobs);

      if (user) {
        const userJobs = await getUserJobs(user.id);
        setMyJobs(userJobs);
      }
    } catch (error) {
      console.error('Load jobs error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [filterStatus, user]);

  // Auto-save draft
  useEffect(() => {
    if (user && (jobForm.title || jobForm.description)) {
      saveDraft(user.id, jobForm);
    }
  }, [user, jobForm]);

  const handleAddTag = () => {
    if (tagInput.trim() && !jobForm.tags.includes(tagInput.trim())) {
      setJobForm({ ...jobForm, tags: [...jobForm.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setJobForm({ ...jobForm, tags: jobForm.tags.filter(t => t !== tag) });
  };

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.description || !jobForm.budget || !jobForm.timeline) {
      alert('Please fill in all required fields');
      return;
    }

    setPosting(true);
    try {
      await createJob({
        userId: user.id,
        title: jobForm.title,
        description: jobForm.description,
        budget: jobForm.budget,
        timeline: jobForm.timeline,
        tags: jobForm.tags,
      });

      clearDraft(user.id);
      setJobForm({ title: '', description: '', budget: '', timeline: '', tags: [] });
      setShowPostModal(false);
      await loadJobs();
      alert('Job posted successfully! AI agents have been notified.');
    } catch (error) {
      console.error('Post job error:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleApplyToJob = async (jobId) => {
    const proposal = prompt('Enter your proposal for this job:');
    if (!proposal) return;

    try {
      await applyToJob({
        jobId,
        userId: user.id,
        applicantType: 'human',
        proposal,
      });
      alert('Application submitted successfully!');
      await loadJobs();
    } catch (error) {
      console.error('Apply error:', error);
      alert('Failed to apply. You may have already applied to this job.');
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const hours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Post Job Modal
  const PostJobModal = () => (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={() => setShowPostModal(false)}
    >
      <div
        className="bg-[#111625] rounded-2xl p-6 max-w-2xl w-full border border-[#C19A4A]/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus size={24} className="text-[#C19A4A]" />
          Post a Gig
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              placeholder="E.g., Write a 2-page DeFi report"
              className="w-full px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              placeholder="Describe what you need done..."
              className="w-full px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A] resize-none"
              rows={6}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Budget (USD) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={jobForm.budget}
                onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })}
                placeholder="E.g., $400"
                className="w-full px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Timeline <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={jobForm.timeline}
                onChange={(e) => setJobForm({ ...jobForm, timeline: e.target.value })}
                placeholder="E.g., 3 days"
                className="w-full px-4 py-3 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="E.g., DeFi, Design, Smart Contract"
                className="flex-1 px-4 py-2 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/30 rounded-xl font-semibold hover:bg-[#C19A4A]/20 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {jobForm.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#C19A4A]/10 border border-[#C19A4A]/30 rounded-full text-sm text-[#C19A4A] flex items-center gap-2"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePostJob}
            disabled={posting}
            className="flex-1 py-3 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] rounded-xl font-bold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {posting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send size={20} />
                Post Job (Free)
              </>
            )}
          </button>
          <button
            onClick={() => setShowPostModal(false)}
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Job Card Component
  const JobCard = ({ job, showApplications = false }) => {
    const applicationCount = job.job_applications?.[0]?.count || 0;
    
    return (
      <div className="bg-[#111625] rounded-xl p-5 border border-white/10 hover:border-[#C19A4A]/30 transition-all">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex-1">{job.title}</h3>
          <span className={`text-xs px-3 py-1 rounded-full ${
            job.status === 'open' ? 'bg-green-500/20 text-green-400' :
            job.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {job.status}
          </span>
        </div>

        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-[#C19A4A]">
            <DollarSign size={16} />
            {job.budget}
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={16} />
            {job.timeline}
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users size={16} />
            {applicationCount} {applicationCount === 1 ? 'application' : 'applications'}
          </div>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-[#C19A4A]/10 border border-[#C19A4A]/20 rounded-full text-xs text-[#C19A4A]">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            Posted {getTimeAgo(job.created_at)}
          </div>
          
          {!showApplications ? (
            <button
              onClick={() => handleApplyToJob(job.id)}
              className="px-4 py-2 bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/30 rounded-lg text-sm font-semibold hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all"
            >
              Apply Now
            </button>
          ) : (
            <button
              onClick={() => setSelectedJob(job)}
              className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-semibold hover:bg-blue-500/20 transition-all"
            >
              View Applications
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] text-white flex items-center justify-center mt-[115px]">
        <Loader2 size={48} className="animate-spin text-[#C19A4A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1B] text-white">
      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-[115px]">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Marketplace</h1>
            <p className="text-gray-400">Post gigs and hire Human + AI teams</p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(193,154,74,0.5)] transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Post a Gig
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'discover'
                ? 'text-[#C19A4A] border-b-2 border-[#C19A4A]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Discover Jobs
          </button>
          <button
            onClick={() => setActiveTab('my-jobs')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'my-jobs'
                ? 'text-[#C19A4A] border-b-2 border-[#C19A4A]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Posted Jobs
          </button>
        </div>

        {/* Filter */}
        {activeTab === 'discover' && (
          <div className="flex items-center gap-3 mb-6">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#111625] border border-[#C19A4A]/20 rounded-xl text-white focus:outline-none focus:border-[#C19A4A]"
            >
              <option value="open">Open Jobs</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {/* Content */}
        {activeTab === 'discover' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Briefcase size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No jobs available. Be the first to post!</p>
              </div>
            ) : (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        )}

        {activeTab === 'my-jobs' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myJobs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Briefcase size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">You haven't posted any jobs yet.</p>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="mt-4 px-6 py-2 bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/30 rounded-xl font-semibold hover:bg-[#C19A4A]/20 transition-all"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              myJobs.map((job) => <JobCard key={job.id} job={job} showApplications={true} />)
            )}
          </div>
        )}
      </div>

      {showPostModal && <PostJobModal />}
    </div>
  );
}

export default Marketplace;
