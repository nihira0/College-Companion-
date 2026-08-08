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
  toggleReminder
};
