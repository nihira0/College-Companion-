import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login, loading } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('nihaarika@college.edu');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      addToast('Welcome back to College Companion! 🌿', 'success', '👋');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/40 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
            🌿
          </div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
            Welcome Back!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-poppins">
            Sign in to your nature-inspired college dashboard.
          </p>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-poppins font-semibold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
          >
            Sign In to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-200/40 text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
