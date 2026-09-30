import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, PieChart } from 'lucide-react';

export const Reports = () => {
  const { token, user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        let res;
        try {
          res = await fetch('/api/academic/reports', { headers });
          if (!res.ok && res.status === 404) {
            res = await fetch('http://localhost:5000/api/academic/reports', { headers });
          }
        } catch (e) {
          res = await fetch('http://localhost:5000/api/academic/reports', { headers });
        }
        if (res && res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [token]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30 shrink-0">
            📊
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100">
              Academic Reports & Analytics
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
              {user?.role === 'admin' ? 'Institutional Overview' : 'Faculty Class Analytics'}
            </p>
          </div>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              {report.reportType}
            </h3>
            {report.averageAttendance && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-poppins">
                Average Attendance: <span className="font-bold text-emerald-600">{report.averageAttendance}</span>
              </p>
            )}
            {report.overallAttendanceAvg && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-poppins">
                Overall Institutional Attendance: <span className="font-bold text-emerald-600">{report.overallAttendanceAvg}</span>
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
            <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-500" />
              Performance Metrics
            </h3>
            {report.classPerformance && report.classPerformance.map((c, i) => (
              <div key={i} className="text-xs text-slate-700 dark:text-slate-200 flex justify-between border-b border-slate-200/30 py-1.5">
                <span>{c.subject}</span>
                <span className="font-bold text-teal-600">Avg Score: {c.avgScore} | Attendance: {c.attendanceAvg}</span>
              </div>
            ))}
            {report.departmentPerformance && report.departmentPerformance.map((d, i) => (
              <div key={i} className="text-xs text-slate-700 dark:text-slate-200 flex justify-between border-b border-slate-200/30 py-1.5">
                <span>{d.dept}</span>
                <span className="font-bold text-teal-600">CGPA: {d.avgCGPA} | Attendance: {d.attendance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
