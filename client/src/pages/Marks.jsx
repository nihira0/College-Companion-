import React from 'react';
import { GraduationCap, Award, TrendingUp, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const Marks = () => {
  const semesterHistory = [
    { sem: 'Semester 1', sgpa: 8.10, credits: 24, status: 'Completed' },
    { sem: 'Semester 2', sgpa: 8.35, credits: 24, status: 'Completed' },
    { sem: 'Semester 3', sgpa: 7.90, credits: 22, status: 'Completed' },
    { sem: 'Semester 4', sgpa: 8.45, credits: 22, status: 'Completed' },
    { sem: 'Semester 5', sgpa: 8.40, credits: 24, status: 'Completed' },
    { sem: 'Semester 6', sgpa: 8.55, credits: 22, status: 'In Progress ⚡' }
  ];

  const currentSubjectGrades = [
    { subject: 'Database Management Systems', code: 'CS601', internal: 28, maxInternal: 30, midterm: 44, maxMidterm: 50, grade: 'A+' },
    { subject: 'Computer Networks', code: 'CS602', internal: 26, maxInternal: 30, midterm: 41, maxMidterm: 50, grade: 'A' },
    { subject: 'Operating Systems', code: 'CS603', internal: 29, maxInternal: 30, midterm: 46, maxMidterm: 50, grade: 'O (Outstanding)' },
    { subject: 'Software Engineering', code: 'CS604', internal: 25, maxInternal: 30, midterm: 39, maxMidterm: 50, grade: 'B+' },
    { subject: 'Web Technologies Lab', code: 'CS605L', internal: 30, maxInternal: 30, midterm: 48, maxMidterm: 50, grade: 'O (Outstanding)' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-purple-500/10 text-purple-500">🎓</span>
          Marks & CGPA Performance Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
          Track semester SGPAs, subject internal scores, and target grade projections.
        </p>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-purple-500/30 flex items-center gap-3.5 sm:gap-5 shadow-lg">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
            8.24
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Cumulative CGPA</span>
            <h3 className="font-poppins font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 truncate">8.24 / 10.0</h3>
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5 truncate">
              <TrendingUp className="w-3 h-3 shrink-0" /> Top 10% of Batch
            </p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-emerald-500/30 flex items-center gap-3.5 sm:gap-5 shadow-lg">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
            8.55
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Target Sem 6 SGPA</span>
            <h3 className="font-poppins font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 truncate">8.55 SGPA</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Estimated based on midterms</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-amber-500/30 flex items-center gap-3.5 sm:gap-5 shadow-lg sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
            138
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Credits Completed</span>
            <h3 className="font-poppins font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 truncate">138 Credits</h3>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 truncate">Degree completion: 82%</p>
          </div>
        </div>
      </div>

      {/* Current Semester Subject Breakdown */}
      <div className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/50 pb-3">
          <h2 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Semester 6 Subject Scores & Midterm Evaluation
          </h2>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Current Session</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-poppins">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-slate-800/50 text-slate-400 text-[11px]">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Internal Marks</th>
                <th className="py-3 px-4">Midterm Score</th>
                <th className="py-3 px-4">Projected Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/40">
              {currentSubjectGrades.map((sub, idx) => (
                <tr key={idx} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{sub.subject}</td>
                  <td className="py-3 px-4 text-slate-500">{sub.code}</td>
                  <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">{sub.internal}/{sub.maxInternal}</td>
                  <td className="py-3 px-4 font-medium text-purple-600 dark:text-purple-400">{sub.midterm}/{sub.maxMidterm}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      {sub.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Semester History Timeline */}
      <div className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-xl space-y-4">
        <h2 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-500" />
          Semester History & SGPA Progression
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {semesterHistory.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 text-center"
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase">{item.sem}</span>
              <div className="font-poppins font-black text-xl text-slate-800 dark:text-slate-100 my-1">
                {item.sgpa}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {item.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
