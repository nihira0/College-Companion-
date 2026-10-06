const { Assignment, Attendance, Mark, Notice, Note, Reminder } = require('../models/AcademicModels');
const { FacultyAssignment, Division, Subject } = require('../models/DepartmentModels');

// Initial default demo dataset
let mockAssignments = [
  { id: 'ass_1', userId: 'user_demo_123', title: 'DBMS Relational Algebra & SQL', subject: 'Database Management Systems', dueDate: 'Tomorrow, 11:59 PM', priority: 'High', completed: false, details: 'Submit ER diagrams and Query outputs on Google Classroom', divisionId: 'div_ita_1' },
  { id: 'ass_2', userId: 'user_demo_123', title: 'CN Socket Programming Lab Report', subject: 'Computer Networks', dueDate: 'May 18, 2026', priority: 'Medium', completed: false, details: 'Include packet capture screenshots from Wireshark', divisionId: 'div_itb_1' },
  { id: 'ass_3', userId: 'user_demo_123', title: 'OS Deadlock Resolution Essay', subject: 'Operating Systems', dueDate: 'May 21, 2026', priority: 'Low', completed: true, details: 'Banker algorithm simulation code attached', divisionId: 'div_ita_1' },
  { id: 'ass_4', userId: 'user_demo_123', title: 'Software Engineering Agile Sprint', subject: 'Software Engineering', dueDate: 'May 25, 2026', priority: 'High', completed: false, details: 'Prepare Jira user stories and velocity chart', divisionId: 'div_itc_1' }
];

let mockAttendance = [
  { id: 'att_1', userId: 'user_demo_123', subject: 'Database Systems', attended: 26, total: 30, target: 75, divisionId: 'div_ita_1' },
  { id: 'att_2', userId: 'user_demo_123', subject: 'Computer Networks', attended: 22, total: 30, target: 75, divisionId: 'div_itb_1' },
  { id: 'att_3', userId: 'user_demo_123', subject: 'Operating Systems', attended: 28, total: 32, target: 75, divisionId: 'div_ita_1' },
  { id: 'att_4', userId: 'user_demo_123', subject: 'Software Engineering', attended: 18, total: 25, target: 75, divisionId: 'div_itc_1' },
  { id: 'att_5', userId: 'user_demo_123', subject: 'Web Technologies Lab', attended: 14, total: 14, target: 75, divisionId: 'div_ita_1' }
];

let mockMarks = [
  { id: 'mark_1', userId: 'user_demo_123', subject: 'PCC-IT 601 Database Systems', subjectCode: 'PCC-IT 601', credits: 4, ise1: 18, maxIse1: 20, ise2: 17, maxIse2: 20, ese: 52, maxEse: 60, prOr: 22, maxPrOr: 25, tw: 23, maxTw: 25, total: 132, maxTotal: 150, grade: 'O (Outstanding)', semester: 6, divisionId: 'div_ita_1' },
  { id: 'mark_2', userId: 'user_demo_123', subject: 'PEC-IT 602 Computer Networks', subjectCode: 'PEC-IT 602', credits: 4, ise1: 16, maxIse1: 20, ise2: 15, maxIse2: 20, ese: 48, maxEse: 60, prOr: 20, maxPrOr: 25, tw: 21, maxTw: 25, total: 120, maxTotal: 150, grade: 'A+', semester: 6, divisionId: 'div_itb_1' },
  { id: 'mark_3', userId: 'user_demo_123', subject: 'PCC-IT 603 Operating Systems', subjectCode: 'PCC-IT 603', credits: 3, ise1: 19, maxIse1: 20, ise2: 18, maxIse2: 20, ese: 54, maxEse: 60, prOr: 0, maxPrOr: 0, tw: 22, maxTw: 25, total: 113, maxTotal: 125, grade: 'O (Outstanding)', semester: 6, divisionId: 'div_ita_1' },
  { id: 'mark_4', userId: 'user_demo_123', subject: 'PCC-IT 604 Software Engineering', subjectCode: 'PCC-IT 604', credits: 3, ise1: 14, maxIse1: 20, ise2: 16, maxIse2: 20, ese: 44, maxEse: 60, prOr: 0, maxPrOr: 0, tw: 20, maxTw: 25, total: 94, maxTotal: 125, grade: 'A', semester: 6, divisionId: 'div_itc_1' },
  { id: 'mark_5', userId: 'user_demo_123', subject: 'PCC-IT 605L Web Tech Lab', subjectCode: 'PCC-IT 605L', credits: 2, ise1: 0, maxIse1: 0, ise2: 0, maxIse2: 0, ese: 0, maxEse: 0, prOr: 24, maxPrOr: 25, tw: 24, maxTw: 25, total: 48, maxTotal: 50, grade: 'O (Outstanding)', semester: 6, divisionId: 'div_ita_1' }
];

let mockNotices = [
  { id: 'not_1', title: 'Final Semester Exam Schedule Released', date: 'May 12, 2026', category: 'Exams', content: 'The end-semester examinations will commence from June 5th. Detailed timetable is posted on the department portal.', urgent: true, divisionId: 'div_ita_1' },
  { id: 'not_2', title: 'Annual Hackathon "HackNature 2026" Registration Open', date: 'May 10, 2026', category: 'Events', content: 'Team registrations are open until May 20th. Cash prizes up to $5,000 for top 3 AI and Web projects.', urgent: false, divisionId: 'all' },
  { id: 'not_3', title: 'Library Extended Hours During Study Break', date: 'May 08, 2026', category: 'General', content: 'Central Library will remain open 24/7 starting May 15th to support students preparing for finals.', urgent: false, divisionId: 'all' }
];

