import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { SageWidget } from '../components/SageWidget';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Plus,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { user } = useAuth();
  const { getGreetingData } = useTheme();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const greeting = getGreetingData(user?.name || 'Nihaarika');

  // Pomodoro Mini State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(1);

  useEffect(() => {
    let interval = null;
    if (isActive && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isActive) {
      setIsActive(false);
      setCompletedSessions(prev => prev + 1);
      addToast('🍅 Pomodoro Focus Session Complete! Plant Grew Bigger 🌱', 'success', '🌱');
      setPomodoroSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, pomodoroSeconds, addToast]);

  const togglePomodoro = () => {
    setIsActive(!isActive);
    if (!isActive) {
      addToast('Focus Session Started! 🌿', 'info', '⏱️');
    }
  };

  const resetPomodoro = () => {
    setIsActive(false);
    setPomodoroSeconds(25 * 60);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Plant stage based on completed sessions
  const getPlantEmoji = () => {
    if (completedSessions === 0) return '🌱';
    if (completedSessions === 1) return '🌿';
    if (completedSessions === 2) return '🌸';
    return '🌳';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Dynamic Context Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-poppins font-extrabold text-2xl md:text-3xl tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span>{greeting.icon}</span> {greeting.salutation}, {user?.name || 'Nihaarika'}!
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 font-poppins">
            {greeting.message}
          </p>
        </div>

        {/* Quick Date pill */}
        <div className="px-4 py-2 rounded-2xl glass-card text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 border border-emerald-500/20 shadow-sm self-start md:self-auto">
          <CalendarIcon className="w-4 h-4 text-emerald-500" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </motion.div>

      {/* Main Grid Layout with Apple-style Spacing (9.8/10 spacing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Upcoming Deadlines (Clean & Minimal) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                  Upcoming Deadlines
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                3 Pending
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-poppins">
                    DBMS Assignment 3
                  </h4>
                  <span className="text-[10px] text-slate-400">Tomorrow, 11:59 PM</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  High
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-poppins">
                    CN practical submission
                  </h4>
                  <span className="text-[10px] text-slate-400">May 18, 2026</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  Medium
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/assignments')}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-poppins group"
          >
            <span>View all assignments →</span>
          </button>
        </motion.div>

        {/* Card 2: Attendance Overview */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">📊</span>
                Attendance Overview
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Safe Zone 🛡️
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 my-2">
              {/* Radial gauge */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="78, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-poppins font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                  78%
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Overall Attendance</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-poppins mt-0.5">
                  78% (108/139)
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium leading-tight">
                  You need 2 more classes to reach safe zone threshold.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/attendance')}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-poppins"
          >
            <span>Calculate bunk allowance →</span>
          </button>
        </motion.div>

        {/* Card 3: Marks & CGPA Overview */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500">🎓</span>
                Marks Overview
              </h3>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +0.18 SGPA
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current CGPA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-poppins font-black text-3xl text-slate-800 dark:text-slate-100">
                  8.24
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Keep up the great work! Semester 6 target: 8.50 CGPA.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/marks')}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline font-poppins"
          >
            <span>View semester breakdown →</span>
          </button>
        </motion.div>
      </div>

      {/* Second Row: Pomodoro Plant Garden + Sage Companion + Quick Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 4: Pomodoro Plant Growth Gamification */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍅</span>
                <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                  Pomodoro Garden
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Session #{completedSessions + 1}
              </span>
            </div>

            <div className="flex items-center gap-5 my-4">
              {/* Plant Visual */}
              <motion.div
                animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex flex-col items-center justify-center border border-emerald-500/30 text-3xl shadow-inner shrink-0"
              >
                <span>{getPlantEmoji()}</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Growing...
                </span>
              </motion.div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Focus on your goal, not on the clock.
                </p>
                <div className="font-poppins font-black text-3xl text-slate-800 dark:text-slate-100 tracking-wider my-1">
                  {formatTimer(pomodoroSeconds)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={togglePomodoro}
              className={`flex-1 py-2.5 rounded-2xl font-poppins text-xs font-semibold flex items-center justify-center gap-2 text-white shadow-md transition-all ${
                isActive
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={resetPomodoro}
              className="p-2.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Card 5: Sage 🌿 AI Companion Card */}
        <SageWidget />

        {/* Card 6: Quick Flash Notes */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">📝</span>
                Quick Notes
              </h3>
              <button
                onClick={() => navigate('/notes')}
                className="p-1 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 text-slate-400 hover:text-emerald-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/40 text-slate-800 dark:text-slate-200 text-xs shadow-sm">
                <span className="font-bold text-[10px] text-amber-700 dark:text-amber-400 block mb-1">DBMS</span>
                <p className="line-clamp-2 text-[11px]">BCNF determinant rule revision notes.</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300/40 text-slate-800 dark:text-slate-200 text-xs shadow-sm">
                <span className="font-bold text-[10px] text-emerald-700 dark:text-emerald-400 block mb-1">OS</span>
                <p className="line-clamp-2 text-[11px]">Coffman deadlock 4 conditions summary.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/notes')}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-poppins"
          >
            <span>Open notes repository →</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
