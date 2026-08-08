const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/academicController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.patch('/assignments/:id/toggle', toggleAssignment);

// Attendance
router.get('/attendance', getAttendance);
router.put('/attendance/:id', updateAttendance);

// Marks
router.get('/marks', getMarks);

// Notices
router.get('/notices', getNotices);

// Notes
router.get('/notes', getNotes);
router.post('/notes', createNote);

// Reminders
router.get('/reminders', getReminders);
router.patch('/reminders/:id/toggle', toggleReminder);

module.exports = router;