let mockNotes = [
  { id: 'note_1', userId: 'user_demo_123', title: 'DBMS Chapter 3: Normalization', subject: 'DBMS', content: '1NF: Atomic values. 2NF: No partial dependency. 3NF: No transitive dependency. BCNF: Strict determinant rule.', color: 'yellow', divisionId: 'div_ita_1' },
  { id: 'note_2', userId: 'user_demo_123', title: 'OS Deadlock Conditions', subject: 'Operating Systems', content: '4 Coffman conditions: 1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait.', color: 'purple', divisionId: 'div_ita_1' },
  { id: 'note_3', userId: 'user_demo_123', title: 'CN Lab Viva Quick Prep', subject: 'Computer Networks', content: 'TCP vs UDP: Connection oriented vs connectionless. 3-way handshake SYN, SYN-ACK, ACK. OSI 7 layers mnemonic: Please Do Not Touch Steve\'s Pet Alligator.', color: 'green', divisionId: 'div_itb_1' }
];

let mockReminders = [
  { id: 'rem_1', userId: 'user_demo_123', title: 'Submit DBMS Assignment 3', time: '10:30 AM', completed: false },
  { id: 'rem_2', userId: 'user_demo_123', title: 'CN Lab Viva Practice', time: '02:15 PM', completed: true },
  { id: 'rem_3', userId: 'user_demo_123', title: 'Group Study Session for OS', time: '06:00 PM', completed: false }
];

// Verify if faculty is assigned to subject/division
const isFacultyAssigned = (facultyId, divisionId) => {
  const { mockFacultyAssignments } = require('./adminController');
  if (!facultyId) return true;
  if (facultyId.includes('admin')) return true;
  return mockFacultyAssignments.some(fa => fa.facultyId === facultyId || facultyId.includes('faculty'));
};

// Faculty Classes
const getMyClasses = async (req, res) => {
  const facultyId = req.user.id;
  const { mockFacultyAssignments, mockSubjects, mockDivisions } = require('./adminController');

  let assignments = [];
  try {
    assignments = await FacultyAssignment.find({ facultyId });
  } catch (e) {}

  if (!assignments || assignments.length === 0) {
    assignments = mockFacultyAssignments.filter(fa => fa.facultyId === facultyId || facultyId.includes('faculty'));
  }

  const result = assignments.map(fa => {
    const sub = mockSubjects.find(s => (s.id || s._id) === fa.subjectId) || { name: 'Database Management Systems', code: 'IT601' };
    const div = mockDivisions.find(d => (d.id || d._id) === fa.divisionId) || { name: 'IT-A', id: 'div_ita_1' };
    return {
      id: fa.id || fa._id,
      facultyId: fa.facultyId,
      subjectId: fa.subjectId,
      subjectName: sub.name,
      subjectCode: sub.code,
      divisionId: fa.divisionId || div.id,
      divisionName: div.name,
      academicYear: fa.academicYear || '2025-2026'
    };
  });

  res.json(result);
};

// In-memory Students Roster per Division
let mockDivisionStudents = {
  'div_ita_1': [
    { id: 'user_demo_123', name: 'Nihaarika', email: 'nihaarika@college.edu', role: 'student', divisionId: 'div_ita_1', divisionName: 'IT-A', rollNo: 'IT-A-042', attendancePct: 87, marksAvg: 88, status: 'Active' },
    { id: 'user_student_2', name: 'Rohan Sharma', email: 'rohan@college.edu', role: 'student', divisionId: 'div_ita_1', divisionName: 'IT-A', rollNo: 'IT-A-012', attendancePct: 72, marksAvg: 76, status: 'Active' },
    { id: 'user_student_3', name: 'Aarav Patel', email: 'aarav@college.edu', role: 'student', divisionId: 'div_ita_1', divisionName: 'IT-A', rollNo: 'IT-A-005', attendancePct: 91, marksAvg: 94, status: 'Active' },
    { id: 'user_student_4', name: 'Ananya Verma', email: 'ananya@college.edu', role: 'student', divisionId: 'div_ita_1', divisionName: 'IT-A', rollNo: 'IT-A-023', attendancePct: 68, marksAvg: 70, status: 'Active' },
    { id: 'user_student_5', name: 'Priya Nambiar', email: 'priya@college.edu', role: 'student', divisionId: 'div_ita_1', divisionName: 'IT-A', rollNo: 'IT-A-055', attendancePct: 83, marksAvg: 85, status: 'Active' }
  ],
  'div_itb_1': [
    { id: 'user_student_6', name: 'Kabir Mehta', email: 'kabir@college.edu', role: 'student', divisionId: 'div_itb_1', divisionName: 'IT-B', rollNo: 'IT-B-015', attendancePct: 74, marksAvg: 68, status: 'Active' },
    { id: 'user_student_7', name: 'Sanya Gupta', email: 'sanya@college.edu', role: 'student', divisionId: 'div_itb_1', divisionName: 'IT-B', rollNo: 'IT-B-031', attendancePct: 89, marksAvg: 92, status: 'Active' }
  ],
  'div_itc_1': [
    { id: 'user_student_8', name: 'Devansh Joshi', email: 'devansh@college.edu', role: 'student', divisionId: 'div_itc_1', divisionName: 'IT-C', rollNo: 'IT-C-008', attendancePct: 65, marksAvg: 62, status: 'Active' }
  ]
};

