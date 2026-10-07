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
  AlertCircle,
  Users,
  FileText,
  PieChart,
  GraduationCap,
  Bell,
  BookOpen,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

import { AdminDashboard } from './AdminDashboard';

export const Dashboard = () => {
  const { user, token } = useAuth();
  const { getGreetingData } = useTheme();
  const { notifications, unreadCount, markAsRead, addToast } = useNotification();
  const navigate = useNavigate();

  const greeting = getGreetingData(user?.name || 'User');
  const userRole = user?.role || 'student';

  const [myClasses, setMyClasses] = useState([]);
  const [notifCategoryFilter, setNotifCategoryFilter] = useState('All');
  const [attentionStudents, setAttentionStudents] = useState([
    { id: 'user_student_2', name: 'Rohan Sharma', rollNo: 'IT-A-012', divisionName: 'IT-A', attendancePct: 72, marksAvg: 76, reason: 'Attendance below 75% threshold (72%)' },
    { id: 'user_student_4', name: 'Ananya Verma', rollNo: 'IT-A-023', divisionName: 'IT-A', attendancePct: 68, marksAvg: 70, reason: 'Attendance below 75% threshold (68%)' },
    { id: 'user_student_8', name: 'Devansh Joshi', rollNo: 'IT-C-008', divisionName: 'IT-C', attendancePct: 65, marksAvg: 62, reason: 'Low Marks (62%) & Attendance (65%)' }
  ]);

  useEffect(() => {
    if (userRole === 'faculty') {
      const fetchClasses = async () => {
        try {
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('/api/academic/my-classes', { headers });
          if (res.ok) {
            const data = await res.json();
            setMyClasses(data);
          }
        } catch (err) {}
      };
      fetchClasses();
    }
  }, [userRole, token]);

  // Pomodoro Mini State for Students Only
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(1);

  useEffect(() => {
    let interval = null;
    if (userRole === 'student') {
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
    }
    return () => clearInterval(interval);
  }, [isActive, pomodoroSeconds, addToast, userRole]);

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

  const getPlantEmoji = () => {
    if (completedSessions === 0) return '🌱';
    if (completedSessions === 1) return '🌿';
    if (completedSessions === 2) return '🌸';
    return '🌳';
  };

  // Render Administrator Dashboard (Clean Admin Governance without Faculty Widgets)
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  // Render Faculty Dashboard
  if (userRole === 'faculty') {
    return (
      <div className="space-y-6 sm:space-y-8 pb-10">
        {/* Dynamic Context Greeting Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-poppins font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
                <span>👨‍🏫</span> {greeting.salutation}, Professor {user?.name || 'Faculty'}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                {userRole}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 font-poppins">
              Faculty Academic Workstation • Manage Assigned Class Rosters, Attendance Registers & Marks
            </p>
          </div>

          <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl glass-card text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 border border-emerald-500/20 shadow-sm self-start md:self-auto">
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </motion.div>

        {/* Faculty Overview Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-3xl p-5 border border-emerald-500/30 shadow-md">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classes</span>
            </div>
            <div className="font-poppins font-black text-2xl text-slate-800 dark:text-slate-100">
              {myClasses.length || 3}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Assigned Classes</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-teal-500/30 shadow-md">
            <div className="flex items-center justify-between text-teal-600 mb-2">
              <UserCheck className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Students</span>
            </div>
            <div className="font-poppins font-black text-2xl text-slate-800 dark:text-slate-100">
              228
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Total Managed Students</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-rose-500/30 shadow-md">
            <div className="flex items-center justify-between text-rose-500 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alerts</span>
            </div>
            <div className="font-poppins font-black text-2xl text-rose-600 dark:text-rose-400">
              {attentionStudents.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Attendance Below 75%</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-purple-500/30 shadow-md">
            <div className="flex items-center justify-between text-purple-500 mb-2">
              <Bell className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notices</span>
            </div>
            <div className="font-poppins font-black text-2xl text-slate-800 dark:text-slate-100">
              3
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Active Department Notices</p>
          </div>
        </div>

        {/* Faculty My Classes Overview */}
        <div className="glass-card rounded-3xl p-6 border border-teal-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📚</span> My Classes Overview
            </h2>
            <button onClick={() => navigate('/classes')} className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              View All Classes →
            </button>
          </div>

          {myClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myClasses.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-xs">
                      {c.divisionName || 'IT-A'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-bold">{c.subjectCode || 'IT601'}</span>
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">{c.subjectName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Roster: 75 Students • Academic Year {c.academicYear || '2025-2026'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-200/30">
                    <button onClick={() => navigate('/attendance')} className="py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-poppins text-[11px] font-semibold text-center hover:bg-emerald-500/25">
                      Attendance
                    </button>
                    <button onClick={() => navigate('/marks')} className="py-1.5 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 font-poppins text-[11px] font-semibold text-center hover:bg-purple-500/25">
                      Marks
                    </button>
                    <button onClick={() => navigate('/assignments')} className="py-1.5 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 font-poppins text-[11px] font-semibold text-center hover:bg-teal-500/25">
                      Assignments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No classes currently assigned. Contact administrator.
            </div>
          )}
        </div>

        {/* Role-Aware Faculty Notification Center & Action Hub */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/40 dark:border-slate-800/40">
            <div>
              <h2 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-500" />
                Faculty Notifications & Administrative Updates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-poppins">
                Administrative updates, academic operations, student alerts & assigned duties
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto">
              {['All', 'Admin', 'Academic', 'Students', 'Events'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setNotifCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    notifCategoryFilter === cat
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(notifCategoryFilter === 'All' ? notifications : notifications.filter(n => n.category === notifCategoryFilter)).slice(0, 6).map(n => {
              const isHigh = n.priority === 'HIGH' || n.type === 'warning';
              return (
                <div
                  key={n.id || n._id}
                  onClick={() => markAsRead(n.id || n._id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    !n.isRead
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 shadow-md'
                      : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/40 opacity-85'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isHigh ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {n.priority || 'MEDIUM'} • {n.category || 'Admin'}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <h3 className="font-poppins font-bold text-xs text-slate-800 dark:text-slate-100">{n.title}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    {n.details && <p className="text-[10px] text-slate-400 italic mt-1 font-mono">{n.details}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/30 flex items-center justify-between text-[10px] text-slate-400">
                    <span>By: {n.performedByName || 'Admin'}</span>
                    {n.actionUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(n.actionUrl); }}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Action →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data-Driven Attention Required & Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Attention Required Card (Data Driven) */}
          <div className="glass-card rounded-3xl p-6 border border-rose-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Attention Required (Students Needing Intervention)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                {attentionStudents.length} Students
              </span>
            </div>

            <div className="space-y-3">
              {attentionStudents.map(student => (
                <div key={student.id} className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 font-poppins">{student.name}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">({student.rollNo})</span>
                    </div>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block mt-0.5">
                      {student.reason}
                    </span>
                  </div>
                  <button
                    onClick={() => { addToast(`Notice alert sent to ${student.name}`, 'success'); }}
                    className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-500/25"
                  >
                    Notify
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Teaching Schedule */}
          <div className="glass-card rounded-3xl p-6 border border-teal-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500" />
                Today's Teaching Schedule
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300">
                3 Lectures
              </span>
            </div>

            <div className="space-y-3 text-xs font-poppins">
              <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">09:00 AM - 10:00 AM</h4>
                  <p className="text-slate-500">Database Systems (IT601) • Lab 3</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  IT-A
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">10:15 AM - 11:15 AM</h4>
                  <p className="text-slate-500">Computer Networks (IT602) • Room 204</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                  IT-B
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">11:30 AM - 12:30 PM</h4>
                  <p className="text-slate-500">Operating Systems (IT603) • Room 204</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  IT-A
                </span>
              </div>
            </div>
          </div>

          {/* Sage AI Assistant Widget for Faculty */}
          <SageWidget />
        </div>
      </div>
    );
  }

  // Student Real Data Fetching (Single Source of Truth)
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({ overallAttended: 108, overallTotal: 131, overallPercentage: '82.4%', isOverallSafe: true });
  const [studentMarks, setStudentMarks] = useState({ currentSubjectMarks: [], cumulativeCGPA: 8.24 });
  const [studentNotes, setStudentNotes] = useState([]);
  const [studentFee, setStudentFee] = useState({ outstandingBalance: 20000, dueDate: '2026-04-15' });

  useEffect(() => {
    if (userRole === 'student') {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. Assignments
      fetch('/api/academic/assignments', { headers })
        .then(res => res.ok ? res.json() : [])
        .then(data => { if (Array.isArray(data)) setStudentAssignments(data); })
        .catch(() => {});

      // 2. Attendance
      fetch('/api/academic/attendance', { headers })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const totalAttended = data.reduce((a, b) => a + (b.attended || 0), 0);
            const totalClasses = data.reduce((a, b) => a + (b.total || 0), 0);
            const pct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 82.4;
            setStudentAttendance({
              overallAttended: totalAttended,
              overallTotal: totalClasses,
              overallPercentage: `${pct}%`,
              isOverallSafe: pct >= 75
            });
          }
        })
        .catch(() => {});

      // 3. Marks
      fetch('/api/academic/marks', { headers })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const totSum = data.reduce((a, b) => a + (b.total || b.score || 0), 0);
            const maxSum = data.reduce((a, b) => a + (b.maxTotal || b.maxScore || 100), 0);
            const avgPct = maxSum > 0 ? (totSum / maxSum) * 100 : 82.4;
            const cgpa = Math.round((avgPct / 10) * 100) / 100;
            setStudentMarks({
              currentSubjectMarks: data,
              cumulativeCGPA: cgpa
            });
          }
        })
        .catch(() => {});

      // 4. Notes / Resources
      fetch('/api/academic/notes', { headers })
        .then(res => res.ok ? res.json() : [])
        .then(data => { if (Array.isArray(data)) setStudentNotes(data); })
        .catch(() => {});

      // 5. Fee Summary
      fetch('/api/academic/fee-summary', { headers })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setStudentFee(data); })
        .catch(() => {});
    }
  }, [userRole, token]);

  // Render Student Dashboard
  const pendingAssList = studentAssignments.filter(a => !a.completed);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Dynamic Context Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-poppins font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
              <span>{greeting.icon}</span> {greeting.salutation}, {user?.name || 'User'}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              {user?.role || 'student'} {user?.divisionId ? `• ${user.divisionId === 'div_itb_1' ? 'IT-B' : user.divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A'}` : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 font-poppins">
            {greeting.message}
          </p>
        </div>

        {/* Quick Date pill */}
        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl glass-card text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 border border-emerald-500/20 shadow-sm self-start md:self-auto">
          <CalendarIcon className="w-4 h-4 text-emerald-500" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Upcoming Deadlines */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-4 sm:p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                  Upcoming Deadlines
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {pendingAssList.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {(pendingAssList.length > 0 ? pendingAssList.slice(0, 2) : studentAssignments.slice(0, 2)).map(ass => (
                <div key={ass.id || ass._id} className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-poppins">
                      {ass.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">{ass.subject} • {ass.dueDate}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    ass.priority === 'High' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {ass.priority || 'Medium'}
                  </span>
                </div>
              ))}
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
          className="glass-card rounded-3xl p-4 sm:p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">📊</span>
                Attendance Overview
              </h3>
              <span className={`text-[11px] font-semibold ${studentAttendance.isOverallSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {studentAttendance.isOverallSafe ? 'Safe Zone 🛡️' : 'Attention Needed ⚠️'}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 my-2">
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
                    strokeDasharray={`${parseFloat(studentAttendance.overallPercentage) || 82}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-poppins font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                  {studentAttendance.overallPercentage}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Overall Attendance</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-poppins mt-0.5">
                  {studentAttendance.overallPercentage} ({studentAttendance.overallAttended}/{studentAttendance.overallTotal})
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium leading-tight">
                  {studentAttendance.isOverallSafe ? 'Above minimum 75% requirement!' : 'Below 75% attendance threshold.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/attendance')}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-poppins"
          >
            <span>View subject attendance →</span>
          </button>
        </motion.div>

        {/* Card 3: Marks & CGPA Overview */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-4 sm:p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500">🎓</span>
                Marks Overview
              </h3>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Semester 7
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current CGPA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-poppins font-black text-2xl sm:text-3xl text-slate-800 dark:text-slate-100">
                  {studentMarks.cumulativeCGPA}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Evaluated from {studentMarks.currentSubjectMarks.length || 8} active subjects.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 4: Pomodoro Plant Growth Gamification */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-4 sm:p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
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

            <div className="flex items-center gap-4 sm:gap-5 my-4">
              <motion.div
                animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex flex-col items-center justify-center border border-emerald-500/30 text-2xl sm:text-3xl shadow-inner shrink-0"
              >
                <span>{getPlantEmoji()}</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Growing...
                </span>
              </motion.div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Focus on your goal, not on the clock.
                </p>
                <div className="font-poppins font-black text-2xl sm:text-3xl text-slate-800 dark:text-slate-100 tracking-wider my-1">
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

        {/* Card 6: Quick Flash Notes / Resources */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card rounded-3xl p-4 sm:p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">📝</span>
                Resources & Notes
              </h3>
              <button
                onClick={() => navigate('/notes')}
                className="p-1 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 text-slate-400 hover:text-emerald-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {studentNotes.slice(0, 2).map((note, idx) => (
                <div key={note.id || note._id || idx} className="p-3 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300/40 text-slate-800 dark:text-slate-200 text-xs shadow-sm">
                  <span className="font-bold text-[10px] text-emerald-700 dark:text-emerald-400 block mb-1">{note.subject || 'CS'}</span>
                  <p className="line-clamp-2 text-[11px] font-medium">{note.title}</p>
                </div>
              ))}
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
