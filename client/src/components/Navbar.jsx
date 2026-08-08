import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Sunset, CloudSun, Bell, Command } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = ({ onOpenOmnibar }) => {
  const { timeOfDay, toggleTimeOfDay } = useTheme();
  const { user } = useAuth();
  const { toasts } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getThemeIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'afternoon':
        return <CloudSun className="w-4 h-4 text-sky-500" />;
      case 'sunset':
        return <Sunset className="w-4 h-4 text-rose-500" />;
      case 'night':
      default:
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="fixed top-5 left-72 right-5 h-16 glass-card rounded-2xl z-30 flex items-center justify-between px-6 transition-all duration-300">
      {/* Search Bar / Omnibar Launcher */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenOmnibar}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-emerald-500/50 transition-all text-xs shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Search anything... <span className="text-[10px] text-slate-400 dark:text-slate-500">(e.g. attendance, OS notes)</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">
            <Command className="w-3 h-3" /> K
          </div>
        </button>
      </div>

      {/* Right Controls: Clock, Theme Switcher, Notifications, Avatar */}
      <div className="flex items-center gap-4">
        {/* Live Date & Time Indicator */}
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-poppins">
            {formattedTime}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {formattedDate}
          </span>
        </div>

        {/* Dynamic Sky Theme Switcher Button */}
        <button
          onClick={() => toggleTimeOfDay()}
          title={`Current Scene: ${timeOfDay.toUpperCase()} (Click to toggle scene)`}
          className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all shadow-sm flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 capitalize"
        >
          {getThemeIcon()}
          <span className="hidden sm:inline capitalize">{timeOfDay}</span>
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all shadow-sm relative text-slate-700 dark:text-slate-200"
          >
            <Bell className="w-4 h-4" />
            {toasts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 glass-card rounded-2xl p-4 shadow-2xl z-50 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/40 dark:border-slate-800/50">
                  <h4 className="font-poppins text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Activity & Toasts ({toasts.length})
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-medium">Live</span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {toasts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No new notifications</p>
                  ) : (
                    toasts.map(toast => (
                      <div
                        key={toast.id}
                        className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/30 dark:border-slate-700/30 flex items-start gap-2.5"
                      >
                        <span className="text-sm mt-0.5">{toast.icon}</span>
                        <div className="flex-1 text-xs">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{toast.message}</p>
                          <span className="text-[10px] text-slate-400">{toast.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200/40 dark:border-slate-800/50">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 dark:from-emerald-700 dark:to-teal-900 flex items-center justify-center text-base shadow-md border border-emerald-300/40">
            {user?.avatar || '🌱'}
          </div>
        </div>
      </div>
    </header>
  );
};