// Get Students in a Division
const getClassStudents = async (req, res) => {
  const { divisionId } = req.params;
  const userRole = req.user.role;

  if (userRole === 'faculty') {
    if (!isFacultyAssigned(req.user.id, divisionId)) {
      return res.status(403).json({ message: 'You are not authorized to access students of this division.' });
    }
  }

  const list = mockDivisionStudents[divisionId] || mockDivisionStudents['div_ita_1'];
  res.json(list);
};

// Enroll/Add Student to Class
const addClassStudent = async (req, res) => {
  const { divisionId, name, email, rollNo } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Student name and email are required' });
  }

  if (req.user.role === 'faculty' && !isFacultyAssigned(req.user.id, divisionId)) {
    return res.status(403).json({ message: 'You are not assigned to manage students for this division.' });
  }

  const divName = divisionId === 'div_itb_1' ? 'IT-B' : divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A';
  const newStudent = {
    id: `user_student_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'student',
    divisionId: divisionId || 'div_ita_1',
    divisionName: divName,
    rollNo: rollNo || `${divName}-${Math.floor(Math.random() * 80 + 10)}`,
    attendancePct: 85,
    marksAvg: 80,
    status: 'Active'
  };

  if (!mockDivisionStudents[divisionId]) {
    mockDivisionStudents[divisionId] = [];
  }
  mockDivisionStudents[divisionId].unshift(newStudent);

  res.status(201).json({ message: `Student ${name} enrolled successfully in ${divName}!`, student: newStudent });
};

// Update/Deactivate Student in Class
const updateClassStudent = async (req, res) => {
  const { studentId } = req.params;
  const { name, rollNo, status, attendancePct, marksAvg } = req.body;

  let found = null;
  for (const divKey of Object.keys(mockDivisionStudents)) {
    const list = mockDivisionStudents[divKey];
    const idx = list.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      if (name) list[idx].name = name;
      if (rollNo) list[idx].rollNo = rollNo;
      if (status) list[idx].status = status;
      if (attendancePct !== undefined) list[idx].attendancePct = Number(attendancePct);
      if (marksAvg !== undefined) list[idx].marksAvg = Number(marksAvg);
      found = list[idx];
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ message: 'Student record not found' });
  }

  res.json({ message: 'Student updated successfully', student: found });
};

// Batch Attendance Save for Faculty
const saveBatchAttendance = async (req, res) => {
  const { divisionId, subject, date, records } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'faculty' && userRole !== 'admin') {
    return res.status(403).json({ message: 'You do not have permission to mark attendance.' });
  }

  if (userRole === 'faculty' && !isFacultyAssigned(req.user.id, divisionId)) {
    return res.status(403).json({ message: 'You are not assigned to mark attendance for this division.' });
  }

  // Live Sync to mockAttendance records for student viewing
  if (Array.isArray(records)) {
    for (const rec of records) {
      const existing = mockAttendance.find(a => a.userId === rec.studentId && a.subject === (subject || 'Database Systems'));
      if (existing) {
        existing.total += 1;
        if (rec.status === 'Present') existing.attended += 1;
      }
    }
  }

  res.json({
    message: `Attendance for ${subject || 'Course'} (${date || 'Today'}) saved successfully for ${records ? records.length : 5} students!`,
    date: date || new Date().toISOString().slice(0, 10),
    divisionId: divisionId || 'div_ita_1'
  });
};

// Batch Marks Save for Faculty (TCET College Scheme)
const saveBatchMarks = async (req, res) => {
  const { divisionId, subject, type, records } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'faculty' && userRole !== 'admin') {
    return res.status(403).json({ message: 'You do not have permission to submit marks.' });
  }

  if (userRole === 'faculty' && !isFacultyAssigned(req.user.id, divisionId)) {
    return res.status(403).json({ message: 'You are not assigned to submit marks for this division.' });
  }

  const assessmentComponent = type || 'ISE 1';

  // Live Sync to mockMarks records for student viewing
  if (Array.isArray(records)) {
    for (const rec of records) {
      if (rec.score !== undefined) {
        let existing = mockMarks.find(m => (m.userId === rec.studentId || rec.studentId === 'user_demo_123') && (m.subject === subject || m.subject.includes(subject || '')));
        if (!existing) {
          existing = {
            id: `mark_${Date.now()}_${Math.random()}`,
            userId: rec.studentId || 'user_demo_123',
            subject: subject || 'PCC-IT 601 Database Systems',
            subjectCode: 'PCC-IT 601',
            credits: 4,
            ise1: 0, maxIse1: 20,
            ise2: 0, maxIse2: 20,
            ese: 0, maxEse: 60,
            prOr: 0, maxPrOr: 25,
            tw: 0, maxTw: 25,
            total: 0, maxTotal: 150,
            grade: 'In Progress',
            semester: 6,
            divisionId: divisionId || 'div_ita_1'
          };
          mockMarks.unshift(existing);
        }

        const scoreVal = Number(rec.score) || 0;
        if (assessmentComponent === 'ISE 1') {
          existing.ise1 = scoreVal;
          if (rec.maxScore) existing.maxIse1 = Number(rec.maxScore);
        } else if (assessmentComponent === 'ISE 2') {
          existing.ise2 = scoreVal;
          if (rec.maxScore) existing.maxIse2 = Number(rec.maxScore);
        } else if (assessmentComponent === 'ESE') {
          existing.ese = scoreVal;
          if (rec.maxScore) existing.maxEse = Number(rec.maxScore);
        } else if (assessmentComponent === 'PR/OR' || assessmentComponent === 'PR / OR') {
          existing.prOr = scoreVal;
          if (rec.maxScore) existing.maxPrOr = Number(rec.maxScore);
        } else if (assessmentComponent === 'TW' || assessmentComponent === 'Term Work') {
          existing.tw = scoreVal;
          if (rec.maxScore) existing.maxTw = Number(rec.maxScore);
        }

        // Recompute Total & Grade
        existing.total = (existing.ise1 || 0) + (existing.ise2 || 0) + (existing.ese || 0) + (existing.prOr || 0) + (existing.tw || 0);
        const maxTot = (existing.maxIse1 || 0) + (existing.maxIse2 || 0) + (existing.maxEse || 0) + (existing.maxPrOr || 0) + (existing.maxTw || 0);
        existing.maxTotal = maxTot || 150;
        const pct = Math.round((existing.total / existing.maxTotal) * 100);
        existing.grade = pct >= 90 ? 'O (Outstanding)' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 50 ? 'B' : 'F';
      }
    }
  }

  res.json({
    message: `Assessment ${assessmentComponent} for ${subject || 'Subject'} saved & published successfully!`,
    recordsSaved: records ? records.length : 5
  });
};

// Standard CRUD handlers with real-time student-division scoping
const getAssignments = async (req, res) => {
  try {
    const items = await Assignment.find({ userId: req.user.id });
    if (items && items.length > 0) return res.json(items);
  } catch (e) {}

  if (req.user.role === 'student') {
    const userDiv = req.user.divisionId || 'div_ita_1';
    const scoped = mockAssignments.filter(a => a.userId === req.user.id || a.divisionId === userDiv || a.divisionId === 'all' || !a.divisionId);
    return res.json(scoped);
  }

  res.json(mockAssignments);
};

const createAssignment = async (req, res) => {
  const { title, subject, dueDate, priority, details, divisionId } = req.body;
  if (req.user.role === 'faculty' && !isFacultyAssigned(req.user.id, divisionId)) {
    return res.status(403).json({ message: 'You are not assigned to create assignments for this division.' });
  }

  try {
    const newItem = new Assignment({ userId: req.user.id, title, subject, dueDate, priority, details });
    await newItem.save();
    return res.status(201).json(newItem);
  } catch (e) {
    const newItem = { id: `ass_${Date.now()}`, userId: req.user.id, title, subject, dueDate, priority: priority || 'Medium', completed: false, details: details || '', divisionId: divisionId || 'div_ita_1' };
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

  if (req.user.role === 'faculty' && !isFacultyAssigned(req.user.id)) {
    return res.status(403).json({ message: 'You are not assigned to manage attendance for this division.' });
  }

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

const createNotice = async (req, res) => {
  const { title, category, content, urgent, divisionId } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  if (req.user.role === 'faculty' && !isFacultyAssigned(req.user.id, divisionId)) {
    return res.status(403).json({ message: 'You are not assigned to post notices for this division.' });
  }

  const newNotice = {
    id: `not_${Date.now()}`,
    title,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    category: category || 'General',
    content,
    urgent: Boolean(urgent),
    divisionId: divisionId || 'all'
  };

  try {
    const item = new Notice(newNotice);
    await item.save();
    return res.status(201).json(item);
  } catch (e) {
    mockNotices.unshift(newNotice);
    return res.status(201).json(newNotice);
  }
};

const createMark = async (req, res) => {
  const { studentId, subject, score, maxScore, type, semester, divisionId } = req.body;
  if (!subject || score === undefined) {
    return res.status(400).json({ message: 'Subject and score are required' });
  }

  if (req.user.role === 'faculty' && !isFacultyAssigned(req.user.id, divisionId)) {
    return res.status(403).json({ message: 'You are not assigned to enter marks for this division.' });
  }

  const newMark = {
    id: `mark_${Date.now()}`,
    userId: studentId || 'user_demo_123',
    subject,
    score: Number(score),
    maxScore: Number(maxScore) || 100,
    type: type || 'Midterm 1',
    semester: Number(semester) || 6,
    divisionId: divisionId || 'div_ita_1'
  };

  try {
    const item = new Mark(newMark);
    await item.save();
    return res.status(201).json(item);
  } catch (e) {
    mockMarks.unshift(newMark);
    return res.status(201).json(newMark);
  }
};

const getReports = async (req, res) => {
  const userRole = req.user?.role || 'student';
  if (userRole === 'student') {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  if (userRole === 'faculty') {
    return res.json({
      reportType: 'Faculty IT Class Analytics',
      assignedDivisions: ['IT-A', 'IT-B'],
      assignedSubjects: ['Database Management Systems', 'Computer Networks'],
      averageAttendance: '84.2%',
      studentsBelowThreshold: [
        { name: 'Rohan Sharma', rollNo: 'IT-A-012', division: 'IT-A', attendance: '72%' },
        { name: 'Ananya Verma', rollNo: 'IT-A-023', division: 'IT-A', attendance: '68%' }
      ],
      classPerformance: [
        { subject: 'DBMS (IT-A)', avgScore: '84.5%', attendanceAvg: '87%' },
        { subject: 'Computer Networks (IT-B)', avgScore: '78.2%', attendanceAvg: '81%' }
      ],
      assignmentStats: { totalGiven: 12, submittedCount: 142, completionRate: '91%' }
    });
  }

  return res.json({
    reportType: 'Institutional IT Department Summary',
    totalStudents: 235,
    totalFaculty: 14,
    overallAttendanceAvg: '83.4%',
    activeDivisions: ['IT-A (78 students)', 'IT-B (76 students)', 'IT-C (81 students)'],
    departmentPerformance: [
      { dept: 'IT Division A', avgCGPA: 8.35, attendance: '85%' },
      { dept: 'IT Division B', avgCGPA: 8.12, attendance: '82%' },
      { dept: 'IT Division C', avgCGPA: 8.05, attendance: '81%' }
    ]
  });
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
  const { title, subject, content, color, divisionId } = req.body;
  try {
    const newItem = new Note({ userId: req.user.id, title, subject, content, color });
    await newItem.save();
    return res.status(201).json(newItem);
  } catch (e) {
    const newItem = { id: `note_${Date.now()}`, userId: req.user.id, title, subject, content, color: color || 'yellow', divisionId: divisionId || 'div_ita_1' };
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

const getAttendanceInternal = async (userId, subjectFilter) => {
  let items = mockAttendance;
  if (subjectFilter) {
    items = items.filter(i => i.subject.toLowerCase().includes(subjectFilter.toLowerCase()));
  }
  const totalAttended = items.reduce((acc, i) => acc + i.attended, 0);
  const totalClasses = items.reduce((acc, i) => acc + i.total, 0);
  const overallPct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 84;

  return {
    overallAttended: totalAttended,
    overallTotal: totalClasses,
    overallPercentage: `${overallPct}%`,
    isOverallSafe: overallPct >= 75,
    subjects: items.map(i => {
      const pct = Math.round((i.attended / i.total) * 100);
      return {
        subject: i.subject,
        attended: i.attended,
        total: i.total,
        percentage: `${pct}%`,
        target: `${i.target || 75}%`,
        statusAdvice: pct >= 75 ? 'Safe Zone 🛡️' : 'Attention Needed ⚠️'
      };
    })
  };
};

const getAssignmentsInternal = async (userId, statusFilter) => {
  let items = mockAssignments;
  return { assignments: items, totalCount: items.length, pendingCount: items.filter(a => !a.completed).length };
};

const getMarksInternal = async (userId) => {
  return { currentSubjectMarks: mockMarks, cumulativeCGPA: 8.24 };
};

const getTimetableInternal = () => {
  return { schedule: 'Monday to Friday IT-A, IT-B, IT-C classes' };
};

const getNoticesInternal = async () => {
  return { notices: mockNotices };
};

const getNotesInternal = async () => {
  return { notes: mockNotes };
};

let mockFeeQueries = [
  { id: 'fq_1', userId: 'user_demo_123', subject: 'Scholarship Concession Status', description: 'Merit scholarship amount ₹20,000 has been verified. When will the updated installment balance reflect?', status: 'Resolved', response: 'Concession applied to Installment #2.', createdAt: '2026-02-15' }
];

const getStudentFeeSummary = async (req, res) => {
  const userId = req.user.id;
  res.json({
    studentId: userId,
    academicYear: '2025-2026',
    program: 'B.Tech Information Technology (Semester 6)',
    status: 'Partial',
    dueDate: '2026-04-15',
    totalPayable: 100000,
    scholarshipConcession: {
      name: 'TCET Merit Academic Scholarship',
      amount: 20000,
      approvedDate: '2025-08-10'
    },
    netPayable: 80000,
    amountPaid: 60000,
    outstandingBalance: 20000,
    itemizedBreakdown: [
      { feeHead: 'Tuition Fee', amount: 75000 },
      { feeHead: 'Development Fee', amount: 15000 },
      { feeHead: 'Laboratory & Exam Fee', amount: 8000 },
      { feeHead: 'Library & Student Amenities', amount: 2000 }
    ],
    installments: [
      { installmentNo: 1, amount: 40000, dueDate: '2025-08-30', status: 'Paid', paidDate: '2025-08-25', receiptNo: 'REC-2025-0842' },
      { installmentNo: 2, amount: 20000, dueDate: '2026-01-15', status: 'Paid', paidDate: '2026-01-10', receiptNo: 'REC-2026-0199' },
      { installmentNo: 3, amount: 20000, dueDate: '2026-04-15', status: 'Pending', paidDate: null, receiptNo: null }
    ],
    paymentHistory: [
      { transactionRef: 'TXN-904812', amount: 40000, date: '2025-08-25', mode: 'Online / UPI', receiptNo: 'REC-2025-0842', status: 'Verified' },
      { transactionRef: 'TXN-948102', amount: 20000, date: '2026-01-10', mode: 'Bank Transfer / NEFT', receiptNo: 'REC-2026-0199', status: 'Verified' }
    ]
  });
};

const getFeeQueries = async (req, res) => {
  res.json(mockFeeQueries);
};

const createFeeQuery = async (req, res) => {
  const { subject, description } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ message: 'Subject and description are required' });
  }

  const newQuery = {
    id: `fq_${Date.now()}`,
    userId: req.user.id,
    subject,
    description,
    status: 'Open',
    response: '',
    createdAt: new Date().toISOString().split('T')[0]
  };

  mockFeeQueries.unshift(newQuery);
  res.status(201).json(newQuery);
};

let mockUserNotifications = [
  {
    id: 'notif_1',
    userId: 'user_demo_123',
    title: '🔔 Added to Class',
    message: 'You have been added to Database Systems (IT601) by Dr. Rajesh S. Bansode.',
    details: 'Division: IT-A | Faculty: Dr. Rajesh S. Bansode',
    type: 'success',
    performedBy: 'user_fac_1',
    performedByName: 'Dr. Rajesh S. Bansode',
    createdAt: new Date().toISOString()
  }
];

const createInAppNotification = async ({ userId, title, message, details, type, performedBy, performedByName }) => {
  try {
    const notifObj = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      details: details || '',
      type: type || 'info',
      performedBy: performedBy || 'faculty',
      performedByName: performedByName || 'Faculty Member',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const mongoose = require('mongoose');
    const { UserNotification } = require('../models/FinanceAndAdminModels');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const dbNotif = new UserNotification({
          userId,
          title,
          message,
          details,
          type,
          performedBy,
          performedByName
        });
        await dbNotif.save();
      } catch (e) {}
    }

    mockUserNotifications.unshift(notifObj);
    return true;
  } catch (err) {
    return false;
  }
};

// Get Available Students (Not currently enrolled in divisionId)
const getAvailableStudentsForClass = async (req, res) => {
  const { divisionId } = req.params;
  const facultyId = req.user.id;

  if (req.user.role === 'faculty' && !isFacultyAssigned(facultyId, divisionId)) {
    return res.status(403).json({ message: 'Access Denied: You are not authorized to manage roster for this division.' });
  }

  const { mockUsers } = require('./authController');
  const enrolledList = mockDivisionStudents[divisionId] || [];
  const enrolledIds = new Set(enrolledList.map(s => s.id));

  let allStudents = [];
  const mongoose = require('mongoose');
  const User = require('../models/User');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const dbStudents = await User.find({ role: 'student' }).select('-password');
      if (dbStudents && dbStudents.length > 0) {
        allStudents = dbStudents.map(u => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          rollNo: u.rollNo || 'IT-2026-000'
        }));
      }
    } catch (e) {}
  }

  if (allStudents.length === 0) {
    allStudents = (mockUsers || []).filter(u => u.role === 'student' || !u.role).map(u => ({
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      rollNo: u.rollNo || 'IT-A-000'
    }));
  }

  const available = allStudents.filter(s => !enrolledIds.has(s.id));
  res.json(available);
};

// Add Student to Roster (Faculty authorization + immediate notification delivery)
const addStudentToRoster = async (req, res) => {
  const { divisionId, studentId, subjectName, subjectCode } = req.body;
  const facultyId = req.user.id;

  if (!divisionId || !studentId) {
    return res.status(400).json({ message: 'divisionId and studentId are required' });
  }

  if (req.user.role === 'faculty' && !isFacultyAssigned(facultyId, divisionId)) {
    return res.status(403).json({ message: 'Access Denied: You are not authorized to manage roster for this division.' });
  }

  const { mockUsers } = require('./authController');
  const facultyUser = (mockUsers || []).find(u => u.id === facultyId || u._id === facultyId) || { name: req.user.name || 'Faculty Member' };
  const facultyName = facultyUser.name || req.user.name || 'Faculty Member';

  const { mockDivisions } = require('./adminController');
  const divObj = (mockDivisions || []).find(d => (d.id || d._id) === divisionId) || { name: divisionId === 'div_itb_1' ? 'IT-B' : divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A' };
  const divisionName = divObj.name;

  let targetStudent = (mockUsers || []).find(u => u.id === studentId || u._id === studentId);
  const mongoose = require('mongoose');
  const User = require('../models/User');
  if (!targetStudent && mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      targetStudent = await User.findById(studentId);
    } catch (e) {}
  }

  if (!targetStudent) {
    targetStudent = { id: studentId, name: 'Student Account', email: 'student@college.edu', rollNo: `${divisionName}-099` };
  }

  const enrolledStudent = {
    id: targetStudent.id || targetStudent._id,
    name: targetStudent.name,
    email: targetStudent.email,
    role: 'student',
    divisionId,
    divisionName,
    rollNo: targetStudent.rollNo || `${divisionName}-0${Math.floor(10 + Math.random() * 80)}`,
    attendancePct: 85,
    marksAvg: 80,
    status: 'Active'
  };

  if (!mockDivisionStudents[divisionId]) {
    mockDivisionStudents[divisionId] = [];
  }

  const alreadyIn = mockDivisionStudents[divisionId].some(s => s.id === enrolledStudent.id);
  if (!alreadyIn) {
    mockDivisionStudents[divisionId].unshift(enrolledStudent);
  }

  // Immediately generate student notification
  const subTitle = subjectName || 'Database Systems';
  const subCode = subjectCode || 'IT601';
  const notifSuccess = await createInAppNotification({
    userId: enrolledStudent.id,
    title: '🔔 Added to Class',
    message: `You have been added to ${subTitle} (${subCode}) by ${facultyName}.`,
    details: `Division: ${divisionName} | Faculty: ${facultyName}`,
    type: 'success',
    performedBy: facultyId,
    performedByName: facultyName
  });

  if (!notifSuccess) {
    return res.status(500).json({ message: 'Failed to deliver student notification for class addition.' });
  }

  res.status(201).json({
    message: `Successfully added ${enrolledStudent.name} to ${subTitle} (${divisionName})!`,
    student: enrolledStudent,
    notificationDelivered: true
  });
};

// Remove Student from Roster (Faculty authorization + immediate notification delivery)
const removeStudentFromRoster = async (req, res) => {
  const { divisionId, studentId, subjectName, subjectCode } = req.body;
  const facultyId = req.user.id;

  if (!divisionId || !studentId) {
    return res.status(400).json({ message: 'divisionId and studentId are required' });
  }

  if (req.user.role === 'faculty' && !isFacultyAssigned(facultyId, divisionId)) {
    return res.status(403).json({ message: 'Access Denied: You are not authorized to manage roster for this division.' });
  }

  const { mockUsers } = require('./authController');
  const facultyUser = (mockUsers || []).find(u => u.id === facultyId || u._id === facultyId) || { name: req.user.name || 'Faculty Member' };
  const facultyName = facultyUser.name || req.user.name || 'Faculty Member';

  const { mockDivisions } = require('./adminController');
  const divObj = (mockDivisions || []).find(d => (d.id || d._id) === divisionId) || { name: divisionId === 'div_itb_1' ? 'IT-B' : divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A' };
  const divisionName = divObj.name;

  const roster = mockDivisionStudents[divisionId] || [];
  const idx = roster.findIndex(s => s.id === studentId);
  let removedStudent = null;

  if (idx !== -1) {
    removedStudent = roster[idx];
    roster.splice(idx, 1);
  } else {
    removedStudent = { id: studentId, name: 'Student Account' };
  }

  // Immediately generate student notification
  const subTitle = subjectName || 'Database Systems';
  const subCode = subjectCode || 'IT601';
  const notifSuccess = await createInAppNotification({
    userId: studentId,
    title: '🔔 Removed from Class',
    message: `You have been removed from ${subTitle} (${subCode}) by ${facultyName}. If this was unexpected, please contact the faculty member or college administration.`,
    details: `Division: ${divisionName} | Faculty: ${facultyName}`,
    type: 'warning',
    performedBy: facultyId,
    performedByName: facultyName
  });

  if (!notifSuccess) {
    return res.status(500).json({ message: 'Failed to deliver student notification for class removal.' });
  }

  res.json({
    message: `Successfully removed ${removedStudent.name} from ${subTitle} (${divisionName}). Enrollment updated.`,
    notificationDelivered: true
  });
};

// Get User Notifications
const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  let userNotifs = [];

  const mongoose = require('mongoose');
  const { UserNotification } = require('../models/FinanceAndAdminModels');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      userNotifs = await UserNotification.find({ userId }).sort({ createdAt: -1 });
    } catch (e) {}
  }

  if (!userNotifs || userNotifs.length === 0) {
    userNotifs = mockUserNotifications.filter(n => n.userId === userId || userId.includes('demo') || userId.includes('student'));
  }

  res.json(userNotifs);
};

// Timetable Management
let mockTimetableSlots = [
  { id: 'tt_1', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Monday', time: '09:00 AM - 10:30 AM', subject: 'Database Management Systems', code: 'IT601', room: 'Lab 221, B-Wing', professor: 'Dr. Rajesh S. Bansode', facultyId: 'user_fac_1', type: 'Lecture' },
  { id: 'tt_2', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Monday', time: '11:00 AM - 01:00 PM', subject: 'DBMS Laboratory', code: 'IT601L', room: 'Lab 203', professor: 'Dr. Rajesh S. Bansode', facultyId: 'user_fac_1', type: 'Practical Lab' },
  { id: 'tt_3', divisionId: 'div_itb_1', divisionName: 'IT-B', day: 'Monday', time: '02:00 PM - 03:30 PM', subject: 'Computer Networks', code: 'IT602', room: 'Class 518', professor: 'Mr. Vijay Kumar Yele', facultyId: 'user_fac_11', type: 'Lecture' },
  { id: 'tt_4', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Tuesday', time: '09:00 AM - 10:30 AM', subject: 'Software Engineering', code: 'IT604', room: 'Class 603', professor: 'Dr. Sangeeta Vhatkar', facultyId: 'user_fac_3', type: 'Lecture' },
  { id: 'tt_5', divisionId: 'div_itb_1', divisionName: 'IT-B', day: 'Tuesday', time: '11:00 AM - 12:30 PM', subject: 'Artificial Intelligence', code: 'IT605', room: 'Class 530', professor: 'Dr. Aruna Pavate', facultyId: 'user_fac_6', type: 'Lecture' },
  { id: 'tt_6', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Wednesday', time: '09:30 AM - 11:30 AM', subject: 'Computer Networks Lab', code: 'IT602L', room: 'Lab 221', professor: 'Mr. Vijay Kumar Yele', facultyId: 'user_fac_11', type: 'Practical Lab' },
  { id: 'tt_7', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Thursday', time: '10:00 AM - 11:30 AM', subject: 'Operating Systems', code: 'IT603', room: 'Class 530', professor: 'Dr. Rahul Neve', facultyId: 'user_fac_8', type: 'Lecture' },
  { id: 'tt_8', divisionId: 'div_itc_1', divisionName: 'IT-C', day: 'Friday', time: '09:00 AM - 11:00 AM', subject: 'OS Simulation Lab', code: 'IT603L', room: 'Lab 204', professor: 'Dr. Rahul Neve', facultyId: 'user_fac_8', type: 'Practical Lab' }
];

const getTimetable = async (req, res) => {
  const { divisionId, day } = req.query;
  const userRole = req.user?.role;
  const studentDiv = userRole === 'student' ? (req.user?.divisionId || 'div_ita_1') : null;
  const targetDivision = divisionId || studentDiv;

  const mongoose = require('mongoose');
  const { TimetableSlot } = require('../models/DepartmentModels');

  let slots = [];
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (targetDivision && targetDivision !== 'ALL') {
        filter.$or = [{ divisionId: targetDivision }, { divisionId: 'ALL' }];
      }
      if (day) filter.day = day;
      slots = await TimetableSlot.find(filter).sort({ createdAt: -1 });
    } catch (e) {}
  }

  if (!slots || slots.length === 0) {
    slots = [...mockTimetableSlots];
    if (targetDivision && targetDivision !== 'ALL') {
      slots = slots.filter(s => s.divisionId === targetDivision || s.divisionId === 'ALL');
    }
    if (day) {
      slots = slots.filter(s => s.day === day);
    }
  }

  res.json(slots);
};

const createTimetableSlot = async (req, res) => {
  const { divisionId, day, time, subject, code, room, type, professor } = req.body;

  if (!day || !time || !subject) {
    return res.status(400).json({ message: 'Day, time, and subject are required fields' });
  }

  const { mockDivisions } = require('./adminController');
  const divObj = (mockDivisions || []).find(d => d.id === divisionId || d._id === divisionId) || { name: divisionId === 'div_itb_1' ? 'IT-B' : divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A' };
  const divName = divObj.name || 'IT-A';

  const newSlot = {
    id: `tt_${Date.now()}`,
    divisionId: divisionId || 'div_ita_1',
    divisionName: divName,
    day: day.trim(),
    time: time.trim(),
    subject: subject.trim(),
    code: (code || 'IT601').trim(),
    room: (room || 'Classroom').trim(),
    professor: (professor || req.user.name || 'Faculty Member').trim(),
    facultyId: req.user.id,
    type: (type || 'Lecture').trim()
  };

  const mongoose = require('mongoose');
  const { TimetableSlot } = require('../models/DepartmentModels');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const created = new TimetableSlot({ ...newSlot, _id: newSlot.id });
      await created.save();
    } catch (e) {}
  }

  mockTimetableSlots.unshift(newSlot);
  res.status(201).json({ message: 'Timetable slot created successfully', slot: newSlot });
};

const updateTimetableSlot = async (req, res) => {
  const { id } = req.params;
  const { divisionId, day, time, subject, code, room, type, professor } = req.body;

  const idx = mockTimetableSlots.findIndex(s => s.id === id || s._id === id);
  let updatedSlot = null;

  if (idx !== -1) {
    if (divisionId) mockTimetableSlots[idx].divisionId = divisionId;
    if (day) mockTimetableSlots[idx].day = day;
    if (time) mockTimetableSlots[idx].time = time;
    if (subject) mockTimetableSlots[idx].subject = subject;
    if (code) mockTimetableSlots[idx].code = code;
    if (room) mockTimetableSlots[idx].room = room;
    if (type) mockTimetableSlots[idx].type = type;
    if (professor) mockTimetableSlots[idx].professor = professor;
    updatedSlot = mockTimetableSlots[idx];
  } else {
    updatedSlot = { id, divisionId, day, time, subject, code, room, type, professor };
  }

  const mongoose = require('mongoose');
  const { TimetableSlot } = require('../models/DepartmentModels');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      await TimetableSlot.findByIdAndUpdate(id, { divisionId, day, time, subject, code, room, type, professor });
    } catch (e) {}
  }

  res.json({ message: 'Timetable slot updated successfully', slot: updatedSlot });
};

const deleteTimetableSlot = async (req, res) => {
  const { id } = req.params;

  const idx = mockTimetableSlots.findIndex(s => s.id === id || s._id === id);
  if (idx !== -1) {
    mockTimetableSlots.splice(idx, 1);
  }

  const mongoose = require('mongoose');
  const { TimetableSlot } = require('../models/DepartmentModels');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      await TimetableSlot.findByIdAndDelete(id);
    } catch (e) {}
  }

  res.json({ message: 'Timetable slot deleted successfully' });
};

module.exports = {
  getMyClasses,
  getClassStudents,
  addClassStudent,
  updateClassStudent,
  getAvailableStudentsForClass,
  addStudentToRoster,
  removeStudentFromRoster,
  getUserNotifications,
  saveBatchAttendance,
  saveBatchMarks,
  getAssignments,
  createAssignment,
  toggleAssignment,
  getAttendance,
  updateAttendance,
  getMarks,
  createMark,
  getNotices,
  createNotice,
  getNotes,
  createNote,
  getReminders,
  toggleReminder,
  getReports,
  getStudentFeeSummary,
  getFeeQueries,
  createFeeQuery,
  getAttendanceInternal,
  getAssignmentsInternal,
  getMarksInternal,
  getTimetableInternal,
  getNoticesInternal,
  getNotesInternal,
  getTimetable,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot
};
