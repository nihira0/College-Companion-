const { Assignment, Attendance, Mark, Notice, Note, Reminder } = require('../models/AcademicModels');

// Initial default demo dataset
let mockAssignments = [
  { id: 'ass_1', userId: 'user_demo_123', title: 'DBMS Relational Algebra & SQL', subject: 'Database Management Systems', dueDate: 'Tomorrow, 11:59 PM', priority: 'High', completed: false, details: 'Submit ER diagrams and Query outputs on Google Classroom' },
  { id: 'ass_2', userId: 'user_demo_123', title: 'CN Socket Programming Lab Report', subject: 'Computer Networks', dueDate: 'May 18, 2026', priority: 'Medium', completed: false, details: 'Include packet capture screenshots from Wireshark' },
  { id: 'ass_3', userId: 'user_demo_123', title: 'OS Deadlock Resolution Essay', subject: 'Operating Systems', dueDate: 'May 21, 2026', priority: 'Low', completed: true, details: 'Banker algorithm simulation code attached' },
  { id: 'ass_4', userId: 'user_demo_123', title: 'Software Engineering Agile Sprint', subject: 'Software Engineering', dueDate: 'May 25, 2026', priority: 'High', completed: false, details: 'Prepare Jira user stories and velocity chart' }
];

let mockAttendance = [
  { id: 'att_1', userId: 'user_demo_123', subject: 'Database Systems', attended: 26, total: 30, target: 75 },
  { id: 'att_2', userId: 'user_demo_123', subject: 'Computer Networks', attended: 22, total: 30, target: 75 },
  { id: 'att_3', userId: 'user_demo_123', subject: 'Operating Systems', attended: 28, total: 32, target: 75 },
  { id: 'att_4', userId: 'user_demo_123', subject: 'Software Engineering', attended: 18, total: 25, target: 75 },
  { id: 'att_5', userId: 'user_demo_123', subject: 'Web Technologies Lab', attended: 14, total: 14, target: 75 }
];

let mockMarks = [
  { id: 'mark_1', userId: 'user_demo_123', subject: 'DBMS', score: 88, maxScore: 100, type: 'Midterm 1', semester: 6 },
  { id: 'mark_2', userId: 'user_demo_123', subject: 'Computer Networks', score: 82, maxScore: 100, type: 'Midterm 1', semester: 6 },
  { id: 'mark_3', userId: 'user_demo_123', subject: 'Operating Systems', score: 91, maxScore: 100, type: 'Midterm 1', semester: 6 },
  { id: 'mark_4', userId: 'user_demo_123', subject: 'Software Engineering', score: 79, maxScore: 100, type: 'Midterm 1', semester: 6 },
  { id: 'mark_5', userId: 'user_demo_123', subject: 'Web Technologies', score: 95, maxScore: 100, type: 'Practical', semester: 6 }
];

let mockNotices = [
  { id: 'not_1', title: 'Final Semester Exam Schedule Released', date: 'May 12, 2026', category: 'Exams', content: 'The end-semester examinations will commence from June 5th. Detailed timetable is posted on the department portal.', urgent: true },
  { id: 'not_2', title: 'Annual Hackathon "HackNature 2026" Registration Open', date: 'May 10, 2026', category: 'Events', content: 'Team registrations are open until May 20th. Cash prizes up to $5,000 for top 3 AI and Web projects.', urgent: false },
  { id: 'not_3', title: 'Library Extended Hours During Study Break', date: 'May 08, 2026', category: 'General', content: 'Central Library will remain open 24/7 starting May 15th to support students preparing for finals.', urgent: false }
];

let mockNotes = [
  { id: 'note_1', userId: 'user_demo_123', title: 'DBMS Chapter 3: Normalization', subject: 'DBMS', content: '1NF: Atomic values. 2NF: No partial dependency. 3NF: No transitive dependency. BCNF: Strict determinant rule.', color: 'yellow' },
  { id: 'note_2', userId: 'user_demo_123', title: 'OS Deadlock Conditions', subject: 'Operating Systems', content: '4 Coffman conditions: 1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait.', color: 'purple' },
  { id: 'note_3', userId: 'user_demo_123', title: 'CN Lab Viva Quick Prep', subject: 'Computer Networks', content: 'TCP vs UDP: Connection oriented vs connectionless. 3-way handshake SYN, SYN-ACK, ACK. OSI 7 layers mnemonic: Please Do Not Touch Steve\'s Pet Alligator.', color: 'green' }
];

