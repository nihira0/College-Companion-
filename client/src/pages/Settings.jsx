import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Settings as SettingsIcon, User, Bell, Shield, Moon, Sun, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Account preferences saved successfully! 🌿', 'success', '⚙️');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30 shrink-0">
          ⚙️
        </div>
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
            Account & Preferences Settings
          </h1>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
            Manage your profile details, notification preferences & theme settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
          <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" /> Profile Information
          </h3>

          <form onSubmit={handleSave} className="space-y-3 text-xs font-poppins">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Account Role</label>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase text-[10px]">
                {user?.role || 'student'}
              </span>
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
          <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" /> Preferences & Theme
          </h3>

          <div className="space-y-4 text-xs font-poppins">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Dark / Light Mode</span>
                <span className="text-[11px] text-slate-500">Current Theme: {theme}</span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Toggle Theme</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Campus Alerts & Email Digest</span>
                <span className="text-[11px] text-slate-500 font-poppins">Receive instant notifications for assignments & notices</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
