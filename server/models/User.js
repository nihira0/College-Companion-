const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'faculty', 'admin'], 
    default: 'student' 
  },
  designation: { type: String, default: '' },
  avatar: { type: String, default: '🌿' },
  course: { type: String, default: 'B.Tech Information Technology' },
  semester: { type: Number, default: 6 },
  departmentId: { type: String, default: 'dept_it_1' },
  divisionId: { type: String, default: 'div_ita_1' },
  rollNo: { type: String, default: 'IT-2026-001' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