let mockReminders = [
  { id: 'rem_1', userId: 'user_demo_123', title: 'Submit DBMS Assignment 3', time: '10:30 AM', completed: false },
  { id: 'rem_2', userId: 'user_demo_123', title: 'CN Lab Viva Practice', time: '02:15 PM', completed: true },
  { id: 'rem_3', userId: 'user_demo_123', title: 'Group Study Session for OS', time: '06:00 PM', completed: false }
];

// Helper to handle DB or fallback
const getAssignments = async (req, res) => {
  try {
    const items = await Assignment.find({ userId: req.user.id });
    if (items && items.length > 0) return res.json(items);
  } catch (e) {}
  res.json(mockAssignments);
};

const createAssignment = async (req, res) => {
  const { title, subject, dueDate, priority, details } = req.body;
  try {
    const newItem = new Assignment({ userId: req.user.id, title, subject, dueDate, priority, details });
    await newItem.save();
    return res.status(201).json(newItem);
  } catch (e) {
    const newItem = { id: `ass_${Date.now()}`, userId: req.user.id, title, subject, dueDate, priority: priority || 'Medium', completed: false, details: details || '' };
    mockAssignments.unshift(newItem);
    res.status(201).json(newItem);
  }
};

const toggleAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Assignment.findById(id);
    if (item) {
      item.completed = !item.completed;
      await item.save();
      return res.json(item);
    }
  } catch (e) {}
  
  const index = mockAssignments.findIndex(a => a.id === id);
  if (index !== -1) {
    mockAssignments[index].completed = !mockAssignments[index].completed;
    return res.json(mockAssignments[index]);
  }
  res.status(404).json({ message: 'Assignment not found' });
};

// Attendance
const getAttendance = async (req, res) => {
  try {
    const items = await Attendance.find({ userId: req.user.id });
    if (items && items.length > 0) return res.json(items);
  } catch (e) {}
  res.json(mockAttendance);
};

const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { attended, total } = req.body;
  try {
    const item = await Attendance.findById(id);
    if (item) {
      item.attended = attended;
      item.total = total;
      await item.save();
      return res.json(item);
    }
  } catch (e) {}

  const index = mockAttendance.findIndex(a => a.id === id);
  if (index !== -1) {
    mockAttendance[index].attended = attended;
    mockAttendance[index].total = total;
    return res.json(mockAttendance[index]);
  }
  res.status(404).json({ message: 'Attendance item not found' });
};

// Marks
const getMarks = async (req, res) => {
  try {
    const items = await Mark.find({ userId: req.user.id });
    if (items && items.length > 0) return res.json(items);
  } catch (e) {}
  res.json(mockMarks);
};

// Notices
const getNotices = async (req, res) => {
  try {
    const items = await Notice.find();
    if (items && items.length > 0) return res.json(items);
  } catch (e) {}
  res.json(mockNotices);
};

// Notes
const getNotes = async (req, res) => {
  try {
    const items = await Note.find({ userId: req.user.id });
    if (items && items.length > 0) return res.json(items);
  } catch (e) {}
  res.json(mockNotes);
};

const createNote = async (req, res) => {
  const { title, subject, content, color } = req.body;
  try {
    const newItem = new Note({ userId: req.user.id, title, subject, content, color });
    await newItem.save();
    return res.status(201).json(newItem);
  } catch (e) {
    const newItem = { id: `note_${Date.now()}`, userId: req.user.id, title, subject, content, color: color || 'yellow' };
    mockNotes.unshift(newItem);
    res.status(201).json(newItem);
  }
};

