const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }
}, { timestamps: true });

const DivisionSchema = new mongoose.Schema({
  departmentId: { type: String, required: true },
  name: { type: String, required: true }, // e.g. IT-A, IT-B, IT-C
  academicYear: { type: String, default: '2025-2026' }
}, { timestamps: true });

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  departmentId: { type: String, required: true }
}, { timestamps: true });

const FacultyAssignmentSchema = new mongoose.Schema({
  facultyId: { type: String, required: true },
  subjectId: { type: String, required: true },
  divisionId: { type: String, required: true },
  academicYear: { type: String, default: '2025-2026' }
}, { timestamps: true });

const TimetableSlotSchema = new mongoose.Schema({
  divisionId: { type: String, required: true, default: 'div_ita_1' },
  divisionName: { type: String, default: 'IT-A' },
  day: { type: String, required: true },
  time: { type: String, required: true },
  subject: { type: String, required: true },
  code: { type: String, default: 'IT601' },
  room: { type: String, default: 'Lab 221, B-Wing' },
  professor: { type: String, default: 'Faculty Member' },
  facultyId: { type: String, default: '' },
  type: { type: String, default: 'Lecture' }
}, { timestamps: true });

module.exports = {
  Department: mongoose.models.Department || mongoose.model('Department', DepartmentSchema),
  Division: mongoose.models.Division || mongoose.model('Division', DivisionSchema),
  Subject: mongoose.models.Subject || mongoose.model('Subject', SubjectSchema),
  FacultyAssignment: mongoose.models.FacultyAssignment || mongoose.model('FacultyAssignment', FacultyAssignmentSchema),
  TimetableSlot: mongoose.models.TimetableSlot || mongoose.model('TimetableSlot', TimetableSlotSchema)
};
