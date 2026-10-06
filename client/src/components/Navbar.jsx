import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Sunset, CloudSun, Bell, Command, Menu, CheckCheck, ExternalLink, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = ({ onOpenOmnibar, onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { timeOfDay, toggleTimeOfDay } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, toasts } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());

  const userRole = user?.role || 'student';

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

  const filteredNotifs = selectedFilter === 'All'
    ? notifications
    : selectedFilter === 'Important'
    ? notifications.filter(n => n.priority === 'HIGH' || n.type === 'warning')
    : notifications.filter(n => n.category === selectedFilter);

  return (
    <header className="fixed top-3 md:top-5 left-3 md:left-72 right-3 md:right-5 h-16 glass-card rounded-2xl z-30 flex items-center justify-between px-3 md:px-6 transition-all duration-300 gap-2">
      {/* Mobile Hamburger Toggle Button */}
      <button
        onClick={onToggleMobileSidebar}
        title="Toggle Menu"
        aria-label="Toggle navigation menu"
        className="md:hidden p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-emerald-500/20 transition-all shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Bar / Omnibar Launcher */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenOmnibar}
          className="w-full flex items-center justify-between px-3 md:px-4 py-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-emerald-500/50 transition-all text-xs shadow-inner group truncate"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
            <span className="font-medium text-slate-500 dark:text-slate-400 truncate">
              Search... <span className="hidden sm:inline text-[10px] text-slate-400 dark:text-slate-500">(e.g. attendance, notices)</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 shrink-0">
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

        {/* Role-Aware Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all shadow-sm relative text-slate-700 dark:text-slate-200"
            title="Notifications Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse border border-white dark:border-slate-900 shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role-Aware Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-3xl p-4 shadow-2xl z-50 border border-slate-200/50 dark:border-slate-700/50 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <h4 className="font-poppins text-xs font-bold text-slate-800 dark:text-slate-200">
                      {userRole === 'faculty' ? 'Faculty Portal Notifications' : userRole === 'admin' ? 'Administrative Alerts' : 'Student Notifications'}
                    </h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                        {unreadCount} Unread
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                  {['All', 'Important', 'Admin', 'Academic', 'Students', 'Events'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                        selectedFilter === cat
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-white/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {filteredNotifs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No notifications in {selectedFilter}</p>
                  ) : (
                    filteredNotifs.map(n => {
                      const isHigh = n.priority === 'HIGH' || n.type === 'warning';
                      const isMed = n.priority === 'MEDIUM';

                      return (
                        <div
                          key={n.id || n._id}
                          onClick={() => {
                            markAsRead(n.id || n._id);
                            if (n.actionUrl) {
                              navigate(n.actionUrl);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                            !n.isRead
                              ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30 shadow-sm'
                              : 'bg-white/30 dark:bg-slate-800/30 border-slate-200/30 opacity-80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              )}
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                isHigh ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
                                isMed ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                'bg-teal-500/20 text-teal-700 dark:text-teal-300'
                              }`}>
                                {n.priority || 'MEDIUM'}
                              </span>
                              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                                • {n.category || 'Admin'}
                              </span>
                            </div>

                            {n.actionUrl && (
                              <ExternalLink className="w-3 h-3 text-slate-400 hover:text-emerald-500 shrink-0" />
                            )}
                          </div>

                          <h5 className="font-poppins text-xs font-bold text-slate-800 dark:text-slate-100">
                            {n.title}
                          </h5>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                            {n.message}
                          </p>

                          {n.details && (
                            <p className="text-[10px] text-slate-400 italic mt-1 font-mono">
                              {n.details}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notices');
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-poppins text-xs font-bold text-center transition-colors"
                >
                  Open Notices & Circulars →
                </button>
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