// Reminders
const getReminders = async (req, res) => {
  try {
    const items = await Reminder.find({ userId: req.user.id });
    if (items && items.length > 0) return res.json(items);
  } catch (e) {}
  res.json(mockReminders);
};

const toggleReminder = async (req, res) => {
  const { id } = req.params;
  const index = mockReminders.findIndex(r => r.id === id);
  if (index !== -1) {
    mockReminders[index].completed = !mockReminders[index].completed;
    return res.json(mockReminders[index]);
  }
  res.status(404).json({ message: 'Reminder not found' });
};

// ==================================================
// SAGE AI INTERNAL DATA GETTERS (SINGLE SOURCE OF TRUTH)
// ==================================================

const mockTimetable = {
  Monday: [
    { time: '09:00 AM - 10:30 AM', subject: 'Database Management Systems', code: 'CS601', room: 'Lab 221, B wing', professor: 'Dr. Anil Vasoya', type: 'Lecture' },
    { time: '10:45 AM - 12:15 PM', subject: 'Computer Networks', code: 'CS602', room: 'class 518', professor: 'Mr. Vijay Kumar Yele', type: 'Lecture' },
    { time: '01:30 PM - 03:30 PM', subject: 'MIS Practical Lab', code: 'CS601L', room: 'lab 203', professor: 'Mrs. Minakshi Ghorpade', type: 'Practical' }
  ],
  Tuesday: [
    { time: '09:00 AM - 10:30 AM', subject: 'Software Engineering', code: 'CS603', room: 'class 603', professor: 'Dr. Sangeeta Vhatkar', type: 'Lecture' },
    { time: '11:00 AM - 12:30 PM', subject: 'Artificial Intelligence', code: 'CS604', room: 'class 530', professor: 'Dr. Aruna Pavate', type: 'Lecture' },
    { time: '02:00 PM - 04:00 PM', subject: 'Pomodoro Self-Study Slot 🌿', code: 'STUDY', room: 'Home', professor: 'Self', type: 'Self Study' }
  ],
  Wednesday: [
    { time: '09:30 AM - 11:30 AM', subject: 'Computer Networks Lab', code: 'CS602L', room: 'lab 221', professor: 'Mr. Vijay Kumar Yele', type: 'Practical' },
    { time: '01:00 PM - 02:30 PM', subject: 'Data Structure and Algorithm', code: 'CS601', room: 'class 619', professor: 'Ms. Nidhi Bhavsar', type: 'Lecture' }
  ],
  Thursday: [
    { time: '10:00 AM - 11:30 AM', subject: 'Big Data Analytics', code: 'CS605', room: 'class 530', professor: 'Dr. Aruna Pavate', type: 'Lecture' },
    { time: '01:30 PM - 03:30 PM', subject: 'Software Engineering Agile Sprint', code: 'CS604', room: 'lab 223', professor: 'Dr. Sangeeta Vhatkar', type: 'Practical' }
  ],
  Friday: [
    { time: '09:00 AM - 11:00 AM', subject: 'Operating Systems Lab', code: 'CS603L', room: 'OS Simulation Lab', professor: 'Dr. Vikram Seth', type: 'Practical' },
    { time: '11:30 AM - 01:00 PM', subject: 'Machine Learning', code: 'CS605L', room: 'lab 204', professor: 'Mrs. Jisha Tinsu', type: 'Practical' }
  ]
};

const matchSubjectAlias = (subjectName, query) => {
  if (!query || !subjectName) return false;
  const s = subjectName.toLowerCase();
  const q = query.toLowerCase().trim();

  if (s.includes(q) || q.includes(s)) return true;

  // Common CS Aliases
  if ((q === 'dbms' || q.includes('dbms') || q.includes('database')) && (s.includes('dbms') || s.includes('database'))) return true;
  if ((q === 'os' || q.includes('os') || q.includes('operating')) && (s.includes('os') || s.includes('operating'))) return true;
  if ((q === 'cn' || q.includes('cn') || q.includes('network')) && (s.includes('cn') || s.includes('network'))) return true;
  if ((q === 'se' || q.includes('se') || q.includes('software')) && (s.includes('se') || s.includes('software'))) return true;
  if ((q === 'web' || q.includes('web')) && s.includes('web')) return true;

  return false;
};

