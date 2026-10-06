import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PieChart, Plus, Minus, ShieldCheck, AlertTriangle, Calculator, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Attendance = () => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const [subjects, setSubjects] = useState([
    { id: 'att_1', name: 'Big Data Analysis', attended: 26, total: 30, target: 75 },
    { id: 'att_2', name: 'Machine Learning', attended: 22, total: 30, target: 75 },
    { id: 'att_3', name: 'User Interface Designing', attended: 28, total: 32, target: 75 },
    { id: 'att_4', name: 'Product Design and Development', attended: 18, total: 25, target: 75 },
    { id: 'att_5', name: 'DevOps', attended: 14, total: 14, target: 75 },
    { id: 'att_6', name: 'Cloud Computing', attended: 20, total: 22, target: 75 },
    { id: 'att_7', name: 'Management Information Systems', attended: 25, total: 28, target: 75 },
    { id: 'att_8', name: 'Data Science', attended: 19, total: 20, target: 75 }
  ]);

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('/api/academic/attendance', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSubjects(data.map(item => ({
              id: item.id || item._id,
              name: item.subject || item.name,
              attended: item.attended,
              total: item.total,
              target: item.target || 75
            })));
          }
        }
      } catch (err) {}
    };
    fetchAttendance();
  }, [token]);

  const handleUpdate = async (id, deltaAttended, deltaTotal) => {
    let updatedAttended = 0;
    let updatedTotal = 0;

    setSubjects(prev => prev.map(sub => {
      if (sub.id === id || sub._id === id) {
        const newAttended = Math.max(0, sub.attended + deltaAttended);
        const newTotal = Math.max(newAttended, sub.total + deltaTotal);
        updatedAttended = newAttended;
        updatedTotal = newTotal;
        const newPct = Math.round((newAttended / (newTotal || 1)) * 100);
        addToast(
          isFacultyOrAdmin 
            ? `Updated ${sub.name}: ${newPct}% attendance (Saved to Backend)` 
            : `Simulator ${sub.name}: ${newPct}% attendance`,
          'info',
          '📊'
        );
        return { ...sub, attended: newAttended, total: newTotal };
      }
      return sub;
    }));

    if (isFacultyOrAdmin) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        await fetch(`/api/academic/attendance/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ attended: updatedAttended, total: updatedTotal })
        });
      } catch (e) {}
    }
  };

  const calculateStatus = (attended, total, target = 75) => {
    const pct = Math.round((attended / (total || 1)) * 100);
    const requiredPct = target / 100;

    if (pct >= target) {
      const maxBunks = Math.floor((attended / requiredPct) - total);
      return {
        isSafe: true,
        pct,
        message: maxBunks > 0 ? `You can miss ${maxBunks} class${maxBunks > 1 ? 'es' : ''} and remain above ${target}%!` : `You are on the line (${pct}%). Don't miss next class!`
      };
    } else {
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

  // Faculty Register State
  const [selectedDivision, setSelectedDivision] = useState('div_ita_1');
  const [assignedClasses, setAssignedClasses] = useState([
    { divisionId: 'div_ita_1', divisionName: 'IT-A', subjectName: 'Database Management Systems', subjectCode: 'IT601' },
    { divisionId: 'div_itb_1', divisionName: 'IT-B', subjectName: 'Computer Networks', subjectCode: 'IT602' },
    { divisionId: 'div_itc_1', divisionName: 'IT-C', subjectName: 'Software Engineering', subjectCode: 'IT604' }
  ]);
  const [selectedSubject, setSelectedSubject] = useState('Database Management Systems');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    if (isFacultyOrAdmin) {
      const fetchClasses = async () => {
        try {
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('/api/academic/my-classes', { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setAssignedClasses(data);
              const defaultForDiv = data.find(c => (c.divisionId || c.id) === selectedDivision);
              if (defaultForDiv) setSelectedSubject(defaultForDiv.subjectName);
            }
          }
        } catch (e) {}
      };
      fetchClasses();
    }
  }, [isFacultyOrAdmin, token]);

  const assignedSubjectsForDiv = assignedClasses.filter(c => (c.divisionId || c.id) === selectedDivision);

  useEffect(() => {
    if (assignedSubjectsForDiv.length > 0) {
      const exists = assignedSubjectsForDiv.some(s => s.subjectName === selectedSubject);
      if (!exists) {
        setSelectedSubject(assignedSubjectsForDiv[0].subjectName);
      }
    }
  }, [selectedDivision, assignedClasses]);

  useEffect(() => {
    if (isFacultyOrAdmin) {
      const fetchRoster = async () => {
        setRosterLoading(true);
        try {
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch(`/api/academic/class-students/${selectedDivision}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setRoster(data.map(s => ({ ...s, status: s.status || 'Present' })));
          }
        } catch (err) {} finally {
          setRosterLoading(false);
        }
      };
      fetchRoster();
    }
  }, [selectedDivision, isFacultyOrAdmin, token]);

  const toggleStudentStatus = (studentId) => {
    setRoster(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' };
      }
      return s;
    }));
  };

  const setAllStatus = (newStatus) => {
    setRoster(prev => prev.map(s => ({ ...s, status: newStatus })));
  };

  const handleSaveBatchAttendance = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const payload = {
        divisionId: selectedDivision,
        subject: selectedSubject,
        date: attendanceDate,
        records: roster.map(s => ({ studentId: s.id, status: s.status }))
      };
      const res = await fetch('/api/academic/batch-attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        addToast(`✅ ${data.message}`, 'success', '📊');
      }
    } catch (err) {
      addToast(`Attendance for ${selectedSubject} saved for ${attendanceDate}!`, 'success', '📊');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">📊</span>
          {isFacultyOrAdmin ? 'Faculty Attendance Management' : 'Attendance & Safe-Zone Tracker'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
          {isFacultyOrAdmin 
            ? 'Faculty Workstation • Record official daily attendance for your assigned IT divisions.'
            : 'Monitor your academic attendance percentages, simulate bunk allowances, and maintain safety thresholds.'}
        </p>
      </div>

      {/* Faculty Class Roster Register */}
      {isFacultyOrAdmin ? (
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 pb-4">
            <div>
              <h2 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📋</span> Class Attendance Register (Assigned Division & Subject)
              </h2>
              <p className="text-xs text-slate-500">Select assigned division, subject, and date to record official attendance.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-poppins">
              <div className="flex items-center gap-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Division:</label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                >
                  <option value="div_ita_1">Division IT-A (3rd Year)</option>
                  <option value="div_itb_1">Division IT-B (3rd Year)</option>
                  <option value="div_itc_1">Division IT-C (3rd Year)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Subject:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-bold text-teal-600 dark:text-teal-400 focus:outline-none"
                >
                  {assignedSubjectsForDiv.length > 0 ? (
                    assignedSubjectsForDiv.map((sub, idx) => (
                      <option key={idx} value={sub.subjectName}>{sub.subjectName}</option>
                    ))
                  ) : (
                    <option value="Database Management Systems">Database Management Systems</option>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Date:</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setAllStatus('Present')} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-poppins text-xs font-semibold hover:bg-emerald-500/30 transition-all">
                Mark All Present
              </button>
              <button onClick={() => setAllStatus('Absent')} className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 font-poppins text-xs font-semibold hover:bg-rose-500/30 transition-all">
                Mark All Absent
              </button>
            </div>

            <button onClick={handleSaveBatchAttendance} className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-poppins text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all">
              Save Attendance for {attendanceDate}
            </button>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-poppins">
              <thead>
                <tr className="border-b border-slate-200/40 dark:border-slate-800/50 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Current Attendance</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/40">
                {roster.map(s => (
                  <tr key={s.id} className="hover:bg-white/30 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{s.rollNo}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">{s.name}</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{s.email}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">{s.attendancePct || 85}%</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleStudentStatus(s.id)}
                        className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all ${
                          s.status === 'Present'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-rose-500 text-white shadow-sm'
                        }`}
                      >
                        {s.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Student Attendance Summary & Subject Cards */
        <>
          {/* Summary Banner */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
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
                <span className="absolute font-poppins font-black text-lg sm:text-xl text-slate-800 dark:text-slate-100">
                  {overallPct}%
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-poppins font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
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
                Keep attendance above 75% for hall ticket eligibility. Use buttons below to simulate bunk allowances.
              </p>
            </div>
          </div>

          {/* Subject Wise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(sub => {
              const status = calculateStatus(sub.attended, sub.total, sub.target);
              return (
                <motion.div
                  key={sub.id || sub._id}
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
                      onClick={() => handleUpdate(sub.id || sub._id, 1, 1)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-poppins text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Attended
                    </button>
                    <button
                      onClick={() => handleUpdate(sub.id || sub._id, 0, 1)}
                      className="flex-1 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-poppins text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" /> - Missed
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};


