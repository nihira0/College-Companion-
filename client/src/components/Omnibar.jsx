import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, PieChart, GraduationCap, Calendar, Bell, BookOpen, Timer, Bot, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Omnibar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Check Attendance', keywords: ['attendance', 'bunk', 'subject', 'percent'], path: '/attendance', icon: PieChart, desc: 'View attendance percentage & safe zone target' },
    { title: 'View Assignments', keywords: ['assignment', 'dbms', 'cn', 'deadline', 'due'], path: '/assignments', icon: FileText, desc: '3 pending assignments due this week' },
    { title: 'OS & DBMS Notes', keywords: ['os notes', 'notes', 'dbms notes', 'study', 'pdf'], path: '/notes', icon: BookOpen, desc: 'Read DBMS Normalization & OS Deadlock notes' },
    { title: 'Ask Sage 🌿 AI Companion', keywords: ['sage', 'ai', 'chatbot', 'help', 'quiz', 'flashcard'], path: '/sage', icon: Bot, desc: 'Generate flashcards, take quizzes, explain concepts' },
    { title: 'Pomodoro Timer', keywords: ['pomodoro', 'timer', 'plant', 'sprout', 'focus'], path: '/pomodoro', icon: Timer, desc: 'Start 25-min focus session with plant garden' },
    { title: 'Marks & CGPA', keywords: ['marks', 'cgpa', 'sgpa', 'grade', 'score'], path: '/marks', icon: GraduationCap, desc: 'Check 8.24 CGPA overview & semester marks' },
    { title: 'Timetable & Schedule', keywords: ['timetable', 'schedule', 'class', 'calendar', 'slot'], path: '/timetable', icon: Calendar, desc: 'Interactive weekly class schedule' },
    { title: 'Notices & Announcements', keywords: ['notice', 'exam', 'hackathon', 'event'], path: '/notices', icon: Bell, desc: 'Campus announcements & exam timetable' }
  ];

  const filteredActions = query.trim() === ''
    ? quickActions
    : quickActions.filter(action =>
        action.title.toLowerCase().includes(query.toLowerCase()) ||
        action.desc.toLowerCase().includes(query.toLowerCase()) ||
        action.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
      );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-xl glass-card rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/50"
        >
          {/* Input Header */}
          <div className="flex items-center px-5 py-4 border-b border-slate-200/40 dark:border-slate-800/50 gap-3">
            <Search className="w-5 h-5 text-emerald-500 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search modules, notes, assignments (e.g. 'attendance', 'OS notes')..."
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-poppins"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-1.5">
            {filteredActions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-poppins">
                No matching academic module or notes found for "{query}" 🌿
              </div>
            ) : (
              filteredActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(action.path)}
                    className="w-full text-left flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-poppins">
                          {action.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {action.desc}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer keyboard guide */}
          <div className="px-5 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200/40 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 font-poppins">
            <span>Navigation Shortcut</span>
            <div className="flex items-center gap-3">
              <span><kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> navigate</span>
              <span><kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