const getAttendanceInternal = async (userId, subjectFilter) => {
  let items = [];
  try {
    if (userId) items = await Attendance.find({ userId });
  } catch (e) {}
  if (!items || items.length === 0) {
    items = mockAttendance;
  }

  let processed = items.map(item => {
    const attended = item.attended || 0;
    const total = item.total || 0;
    const target = item.target || 75;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    const isSafe = percentage >= target;
    const requiredPct = target / 100;

    let statusAdvice = '';
    if (isSafe) {
      const maxBunks = Math.floor((attended / requiredPct) - total);
      statusAdvice = maxBunks > 0 ? `Can miss ${maxBunks} class(es) and remain above ${target}% target.` : `On the target line (${percentage}%). Do not miss next class.`;
    } else {
      const needed = Math.ceil((requiredPct * total - attended) / (1 - requiredPct));
      statusAdvice = `Below target. Need to attend next ${needed} consecutive class(es) to reach ${target}% safe zone.`;
    }

    return {
      subject: item.subject,
      attended,
      total,
      percentage: `${percentage}%`,
      percentageNum: percentage,
      target: `${target}%`,
      isSafe,
      statusAdvice
    };
  });

  if (subjectFilter && typeof subjectFilter === 'string' && subjectFilter.trim()) {
    processed = processed.filter(sub => matchSubjectAlias(sub.subject, subjectFilter));
  }

  const overallAttended = processed.reduce((sum, i) => sum + i.attended, 0);
  const overallTotal = processed.reduce((sum, i) => sum + i.total, 0);
  const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0;

  return {
    subjects: processed,
    overallAttended,
    overallTotal,
    overallPercentage: `${overallPercentage}%`,
    overallTarget: '75%',
    isOverallSafe: overallPercentage >= 75
  };
};

const getAssignmentsInternal = async (userId, statusFilter, priorityFilter) => {
  let items = [];
  try {
    if (userId) items = await Assignment.find({ userId });
  } catch (e) {}
  if (!items || items.length === 0) {
    items = mockAssignments;
  }

  let filtered = items.map(item => ({
    id: item.id || item._id,
    title: item.title,
    subject: item.subject,
    dueDate: item.dueDate,
    priority: item.priority,
    completed: item.completed,
    status: item.completed ? 'completed' : 'pending',
    details: item.details || ''
  }));

  if (statusFilter && typeof statusFilter === 'string') {
    const s = statusFilter.toLowerCase().trim();
    if (s === 'pending' || s === 'incomplete' || s === 'due') {
      filtered = filtered.filter(a => !a.completed);
    } else if (s === 'completed' || s === 'done') {
      filtered = filtered.filter(a => a.completed);
    }
  }

  if (priorityFilter && typeof priorityFilter === 'string') {
    const p = priorityFilter.toLowerCase().trim();
    filtered = filtered.filter(a => a.priority.toLowerCase() === p);
  }

  const pendingAssignments = filtered.filter(a => !a.completed);
  const completedAssignments = filtered.filter(a => a.completed);

  return {
    assignments: filtered,
    totalCount: filtered.length,
    pendingCount: pendingAssignments.length,
    completedCount: completedAssignments.length
  };
};

