'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UserCheck, UserX, FileText, Search, X, Shield, Eye,
  CheckCircle, Clock, XCircle, Menu, LogOut, ChevronDown,
  CreditCard, MessageSquare, Briefcase, BarChart2, Bell,
  Settings, Plus, Edit, Trash2, Pin, Archive, AlertTriangle,
  RefreshCw, DollarSign, TrendingUp, Filter, Download,
  ChevronRight, ArrowLeft, Check, Ban, Flag, Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',      label: 'Overview',          icon: BarChart2,     priority: 1 },
  { id: 'users',         label: 'User Management',   icon: Users,         priority: 1 },
  { id: 'credits',       label: 'Credit Management', icon: CreditCard,    priority: 1 },
  { id: 'support',       label: 'Support Queue',     icon: MessageSquare, priority: 1 },
  { id: 'jobs',          label: 'Job Postings',      icon: Briefcase,     priority: 1 },
  { id: 'proofs',        label: 'Proof Records',     icon: FileText,      priority: 2 },
  { id: 'revenue',       label: 'Revenue',           icon: DollarSign,    priority: 2 },
  { id: 'announcements', label: 'Announcements',     icon: Bell,          priority: 2 },
  { id: 'analytics',     label: 'Analytics',         icon: TrendingUp,    priority: 3 },
  { id: 'config',        label: 'Platform Config',   icon: Settings,      priority: 4 },
];

