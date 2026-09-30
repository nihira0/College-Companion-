import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Users, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const UserManagement = () => {
  const { token } = useAuth();
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      let res;
      try {
        res = await fetch('/api/admin/users', { headers });
        if (!res.ok && res.status === 404) {
          res = await fetch('http://localhost:5000/api/admin/users', { headers });
        }
      } catch (e) {
        res = await fetch('http://localhost:5000/api/admin/users', { headers });
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      addToast('Error fetching user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const payload = { role: newRole };
      let res;
      try {
        res = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        });
        if (!res.ok && res.status === 404) {
          res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload)
          });
        }
      } catch (e) {
        res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        });
      }

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
              User Management & Roles
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
              Admin Portal • Institutional Role-Based Access Control
            </p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-xs font-poppins font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Users
        </button>
      </div>

      {/* Users Table Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-slate-800/40 text-[11px] font-bold font-poppins text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-4">User</th>
                <th className="pb-3 px-4">Email</th>
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
    </div>
  );
};
