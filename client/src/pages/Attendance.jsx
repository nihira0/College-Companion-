import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { PieChart, Plus, Minus, ShieldCheck, AlertTriangle, Calculator, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Attendance = () => {
  const { addToast } = useNotification();
  const [subjects, setSubjects] = useState([
    { id: '1', name: 'Database Systems', attended: 26, total: 30, target: 75 },
    { id: '2', name: 'Computer Networks', attended: 22, total: 30, target: 75 },
    { id: '3', name: 'Operating Systems', attended: 28, total: 32, target: 75 },
    { id: '4', name: 'Software Engineering', attended: 18, total: 25, target: 75 },
    { id: '5', name: 'Web Technologies Lab', attended: 14, total: 14, target: 75 }
  ]);

  const handleUpdate = (id, deltaAttended, deltaTotal) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id === id) {
        const newAttended = Math.max(0, sub.attended + deltaAttended);
        const newTotal = Math.max(newAttended, sub.total + deltaTotal);
        const newPct = Math.round((newAttended / (newTotal || 1)) * 100);
        addToast(`Updated ${sub.name}: ${newPct}% attendance`, 'info', '📊');
        return { ...sub, attended: newAttended, total: newTotal };
      }
      return sub;
    }));
  };

  const calculateStatus = (attended, total, target = 75) => {
    const pct = Math.round((attended / (total || 1)) * 100);
    const requiredPct = target / 100;

    if (pct >= target) {
      // Calculate how many can bunk
      // (attended) / (total + x) >= target/100  => x <= (attended*100/target) - total
      const maxBunks = Math.floor((attended / requiredPct) - total);
      return {
        isSafe: true,
        pct,
        message: maxBunks > 0 ? `You can miss ${maxBunks} class${maxBunks > 1 ? 'es' : ''} and remain above ${target}%!` : `You are on the line (${pct}%). Don't miss next class!`
      };
    } else {
      // Calculate how many to attend
      // (attended + x) / (total + x) >= target/100 => x >= (target*total - 100*attended) / (100 - target)
      const needed = Math.ceil((requiredPct * total - attended) / (1 - requiredPct));
      return {
        isSafe: false,
        pct,
        message: `Attend next ${needed} consecutive class${needed > 1 ? 'es' : ''} to reach ${target}% safe zone!`
      };
    }
  };

  const totalAttendedAll = subjects.reduce((acc, s) => acc + s.attended, 0);
  const totalClassesAll = subjects.reduce((acc, s) => acc + s.total, 0);
  const overallPct = Math.round((totalAttendedAll / (totalClassesAll || 1)) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">📊</span>
          Attendance & Safe-Zone Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
          Monitor your academic attendance percentages, simulate bunk allowances, and maintain safety thresholds.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${overallPct}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-poppins font-black text-xl text-slate-800 dark:text-slate-100">
              {overallPct}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-poppins font-bold text-lg text-slate-800 dark:text-slate-100">
                Overall Attendance: {overallPct}%
              </h2>
              {overallPct >= 75 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Safe Zone
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Below Target
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Total Classes Attended: <strong className="text-emerald-600 dark:text-emerald-400">{totalAttendedAll}</strong> / {totalClassesAll}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-xs font-poppins space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">💡 Smart Advice:</span>
          <p className="text-slate-600 dark:text-slate-300">
            Keep your attendance above 75% for hall ticket eligibility. Use the buttons below to log attended/missed classes.
          </p>
        </div>
      </div>

      {/* Subject Wise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(sub => {
          const status = calculateStatus(sub.attended, sub.total, sub.target);
          return (
            <motion.div
              key={sub.id}
              whileHover={{ y: -4 }}
              className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                    {sub.name}
                  </h3>
                  <span className={`text-xs font-black font-poppins px-2.5 py-0.5 rounded-full ${
                    status.isSafe ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>
                    {status.pct}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden my-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      status.isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, status.pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 my-2">
                  <span>Attended: {sub.attended}/{sub.total}</span>
                  <span>Target: {sub.target}%</span>
                </div>

                <div className={`p-3 rounded-2xl text-[11px] font-medium my-3 ${
                  status.isSafe ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {status.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200/30 dark:border-slate-800/40">
                <button
                  onClick={() => handleUpdate(sub.id, 1, 1)}
                  className="flex-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-poppins text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Attended
                </button>
                <button
                  onClick={() => handleUpdate(sub.id, 0, 1)}
                  className="flex-1 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-poppins text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" /> Missed
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