const BADGE = { 1: null, 2: 'Soon', 3: 'Soon', 4: 'Soon' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateUID = (userId) => {
  if (!userId) return '000000000';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString().padStart(9, '0').slice(0, 9);
};

const statusBadge = (status) => {
  const map = {
    active:    'bg-green-500/20 text-green-400 border-green-500/30',
    inactive:  'bg-gray-500/20 text-gray-400 border-gray-500/30',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    flagged:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    verified:  'bg-green-500/20 text-green-400 border-green-500/30',
    pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    rejected:  'bg-red-500/20 text-red-400 border-red-500/30',
    open:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
    resolved:  'bg-green-500/20 text-green-400 border-green-500/30',
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    unpublished:'bg-gray-500/20 text-gray-400 border-gray-500/30',
    archived:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return `text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`;
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'text-[#C19A4A]' }) => (
  <div className="bg-[#1A2332] border border-gray-700/50 rounded-xl p-4 md:p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-lg bg-[#C19A4A]/10 flex items-center justify-center">
        <Icon size={18} className="text-[#C19A4A]" />
      </div>
    </div>
    <div className={`text-2xl md:text-3xl font-bold ${color} mb-1`}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
    {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
  </div>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const SectionTitle = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Coming Soon placeholder ──────────────────────────────────────────────────
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#C19A4A]/10 border border-[#C19A4A]/20 flex items-center justify-center mb-4">
      <Clock size={28} className="text-[#C19A4A]" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 max-w-xs">This section is being built. Check back soon.</p>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Data state ───────────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState([]);
  const [proofs,       setProofs]       = useState([]);
  const [messages,     setMessages]     = useState([]);
  const [jobs,         setJobs]         = useState([]);
  const [stats,        setStats]        = useState({ totalUsers: 0, talents: 0, hirers: 0, totalProofs: 0, openTickets: 0, activeJobs: 0 });
  const [loading,      setLoading]      = useState(true);

  // ── Modal / detail state ──────────────────────────────────────────────────
  const [selectedUser,      setSelectedUser]      = useState(null);
  const [selectedProofData, setSelectedProofData] = useState(null);
  const [selectedTicket,    setSelectedTicket]    = useState(null);
  const [selectedJob,       setSelectedJob]       = useState(null);
  const [showJobForm,       setShowJobForm]       = useState(false);
  const [editingJob,        setEditingJob]        = useState(null);

  // ── Search / filter state ─────────────────────────────────────────────────
  const [userSearch,    setUserSearch]    = useState('');
  const [userFilter,    setUserFilter]    = useState('All');
  const [userTypeFilter,setUserTypeFilter]= useState('All');
  const [proofFilter,   setProofFilter]   = useState('All');
  const [ticketFilter,  setTicketFilter]  = useState('All');

  // ── Job form state ────────────────────────────────────────────────────────
  const [jobForm, setJobForm] = useState({
    title: '', description: '', requirements: '', domain: '',
    budget_min: '', budget_max: '', deadline: '', status: 'published', pinned: false,
  });

  // ── Credit adjustment state ───────────────────────────────────────────────
  const [creditUser,   setCreditUser]   = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote,   setCreditNote]   = useState('');

  // ── Announcement state ────────────────────────────────────────────────────
  const [announcement, setAnnouncement] = useState({ title: '', message: '', segment: 'all' });

  // ─── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) router.push('/admin/login');
  }, [router]);

  // ─── Data fetch ───────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, proofsRes, messagesRes, jobsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('proofs').select('*'),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').order('posted_at', { ascending: false }),
      ]);

      const profilesData = profilesRes.data || [];
      const proofsData   = proofsRes.data   || [];
      const messagesData = messagesRes.data  || [];
      const jobsData     = jobsRes.data      || [];

      const formattedUsers = profilesData.map(profile => {
        const userProofs = proofsData.filter(p => p.user_id === profile.user_id);
        return {
          id:           generateUID(profile.user_id),
          userId:       profile.user_id,
          email:        profile.email || 'N/A',
          fullName:     profile.display_name || 'N/A',
          userType:     profile.user_type || 'N/A',
          status:       profile.account_status || 'active',
          flagged:      profile.flagged || false,
          credits:      profile.credits || 0,
          onboarding:   profile.onboarding_complete || false,
          dateJoined:   profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A',
          lastActivity: profile.updated_at  ? new Date(profile.updated_at).toLocaleDateString()  : 'N/A',
          proofs: {
            verified: userProofs.filter(p => p.status === 'verified').length,
            pending:  userProofs.filter(p => p.status === 'pending').length,
            rejected: userProofs.filter(p => p.status === 'rejected').length,
          },
          proofHistory: userProofs.map(p => ({
            proofId:   p.id,
            status:    p.status,
            createdAt: p.created_at,
            proofType: p.proof_type || 'N/A',
            txHash:    p.blockchain_tx || null,
          })),
          creditHistory: [],
        };
      });

      setUsers(formattedUsers);
      setProofs(proofsData);
      setMessages(messagesData);
      setJobs(jobsData);

      const talents = formattedUsers.filter(u => u.userType === 'professional').length;
      const hirers  = formattedUsers.filter(u => u.userType === 'hirer').length;

      setStats({
        totalUsers:  formattedUsers.length,
        talents,
        hirers,
        totalProofs: proofsData.length,
        openTickets: messagesData.filter(m => !m.resolved).length,
        activeJobs:  jobsData.filter(j => j.status === 'published').length,
      });
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // ─── Real-time subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel('admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' },   fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' },     fetchAllData)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchAllData]);

  // ─── User actions ─────────────────────────────────────────────────────────
  const handleUserStatus = async (userId, newStatus) => {
    await supabase.from('profiles').update({ account_status: newStatus }).eq('user_id', userId);
    setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: newStatus } : u));
    if (selectedUser?.userId === userId) setSelectedUser(prev => ({ ...prev, status: newStatus }));
  };

  const handleFlagUser = async (userId, flagged) => {
    await supabase.from('profiles').update({ flagged }).eq('user_id', userId);
    setUsers(prev => prev.map(u => u.userId === userId ? { ...u, flagged } : u));
  };

  // ─── Credit adjustment ────────────────────────────────────────────────────
  const handleCreditAdjust = async () => {
    if (!creditUser || !creditAmount) return;
    const amount = parseInt(creditAmount);
    const newCredits = (creditUser.credits || 0) + amount;
    await supabase.from('profiles').update({ credits: newCredits }).eq('user_id', creditUser.userId);
    setUsers(prev => prev.map(u => u.userId === creditUser.userId ? { ...u, credits: newCredits } : u));
    setCreditUser(null); setCreditAmount(''); setCreditNote('');
    alert(`Credits updated. New balance: ${newCredits}`);
  };

  // ─── Ticket actions ───────────────────────────────────────────────────────
  const handleResolveTicket = async (ticketId) => {
    await supabase.from('messages').update({ resolved: true }).eq('id', ticketId);
    setMessages(prev => prev.map(m => m.id === ticketId ? { ...m, resolved: true } : m));
    if (selectedTicket?.id === ticketId) setSelectedTicket(prev => ({ ...prev, resolved: true }));
  };

  // ─── Job actions ──────────────────────────────────────────────────────────
  const handleJobSubmit = async () => {
    if (!jobForm.title) return;
    const payload = { ...jobForm, posted_at: new Date().toISOString() };
    if (editingJob) {
      await supabase.from('jobs').update(payload).eq('id', editingJob.id);
    } else {
      await supabase.from('jobs').insert([payload]);
    }
    setShowJobForm(false); setEditingJob(null);
    setJobForm({ title: '', description: '', requirements: '', domain: '', budget_min: '', budget_max: '', deadline: '', status: 'published', pinned: false });
    fetchAllData();
  };

  const handleJobStatus = async (jobId, status) => {
    await supabase.from('jobs').update({ status }).eq('id', jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const handleJobPin = async (jobId, pinned) => {
    await supabase.from('jobs').update({ pinned }).eq('id', jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, pinned } : j));
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Delete this job post?')) return;
    await supabase.from('jobs').delete().eq('id', jobId);
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  // ─── Proof detail ─────────────────────────────────────────────────────────
  const fetchProofDetails = async (proofId) => {
    const { data } = await supabase.from('proofs').select('*').eq('id', proofId).single();
    if (!data) return;
    const fields = [
      { proofId: data.id, eventType: 'Upload received',    proofType: data.proof_type || 'N/A', timestamp: new Date(data.created_at).toLocaleString(), status: 'successful' },
      { proofId: data.id, eventType: 'Extraction started', proofType: data.proof_type || 'N/A', timestamp: new Date(data.created_at).toLocaleString(), status: data.status === 'verified' ? 'successful' : 'pending' },
      { proofId: data.id, eventType: 'Verification',       proofType: data.proof_type || 'N/A', timestamp: data.updated_at ? new Date(data.updated_at).toLocaleString() : new Date(data.created_at).toLocaleString(), status: data.status === 'verified' ? 'successful' : data.status === 'pending' ? 'pending' : 'failed' },
    ];
    const ok = fields.filter(f => f.status === 'successful').length;
    setSelectedProofData({ title: data.proof_type || 'Proof Details', verificationResult: `${ok}/${fields.length}`, completedCount: `${ok}/${fields.length}`, fields, txHash: data.blockchain_tx });
  };

  // ─── Filtered lists ───────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.includes(userSearch) || u.dateJoined.includes(userSearch);
    const matchStatus = userFilter === 'All' || u.status === userFilter.toLowerCase();
    const matchType   = userTypeFilter === 'All' || u.userType === userTypeFilter.toLowerCase() ||
      (userTypeFilter === 'Talent' && u.userType === 'professional');
    return matchSearch && matchStatus && matchType;
  });

  const filteredProofs   = proofFilter === 'All' ? proofs : proofs.filter(p => p.status === proofFilter.toLowerCase());
  const filteredTickets  = ticketFilter === 'All' ? messages : messages.filter(m => ticketFilter === 'Open' ? !m.resolved : m.resolved);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION RENDERS
  // ══════════════════════════════════════════════════════════════════════════

  const renderOverview = () => (
    <div>
      <SectionTitle title="Platform Overview" subtitle="Real-time snapshot of Ghonsi Proof" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
        <StatCard icon={Users}       label="Total Users"    value={stats.totalUsers}  />
        <StatCard icon={UserCheck}   label="Talents"        value={stats.talents}     />
        <StatCard icon={Briefcase}   label="Hirers"         value={stats.hirers}      />
        <StatCard icon={FileText}    label="Total Proofs"   value={stats.totalProofs} />
        <StatCard icon={MessageSquare} label="Open Tickets" value={stats.openTickets} color="text-yellow-400" />
        <StatCard icon={Briefcase}   label="Active Jobs"    value={stats.activeJobs}  color="text-green-400" />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A2332] rounded-xl border border-gray-700/50 p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Users size={16} className="text-[#C19A4A]" /> Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{u.fullName}</p>
                  <p className="text-xs text-gray-400">{u.email} · {u.userType}</p>
                </div>
                <span className={statusBadge(u.status)}>{u.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A2332] rounded-xl border border-gray-700/50 p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-[#C19A4A]" /> Recent Tickets</h3>
          <div className="space-y-3">
            {messages.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{m.sender_name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{m.message?.slice(0, 50)}...</p>
                </div>
                <span className={statusBadge(m.resolved ? 'resolved' : 'open')}>{m.resolved ? 'Resolved' : 'Open'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <SectionTitle title="User Management" subtitle={`${filteredUsers.length} users found`} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, ID, or date..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="w-full bg-[#1A2332] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All','Active','Inactive','Suspended','Flagged'].map(f => (
            <button key={f} onClick={() => setUserFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${userFilter === f ? 'bg-[#C19A4A] text-black' : 'bg-[#1A2332] text-gray-400 border border-gray-700 hover:border-[#C19A4A]/50'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['All','Talent','Hirer'].map(f => (
            <button key={f} onClick={() => setUserTypeFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${userTypeFilter === f ? 'bg-blue-600 text-white' : 'bg-[#1A2332] text-gray-400 border border-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block bg-[#0B1121] rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-[#1A2332]">
                {['#','User','Type','Status','Proofs','Credits','Onboarding','Joined','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-[#1A2332]/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-white">{user.fullName}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                    <div className="text-xs text-gray-600 font-mono">{user.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-300 capitalize">{user.userType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={statusBadge(user.flagged ? 'flagged' : user.status)}>
                      {user.flagged ? 'Flagged' : user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400">✓{user.proofs.verified}</span>
                      <span className="text-yellow-400">⏱{user.proofs.pending}</span>
                      <span className="text-red-400">✗{user.proofs.rejected}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-white">{user.credits}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs ${user.onboarding ? 'text-green-400' : 'text-yellow-400'}`}>
                      {user.onboarding ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{user.dateJoined}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedUser(user)} className="p-1.5 rounded bg-[#C19A4A]/10 text-[#C19A4A] hover:bg-[#C19A4A]/20" title="View"><Eye size={14} /></button>
                      <button onClick={() => setCreditUser(user)} className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" title="Credits"><CreditCard size={14} /></button>
                      <button onClick={() => handleFlagUser(user.userId, !user.flagged)} className={`p-1.5 rounded ${user.flagged ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/10 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400'}`} title="Flag"><Flag size={14} /></button>
                      <button onClick={() => handleUserStatus(user.userId, user.status === 'active' ? 'suspended' : 'active')} className={`p-1.5 rounded ${user.status === 'suspended' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`} title={user.status === 'suspended' ? 'Activate' : 'Suspend'}><Ban size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user, i) => (
          <div key={i} className="bg-[#1A2332] rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-white text-sm">{user.fullName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-600 font-mono">{user.id}</p>
              </div>
              <span className={statusBadge(user.flagged ? 'flagged' : user.status)}>
                {user.flagged ? 'Flagged' : user.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-gray-400 capitalize">{user.userType}</span>
              <span className="text-gray-400">Credits: <span className="text-white">{user.credits}</span></span>
              <span className={user.onboarding ? 'text-green-400' : 'text-yellow-400'}>{user.onboarding ? '✓ Onboarded' : '⚠ Incomplete'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedUser(user)} className="flex-1 py-1.5 text-xs rounded bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/30">View</button>
              <button onClick={() => setCreditUser(user)} className="flex-1 py-1.5 text-xs rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">Credits</button>
              <button onClick={() => handleFlagUser(user.userId, !user.flagged)} className="flex-1 py-1.5 text-xs rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">{user.flagged ? 'Unflag' : 'Flag'}</button>
              <button onClick={() => handleUserStatus(user.userId, user.status === 'active' ? 'suspended' : 'active')} className={`flex-1 py-1.5 text-xs rounded ${user.status === 'suspended' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>{user.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCredits = () => (
    <div>
      <SectionTitle title="Credit Management" subtitle="View and adjust user credit balances" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CreditCard} label="Total Credits Issued" value={users.reduce((s,u) => s + (u.credits||0), 0)} />
        <StatCard icon={Users} label="Users with Credits" value={users.filter(u => (u.credits||0) > 0).length} />
        <StatCard icon={TrendingUp} label="Avg Credits/User" value={users.length ? Math.round(users.reduce((s,u) => s+(u.credits||0),0)/users.length) : 0} />
        <StatCard icon={AlertTriangle} label="Zero Balance" value={users.filter(u => (u.credits||0) === 0).length} color="text-yellow-400" />
      </div>

      <div className="bg-[#0B1121] rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-[#1A2332]">
                {['User','Type','Balance','Last Activity','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-[#1A2332]/50">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-white">{user.fullName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-300 capitalize">{user.userType}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold ${(user.credits||0) > 0 ? 'text-green-400' : 'text-gray-500'}`}>{user.credits || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{user.lastActivity}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => setCreditUser(user)} className="px-3 py-1.5 text-xs rounded bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/30 hover:bg-[#C19A4A]/20 flex items-center gap-1">
                      <Edit size={12} /> Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div>
      <SectionTitle title="Support Queue" subtitle={`${messages.filter(m=>!m.resolved).length} open tickets`} />
      <div className="flex gap-2 mb-5">
        {['All','Open','Resolved'].map(f => (
          <button key={f} onClick={() => setTicketFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium ${ticketFilter === f ? 'bg-[#C19A4A] text-black' : 'bg-[#1A2332] text-gray-400 border border-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><MessageSquare size={40} className="mx-auto mb-3 opacity-30" /><p>No tickets found</p></div>
        ) : filteredTickets.map((ticket, i) => (
          <div key={i} className="bg-[#1A2332] rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-white">{ticket.sender_name || 'Anonymous'}</span>
                  <span className={statusBadge(ticket.resolved ? 'resolved' : 'open')}>{ticket.resolved ? 'Resolved' : 'Open'}</span>
                  {ticket.type && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{ticket.type}</span>}
                </div>
                <p className="text-sm text-gray-300 mb-2 line-clamp-2">{ticket.message}</p>
                <p className="text-xs text-gray-500">{ticket.sender_email || 'No email'} · {new Date(ticket.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setSelectedTicket(ticket)} className="p-2 rounded bg-[#C19A4A]/10 text-[#C19A4A] hover:bg-[#C19A4A]/20"><Eye size={14} /></button>
                {!ticket.resolved && (
                  <button onClick={() => handleResolveTicket(ticket.id)} className="p-2 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"><CheckCircle size={14} /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJobs = () => (
    <div>
      <SectionTitle title="Job Postings" subtitle={`${jobs.length} total posts`}
        action={
          <button onClick={() => { setShowJobForm(true); setEditingJob(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#C19A4A] text-black rounded-lg text-sm font-semibold hover:bg-[#D4A854]">
            <Plus size={16} /> New Job Post
          </button>
        }
      />

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><Briefcase size={40} className="mx-auto mb-3 opacity-30" /><p>No job posts yet. Create your first one.</p></div>
        ) : jobs.map((job, i) => (
          <div key={i} className={`bg-[#1A2332] rounded-xl border p-4 ${job.pinned ? 'border-[#C19A4A]/50' : 'border-gray-700/50'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {job.pinned && <Pin size={12} className="text-[#C19A4A]" />}
                  <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                  <span className={statusBadge(job.status || 'published')}>{job.status || 'published'}</span>
                  {job.domain && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{job.domain}</span>}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{job.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  {(job.budget_min || job.budget_max) && <span>Budget: ${job.budget_min}–${job.budget_max}</span>}
                  {job.deadline && <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                  <span>Applicants: {(job.applicants || []).length}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => { setEditingJob(job); setJobForm({...job}); setShowJobForm(true); }} className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Edit size={13} /></button>
                <button onClick={() => handleJobPin(job.id, !job.pinned)} className={`p-1.5 rounded ${job.pinned ? 'bg-[#C19A4A]/20 text-[#C19A4A]' : 'bg-gray-500/10 text-gray-400'}`}><Pin size={13} /></button>
                <button onClick={() => handleJobStatus(job.id, job.status === 'published' ? 'unpublished' : 'published')} className="p-1.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">{job.status === 'published' ? <Archive size={13} /> : <Check size={13} />}</button>
                <button onClick={() => handleDeleteJob(job.id)} className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProofs = () => (
    <div>
      <SectionTitle title="Proof Records" subtitle={`${proofs.length} total records`} />
      <div className="flex gap-2 mb-5">
        {['All','Verified','Pending','Rejected'].map(f => (
          <button key={f} onClick={() => setProofFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium ${proofFilter === f ? 'bg-[#C19A4A] text-black' : 'bg-[#1A2332] text-gray-400 border border-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="bg-[#0B1121] rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-[#1A2332]">
                {['Proof Name','Type','Status','User','On-chain','Date','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProofs.map((proof, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-[#1A2332]/50">
                  <td className="py-3 px-4 text-sm text-white">{proof.proof_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-xs text-gray-300 capitalize">{proof.proof_type || 'N/A'}</td>
                  <td className="py-3 px-4"><span className={statusBadge(proof.status)}>{proof.status}</span></td>
                  <td className="py-3 px-4 text-xs text-gray-400 font-mono">{proof.user_id?.slice(0,8)}...</td>
                  <td className="py-3 px-4">
                    {proof.blockchain_tx ? (
                      <a href={`https://solscan.io/tx/${proof.blockchain_tx}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C19A4A] hover:underline font-mono">{proof.blockchain_tx.slice(0,8)}...</a>
                    ) : <span className="text-xs text-gray-600">Not anchored</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{new Date(proof.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => fetchProofDetails(proof.id)} className="p-1.5 rounded bg-[#C19A4A]/10 text-[#C19A4A] hover:bg-[#C19A4A]/20"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div>
      <SectionTitle title="Platform Announcements" subtitle="Send messages to users" />
      <div className="bg-[#1A2332] rounded-xl border border-gray-700/50 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input value={announcement.title} onChange={e => setAnnouncement({...announcement, title: e.target.value})}
              placeholder="Announcement title" className="w-full bg-[#0B1121] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea value={announcement.message} onChange={e => setAnnouncement({...announcement, message: e.target.value})}
              rows={4} placeholder="Write your announcement..." className="w-full bg-[#0B1121] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Segment</label>
            <select value={announcement.segment} onChange={e => setAnnouncement({...announcement, segment: e.target.value})}
              className="w-full bg-[#0B1121] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]">
              <option value="all">All Users</option>
              <option value="talents">Talents Only</option>
              <option value="hirers">Hirers Only</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>
          <button onClick={() => alert('Announcement feature coming soon — connect to your email provider.')}
            className="w-full bg-[#C19A4A] text-black font-bold py-3 rounded-lg hover:bg-[#D4A854] flex items-center justify-center gap-2">
            <Bell size={16} /> Send Announcement
          </button>
        </div>
      </div>
    </div>
  );

  const sectionMap = {
    overview:      renderOverview,
    users:         renderUsers,
    credits:       renderCredits,
    support:       renderSupport,
    jobs:          renderJobs,
    proofs:        renderProofs,
    revenue:       () => <ComingSoon title="Revenue & Subscriptions" />,
    announcements: renderAnnouncements,
    analytics:     () => <ComingSoon title="Analytics & Platform Health" />,
    config:        () => <ComingSoon title="Platform Configuration" />,
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-[#C19A4A] border-gray-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1121] text-white flex">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0D1526] border-r border-gray-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src="/assets/ghonsi-proof-logos/transparent-png-logo/4.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <p className="text-sm font-bold text-white">Admin Panel</p>
              <p className="text-xs text-gray-500">Ghonsi Proof</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const badge = BADGE[item.priority];
            return (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeSection === item.id ? 'bg-[#C19A4A]/15 text-[#C19A4A] border border-[#C19A4A]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={16} />
                <span className="flex-1 text-left">{item.label}</span>
                {badge && <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0D1526] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-white capitalize">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAllData} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <div className="w-7 h-7 rounded-full bg-[#C19A4A]/20 border border-[#C19A4A]/30 flex items-center justify-center">
              <Shield size={14} className="text-[#C19A4A]" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {sectionMap[activeSection]?.()}
        </main>
      </div>

      {/* ── User Detail Modal ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-[#0D1526] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.fullName}</h2>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={statusBadge(selectedUser.status)}>{selectedUser.status}</span>
                    <span className="text-xs text-gray-400 capitalize">{selectedUser.userType}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white"><X size={22} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#1A2332] rounded-xl p-4 mb-4">
                {[
                  ['User ID', selectedUser.id],
                  ['Joined', selectedUser.dateJoined],
                  ['Last Active', selectedUser.lastActivity],
                  ['Credits', selectedUser.credits],
                  ['Onboarding', selectedUser.onboarding ? 'Complete' : 'Incomplete'],
                  ['Flagged', selectedUser.flagged ? 'Yes' : 'No'],
                ].map(([k,v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-500 mb-0.5">{k}</p>
                    <p className="text-sm text-white">{v}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#1A2332] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3"><Shield size={16} className="text-[#C19A4A]" /><h3 className="font-semibold text-sm">Proof History</h3></div>
                {selectedUser.proofHistory?.length > 0 ? selectedUser.proofHistory.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                    <div>
                      <p className="text-xs font-mono text-gray-300">{p.proofId.slice(0,12)}...</p>
                      <p className="text-xs text-gray-500">{p.proofType} · {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(p.status)}>{p.status}</span>
                      <button onClick={() => fetchProofDetails(p.proofId)} className="p-1.5 rounded bg-[#C19A4A]/10 text-[#C19A4A]"><Eye size={12} /></button>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-500">No proof history</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setCreditUser(selectedUser); setSelectedUser(null); }} className="flex-1 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/20">Adjust Credits</button>
                <button onClick={() => { handleFlagUser(selectedUser.userId, !selectedUser.flagged); setSelectedUser(null); }} className="flex-1 py-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-sm font-medium hover:bg-yellow-500/20">{selectedUser.flagged ? 'Unflag' : 'Flag Account'}</button>
                <button onClick={() => { handleUserStatus(selectedUser.userId, selectedUser.status === 'active' ? 'suspended' : 'active'); setSelectedUser(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${selectedUser.status === 'suspended' ? 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'}`}>{selectedUser.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Credit Adjustment Modal ── */}
      {creditUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCreditUser(null)}>
          <div className="bg-[#0D1526] rounded-2xl w-full max-w-md border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">Adjust Credits</h2>
              <button onClick={() => setCreditUser(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-300 mb-1">{creditUser.fullName}</p>
            <p className="text-xs text-gray-500 mb-4">Current balance: <span className="text-white font-bold">{creditUser.credits}</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Amount (use negative to remove)</label>
                <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
                  placeholder="e.g. 50 or -20" className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Note (optional)</label>
                <input type="text" value={creditNote} onChange={e => setCreditNote(e.target.value)}
                  placeholder="Reason for adjustment" className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]" />
              </div>
              <button onClick={handleCreditAdjust} className="w-full bg-[#C19A4A] text-black font-bold py-2.5 rounded-lg hover:bg-[#D4A854]">Apply Adjustment</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ticket Detail Modal ── */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-[#0D1526] rounded-2xl w-full max-w-lg border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Support Ticket</h2>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="bg-[#1A2332] rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">{selectedTicket.sender_name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">{selectedTicket.sender_email}</p>
                </div>
                <span className={statusBadge(selectedTicket.resolved ? 'resolved' : 'open')}>{selectedTicket.resolved ? 'Resolved' : 'Open'}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{selectedTicket.message}</p>
            </div>
            {!selectedTicket.resolved && (
              <button onClick={() => { handleResolveTicket(selectedTicket.id); setSelectedTicket(null); }}
                className="w-full bg-green-500 text-white font-bold py-2.5 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Mark as Resolved
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Job Form Modal ── */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowJobForm(false)}>
          <div className="bg-[#0D1526] rounded-2xl w-full max-w-2xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">{editingJob ? 'Edit Job Post' : 'Create Job Post'}</h2>
              <button onClick={() => setShowJobForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Job Title *', key: 'title', placeholder: 'e.g. Senior Frontend Developer' },
                { label: 'Domain', key: 'domain', placeholder: 'e.g. Web3, Marketing, Design' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                  <input value={jobForm[key]} onChange={e => setJobForm({...jobForm, [key]: e.target.value})}
                    placeholder={placeholder} className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                <textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})}
                  rows={3} placeholder="Job description..." className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A] resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Requirements</label>
                <textarea value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})}
                  rows={3} placeholder="Requirements..." className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A] resize-none" />
              </div>
              {[
                { label: 'Min Budget ($)', key: 'budget_min', placeholder: '500' },
                { label: 'Max Budget ($)', key: 'budget_max', placeholder: '2000' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                  <input type="number" value={jobForm[key]} onChange={e => setJobForm({...jobForm, [key]: e.target.value})}
                    placeholder={placeholder} className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Deadline</label>
                <input type="date" value={jobForm.deadline} onChange={e => setJobForm({...jobForm, deadline: e.target.value})}
                  className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                <select value={jobForm.status} onChange={e => setJobForm({...jobForm, status: e.target.value})}
                  className="w-full bg-[#1A2332] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C19A4A]">
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input type="checkbox" id="pinned" checked={jobForm.pinned} onChange={e => setJobForm({...jobForm, pinned: e.target.checked})} className="w-4 h-4 accent-[#C19A4A]" />
                <label htmlFor="pinned" className="text-sm text-gray-300">Pin this post above organic listings</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowJobForm(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:bg-white/5">Cancel</button>
              <button onClick={handleJobSubmit} className="flex-1 py-2.5 rounded-lg bg-[#C19A4A] text-black text-sm font-bold hover:bg-[#D4A854]">{editingJob ? 'Update Post' : 'Create Post'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Proof Detail Modal ── */}
      {selectedProofData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProofData(null)}>
          <div className="bg-[#0D1526] rounded-2xl w-full max-w-2xl border border-gray-700 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">System Match Details</h2>
                <p className="text-sm text-gray-400">{selectedProofData.title}</p>
              </div>
              <button onClick={() => setSelectedProofData(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="bg-[#1A2332] rounded-xl p-4 mb-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-white">Verification Analysis</p>
                <p className="text-xs text-gray-400">Event Timeline {selectedProofData.completedCount}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{selectedProofData.verificationResult}</p>
                <p className="text-xs text-green-400">Fields Verified</p>
              </div>
            </div>
            {selectedProofData.txHash && (
              <div className="bg-[#1A2332] rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">On-chain Transaction</p>
                <a href={`https://solscan.io/tx/${selectedProofData.txHash}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#C19A4A] hover:underline font-mono break-all">{selectedProofData.txHash}</a>
              </div>
            )}
            <div className="bg-[#1A2332] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {['Event','Type','Timestamp','Status'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProofData.fields.map((f, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-2.5 px-3 text-xs text-gray-300">{f.eventType}</td>
                        <td className="py-2.5 px-3 text-xs text-gray-400">{f.proofType}</td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">{f.timestamp}</td>
                        <td className="py-2.5 px-3">
                          {f.status === 'successful' && <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle size={12} />OK</span>}
                          {f.status === 'pending'    && <span className="text-yellow-400 text-xs flex items-center gap-1"><Clock size={12} />Pending</span>}
                          {f.status === 'failed'     && <span className="text-red-400 text-xs flex items-center gap-1"><XCircle size={12} />Failed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
