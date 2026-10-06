const express = require('express');
const router = express.Router();
const {
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
  getTimetable,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot
} = require('../controllers/academicController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Timetable Management
router.get('/timetable', getTimetable);
router.post('/timetable', requireRole('faculty', 'admin'), createTimetableSlot);
router.put('/timetable/:id', requireRole('faculty', 'admin'), updateTimetableSlot);
router.delete('/timetable/:id', requireRole('faculty', 'admin'), deleteTimetableSlot);

// Student Fee Management
router.get('/fees/summary', requireRole('student', 'admin'), getStudentFeeSummary);
router.get('/fees/queries', requireRole('student', 'admin'), getFeeQueries);
router.post('/fees/queries', requireRole('student', 'admin'), createFeeQuery);

// User In-App Notifications
router.get('/notifications', getUserNotifications);

// Faculty / My Classes & Roster Management
router.get('/my-classes', requireRole('faculty', 'admin'), getMyClasses);
router.get('/class-students/:divisionId', requireRole('faculty', 'admin'), getClassStudents);
router.get('/available-students/:divisionId', requireRole('faculty', 'admin'), getAvailableStudentsForClass);
router.post('/class-students/add-roster', requireRole('faculty', 'admin'), addStudentToRoster);
router.post('/class-students/remove-roster', requireRole('faculty', 'admin'), removeStudentFromRoster);
router.post('/class-students', requireRole('faculty', 'admin'), addClassStudent);
router.patch('/class-students/:studentId', requireRole('faculty', 'admin'), updateClassStudent);
router.post('/batch-attendance', requireRole('faculty', 'admin'), saveBatchAttendance);
router.post('/batch-marks', requireRole('faculty', 'admin'), saveBatchMarks);

// Assignments: Read (all authenticated), Create (faculty/admin)
router.get('/assignments', getAssignments);
router.post('/assignments', requireRole('faculty', 'admin'), createAssignment);
router.patch('/assignments/:id/toggle', toggleAssignment);

// Attendance: Read (all authenticated), Update (faculty/admin only)
router.get('/attendance', getAttendance);
router.put('/attendance/:id', requireRole('faculty', 'admin'), updateAttendance);

// Marks: Read (all authenticated), Create/Update (faculty/admin only)
router.get('/marks', getMarks);
router.post('/marks', requireRole('faculty', 'admin'), createMark);

// Notices: Read (all authenticated), Create (faculty/admin only)
router.get('/notices', getNotices);
router.post('/notices', requireRole('faculty', 'admin'), createNotice);

// Notes: Read and Create
router.get('/notes', getNotes);
router.post('/notes', createNote);

// Reminders
router.get('/reminders', getReminders);
router.patch('/reminders/:id/toggle', toggleReminder);

// Reports: Faculty and Admin analytics
router.get('/reports', requireRole('faculty', 'admin'), getReports);

module.exports = router;
