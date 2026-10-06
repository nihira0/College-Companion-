const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getUsers,
  updateUserRole,
  resetUserPassword,
  updateUserAcademic,
  getAdmissions,
  createAdmission,
  updateAdmissionStatus,
  convertAdmissionToStudent,
  getFeeStructures,
  createFeeStructure,
  recordPayment,
  getFinancialSummary,
  getDepartments,
  getDivisions,
  createDivision,
  getSubjects,
  createSubject,
  getFacultyAssignments,
  createFacultyAssignment,
  deleteFacultyAssignment,
  batchImportStudents,
  getAuditLogs,
  broadcastAnnouncement
} = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.use(requireRole('admin'));

// Overview
router.get('/overview-stats', getOverviewStats);

// User & Role Management
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.post('/users/:id/reset-password', resetUserPassword);
router.patch('/users/:id/academic', updateUserAcademic);
router.post('/batch-import-students', batchImportStudents);

// Admissions Lifecycle
router.get('/admissions', getAdmissions);
router.post('/admissions', createAdmission);
router.patch('/admissions/:id/status', updateAdmissionStatus);
router.post('/admissions/:id/convert-to-student', convertAdmissionToStudent);

// Finance & Fee Management
router.get('/fee-structures', getFeeStructures);
router.post('/fee-structures', createFeeStructure);
router.post('/record-payment', recordPayment);
router.get('/financial-summary', getFinancialSummary);

// Academic Configuration
router.get('/departments', getDepartments);
router.get('/divisions', getDivisions);
router.post('/divisions', createDivision);
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.get('/faculty-assignments', getFacultyAssignments);
router.post('/faculty-assignments', createFacultyAssignment);
router.delete('/faculty-assignments/:id', deleteFacultyAssignment);

// System Audit Logs & Communications
router.get('/audit-logs', getAuditLogs);
router.post('/broadcast-announcement', broadcastAnnouncement);

module.exports = router;