const getMarksInternal = async (userId, subjectFilter, semesterFilter) => {
  let items = [];
  try {
    if (userId) items = await Mark.find({ userId });
  } catch (e) {}
  if (!items || items.length === 0) {
    items = mockMarks;
  }

  let processed = items.map(m => ({
    subject: m.subject,
    score: m.score,
    maxScore: m.maxScore || 100,
    percentage: `${Math.round((m.score / (m.maxScore || 100)) * 100)}%`,
    type: m.type || 'Midterm 1',
    semester: m.semester || 6
  }));

  if (subjectFilter && typeof subjectFilter === 'string' && subjectFilter.trim()) {
    processed = processed.filter(m => matchSubjectAlias(m.subject, subjectFilter));
  }

  if (semesterFilter) {
    processed = processed.filter(m => m.semester === Number(semesterFilter));
  }

  const semesterHistory = [
    { semester: 1, sgpa: 8.10, status: 'Completed' },
    { semester: 2, sgpa: 8.35, status: 'Completed' },
    { semester: 3, sgpa: 7.90, status: 'Completed' },
    { semester: 4, sgpa: 8.45, status: 'Completed' },
    { semester: 5, sgpa: 8.40, status: 'Completed' },
    { semester: 6, sgpa: 8.55, status: 'In Progress (Target SGPA)' }
  ];

  return {
    currentSubjectMarks: processed,
    cumulativeCGPA: 8.24,
    maxCGPA: 10.0,
    targetSem6SGPA: 8.55,
    creditsCompleted: 138,
    batchStanding: 'Top 10%',
    semesterHistory
  };
};

const getTimetableInternal = (dayFilter) => {
  if (!dayFilter || typeof dayFilter !== 'string' || dayFilter.toLowerCase().trim() === 'all' || dayFilter.toLowerCase().trim() === 'week') {
    return { timetable: mockTimetable };
  }

  let targetDay = dayFilter.trim().toLowerCase();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();

  if (targetDay === 'today') {
    targetDay = dayNames[todayIndex].toLowerCase();
  } else if (targetDay === 'tomorrow') {
    targetDay = dayNames[(todayIndex + 1) % 7].toLowerCase();
  }

  const matchedKey = Object.keys(mockTimetable).find(k => k.toLowerCase() === targetDay);

  if (matchedKey && mockTimetable[matchedKey]) {
    return {
      day: matchedKey,
      schedule: mockTimetable[matchedKey]
    };
  }

  return {
    message: `No classes scheduled for ${dayFilter} (or weekend).`,
    fullTimetable: mockTimetable
  };
};

const getNoticesInternal = async (categoryFilter, urgentOnly) => {
  let items = [];
  try {
    items = await Notice.find();
  } catch (e) {}
  if (!items || items.length === 0) {
    items = mockNotices;
  }

  let filtered = items.map(n => ({
    id: n.id || n._id,
    title: n.title,
    date: n.date,
    category: n.category,
    content: n.content,
    urgent: n.urgent
  }));

  if (categoryFilter && typeof categoryFilter === 'string' && categoryFilter.trim()) {
    const c = categoryFilter.trim().toLowerCase();
    filtered = filtered.filter(n => n.category.toLowerCase().includes(c));
  }

  if (urgentOnly === true || urgentOnly === 'true') {
    filtered = filtered.filter(n => n.urgent === true);
  }

  return {
    notices: filtered,
    totalNotices: filtered.length
  };
};

const getNotesInternal = async (userId, subjectFilter, searchKeyword) => {
  let items = [];
  try {
    if (userId) items = await Note.find({ userId });
  } catch (e) {}
  if (!items || items.length === 0) {
    items = mockNotes;
  }

  let filtered = items.map(n => ({
    id: n.id || n._id,
    title: n.title,
    subject: n.subject,
    content: n.content,
    color: n.color
  }));

  if (subjectFilter && typeof subjectFilter === 'string' && subjectFilter.trim()) {
    filtered = filtered.filter(n => matchSubjectAlias(n.subject, subjectFilter));
  }

  if (searchKeyword && typeof searchKeyword === 'string' && searchKeyword.trim()) {
    const k = searchKeyword.trim().toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(k) ||
      n.content.toLowerCase().includes(k) ||
      matchSubjectAlias(n.subject, k)
    );
  }

  return {
    notes: filtered,
    totalNotes: filtered.length
  };
};

module.exports = {
  getAssignments,
  createAssignment,
  toggleAssignment,
  getAttendance,
  updateAttendance,
  getMarks,
  getNotices,
  getNotes,
  createNote,
  getReminders,
  toggleReminder,
  getAttendanceInternal,
  getAssignmentsInternal,
  getMarksInternal,
  getTimetableInternal,
  getNoticesInternal,
  getNotesInternal
};

