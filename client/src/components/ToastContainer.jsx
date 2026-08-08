import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.slice(0, 4).map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.3 } }}
            className="pointer-events-auto glass-card rounded-2xl p-3.5 shadow-xl border border-white/40 dark:border-slate-700/50 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="text-base p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                {toast.icon || '✅'}
              </span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 font-poppins">
                  {toast.message}
                </p>
                <p className="text-[10px] text-slate-400">
                  {toast.time}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
