const express = require('express');
const router = express.Router();
const {
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
  getReports
} = require('../controllers/academicController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

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

// Notes: Read and Create (personal study notes)
router.get('/notes', getNotes);
router.post('/notes', createNote);

// Reminders
router.get('/reminders', getReminders);
router.patch('/reminders/:id/toggle', toggleReminder);

// Reports: Faculty and Admin analytics
router.get('/reports', requireRole('faculty', 'admin'), getReports);

module.exports = router;
