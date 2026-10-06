const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
  departmentId: { type: String, required: true, default: 'dept_it_1' },
  academicYear: { type: String, required: true, default: '2025-2026' },
  semester: { type: Number, required: true, default: 6 },
  tuitionFee: { type: Number, required: true, default: 75000 },
  developmentFee: { type: Number, required: true, default: 15000 },
  labExamFee: { type: Number, required: true, default: 8000 },
  otherCharges: { type: Number, required: true, default: 2000 },
  totalAmount: { type: Number, required: true, default: 100000 }
}, { timestamps: true });

const StudentFeeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  academicYear: { type: String, required: true, default: '2025-2026' },
  feeStructureId: { type: String, default: 'fee_struct_it_6' },
  totalPayable: { type: Number, required: true, default: 100000 },
  scholarshipAmount: { type: Number, default: 20000 },
  scholarshipName: { type: String, default: 'Merit Academic Concession' },
  amountPaid: { type: Number, default: 60000 },
  outstandingBalance: { type: Number, default: 20000 },
  status: { type: String, enum: ['Paid', 'Partial', 'Overdue', 'Pending'], default: 'Partial' },
  dueDate: { type: String, default: '2026-04-15' },
  installments: [
    {
      installmentNo: { type: Number },
      amount: { type: Number },
      dueDate: { type: String },
      status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
      paidDate: { type: String }
    }
  ]
}, { timestamps: true });

const FeeTransactionSchema = new mongoose.Schema({
  transactionRef: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Online / UPI', 'Bank Transfer / NEFT', 'Demand Draft', 'Cash'], default: 'Online / UPI' },
  paymentDate: { type: String, required: true },
  receiptNo: { type: String, required: true },
  status: { type: String, enum: ['Verified', 'Pending Verification', 'Rejected'], default: 'Verified' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const FeeQuerySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  response: { type: String, default: '' }
}, { timestamps: true });

const AdmissionApplicationSchema = new mongoose.Schema({
  applicationNo: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  course: { type: String, default: 'B.Tech Information Technology' },
  departmentId: { type: String, default: 'dept_it_1' },
  status: { type: String, enum: ['Received', 'Under Review', 'Interviewing', 'Accepted', 'Rejected'], default: 'Received' },
  appliedDate: { type: String, default: '2026-03-01' },
  score: { type: Number, default: 94.5 },
  notes: { type: String, default: '' },
  convertedStudentId: { type: String, default: null }
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  performedByName: { type: String, default: 'Admin' },
  target: { type: String, default: '' },
  details: { type: String, default: '' }
}, { timestamps: true });

const UserNotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  details: { type: String, default: '' },
  type: { type: String, default: 'info' },
  performedBy: { type: String, required: true },
  performedByName: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  FeeStructure: mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema),
  StudentFee: mongoose.models.StudentFee || mongoose.model('StudentFee', StudentFeeSchema),
  FeeTransaction: mongoose.models.FeeTransaction || mongoose.model('FeeTransaction', FeeTransactionSchema),
  FeeQuery: mongoose.models.FeeQuery || mongoose.model('FeeQuery', FeeQuerySchema),
  AdmissionApplication: mongoose.models.AdmissionApplication || mongoose.model('AdmissionApplication', AdmissionApplicationSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema),
  UserNotification: mongoose.models.UserNotification || mongoose.model('UserNotification', UserNotificationSchema)
};
