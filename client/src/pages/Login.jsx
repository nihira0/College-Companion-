import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login, loading } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem('college_companion_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    } else {
      setEmail('nihaarika@college.edu');
    }
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (!rememberEmail) {
      if (role === 'student') setEmail('nihaarika@college.edu');
      else if (role === 'faculty') setEmail('faculty@college.edu');
      else if (role === 'admin') setEmail('admin@college.edu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rememberEmail) {
      localStorage.setItem('college_companion_remembered_email', email);
    } else {
      localStorage.removeItem('college_companion_remembered_email');
    }

    const result = await login(email, password, keepLoggedIn, selectedRole);
    if (result.success) {
      addToast('Welcome back to College Companion! 🌿', 'success', '👋');
      navigate('/');
    } else {
      addToast(result.message || 'Invalid login credentials', 'error', '⚠️');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-3xl p-5 sm:p-8 border border-white/40 shadow-2xl space-y-4 sm:space-y-5"
      >
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 mx-auto flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-emerald-500/30">
            🌿
          </div>
          <h1 className="font-poppins font-extrabold text-xl sm:text-2xl text-slate-800 dark:text-slate-100">
            Welcome Back!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-poppins">
            Sign in to your nature-inspired college dashboard.
          </p>
        </div>

        {/* 1. LOGIN ROLE SELECTION */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs text-center font-bold text-slate-700 dark:text-slate-200 font-poppins">
            Who are you logging in as?
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { id: 'student', label: 'Student', icon: '🎓' },
              { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
              { id: 'admin', label: 'Admin', icon: '⚙️' }
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role.id)}
                className={`p-2 sm:p-2.5 rounded-2xl font-poppins text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all border ${
                  selectedRole === role.id
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-md scale-[1.02]'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-emerald-500/10'
                }`}
              >
                <span className="text-base sm:text-lg">{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-poppins">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nihaarika@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Options: Remember Email & Keep Me Logged In */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-400 border-slate-300"
              />
              <span>Remember email</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-400 border-slate-300"
              />
              <span>Keep me logged in</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-poppins font-semibold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Helper */}
        <div className="pt-2 border-t border-slate-200/40 text-[11px] font-poppins text-slate-500 dark:text-slate-400 space-y-1">
          <span className="font-bold text-slate-700 dark:text-slate-200 block text-center">💡 Demo Quick Logins (Password: <code className="text-emerald-600 font-bold">password123</code>):</span>
          <div className="flex flex-wrap justify-center gap-1.5 pt-1 text-[10px]">
            <button type="button" onClick={() => { setSelectedRole('student'); setEmail('nihaarika@college.edu'); setPassword('password123'); }} className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500/20 transition-colors">
              🎓 Student: nihaarika@college.edu
            </button>
            <button type="button" onClick={() => { setSelectedRole('faculty'); setEmail('faculty@college.edu'); setPassword('password123'); }} className="px-2.5 py-1 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-500/20 transition-colors">
              👨‍🏫 Faculty: faculty@college.edu
            </button>
            <button type="button" onClick={() => { setSelectedRole('admin'); setEmail('admin@college.edu'); setPassword('password123'); }} className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-500/20 transition-colors">
              ⚙️ Admin: admin@college.edu
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
