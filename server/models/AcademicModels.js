const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  completed: { type: Boolean, default: false },
  details: { type: String, default: '' }
});

const AttendanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  attended: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  target: { type: Number, default: 75 }
});

const MarkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, default: 100 },
  type: { type: String, default: 'Midterm' },
  semester: { type: Number, default: 6 }
});

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, default: 'General' },
  content: { type: String, required: true },
  urgent: { type: Boolean, default: false }
});

const NoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, default: '' },
  color: { type: String, default: 'yellow' },
  updatedAt: { type: Date, default: Date.now }
});

const ReminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  time: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

module.exports = {
  Assignment: mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema),
  Attendance: mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema),
  Mark: mongoose.models.Mark || mongoose.model('Mark', MarkSchema),
  Notice: mongoose.models.Notice || mongoose.model('Notice', NoticeSchema),
  Note: mongoose.models.Note || mongoose.model('Note', NoteSchema),
  Reminder: mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema)
};
