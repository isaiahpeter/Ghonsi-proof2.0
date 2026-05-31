'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Filter, Briefcase, Users, Clock, CheckCircle, XCircle, Eye, Edit, Trash2, MoreVertical, Building2 } from 'lucide-react';
import { getCurrentUser } from '@/utils/supabaseAuth';
import { getHirerProfile, getHirerJobs, getHirerApplicants } from '@/utils/hirerProfileApi';
import { supabase } from '@/lib/supabaseClient';

const DashboardHirers = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hirerProfile, setHirerProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Active Jobs', value: '0', icon: Briefcase, color: '#C19A4A' },
    { label: 'Total Applicants', value: '0', icon: Users, color: '#C19A4A' },
    { label: 'Pending Reviews', value: '0', icon: Clock, color: '#C19A4A' },
    { label: 'Hired', value: '0', icon: CheckCircle, color: '#C19A4A' }
  ]);

  // Load hirer data on mount
  useEffect(() => {
    const loadHirerData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Check user type - redirect professionals to their dashboard
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileData?.user_type === 'professional') {
          router.push('/dashboard');
          return;
        }

        // Load hirer profile
        const profile = await getHirerProfile(user.id);
        setHirerProfile(profile);

        // Load jobs
        const jobsData = await getHirerJobs(user.id);
        setJobs(jobsData);

        // Load applicants
        const applicantsData = await getHirerApplicants(user.id);
        setApplicants(applicantsData);

        // Calculate stats
        const activeJobs = jobsData.filter(job => job.status === 'active').length;
        const totalApplicants = applicantsData.length;
        const pendingReviews = applicantsData.filter(app => app.status === 'pending' || app.status === 'under_review').length;
        const hired = applicantsData.filter(app => app.status === 'hired').length;

        setStats([
          { label: 'Active Jobs', value: activeJobs.toString(), icon: Briefcase, color: '#C19A4A' },
          { label: 'Total Applicants', value: totalApplicants.toString(), icon: Users, color: '#C19A4A' },
          { label: 'Pending Reviews', value: pendingReviews.toString(), icon: Clock, color: '#C19A4A' },
          { label: 'Hired', value: hired.toString(), icon: CheckCircle, color: '#C19A4A' }
        ]);
      } catch (error) {
        console.error('Error loading hirer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHirerData();
  }, [router]);

  // Helper function to get company initials
  const getCompanyInitials = (name) => {
    if (!name) return 'CO';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return 'bg-[#C19A4A]/10 text-[#C19A4A] border-[#C19A4A]/30';
      case 'closed':
      case 'inactive':
        return 'bg-white/5 text-white/40 border-white/20';
      case 'under review':
      case 'under_review':
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'shortlisted':
        return 'bg-[#C19A4A]/10 text-[#C19A4A] border-[#C19A4A]/30';
      case 'interview scheduled':
      case 'interview_scheduled':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'hired':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-white/5 text-white/60 border-white/20';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get applicant count for a job
  const getApplicantCount = (jobId) => {
    return applicants.filter(app => app.job_id === jobId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#C19A4A] rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1B] [background-image:radial-gradient(ellipse_80%_40%_at_50%_0%,#C19A4A1A_0%,transparent_100%),radial-gradient(ellipse_60%_30%_at_90%_100%,#C19A4A12_0%,transparent_100%)] text-white font-sans">
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 mt-[75px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              {hirerProfile && (
                <div className="flex items-center gap-4">
                  {hirerProfile.company_logo_url ? (
                    <img 
                      src={hirerProfile.company_logo_url} 
                      alt={hirerProfile.company_name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center text-white font-bold text-xl border-2 border-white/10">
                      {getCompanyInitials(hirerProfile.company_name)}
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">
                      {hirerProfile.company_name || 'Hirer Dashboard'}
                    </h1>
                    <p className="text-white/60 text-sm font-light">
                      {hirerProfile.location || 'Manage your job postings and review talent applications'}
                    </p>
                  </div>
                </div>
              )}
              {!hirerProfile && (
                <div>
                  <h1 className="text-3xl font-semibold mb-2 text-white tracking-tight">Hirer Dashboard</h1>
                  <p className="text-white/60 text-sm font-light">Manage your job postings and review talent applications</p>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {hirerProfile && (
                <button 
                  onClick={() => router.push('/createProfileHirers')}
                  className="bg-white/5 border border-white/20 hover:border-[#C19A4A]/50 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )}
              <button 
                onClick={() => router.push('/jobs')}
                className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-[#C19A4A]/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Post New Job
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-[#C19A4A]/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-xs text-white/60 uppercase tracking-wider font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'text-[#C19A4A] border-b-2 border-[#C19A4A]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 text-sm font-medium transition-all ${
              activeTab === 'jobs'
                ? 'text-[#C19A4A] border-b-2 border-[#C19A4A]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            My Jobs
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`pb-3 text-sm font-medium transition-all ${
              activeTab === 'applicants'
                ? 'text-[#C19A4A] border-b-2 border-[#C19A4A]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Applicants
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'text-[#C19A4A] border-b-2 border-[#C19A4A]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-in-out]">
            {/* Active Jobs Section */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Active Job Postings</h2>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="text-[#C19A4A] text-sm hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {jobs.filter(job => job.status === 'active').length === 0 ? (
                  <div className="bg-[#0B0F1B] border border-white/10 rounded-lg p-8 text-center">
                    <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 text-sm mb-4">No active jobs yet</p>
                    <button 
                      onClick={() => router.push('/jobs')}
                      className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-6 py-2.5 rounded-lg transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  jobs.filter(job => job.status === 'active').slice(0, 3).map(job => (
                    <div 
                      key={job.id}
                      className="bg-[#0B0F1B] border border-white/10 rounded-lg p-5 hover:border-[#C19A4A]/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-white mb-2">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {job.employment_type || 'Full-time'}
                            </span>
                            <span>•</span>
                            <span>{job.location || 'Remote'}</span>
                            <span>•</span>
                            <span>{formatDate(job.created_at)}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {formatStatus(job.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-sm text-white/60">
                          <span className="text-[#C19A4A] font-semibold">{getApplicantCount(job.id)}</span> applicants
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="text-white/60 hover:text-[#C19A4A] transition-colors p-2">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-white/60 hover:text-[#C19A4A] transition-colors p-2">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Applicants Section */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Recent Applicants</h2>
                <button 
                  onClick={() => setActiveTab('applicants')}
                  className="text-[#C19A4A] text-sm hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {applicants.length === 0 ? (
                  <div className="bg-[#0B0F1B] border border-white/10 rounded-lg p-8 text-center">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 text-sm">No applicants yet</p>
                  </div>
                ) : (
                  applicants.slice(0, 3).map(applicant => (
                    <div 
                      key={applicant.id}
                      className="bg-[#0B0F1B] border border-white/10 rounded-lg p-5 hover:border-[#C19A4A]/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {applicant.profiles?.avatar_url ? (
                            <img src={applicant.profiles.avatar_url} alt={applicant.profiles.display_name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-base font-medium text-white mb-1">
                                {applicant.profiles?.display_name || 'Anonymous'}
                              </h3>
                              <p className="text-sm text-white/60">
                                {applicant.profiles?.profession || 'Professional'} • {applicant.profiles?.social_links?.experience || 'N/A'}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(applicant.status)}`}>
                              {formatStatus(applicant.status)}
                            </span>
                          </div>
                          {applicant.profiles?.social_links?.expertise && applicant.profiles.social_links.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {applicant.profiles.social_links.expertise.slice(0, 3).map((skill, idx) => (
                                <span 
                                  key={idx}
                                  className="px-3 py-1 bg-white/5 border border-white/20 rounded-full text-xs text-white/80"
                                >
                                  {skill}
                                </span>
                              ))}
                              {applicant.profiles.social_links.expertise.length > 3 && (
                                <span className="px-3 py-1 bg-white/5 border border-white/20 rounded-full text-xs text-white/80">
                                  +{applicant.profiles.social_links.expertise.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-white/50">
                            Applied for: {applicant.job_postings?.title || 'Unknown Position'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="animate-[fadeIn_0.4s_ease-in-out]">
            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-11 pr-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all"
                />
              </div>
              <button className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white hover:border-[#C19A4A]/50 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                  <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No jobs posted yet</h3>
                  <p className="text-white/60 text-sm mb-6">Start by posting your first job to find talented professionals</p>
                  <button 
                    onClick={() => router.push('/jobs')}
                    className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-bold px-6 py-3 rounded-lg shadow-lg shadow-[#C19A4A]/20 transition-all transform hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Post Your First Job
                  </button>
                </div>
              ) : (
                jobs.map(job => (
                  <div 
                    key={job.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#C19A4A]/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-white">{job.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                            {formatStatus(job.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.employment_type || 'Full-time'}
                          </span>
                          <span>•</span>
                          <span>{job.location || 'Remote'}</span>
                          <span>•</span>
                          <span>Posted {formatDate(job.created_at)}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setShowDropdown(showDropdown === job.id ? null : job.id)}
                          className="text-white/60 hover:text-white transition-colors p-2"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {showDropdown === job.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-[#0B0F1B] border border-white/20 rounded-lg shadow-xl overflow-hidden z-10">
                            <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Edit Job
                            </button>
                            <button className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Delete Job
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-sm text-white/60">
                        <span className="text-[#C19A4A] font-semibold text-base">{getApplicantCount(job.id)}</span> applicants
                      </span>
                      <button className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-5 py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95">
                        View Applicants
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Applicants Tab */}
        {activeTab === 'applicants' && (
          <div className="animate-[fadeIn_0.4s_ease-in-out]">
            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-11 pr-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all"
                />
              </div>
              <button className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white hover:border-[#C19A4A]/50 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {/* Applicants List */}
            <div className="space-y-4">
              {applicants.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                  <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No applicants yet</h3>
                  <p className="text-white/60 text-sm">Applicants will appear here once they apply to your jobs</p>
                </div>
              ) : (
                applicants.map(applicant => (
                  <div 
                    key={applicant.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#C19A4A]/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {applicant.profiles?.avatar_url ? (
                          <img src={applicant.profiles.avatar_url} alt={applicant.profiles.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-8 h-8 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-medium text-white mb-1">
                              {applicant.profiles?.display_name || 'Anonymous'}
                            </h3>
                            <p className="text-sm text-white/60">
                              {applicant.profiles?.profession || 'Professional'} • {applicant.profiles?.social_links?.experience || 'N/A'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(applicant.status)}`}>
                            {formatStatus(applicant.status)}
                          </span>
                        </div>
                        {applicant.profiles?.social_links?.expertise && applicant.profiles.social_links.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {applicant.profiles.social_links.expertise.slice(0, 5).map((skill, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1.5 bg-white/5 border border-white/20 rounded-full text-xs text-white/80"
                              >
                                {skill}
                              </span>
                            ))}
                            {applicant.profiles.social_links.expertise.length > 5 && (
                              <span className="px-3 py-1.5 bg-white/5 border border-white/20 rounded-full text-xs text-white/80">
                                +{applicant.profiles.social_links.expertise.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <p className="text-xs text-white/50">
                            Applied for: <span className="text-white/70">{applicant.job_postings?.title || 'Unknown Position'}</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <button className="bg-white/5 border border-white/20 hover:border-[#C19A4A]/50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
                              View Profile
                            </button>
                            <button className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95">
                              Review Application
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-[fadeIn_0.4s_ease-in-out]">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h2 className="text-lg font-medium text-white mb-6">Company Settings</h2>
              
              {/* Company Profile Section */}
              {hirerProfile && (
                <div className="mb-8 pb-8 border-b border-white/10">
                  <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-4">Company Profile</label>
                  <div className="flex items-start gap-6 mb-6">
                    {hirerProfile.company_logo_url ? (
                      <img 
                        src={hirerProfile.company_logo_url} 
                        alt={hirerProfile.company_name} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] flex items-center justify-center text-white font-bold text-2xl border-2 border-white/10">
                        {getCompanyInitials(hirerProfile.company_name)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{hirerProfile.company_name}</h3>
                      <p className="text-sm text-white/60 mb-2">{hirerProfile.company_size}</p>
                      <p className="text-sm text-white/60 mb-3">
                        {hirerProfile.location} • {hirerProfile.timezone}
                      </p>
                      {hirerProfile.description && (
                        <p className="text-sm text-white/70 leading-relaxed mb-4">{hirerProfile.description}</p>
                      )}
                      <button 
                        onClick={() => router.push('/create-profile-hirers')}
                        className="bg-white/5 border border-white/20 hover:border-[#C19A4A]/50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Company Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {!hirerProfile && (
                <div className="mb-8 pb-8 border-b border-white/10">
                  <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-4">Company Profile</label>
                  <div className="bg-[#0B0F1B] border border-white/10 rounded-lg p-6 text-center">
                    <Building2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 text-sm mb-4">Complete your company profile to attract top talent</p>
                    <button 
                      onClick={() => router.push('/create-profile-hirers')}
                      className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-6 py-2.5 rounded-lg transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Company Profile
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-3">Notification Preferences</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C19A4A] focus:ring-[#C19A4A]" defaultChecked />
                    <span className="text-sm text-white">Email me when someone applies to my jobs</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C19A4A] focus:ring-[#C19A4A]" defaultChecked />
                    <span className="text-sm text-white">Weekly summary of applications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C19A4A] focus:ring-[#C19A4A]" />
                    <span className="text-sm text-white">Marketing and product updates</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardHirers;
