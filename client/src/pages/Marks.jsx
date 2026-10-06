import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GraduationCap, Award, TrendingUp, BookOpen, Star, Plus, Save, CheckCircle2, AlertTriangle, Users, Filter, BarChart3, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Marks = () => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const isFaculty = user?.role === 'faculty';

  // Faculty State
  const [selectedClass, setSelectedClass] = useState('div_ita_1');
  const [assignedClasses, setAssignedClasses] = useState([
    { divisionId: 'div_ita_1', divisionName: 'IT-A', subjectName: 'Big Data Analysis', subjectCode: 'IT601' },
    { divisionId: 'div_itb_1', divisionName: 'IT-B', subjectName: 'Machine Learning', subjectCode: 'IT602' },
    { divisionId: 'div_itc_1', divisionName: 'IT-C', subjectName: 'Product Design and Development', subjectCode: 'IT604' }
  ]);
  const [selectedSubject, setSelectedSubject] = useState('Big Data Analysis');
  const [assessmentComponent, setAssessmentComponent] = useState('ISE 1');
  const [maxScore, setMaxScore] = useState(20);

  useEffect(() => {
    if (isFaculty) {
      const fetchClasses = async () => {
        try {
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('/api/academic/my-classes', { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setAssignedClasses(data);
              const defaultForDiv = data.find(c => (c.divisionId || c.id) === selectedClass);
              if (defaultForDiv) setSelectedSubject(defaultForDiv.subjectName);
            }
          }
        } catch (e) {}
      };
      fetchClasses();
    }
  }, [isFaculty, token]);

  const assignedSubjectsForDiv = assignedClasses.filter(c => (c.divisionId || c.id) === selectedClass);

  useEffect(() => {
    if (assignedSubjectsForDiv.length > 0) {
      const exists = assignedSubjectsForDiv.some(s => s.subjectName === selectedSubject);
      if (!exists) {
        setSelectedSubject(assignedSubjectsForDiv[0].subjectName);
      }
    }
  }, [selectedClass, assignedClasses]);

  // Assessment Component Default Max Score Auto-Setter
  useEffect(() => {
    if (assessmentComponent === 'ISE 1' || assessmentComponent === 'ISE 2') {
      setMaxScore(20);
    } else if (assessmentComponent === 'ESE') {
      setMaxScore(60);
    } else if (assessmentComponent === 'PR/OR' || assessmentComponent === 'TW') {
      setMaxScore(25);
    }
  }, [assessmentComponent]);

  const initialRosters = {
    div_ita_1: [
      { id: 's1', rollNo: 'IT-2023-01', name: 'Nihaarika Shitap', score: 18, status: 'Published' },
      { id: 's2', rollNo: 'IT-2023-02', name: 'Aarav Sharma', score: 19, status: 'Published' },
      { id: 's3', rollNo: 'IT-2023-03', name: 'Ananya Patel', score: 15, status: 'Published' },
      { id: 's4', rollNo: 'IT-2023-04', name: 'Rohan Verma', score: 7, status: 'Attention' },
      { id: 's5', rollNo: 'IT-2023-05', name: 'Priya Iyer', score: 17, status: 'Published' },
    ],
    div_itb_1: [
      { id: 's6', rollNo: 'IT-2023-06', name: 'Kabir Mehta', score: 16, status: 'Published' },
      { id: 's7', rollNo: 'IT-2023-07', name: 'Diya Sen', score: 18, status: 'Published' },
      { id: 's8', rollNo: 'IT-2023-08', name: 'Devansh Joshi', score: 6, status: 'Attention' },
    ],
    div_itc_1: [
      { id: 's9', rollNo: 'IT-2023-09', name: 'Siddharth Rao', score: 14, status: 'Published' },
      { id: 's10', rollNo: 'IT-2023-10', name: 'Tara Nair', score: 17, status: 'Published' },
    ]
  };

  const [rosterScores, setRosterScores] = useState(initialRosters[selectedClass]);

  useEffect(() => {
    setRosterScores(initialRosters[selectedClass] || []);
  }, [selectedClass]);

  const handleScoreChange = (id, newScore) => {
    const parsed = Math.min(Number(maxScore), Math.max(0, Number(newScore) || 0));
    setRosterScores(prev => prev.map(s => s.id === id ? { ...s, score: parsed, status: 'Modified' } : s));
  };

  const handlePublishMarks = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const payload = {
        divisionId: selectedClass,
        subject: selectedSubject,
        type: assessmentComponent,
        records: rosterScores.map(s => ({ studentId: s.id, score: s.score, maxScore: Number(maxScore) }))
      };

      await fetch('/api/academic/batch-marks', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }).catch(() => {});

      const passThreshold = Math.ceil(Number(maxScore) * 0.4);
      setRosterScores(prev => prev.map(s => ({ ...s, status: s.score < passThreshold ? 'Attention' : 'Published' })));
      addToast(`Evaluation ${assessmentComponent} for ${selectedSubject} published!`, 'success', '🎓');
    } catch (err) {
      addToast('Failed to publish marks', 'error');
    }
  };

  // Compute faculty analytics
  const scoresArr = rosterScores.map(s => s.score);
  const classAvg = scoresArr.length ? (scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length).toFixed(1) : 0;
  const maxClassScore = scoresArr.length ? Math.max(...scoresArr) : 0;
  const passThreshold = Math.ceil(Number(maxScore) * 0.4);
  const passCount = rosterScores.filter(s => s.score >= passThreshold).length;
  const passPercentage = rosterScores.length ? Math.round((passCount / rosterScores.length) * 100) : 0;
  const lowScorers = rosterScores.filter(s => s.score < passThreshold);

  // Student Scheme State
  const [subjectSchemeGrades, setSubjectSchemeGrades] = useState([
    { subject: 'Database Management Systems', code: 'PCC-IT 601', credits: 4, ise1: 18, maxIse1: 20, ise2: 17, maxIse2: 20, ese: 52, maxEse: 60, prOr: 22, maxPrOr: 25, tw: 23, maxTw: 25, total: 132, maxTotal: 150, grade: 'O (Outstanding)' },
    { subject: 'Computer Networks', code: 'PEC-IT 602', credits: 4, ise1: 16, maxIse1: 20, ise2: 15, maxIse2: 20, ese: 48, maxEse: 60, prOr: 20, maxPrOr: 25, tw: 21, maxTw: 25, total: 120, maxTotal: 150, grade: 'A+' },
    { subject: 'Operating Systems', code: 'PCC-IT 603', credits: 3, ise1: 19, maxIse1: 20, ise2: 18, maxIse2: 20, ese: 54, maxEse: 60, prOr: 0, maxPrOr: 0, tw: 22, maxTw: 25, total: 113, maxTotal: 125, grade: 'O (Outstanding)' },
    { subject: 'Software Engineering', code: 'PCC-IT 604', credits: 3, ise1: 14, maxIse1: 20, ise2: 16, maxIse2: 20, ese: 44, maxEse: 60, prOr: 0, maxPrOr: 0, tw: 20, maxTw: 25, total: 94, maxTotal: 125, grade: 'A' },
    { subject: 'Web Technologies Lab', code: 'PCC-IT 605L', credits: 2, ise1: 0, maxIse1: 0, ise2: 0, maxIse2: 0, ese: 0, maxEse: 0, prOr: 24, maxPrOr: 25, tw: 24, maxTw: 25, total: 48, maxTotal: 50, grade: 'O (Outstanding)' }
  ]);

  useEffect(() => {
    if (!isFaculty) {
      const fetchMarks = async () => {
        try {
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('/api/academic/marks', { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setSubjectSchemeGrades(data.map(m => {
                const totalScored = m.total || ((m.ise1 || 0) + (m.ise2 || 0) + (m.ese || 0) + (m.prOr || 0) + (m.tw || 0));
                const totalMax = m.maxTotal || 150;
                const pct = Math.round((totalScored / totalMax) * 100);
                return {
                  subject: m.subject || 'Database Systems',
                  code: m.subjectCode || m.code || 'PCC-IT 601',
                  credits: m.credits || 4,
                  ise1: m.ise1 !== undefined ? m.ise1 : 18,
                  maxIse1: m.maxIse1 || 20,
                  ise2: m.ise2 !== undefined ? m.ise2 : 17,
                  maxIse2: m.maxIse2 || 20,
                  ese: m.ese !== undefined ? m.ese : 52,
                  maxEse: m.maxEse || 60,
                  prOr: m.prOr !== undefined ? m.prOr : 22,
                  maxPrOr: m.maxPrOr || 25,
                  tw: m.tw !== undefined ? m.tw : 23,
                  maxTw: m.maxTw || 25,
                  total: totalScored,
                  maxTotal: totalMax,
                  grade: m.grade || (pct >= 90 ? 'O (Outstanding)' : pct >= 80 ? 'A+' : 'A')
                };
              }));
            }
          }
        } catch (err) {}
      };
      fetchMarks();
    }
  }, [isFaculty, token]);

  const semesterHistory = [
    { sem: 'Semester 1', sgpa: 8.10, credits: 24, status: 'Completed' },
    { sem: 'Semester 2', sgpa: 8.35, credits: 24, status: 'Completed' },
    { sem: 'Semester 3', sgpa: 7.90, credits: 22, status: 'Completed' },
    { sem: 'Semester 4', sgpa: 8.45, credits: 22, status: 'Completed' },
    { sem: 'Semester 5', sgpa: 8.40, credits: 24, status: 'Completed' },
    { sem: 'Semester 6', sgpa: 8.55, credits: 16, status: 'In Progress ⚡' }
  ];

  // Render Faculty View
  if (isFaculty) {
    return (
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-purple-500/10 text-purple-500">🎓</span>
              Academic Assessment Workstation
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
              Faculty Management • Evaluate students according to official Autonomous College Scheme (ISE 1, ISE 2, ESE, PR/OR, TW).
            </p>
          </div>

          <button
            onClick={handlePublishMarks}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-poppins text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            Publish Evaluation Marks
          </button>
        </div>

        {/* Persistent Class, Subject & Assessment Selectors */}
        <div className="glass-card rounded-3xl p-5 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
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

            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Scheme Component:</span>
              <select
                value={assessmentComponent}
                onChange={(e) => setAssessmentComponent(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-purple-700 dark:text-purple-300 focus:outline-none focus:border-purple-500"
              >
                <option value="ISE 1">ISE 1 (In-Semester Eval 1 • Max 20)</option>
                <option value="ISE 2">ISE 2 (In-Semester Eval 2 • Max 20)</option>
                <option value="ESE">ESE (End Semester Exam • Max 60)</option>
                <option value="PR/OR">PR/OR (Practical & Oral • Max 25)</option>
                <option value="TW">TW (Term Work • Max 25)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500">Max Score:</span>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className="w-16 px-2.5 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Class Analytics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-purple-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
              {classAvg}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Class Average</span>
              <h4 className="font-poppins font-black text-lg text-slate-800 dark:text-slate-100">{classAvg} / {maxScore}</h4>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              {maxClassScore}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Highest Score</span>
              <h4 className="font-poppins font-black text-lg text-slate-800 dark:text-slate-100">{maxClassScore} / {maxScore}</h4>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              {passPercentage}%
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Pass Rate</span>
              <h4 className="font-poppins font-black text-lg text-slate-800 dark:text-slate-100">{passCount} of {rosterScores.length} passed</h4>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-amber-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              {lowScorers.length}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Intervention Needed</span>
              <h4 className="font-poppins font-black text-lg text-amber-600 dark:text-amber-400">&lt; {passThreshold} marks</h4>
            </div>
          </div>
        </div>

        {/* Low Scorer Attention Banner */}
        {lowScorers.length > 0 && (
          <div className="glass-card rounded-3xl p-5 border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Assessment Warning ({lowScorers.length} student scored below 40% threshold in {assessmentComponent})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowScorers.map(s => (
                <span key={s.id} className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold text-xs flex items-center gap-1.5">
                  <span>{s.name} ({s.rollNo})</span>
                  <span className="font-bold text-rose-600">[{s.score}/{maxScore}]</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roster Evaluation Table */}
        <div className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/50 pb-3">
            <h2 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Student Evaluation Sheet • {assessmentComponent} ({selectedSubject})
            </h2>
            <span className="text-xs font-semibold text-slate-500">{rosterScores.length} Enrolled Students</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-poppins">
              <thead>
                <tr className="border-b border-slate-200/40 dark:border-slate-800/50 text-slate-400 text-[11px]">
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">{assessmentComponent} Score (Max {maxScore})</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/40">
                {rosterScores.map((student) => {
                  const pct = Math.round((student.score / maxScore) * 100);
                  const gradeStr = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 50 ? 'B' : 'F';
                  return (
                    <tr key={student.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{student.rollNo}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">{student.name}</td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          value={student.score}
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          className="w-24 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">{pct}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-xl font-bold text-[10px] ${
                          pct >= 80 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                          pct >= 50 ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                          'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        }`}>
                          {gradeStr}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold ${
                          student.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600' :
                          student.status === 'Modified' ? 'bg-purple-500/15 text-purple-600 font-bold' :
                          'bg-amber-500/15 text-amber-600 font-bold'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render Student View (Official Autonomous Scheme Matrix)
  const totalEarned = subjectSchemeGrades.reduce((sum, item) => sum + item.total, 0);
  const totalMaxPossible = subjectSchemeGrades.reduce((sum, item) => sum + item.maxTotal, 0);
  const totalCredits = subjectSchemeGrades.reduce((sum, item) => sum + item.credits, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-purple-500/10 text-purple-500">🎓</span>
            Academic Scheme & Evaluation Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
            Thakur College of Engineering & Technology (TCET Autonomous) • Department of Information Technology (CBCGS-HME Scheme)
          </p>
        </div>
      </div>

      {/* Scheme Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card rounded-3xl p-5 border border-purple-500/30 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-black shrink-0">
            8.24
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Cumulative CGPA</span>
            <h3 className="font-poppins font-black text-xl text-slate-800 dark:text-slate-100 truncate">8.24 / 10.0</h3>
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5 truncate">
              <TrendingUp className="w-3 h-3 shrink-0" /> Top 10% Batch
            </p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-emerald-500/30 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-black shrink-0">
            {totalCredits}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Sem 6 Scheme Credits</span>
            <h3 className="font-poppins font-black text-xl text-slate-800 dark:text-slate-100 truncate">{totalCredits} Credits</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Total 174 Degree Credits</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-indigo-500/30 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-black shrink-0">
            87%
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Internal Assessment (IA)</span>
            <h3 className="font-poppins font-black text-xl text-indigo-600 dark:text-indigo-400 truncate">34.8 / 40 Avg</h3>
            <p className="text-[11px] text-indigo-500 font-semibold mt-0.5 truncate">ISE 1 & ISE 2 Combined</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-amber-500/30 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black shrink-0">
            {Math.round((totalEarned / totalMaxPossible) * 100)}%
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Grand Total Score</span>
            <h3 className="font-poppins font-black text-xl text-slate-800 dark:text-slate-100 truncate">{totalEarned} / {totalMaxPossible}</h3>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 truncate">Continuous Evaluation</p>
          </div>
        </div>
      </div>

      {/* Autonomous College Academic Scheme Matrix Table */}
      <div className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/40 dark:border-slate-800/50 pb-3 gap-2">
          <div>
            <h2 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-500" />
              Choice Based Credit Grading Scheme (CBCGS-HME) • Course Evaluation Breakdown
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Modes of Evaluation: ISE 1 (20) • ISE 2 (20) • IA Total (40) • ESE (60) • PR/OR (25/50) • TW (25/50)</p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl self-start sm:self-auto">
            Autonomous Scheme 2025-26
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-poppins">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-slate-800/50 text-slate-400 text-[11px] uppercase">
                <th className="py-3 px-3">Course Code & Title</th>
                <th className="py-3 px-2 text-center">Credits</th>
                <th className="py-3 px-2 text-center bg-purple-500/5 dark:bg-purple-500/10">ISE 1 (20)</th>
                <th className="py-3 px-2 text-center bg-purple-500/5 dark:bg-purple-500/10">ISE 2 (20)</th>
                <th className="py-3 px-2 text-center font-bold text-purple-600 dark:text-purple-400 bg-purple-500/15">IA (40)</th>
                <th className="py-3 px-2 text-center bg-indigo-500/5 dark:bg-indigo-500/10">ESE (60)</th>
                <th className="py-3 px-2 text-center">PR/OR (25)</th>
                <th className="py-3 px-2 text-center">TW (25)</th>
                <th className="py-3 px-3 text-center font-bold">Total Marks</th>
                <th className="py-3 px-3 text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/40">
              {subjectSchemeGrades.map((sub, idx) => {
                const iaTotal = (sub.ise1 || 0) + (sub.ise2 || 0);
                return (
                  <tr key={idx} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{sub.subject}</div>
                      <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400">{sub.code}</div>
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold text-slate-700 dark:text-slate-300">{sub.credits}</td>
                    <td className="py-3.5 px-2 text-center font-semibold text-slate-700 dark:text-slate-300 bg-purple-500/5 dark:bg-purple-500/10">
                      {sub.maxIse1 > 0 ? `${sub.ise1}/${sub.maxIse1}` : '—'}
                    </td>
                    <td className="py-3.5 px-2 text-center font-semibold text-slate-700 dark:text-slate-300 bg-purple-500/5 dark:bg-purple-500/10">
                      {sub.maxIse2 > 0 ? `${sub.ise2}/${sub.maxIse2}` : '—'}
                    </td>
                    <td className="py-3.5 px-2 text-center font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/15">
                      {sub.maxIse1 + sub.maxIse2 > 0 ? `${iaTotal}/40` : '—'}
                    </td>
                    <td className="py-3.5 px-2 text-center font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10">
                      {sub.maxEse > 0 ? `${sub.ese}/${sub.maxEse}` : '—'}
                    </td>
                    <td className="py-3.5 px-2 text-center font-medium text-emerald-600 dark:text-emerald-400">
                      {sub.maxPrOr > 0 ? `${sub.prOr}/${sub.maxPrOr}` : '—'}
                    </td>
                    <td className="py-3.5 px-2 text-center font-medium text-teal-600 dark:text-teal-400">
                      {sub.maxTw > 0 ? `${sub.tw}/${sub.maxTw}` : '—'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-slate-800 dark:text-slate-100">
                      {sub.total} / {sub.maxTotal}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Grand Total Row */}
              <tr className="bg-purple-500/10 font-black text-slate-800 dark:text-slate-100">
                <td className="py-3 px-3">Sem 6 Scheme Grand Total</td>
                <td className="py-3 px-2 text-center">{totalCredits}</td>
                <td className="py-3 px-2 text-center">—</td>
                <td className="py-3 px-2 text-center">—</td>
                <td className="py-3 px-2 text-center text-purple-600 dark:text-purple-300">34.8 / 40 Avg</td>
                <td className="py-3 px-2 text-center">—</td>
                <td className="py-3 px-2 text-center">—</td>
                <td className="py-3 px-2 text-center">—</td>
                <td className="py-3 px-3 text-center text-purple-700 dark:text-purple-300">{totalEarned} / {totalMaxPossible}</td>
                <td className="py-3 px-3 text-right text-emerald-600">PASS (SGPA 8.55)</td>
              </tr>
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

