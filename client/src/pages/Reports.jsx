import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { BarChart3, PieChart, Filter, Download, AlertTriangle, Users, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';

export const Reports = () => {
  const { token, user } = useAuth();
  const { addToast } = useNotification();
  const isFaculty = user?.role === 'faculty';

  const [selectedClass, setSelectedClass] = useState('div_ita_1');
  const [selectedSubject, setSelectedSubject] = useState('Database Management Systems');

  const classes = [
    { id: 'div_ita_1', name: 'IT-A (3rd Year)', subject: 'Database Management Systems' },
    { id: 'div_itb_1', name: 'IT-B (3rd Year)', subject: 'Computer Networks' },
    { id: 'div_itc_1', name: 'IT-C (3rd Year)', subject: 'Software Engineering' },
  ];

  const classReportsData = {
    div_ita_1: {
      totalStudents: 78,
      avgAttendance: '84%',
      passRate: '92%',
      classAvgScore: 82,
      highestScore: 96,
      lowestScore: 42,
      gradeDistribution: [
        { grade: 'O (Outstanding)', count: 24, color: 'bg-emerald-500' },
        { grade: 'A+ (Excellent)', count: 32, color: 'bg-teal-500' },
        { grade: 'A (Good)', count: 14, color: 'bg-purple-500' },
        { grade: 'B (Pass)', count: 5, color: 'bg-indigo-500' },
        { grade: 'F (Attention Required)', count: 3, color: 'bg-rose-500' },
      ],
      attendanceBrackets: [
        { bracket: '≥ 85% Attendance', count: 58, pct: '74%' },
        { bracket: '75% - 84% Attendance', count: 14, pct: '18%' },
        { bracket: '< 75% Attendance (Warning)', count: 6, pct: '8%' },
      ],
      attentionList: [
        { name: 'Rohan Verma', rollNo: 'IT-2023-04', attendance: '68%', score: 42, reason: 'Low Attendance & Low Score' },
        { name: 'Sameer Joshi', rollNo: 'IT-2023-14', attendance: '72%', score: 58, reason: 'Attendance below 75%' },
      ]
    },
    div_itb_1: {
      totalStudents: 75,
      avgAttendance: '81%',
      passRate: '89%',
      classAvgScore: 78,
      highestScore: 94,
      lowestScore: 48,
      gradeDistribution: [
        { grade: 'O (Outstanding)', count: 18, color: 'bg-emerald-500' },
        { grade: 'A+ (Excellent)', count: 28, color: 'bg-teal-500' },
        { grade: 'A (Good)', count: 18, color: 'bg-purple-500' },
        { grade: 'B (Pass)', count: 7, color: 'bg-indigo-500' },
        { grade: 'F (Attention Required)', count: 4, color: 'bg-rose-500' },
      ],
      attendanceBrackets: [
        { bracket: '≥ 85% Attendance', count: 52, pct: '69%' },
        { bracket: '75% - 84% Attendance', count: 16, pct: '21%' },
        { bracket: '< 75% Attendance (Warning)', count: 7, pct: '10%' },
      ],
      attentionList: [
        { name: 'Devansh Joshi', rollNo: 'IT-2023-08', attendance: '70%', score: 48, reason: 'Low Score & Attendance Warning' }
      ]
    }
  };

  const currReport = classReportsData[selectedClass] || classReportsData['div_ita_1'];

  const handleExportPDF = () => {
    const className = classes.find(c => c.id === selectedClass)?.name;
    addToast(`Exporting academic performance report for ${className}...`, 'success', '📄');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30 shrink-0">
            📊
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
              Academic Reports & Analytics
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
              {isFaculty ? 'Faculty Class Analytics & Performance Workstation' : 'Institutional Overview'}
            </p>
          </div>
        </div>

        {isFaculty && (
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-poppins text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            Export Class Report (PDF/CSV)
          </button>
        )}
      </div>

      {/* Class & Subject Selector */}
      {isFaculty && (
        <div className="glass-card rounded-3xl p-5 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject:</span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold">
                {classes.find(c => c.id === selectedClass)?.subject}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</span>
          <h3 className="font-poppins font-black text-2xl text-slate-800 dark:text-slate-100">{currReport.totalStudents}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <Users className="w-3 h-3" /> Active Roster
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-teal-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Class Avg Attendance</span>
          <h3 className="font-poppins font-black text-2xl text-teal-600 dark:text-teal-400">{currReport.avgAttendance}</h3>
          <p className="text-[11px] text-slate-500 font-medium">Department Target: ≥ 75%</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Pass Rate</span>
          <h3 className="font-poppins font-black text-2xl text-indigo-600 dark:text-indigo-400">{currReport.passRate}</h3>
          <p className="text-[11px] text-indigo-500 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Midterm & Lab Evaluations
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Class Average Score</span>
          <h3 className="font-poppins font-black text-2xl text-purple-600 dark:text-purple-400">{currReport.classAvgScore} / 100</h3>
          <p className="text-[11px] text-slate-500">Highest: {currReport.highestScore} | Lowest: {currReport.lowestScore}</p>
        </div>
      </div>

      {/* Grade & Attendance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-xl space-y-4">
          <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200/40 pb-3">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Grade Distribution Summary
          </h3>
          <div className="space-y-3 font-poppins text-xs">
            {currReport.gradeDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>{item.grade}</span>
                  <span>{item.count} Students ({Math.round((item.count / currReport.totalStudents) * 100)}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${(item.count / currReport.totalStudents) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-xl space-y-4">
          <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200/40 pb-3">
            <PieChart className="w-4 h-4 text-teal-500" />
            Attendance Brackets
          </h3>
          <div className="space-y-3 font-poppins text-xs">
            {currReport.attendanceBrackets.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.bracket}</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{item.count} Students ({item.pct})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intervention & Attention Required Table */}
      {currReport.attentionList.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-amber-500/5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm border-b border-amber-500/20 pb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Class Intervention List ({currReport.attentionList.length} Students Needing Support)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-poppins">
              <thead>
                <tr className="text-slate-400 border-b border-amber-500/20">
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Midterm Score</th>
                  <th className="py-2.5 px-3">Intervention Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/15">
                {currReport.attentionList.map((st, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-mono font-medium text-slate-500">{st.rollNo}</td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{st.name}</td>
                    <td className="py-3 px-3 font-bold text-rose-600">{st.attendance}</td>
                    <td className="py-3 px-3 font-bold text-purple-600">{st.score} / 100</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                        {st.reason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
