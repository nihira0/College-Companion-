import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Layers,
  Bell,
  RefreshCw,
  Plus,
  Key,
  DollarSign,
  Award,
  FileCheck,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminDashboard = () => {
  const { token, user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('overview');

  // Overview stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);

  // Admissions state
  const [admissions, setAdmissions] = useState([]);
  const [admissionFilter, setAdmissionFilter] = useState('all');
  const [newApplicantName, setNewApplicantName] = useState('');
  const [newApplicantEmail, setNewApplicantEmail] = useState('');
  const [newApplicantPhone, setNewApplicantPhone] = useState('');
  const [newApplicantScore, setNewApplicantScore] = useState('95.0');
  const [convertingId, setConvertingId] = useState(null);

  // Finance state
  const [feeStructures, setFeeStructures] = useState([]);
  const [payUserId, setPayUserId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Online / UPI');
  const [payRemarks, setPayRemarks] = useState('');
  const [recordingPay, setRecordingPay] = useState(false);

  // Academic Config state
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [newDivName, setNewDivName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignSubId, setAssignSubId] = useState('');
  const [assignDivId, setAssignDivId] = useState('');

  // Audit Logs & Broadcast state
  const [auditLogs, setAuditLogs] = useState([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');

  const fetchOverviewStats = async () => {
    setLoadingStats(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/admin/overview-stats', { headers });
      if (res.ok) setStats(await res.json());
    } catch (err) {
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/admin/users', { headers });
      if (res.ok) setUsers(await res.json());
    } catch (err) {}
  };

  const fetchAdmissions = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/admin/admissions', { headers });
      if (res.ok) setAdmissions(await res.json());
    } catch (err) {}
  };

  const fetchFeeStructures = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/admin/fee-structures', { headers });
      if (res.ok) setFeeStructures(await res.json());
    } catch (err) {}
  };

  const fetchAcademicStructure = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [deptRes, divRes, subRes, faRes] = await Promise.all([
        fetch('/api/admin/departments', { headers }),
        fetch('/api/admin/divisions', { headers }),
        fetch('/api/admin/subjects', { headers }),
        fetch('/api/admin/faculty-assignments', { headers })
      ]);

      if (deptRes.ok) setDepartments(await deptRes.json());
      if (divRes.ok) setDivisions(await divRes.json());
      if (subRes.ok) setSubjects(await subRes.json());
      if (faRes.ok) setFacultyAssignments(await faRes.json());
    } catch (err) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/admin/audit-logs', { headers });
      if (res.ok) setAuditLogs(await res.json());
    } catch (err) {}
  };

  useEffect(() => {
    fetchOverviewStats();
    fetchUsers();
    fetchAdmissions();
    fetchFeeStructures();
    fetchAcademicStructure();
    fetchAuditLogs();
  }, [token]);

  // Handlers
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        addToast(`User role updated to ${newRole} ⚙️`, 'success', '🛡️');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        fetchAuditLogs();
      }
    } catch (err) {
      addToast('Failed to update role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setTempPassword(data.temporaryPassword);
        addToast('Password reset successfully!', 'success', '🔑');
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleCreateApplicant = async (e) => {
    e.preventDefault();
    if (!newApplicantName.trim() || !newApplicantEmail.trim()) {
      return addToast('Please enter applicant name and email', 'warning');
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/admin/admissions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          studentName: newApplicantName,
          email: newApplicantEmail,
          phone: newApplicantPhone,
          score: newApplicantScore
        })
      });
      if (res.ok) {
        const item = await res.json();
        setAdmissions(prev => [item, ...prev]);
        addToast(`Admission application ${item.applicationNo} created!`, 'success', '📑');
        setNewApplicantName('');
        setNewApplicantEmail('');
        setNewApplicantPhone('');
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleUpdateAdmissionStatus = async (admId, newStatus) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch(`/api/admin/admissions/${admId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAdmissions(prev => prev.map(a => (a.id === admId || a._id === admId) ? { ...a, status: newStatus } : a));
        addToast(`Application status updated to ${newStatus}`, 'success', '📌');
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleConvertApplicant = async (admId) => {
    setConvertingId(admId);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`/api/admin/admissions/${admId}/convert-to-student`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        addToast(data.message, 'success', '🎓');
        fetchAdmissions();
        fetchUsers();
        fetchAuditLogs();
      }
    } catch (err) {} finally {
      setConvertingId(null);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payUserId || !payAmount) {
      return addToast('Please select student and enter payment amount', 'warning');
    }

    setRecordingPay(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/admin/record-payment', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: payUserId,
          amount: Number(payAmount),
          paymentMode: payMode,
          remarks: payRemarks
        })
      });
      if (res.ok) {
        const data = await res.json();
        addToast(data.message, 'success', '💳');
        setPayAmount('');
        setPayRemarks('');
        fetchAuditLogs();
      }
    } catch (err) {} finally {
      setRecordingPay(false);
    }
  };

  const handleCreateDivision = async (e) => {
    e.preventDefault();
    if (!newDivName.trim()) return;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/admin/divisions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newDivName, departmentId: 'dept_it_1' })
      });
      if (res.ok) {
        const item = await res.json();
        setDivisions(prev => [...prev, item]);
        addToast(`Division ${newDivName} created!`, 'success', '🏛️');
        setNewDivName('');
      }
    } catch (err) {}
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newSubName, code: newSubCode, departmentId: 'dept_it_1' })
      });
      if (res.ok) {
        const item = await res.json();
        setSubjects(prev => [...prev, item]);
        addToast(`Subject ${newSubName} (${newSubCode}) added!`, 'success', '📚');
        setNewSubName('');
        setNewSubCode('');
      }
    } catch (err) {}
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignFacultyId || !assignSubId || !assignDivId) {
      return addToast('Please select Faculty, Subject, and Division', 'warning');
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/admin/faculty-assignments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          facultyId: assignFacultyId,
          subjectId: assignSubId,
          divisionId: assignDivId
        })
      });
      if (res.ok) {
        const item = await res.json();
        setFacultyAssignments(prev => [...prev, item]);
        addToast('Faculty assignment saved!', 'success', '👨‍🏫');
      }
    } catch (err) {}
  };

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/admin/broadcast-announcement', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: broadcastTitle,
          content: broadcastContent,
          targetRole: broadcastTarget
        })
      });
      if (res.ok) {
        const data = await res.json();
        addToast(data.message, 'success', '📢');
        setBroadcastTitle('');
        setBroadcastContent('');
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Admissions
  const filteredAdmissions = admissions.filter(a => {
    if (admissionFilter === 'all') return true;
    return a.status === admissionFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Top Banner */}
      <div className="glass-card rounded-3xl p-6 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30 shrink-0">
            ⚙️
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Administrator Governance Console
            </h1>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium font-poppins mt-0.5">
              System Operations • Users, Admissions, Financials, Scheme & Audit Controls
            </p>
          </div>
        </div>

        <button
          onClick={() => { fetchOverviewStats(); fetchUsers(); fetchAdmissions(); fetchAuditLogs(); }}
          disabled={loadingStats}
          className="px-4 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-xs font-poppins font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-purple-500/10 hover:text-purple-600 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} /> Refresh Admin System
        </button>
      </div>

      {/* 6 Core Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: '1. Overview Stats', icon: LayoutDashboard },
          { id: 'users', label: '2. User & Roles', icon: Users },
          { id: 'admissions', label: '3. Admissions Pipeline', icon: UserCheck },
          { id: 'finance', label: '4. Fee & Financials', icon: CreditCard },
          { id: 'academic', label: '5. Academic Scheme', icon: Layers },
          { id: 'audit', label: '6. Audit & Notices', icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-poppins text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Overview Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-slate-800/40 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                🎓
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-poppins">Total Students</span>
                <span className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                  {stats?.studentCount || 1420}
                </span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-slate-800/40 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 flex items-center justify-center text-2xl font-bold">
                👨‍🏫
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-poppins">Active Faculty</span>
                <span className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                  {stats?.facultyCount || 48}
                </span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-slate-800/40 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 flex items-center justify-center text-2xl font-bold">
                💳
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-poppins">Fees Collected</span>
                <span className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                  ₹{(stats?.totalCollected ? stats.totalCollected / 10000000 : 1.42).toFixed(2)} Cr
                </span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-slate-200/40 dark:border-slate-800/40 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-2xl font-bold">
                ⚡
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-poppins">Avg Attendance</span>
                <span className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
                  {stats?.overallAttendanceAvg || 84.5}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
              Administrator System Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-poppins text-xs font-semibold">
              <button onClick={() => setActiveTab('users')} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 hover:bg-purple-500/10 hover:border-purple-500/30 text-left transition-all">
                <Users className="w-5 h-5 text-purple-500 mb-2" /> Manage User Roles
              </button>
              <button onClick={() => setActiveTab('admissions')} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-left transition-all">
                <UserCheck className="w-5 h-5 text-emerald-500 mb-2" /> Review Applications
              </button>
              <button onClick={() => setActiveTab('finance')} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 hover:bg-teal-500/10 hover:border-teal-500/30 text-left transition-all">
                <CreditCard className="w-5 h-5 text-teal-500 mb-2" /> Record Fee Payment
              </button>
              <button onClick={() => setActiveTab('audit')} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-left transition-all">
                <Bell className="w-5 h-5 text-indigo-500 mb-2" /> Broadcast Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User & Role Directory */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user directory by name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-poppins"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-poppins font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-poppins text-xs">
              <thead>
                <tr className="border-b border-slate-200/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">User</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Academic Details</th>
                  <th className="pb-3 px-4">Current Role</th>
                  <th className="pb-3 px-4">Role Switcher</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                      <span className="text-base">{u.avatar || '🌿'}</span>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {u.designation ? u.designation : `IT Dept • ${u.rollNo || 'IT-2026-001'}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30' :
                        u.role === 'faculty' ? 'bg-teal-500/20 text-teal-600 border border-teal-500/30' :
                        'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                      }`}>
                        {u.role || 'student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role || 'student'}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 text-xs font-semibold"
                      >
                        <option value="student">Student 🎓</option>
                        <option value="faculty">Faculty 👨‍🏫</option>
                        <option value="admin">Admin ⚙️</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => { setResetModalUser(u); handleResetPassword(u.id); }}
                        className="px-2.5 py-1 rounded-xl bg-slate-200/50 hover:bg-purple-500 hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Key className="w-3 h-3" /> Reset Creds
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Admissions Lifecycle */}
      {activeTab === 'admissions' && (
        <div className="space-y-6">
          {/* New Applicant Form */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Receive New Student Application
            </h3>

            <form onSubmit={handleCreateApplicant} className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-poppins text-xs">
              <input
                type="text"
                value={newApplicantName}
                onChange={(e) => setNewApplicantName(e.target.value)}
                placeholder="Full Student Name"
                className="px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200"
              />
              <input
                type="email"
                value={newApplicantEmail}
                onChange={(e) => setNewApplicantEmail(e.target.value)}
                placeholder="Email Address"
                className="px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200"
              />
              <input
                type="text"
                value={newApplicantPhone}
                onChange={(e) => setNewApplicantPhone(e.target.value)}
                placeholder="Phone Number"
                className="px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200"
              />
              <input
                type="text"
                value={newApplicantScore}
                onChange={(e) => setNewApplicantScore(e.target.value)}
                placeholder="CET/JEE Score (95.0)"
                className="px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200"
              />
              <button type="submit" className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1">
                Add Application
              </button>
            </form>
          </div>

          {/* Applications Table */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                Admissions Pipeline ({filteredAdmissions.length})
              </h3>
              <select
                value={admissionFilter}
                onChange={(e) => setAdmissionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 text-xs font-poppins font-semibold"
              >
                <option value="all">All Pipeline Stages</option>
                <option value="Received">Received</option>
                <option value="Under Review">Under Review</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-poppins text-xs">
                <thead>
                  <tr className="border-b border-slate-200/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-4">Application #</th>
                    <th className="pb-3 px-4">Applicant Name</th>
                    <th className="pb-3 px-4">Program & Score</th>
                    <th className="pb-3 px-4">Status Stage</th>
                    <th className="pb-3 px-4">Update Stage</th>
                    <th className="pb-3 px-4">Enrollment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30">
                  {filteredAdmissions.map(a => (
                    <tr key={a.id || a._id} className="hover:bg-white/30 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                        {a.applicationNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{a.studentName}</div>
                        <div className="text-[11px] text-slate-500">{a.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">{a.course}</div>
                        <div className="text-[11px] text-emerald-600 font-bold font-mono">Score: {a.score}%</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          a.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-600' :
                          a.status === 'Interviewing' ? 'bg-indigo-500/20 text-indigo-600' :
                          a.status === 'Under Review' ? 'bg-amber-500/20 text-amber-600' :
                          'bg-slate-500/20 text-slate-600'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={a.status}
                          onChange={(e) => handleUpdateAdmissionStatus(a.id || a._id, e.target.value)}
                          className="px-2 py-1 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 text-xs font-semibold"
                        >
                          <option value="Received">Received</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        {a.convertedStudentId ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Enrolled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConvertApplicant(a.id || a._id)}
                            disabled={convertingId === (a.id || a._id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-[11px] hover:bg-emerald-600 transition-colors flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Convert to Student
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Fee & Financial Control */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Record Payment */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-500" /> Record Student Manual Payment
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-4 font-poppins text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Select Student</label>
                <select
                  value={payUserId}
                  onChange={(e) => setPayUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">Select Student Account...</option>
                  {users.filter(u => u.role === 'student').map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNo || s.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Online / UPI">Online / UPI</option>
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="Demand Draft">Demand Draft</option>
                    <option value="Cash">Cash Counter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Admin Remarks</label>
                <input
                  type="text"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  placeholder="Installment #2 clearing..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={recordingPay}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
              >
                <CheckCircle2 className="w-4 h-4" /> Record Payment & Issue Receipt
              </button>
            </form>
          </div>

          {/* Fee Structure Summary */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
              Active Program Fee Configurations
            </h3>

            <div className="space-y-3">
              {feeStructures.map(fs => (
                <div key={fs.id || fs._id} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 space-y-2 font-poppins text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100">IT Department • Semester {fs.semester}</span>
                    <span className="font-mono font-extrabold text-teal-600 text-sm">Total ₹{fs.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/40">
                    <div>Tuition Fee: ₹{fs.tuitionFee?.toLocaleString()}</div>
                    <div>Development Fee: ₹{fs.developmentFee?.toLocaleString()}</div>
                    <div>Lab & Exam Fee: ₹{fs.labExamFee?.toLocaleString()}</div>
                    <div>Other Charges: ₹{fs.otherCharges?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Academic Scheme Configuration */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Divisions */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
              <span>Department Divisions</span>
              <span className="text-xs text-emerald-500 font-semibold">{divisions.length} Divisions</span>
            </h3>

            <div className="space-y-2">
              {divisions.map(d => (
                <div key={d.id || d._id} className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 flex items-center justify-between text-xs font-poppins">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{d.name}</span>
                  <span className="text-slate-500">Academic Year: {d.academicYear || '2025-2026'}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateDivision} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newDivName}
                onChange={(e) => setNewDivName(e.target.value)}
                placeholder="e.g. IT-D"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 text-xs"
              />
              <button type="submit" className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold">
                Add Division
              </button>
            </form>
          </div>

          {/* Faculty Assignment */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
              Assign Faculty Member to Subject & Division
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3 font-poppins text-xs">
              <select
                value={assignFacultyId}
                onChange={(e) => setAssignFacultyId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200"
              >
                <option value="">Select Faculty...</option>
                {users.filter(u => u.role === 'faculty' || u.role === 'admin').map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.role})</option>
                ))}
              </select>

              <select
                value={assignSubId}
                onChange={(e) => setAssignSubId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200"
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.code})</option>
                ))}
              </select>

              <select
                value={assignDivId}
                onChange={(e) => setAssignDivId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200"
              >
                <option value="">Select Division...</option>
                {divisions.map(d => (
                  <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center gap-1"
              >
                Save Teaching Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: Audit Logs & Announcements */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Broadcast Announcement */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" /> Broadcast System Announcement
            </h3>

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 font-poppins text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Notice Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Mandatory Academic Fee Submission Deadline"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Notice Body Content</label>
                <textarea
                  rows={3}
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Enter broadcast announcement message..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <option value="all">All Campus Users (Students + Faculty)</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25"
              >
                Broadcast Notice
              </button>
            </form>
          </div>

          {/* Live Audit Log Timeline */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" /> Admin System Audit Log
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 font-poppins text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-purple-600 dark:text-purple-400">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px]">{log.details}</p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/30 flex justify-between">
                    <span>By: {log.performedByName}</span>
                    <span>Target: {log.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalUser && tempPassword && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm glass-card rounded-3xl p-6 border border-purple-500/30 bg-white/90 dark:bg-slate-900/90 shadow-2xl space-y-4 text-center font-poppins"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 flex items-center justify-center mx-auto text-2xl">
              🔑
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Temporary Credentials Issued
            </h3>
            <p className="text-xs text-slate-500">
              Credentials reset for <span className="font-bold text-slate-700 dark:text-slate-200">{resetModalUser.name}</span>
            </p>

            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Temporary Password</span>
              <span className="font-mono font-extrabold text-lg text-purple-700 dark:text-purple-300">{tempPassword}</span>
            </div>

            <button
              onClick={() => { setResetModalUser(null); setTempPassword(null); }}
              className="w-full py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs"
            >
              Done & Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
