import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Users, Shield, RefreshCw, BookOpen, Layers, UserCheck, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const UserManagement = () => {
  const { token } = useAuth();
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Divisions & Subjects state
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  // Forms
  const [newDivName, setNewDivName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignSubId, setAssignSubId] = useState('');
  const [assignDivId, setAssignDivId] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/admin/users', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch (err) {
      addToast('Error fetching user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicStructure = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [divRes, subRes, faRes] = await Promise.all([
        fetch('/api/admin/divisions', { headers }),
        fetch('/api/admin/subjects', { headers }),
        fetch('/api/admin/faculty-assignments', { headers })
      ]);

      if (divRes.ok) setDivisions(await divRes.json());
      if (subRes.ok) setSubjects(await subRes.json());
      if (faRes.ok) setFacultyAssignments(await faRes.json());
    } catch (err) {}
  };

  useEffect(() => {
    fetchUsers();
    fetchAcademicStructure();
  }, [token]);

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

      const data = await res.json();
      if (res.ok) {
        addToast(`Role updated to ${newRole} ⚙️`, 'success', '🛡️');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        addToast(data.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      addToast('Failed to update role', 'error');
    } finally {
      setUpdatingId(null);
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
        addToast(`Division ${newDivName} added!`, 'success', '🏛️');
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
        addToast('Faculty assignment created successfully!', 'success', '👨‍🏫');
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30 shrink-0">
            ⚙️
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              IT Department & User Management
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
              Admin Portal • Manage IT Divisions (A, B, C), Subjects, Faculty Assignments & Roles
            </p>
          </div>
        </div>

        <button
          onClick={() => { fetchUsers(); fetchAcademicStructure(); }}
          disabled={loading}
          className="px-4 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-xs font-poppins font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-3">
        {[
          { id: 'users', label: 'User Directory & Roles', icon: Users },
          { id: 'academic', label: 'Divisions & Subjects', icon: Layers },
          { id: 'assignments', label: 'Faculty Assignments', icon: UserCheck }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-poppins text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: User Directory & Roles */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/40 dark:border-slate-800/40 text-[11px] font-bold font-poppins text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">User</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Dept / Division / Roll</th>
                  <th className="pb-3 px-4">Current Role</th>
                  <th className="pb-3 px-4">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30 text-xs font-poppins">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                      <span className="text-base">{u.avatar || '🌿'}</span>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {u.designation ? u.designation : `IT Department • ${u.divisionId === 'div_itb_1' ? 'IT-B' : u.divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A'} • ${u.rollNo || 'IT-2026-001'}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30' 
                          : u.role === 'faculty' 
                          ? 'bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30' 
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {u.role || 'student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role || 'student'}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="student">Student 🎓</option>
                        <option value="faculty">Faculty 👨‍🏫</option>
                        <option value="admin">Admin ⚙️</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Divisions & Subjects */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Divisions */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
              <span>IT Divisions (70-80 students/class)</span>
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

          {/* Subjects */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
              <span>IT Department Subjects</span>
              <span className="text-xs text-teal-500 font-semibold">{subjects.length} Subjects</span>
            </h3>

            <div className="space-y-2">
              {subjects.map(s => (
                <div key={s.id || s._id} className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 flex items-center justify-between text-xs font-poppins">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{s.name}</span>
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold">
                    {s.code}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-2 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Subject Name (e.g. Web Dev)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  placeholder="Code (IT605)"
                  className="w-28 px-3.5 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 text-xs"
                />
              </div>
              <button type="submit" className="w-full py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
                Add Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Faculty Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
              Assign Faculty to Subject + Division
            </h3>

            <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-poppins">
              <select
                value={assignFacultyId}
                onChange={(e) => setAssignFacultyId(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <option value="">Select Faculty...</option>
                {users.filter(u => u.role === 'faculty' || u.role === 'admin').map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.role})</option>
                ))}
              </select>

              <select
                value={assignSubId}
                onChange={(e) => setAssignSubId(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.code})</option>
                ))}
              </select>

              <select
                value={assignDivId}
                onChange={(e) => setAssignDivId(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <option value="">Select Division...</option>
                {divisions.map(d => (
                  <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>
                ))}
              </select>

              <button
                type="submit"
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Save Assignment
              </button>
            </form>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl overflow-hidden">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">
              Active Faculty Teaching Assignments
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-poppins">
                <thead>
                  <tr className="border-b border-slate-200/40 text-slate-400 font-bold">
                    <th className="pb-3 px-4">Faculty Member</th>
                    <th className="pb-3 px-4">Assigned Subject</th>
                    <th className="pb-3 px-4">Assigned Division</th>
                    <th className="pb-3 px-4">Academic Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30">
                  {facultyAssignments.map(fa => {
                    const faculty = users.find(u => u.id === fa.facultyId);
                    const sub = subjects.find(s => (s.id || s._id) === fa.subjectId);
                    const div = divisions.find(d => (d.id || d._id) === fa.divisionId);
                    return (
                      <tr key={fa.id || fa._id} className="hover:bg-white/30">
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                          {faculty ? faculty.name : 'Dr. Anil Vasoya'}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                          {sub ? sub.name : 'Database Management Systems'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                            {div ? div.name : 'IT-A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{fa.academicYear || '2025-2026'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
