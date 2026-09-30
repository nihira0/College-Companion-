import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const AccessDenied = ({ requiredRole }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-rose-500/30 shadow-2xl text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-poppins font-extrabold text-xl text-slate-800 dark:text-slate-100">
            Access Denied
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-poppins leading-relaxed">
            You do not have permission to view this page. This area is restricted to authorized {requiredRole || 'privileged'} users.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-poppins font-semibold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
};
