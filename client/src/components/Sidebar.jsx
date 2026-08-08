import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PieChart,
  GraduationCap,
  Calendar,
  Bell,
  BookOpen,
  Timer,
  Bot,
  Sparkles,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/assignments', label: 'Assignments', icon: FileText },
    { path: '/attendance', label: 'Attendance', icon: PieChart },
    { path: '/marks', label: 'Marks', icon: GraduationCap },
    { path: '/timetable', label: 'Timetable', icon: Calendar },
    { path: '/notices', label: 'Notices', icon: Bell },
    { path: '/notes', label: 'Notes', icon: BookOpen },
    { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
    { path: '/sage', label: 'AI Assistant', icon: Bot, badge: 'Sage 🌿' }
  ];

  return (
    <aside className="fixed left-5 top-5 bottom-5 w-64 glass-sidebar rounded-3xl z-40 flex flex-col justify-between p-4 transition-all duration-300">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-2 mb-6">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30"
          >
            🌿
          </motion.div>
          <div>
            <h1 className="font-poppins font-bold text-lg leading-snug tracking-tight text-slate-800 dark:text-slate-100">
              College Companion
            </h1>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Nature & AI Powered
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold shadow-inner border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Hover Glow Icon Container */}
                    <div className="relative flex items-center justify-center">
                      <Icon
                        className={`w-5 h-5 transition-all duration-300 group-hover:scale-125 group-hover:text-emerald-500 ${
                          isActive ? 'text-emerald-600 dark:text-emerald-400 scale-110' : ''
                        }`}
                      />
                      {/* Tiny green glow circle on hover */}
                      <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>

                    <span className="font-poppins text-xs tracking-wide">
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Companion Status Card */}
      <div className="space-y-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/50">
        {/* Mini Leafy Companion Quote */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-xs flex items-center gap-2.5">
          <div className="text-xl animate-bounce">🌿</div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
              Stay productive!
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              You've got this! ✨
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-900/60 flex items-center justify-center text-sm font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
              {user?.avatar || '🌱'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'Nihaarika'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.course || 'B.Tech CS'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
