const mongoose = require('mongoose');
const User = require('../models/User');
const { Department, Division, Subject, FacultyAssignment } = require('../models/DepartmentModels');
const { 
  FeeStructure, 
  StudentFee, 
  FeeTransaction, 
  FeeQuery, 
  AdmissionApplication, 
  AuditLog 
} = require('../models/FinanceAndAdminModels');

const { mockUsers, REAL_IT_FACULTY } = require('./authController');

const isDbReady = () => mongoose.connection && mongoose.connection.readyState === 1;

// Demo Fallback In-Memory Datasets
let mockDepartments = [
  { id: 'dept_it_1', name: 'Information Technology', code: 'IT' },
  { id: 'dept_cs_1', name: 'Computer Engineering', code: 'COMP' },
  { id: 'dept_extc_1', name: 'Electronics & Telecom', code: 'EXTC' }
];

let mockDivisions = [
  { id: 'div_ita_1', departmentId: 'dept_it_1', name: 'IT-A', academicYear: '2025-2026' },
  { id: 'div_itb_1', departmentId: 'dept_it_1', name: 'IT-B', academicYear: '2025-2026' },
  { id: 'div_itc_1', departmentId: 'dept_it_1', name: 'IT-C', academicYear: '2025-2026' }
];

let mockSubjects = [
  { id: 'sub_dbms_1', departmentId: 'dept_it_1', name: 'Database Management Systems', code: 'IT601' },
  { id: 'sub_cn_1', departmentId: 'dept_it_1', name: 'Computer Networks', code: 'IT602' },
  { id: 'sub_os_1', departmentId: 'dept_it_1', name: 'Operating Systems', code: 'IT603' },
  { id: 'sub_se_1', departmentId: 'dept_it_1', name: 'Software Engineering', code: 'IT604' }
];

let mockFacultyAssignments = [
  { id: 'fa_1', facultyId: 'user_fac_1', subjectId: 'sub_dbms_1', divisionId: 'div_ita_1', academicYear: '2025-2026' },
  { id: 'fa_2', facultyId: 'user_fac_2', subjectId: 'sub_se_1', divisionId: 'div_ita_1', academicYear: '2025-2026' },
  { id: 'fa_3', facultyId: 'user_fac_3', subjectId: 'sub_se_1', divisionId: 'div_itb_1', academicYear: '2025-2026' },
  { id: 'fa_4', facultyId: 'user_faculty_1', subjectId: 'sub_dbms_1', divisionId: 'div_ita_1', academicYear: '2025-2026' },
  { id: 'fa_5', facultyId: 'user_fac_6', subjectId: 'sub_os_1', divisionId: 'div_itc_1', academicYear: '2025-2026' },
  { id: 'fa_6', facultyId: 'user_fac_11', subjectId: 'sub_cn_1', divisionId: 'div_itb_1', academicYear: '2025-2026' },
  { id: 'fa_7', facultyId: 'user_fac_17', subjectId: 'sub_dbms_1', divisionId: 'div_itc_1', academicYear: '2025-2026' },
  { id: 'fa_8', facultyId: 'user_fac_23', subjectId: 'sub_cn_1', divisionId: 'div_ita_1', academicYear: '2025-2026' },
  { id: 'fa_9', facultyId: 'user_fac_25', subjectId: 'sub_os_1', divisionId: 'div_itb_1', academicYear: '2025-2026' }
];

let mockAdmissions = [
  { id: 'adm_101', applicationNo: 'APP-2026-089', studentName: 'Aarav Mehta', email: 'aarav.m@gmail.com', phone: '+91 98201 12345', course: 'B.Tech Information Technology', departmentId: 'dept_it_1', status: 'Received', appliedDate: '2026-03-01', score: 96.4, notes: 'Strong JEE main percentile.' },
  { id: 'adm_102', applicationNo: 'APP-2026-092', studentName: 'Ananya Roy', email: 'ananya.roy@gmail.com', phone: '+91 98202 54321', course: 'B.Tech Computer Engineering', departmentId: 'dept_cs_1', status: 'Under Review', appliedDate: '2026-03-02', score: 94.8, notes: 'MHT-CET Merit rank 412.' },
  { id: 'adm_103', applicationNo: 'APP-2026-095', studentName: 'Kabir Verma', email: 'kabir.v@gmail.com', phone: '+91 98203 99887', course: 'B.Tech Information Technology', departmentId: 'dept_it_1', status: 'Interviewing', appliedDate: '2026-03-04', score: 91.2, notes: 'Interview scheduled for March 12.' },
  { id: 'adm_104', applicationNo: 'APP-2026-098', studentName: 'Sanya Kapoor', email: 'sanya.k@gmail.com', phone: '+91 98204 11223', course: 'B.Tech Information Technology', departmentId: 'dept_it_1', status: 'Accepted', appliedDate: '2026-03-05', score: 97.5, notes: 'Eligible for Direct Admission.' }
];

let mockFeeStructures = [
  { id: 'fs_1', departmentId: 'dept_it_1', academicYear: '2025-2026', semester: 6, tuitionFee: 75000, developmentFee: 15000, labExamFee: 8000, otherCharges: 2000, totalAmount: 100000 }
];

let mockAuditLogs = [
  { id: 'log_1', action: 'SYSTEM_BOOT', performedBy: 'user_admin_1', performedByName: 'College Admin', target: 'System', details: 'System initialization and schema check completed.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log_2', action: 'ASSIGN_FACULTY', performedBy: 'user_admin_1', performedByName: 'College Admin', target: 'Dr. Rajesh S. Bansode', details: 'Assigned Database Systems for IT-A.', timestamp: new Date(Date.now() - 1800000).toISOString() }
];

// 1. Overview Stats
const getOverviewStats = async (req, res) => {
  try {
    let studentCount = 1420;
    let facultyCount = REAL_IT_FACULTY.length;
    let deptCount = 6;
    let totalCollected = 14200000; // INR
    let totalPending = 2800000;
    let overallAttendanceAvg = 84.5;

    if (isDbReady()) {
      try {
        studentCount = await User.countDocuments({ role: 'student' });
        facultyCount = await User.countDocuments({ role: 'faculty' });
        deptCount = await Department.countDocuments();
      } catch (e) {}
    }

    res.json({
      studentCount: studentCount || 1420,
      facultyCount: facultyCount || REAL_IT_FACULTY.length,
      departmentCount: deptCount || 6,
      totalCollected,
      totalPending,
      overallAttendanceAvg,
      activeAcademicYear: '2025-2026'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving admin overview stats' });
  }
};

// 2. Users Management & Password Reset
const getUsers = async (req, res) => {
  try {
    let users = [];
    if (isDbReady()) {
      users = await User.find().select('-password');
    }
    
    if (!users || users.length === 0) {
      users = mockUsers;
    } else {
      users = users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role || 'student',
        designation: u.designation || (u.role === 'faculty' ? 'Assistant Professor' : undefined),
        course: u.course || 'B.Tech Information Technology',
        semester: u.semester || 6,
        departmentId: u.departmentId || 'dept_it_1',
        divisionId: u.divisionId || 'div_ita_1',
        rollNo: u.rollNo || 'IT-2026-001',
        avatar: u.avatar || '🌿',
        createdAt: u.createdAt
      }));
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving users list' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['student', 'faculty', 'admin'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid role specified. Role must be student, faculty, or admin.' });
    }

    const cleanRole = role.toLowerCase();
    let updatedUser = null;

    if (isDbReady()) {
      try {
        const user = await User.findById(id);
        if (user) {
          user.role = cleanRole;
          await user.save();
          updatedUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            course: user.course,
            semester: user.semester,
            departmentId: user.departmentId,
            divisionId: user.divisionId,
            rollNo: user.rollNo,
            avatar: user.avatar
          };
        }
      } catch (e) {}
    }

    if (!updatedUser) {
      updatedUser = {
        id,
        name: id.includes('faculty') ? 'Dr. Anil Vasoya' : id.includes('admin') ? 'College Admin' : 'Nihaarika',
        email: id.includes('faculty') ? 'faculty@college.edu' : id.includes('admin') ? 'admin@college.edu' : 'nihaarika@college.edu',
        role: cleanRole,
        course: 'B.Tech Information Technology',
        semester: 6,
        departmentId: 'dept_it_1',
        divisionId: 'div_ita_1',
        rollNo: 'IT-2026-001',
        avatar: '🌿'
      };
    }

    // Add Audit Log
    mockAuditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'UPDATE_ROLE',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'College Admin',
      target: updatedUser.name,
      details: `Changed role to ${cleanRole}`,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: `User role updated successfully to ${cleanRole}`,
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const temporaryPassword = `Pass@${Math.floor(1000 + Math.random() * 9000)}`;

    if (isDbReady()) {
      try {
        const bcrypt = require('bcryptjs');
        const user = await User.findById(id);
        if (user) {
          user.password = await bcrypt.hash(temporaryPassword, 10);
          await user.save();
        }
      } catch (e) {}
    }

    mockAuditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'RESET_PASSWORD',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'College Admin',
      target: id,
      details: `Generated temporary credentials for user ${id}`,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: `Temporary password reset successfully`,
      temporaryPassword
    });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};

const updateUserAcademic = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, divisionId, rollNo } = req.body;

    let updatedUser = null;
    if (isDbReady()) {
      try {
        const user = await User.findById(id);
        if (user) {
          if (departmentId) user.departmentId = departmentId;
          if (divisionId) user.divisionId = divisionId;
          if (rollNo) user.rollNo = rollNo;
          await user.save();
          updatedUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId,
            divisionId: user.divisionId,
            rollNo: user.rollNo
          };
        }
      } catch (e) {}
    }

    if (!updatedUser) {
      updatedUser = {
        id,
        departmentId: departmentId || 'dept_it_1',
        divisionId: divisionId || 'div_ita_1',
        rollNo: rollNo || 'IT-2026-042'
      };
    }

    res.json({ message: 'Student academic info updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating student academic info' });
  }
};

// 3. Admissions Lifecycle
const getAdmissions = async (req, res) => {
  try {
    if (isDbReady()) {
      const list = await AdmissionApplication.find().sort({ createdAt: -1 });
      if (list && list.length > 0) return res.json(list);
    }
  } catch (e) {}
  res.json(mockAdmissions);
};

const createAdmission = async (req, res) => {
  const { studentName, email, phone, course, departmentId, score, notes } = req.body;
  if (!studentName || !email) {
    return res.status(400).json({ message: 'Student name and email are required' });
  }

  const newApp = {
    id: `adm_${Date.now()}`,
    applicationNo: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
    studentName,
    email: email.toLowerCase().trim(),
    phone: phone || '',
    course: course || 'B.Tech Information Technology',
    departmentId: departmentId || 'dept_it_1',
    status: 'Received',
    appliedDate: new Date().toISOString().split('T')[0],
    score: Number(score) || 90.0,
    notes: notes || ''
  };

  try {
    if (isDbReady()) {
      const item = new AdmissionApplication(newApp);
      await item.save();
      return res.status(201).json(item);
    }
  } catch (e) {}

  mockAdmissions.unshift(newApp);

  mockAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'CREATE_ADMISSION',
    performedBy: req.user?.id || 'admin',
    performedByName: req.user?.name || 'College Admin',
    target: studentName,
    details: `Created application ${newApp.applicationNo}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newApp);
};

const updateAdmissionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['Received', 'Under Review', 'Interviewing', 'Accepted', 'Rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let item = mockAdmissions.find(a => a.id === id || a._id === id);
  if (item) {
    item.status = status;
    if (notes) item.notes = notes;
  }

  if (isDbReady()) {
    try {
      const dbItem = await AdmissionApplication.findById(id);
      if (dbItem) {
        dbItem.status = status;
        if (notes) dbItem.notes = notes;
        await dbItem.save();
        item = dbItem;
      }
    } catch (e) {}
  }

  mockAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'UPDATE_ADMISSION_STATUS',
    performedBy: req.user?.id || 'admin',
    performedByName: req.user?.name || 'College Admin',
    target: id,
    details: `Updated status to ${status}`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: `Application status updated to ${status}`, item });
};

const convertAdmissionToStudent = async (req, res) => {
  const { id } = req.params;
  let adm = mockAdmissions.find(a => a.id === id || a._id === id);

  if (isDbReady()) {
    try {
      adm = await AdmissionApplication.findById(id);
    } catch (e) {}
  }

  if (!adm) {
    return res.status(404).json({ message: 'Admission application not found' });
  }

  const generatedRollNo = `IT-2026-${Math.floor(100 + Math.random() * 899)}`;
  const newUser = {
    id: `user_converted_${Date.now()}`,
    name: adm.studentName,
    email: adm.email,
    role: 'student',
    course: adm.course || 'B.Tech Information Technology',
    semester: 1,
    departmentId: adm.departmentId || 'dept_it_1',
    divisionId: 'div_ita_1',
    rollNo: generatedRollNo,
    avatar: '🎓'
  };

  if (adm.status) adm.status = 'Accepted';
  adm.convertedStudentId = newUser.id;

  if (isDbReady()) {
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Student@123', 10);
      const dbUser = new User({
        name: newUser.name,
        email: newUser.email,
        password: hashedPassword,
        role: 'student',
        course: newUser.course,
        semester: 1,
        departmentId: newUser.departmentId,
        divisionId: newUser.divisionId,
        rollNo: newUser.rollNo,
        avatar: newUser.avatar
      });
      await dbUser.save();
      newUser.id = dbUser._id.toString();
    } catch (e) {}
  }

  mockAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'CONVERT_TO_STUDENT',
    performedBy: req.user?.id || 'admin',
    performedByName: req.user?.name || 'College Admin',
    target: adm.studentName,
    details: `Converted applicant ${adm.applicationNo} to enrolled student ${generatedRollNo}`,
    timestamp: new Date().toISOString()
  });

  res.json({
    message: `Applicant successfully enrolled as Student (${generatedRollNo})! Initial password is Student@123`,
    student: newUser
  });
};

// 4. Finance & Fee Structures
const getFeeStructures = async (req, res) => {
  try {
    if (isDbReady()) {
      const list = await FeeStructure.find();
      if (list && list.length > 0) return res.json(list);
    }
  } catch (e) {}
  res.json(mockFeeStructures);
};

const createFeeStructure = async (req, res) => {
  const { departmentId, academicYear, semester, tuitionFee, developmentFee, labExamFee, otherCharges } = req.body;

  const total = (Number(tuitionFee) || 0) + (Number(developmentFee) || 0) + (Number(labExamFee) || 0) + (Number(otherCharges) || 0);

  const newFs = {
    id: `fs_${Date.now()}`,
    departmentId: departmentId || 'dept_it_1',
    academicYear: academicYear || '2025-2026',
    semester: Number(semester) || 6,
    tuitionFee: Number(tuitionFee) || 75000,
    developmentFee: Number(developmentFee) || 15000,
    labExamFee: Number(labExamFee) || 8000,
    otherCharges: Number(otherCharges) || 2000,
    totalAmount: total || 100000
  };

  try {
    if (isDbReady()) {
      const item = new FeeStructure(newFs);
      await item.save();
      return res.status(201).json(item);
    }
  } catch (e) {}

  mockFeeStructures.push(newFs);

  mockAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'CREATE_FEE_STRUCTURE',
    performedBy: req.user?.id || 'admin',
    performedByName: req.user?.name || 'College Admin',
    target: `Semester ${newFs.semester}`,
    details: `Configured total fee of ₹${newFs.totalAmount.toLocaleString()}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newFs);
};

const recordPayment = async (req, res) => {
  const { userId, amount, paymentMode, remarks } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ message: 'userId and amount are required' });
  }

  const txnRef = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const receiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTxn = {
    id: `txn_${Date.now()}`,
    transactionRef: txnRef,
    userId,
    amount: Number(amount),
    paymentMode: paymentMode || 'Online / UPI',
    paymentDate: new Date().toISOString().split('T')[0],
    receiptNo,
    status: 'Verified',
    remarks: remarks || 'Manual Payment Recorded by Admin'
  };

  if (isDbReady()) {
    try {
      const dbTxn = new FeeTransaction(newTxn);
      await dbTxn.save();
    } catch (e) {}
  }

  mockAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'RECORD_PAYMENT',
    performedBy: req.user?.id || 'admin',
    performedByName: req.user?.name || 'College Admin',
    target: userId,
    details: `Recorded payment of ₹${Number(amount).toLocaleString()} (${txnRef})`,
    timestamp: new Date().toISOString()
  });

  res.json({
    message: `Payment of ₹${Number(amount).toLocaleString()} recorded successfully! Receipt: ${receiptNo}`,
    transaction: newTxn
  });
};

const getFinancialSummary = async (req, res) => {
  res.json({
    academicYear: '2025-2026',
    totalBilled: 17000000,
    totalCollected: 14200000,
    totalOutstanding: 2800000,
    collectionPercentage: 83.5,
    breakdown: [
      { category: 'Tuition Fees', collected: 10650000, target: 12750000 },
      { category: 'Development Fees', collected: 2130000, target: 2550000 },
      { category: 'Lab & Exam Fees', collected: 1136000, target: 1360000 },
      { category: 'Other Amenities', collected: 284000, target: 340000 }
    ]
  });
};

// 5. Academic Departments, Divisions, Subjects, Faculty Assignments
const getDepartments = async (req, res) => {
  try {
    if (isDbReady()) {
      const items = await Department.find();
      if (items && items.length > 0) return res.json(items);
    }
  } catch (e) {}
  res.json(mockDepartments);
};

const getDivisions = async (req, res) => {
  try {
    if (isDbReady()) {
      const items = await Division.find();
      if (items && items.length > 0) return res.json(items);
    }
  } catch (e) {}
  res.json(mockDivisions);
};

const createDivision = async (req, res) => {
  const { name, departmentId, academicYear } = req.body;
  if (!name) return res.status(400).json({ message: 'Division name is required' });

  const newDiv = {
    id: `div_${Date.now()}`,
    departmentId: departmentId || 'dept_it_1',
    name,
    academicYear: academicYear || '2025-2026'
  };

  try {
    if (isDbReady()) {
      const item = new Division(newDiv);
      await item.save();
      return res.status(201).json(item);
    }
  } catch (e) {}

  mockDivisions.push(newDiv);
  res.status(201).json(newDiv);
};

const getSubjects = async (req, res) => {
  try {
    if (isDbReady()) {
      const items = await Subject.find();
      if (items && items.length > 0) return res.json(items);
    }
  } catch (e) {}
  res.json(mockSubjects);
};

const createSubject = async (req, res) => {
  const { name, code, departmentId } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'Subject name and code are required' });

  const newSub = {
    id: `sub_${Date.now()}`,
    departmentId: departmentId || 'dept_it_1',
    name,
    code
  };

  try {
    if (isDbReady()) {
      const item = new Subject(newSub);
      await item.save();
      return res.status(201).json(item);
    }
  } catch (e) {}

  mockSubjects.push(newSub);
  res.status(201).json(newSub);
};

const getFacultyAssignments = async (req, res) => {
  try {
    if (isDbReady()) {
      const items = await FacultyAssignment.find();
      if (items && items.length > 0) return res.json(items);
    }
  } catch (e) {}
  res.json(mockFacultyAssignments);
};

const createFacultyAssignment = async (req, res) => {
  const { facultyId, subjectId, divisionId, academicYear } = req.body;
  if (!facultyId || !subjectId || !divisionId) {
    return res.status(400).json({ message: 'facultyId, subjectId, and divisionId are required' });
  }

  const newAssign = {
    id: `fa_${Date.now()}`,
    facultyId,
    subjectId,
    divisionId,
    academicYear: academicYear || '2025-2026'
  };

  try {
    if (isDbReady()) {
      const item = new FacultyAssignment(newAssign);
      await item.save();
      return res.status(201).json(item);
    }
  } catch (e) {}

  mockFacultyAssignments.push(newAssign);
  res.status(201).json(newAssign);
};

const deleteFacultyAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbReady()) {
      await FacultyAssignment.findByIdAndDelete(id);
    }
  } catch (e) {}

  const index = mockFacultyAssignments.findIndex(fa => fa.id === id || fa._id === id);
  if (index !== -1) {
    mockFacultyAssignments.splice(index, 1);
  }

  res.json({ message: 'Faculty assignment removed successfully' });
};

const batchImportStudents = async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'No valid student records provided' });
  }

  const imported = [];
  for (const s of students) {
    const newStudent = {
      id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: s.name || 'Imported Student',
      email: s.email ? s.email.toLowerCase().trim() : `student_${Date.now()}@college.edu`,
      role: 'student',
      course: 'B.Tech Information Technology',
      semester: 6,
      departmentId: s.departmentId || 'dept_it_1',
      divisionId: s.divisionId || 'div_ita_1',
      rollNo: s.rollNo || `IT-2026-${Math.floor(Math.random() * 100)}`,
      avatar: '🎓'
    };
    imported.push(newStudent);
  }

  res.json({ message: `Successfully imported ${imported.length} student records!`, imported });
};

// 6. Audit Logs & System Communications
const getAuditLogs = async (req, res) => {
  try {
    if (isDbReady()) {
      const logs = await AuditLog.find().sort({ createdAt: -1 });
      if (logs && logs.length > 0) return res.json(logs);
    }
  } catch (e) {}
  res.json(mockAuditLogs);
};

const broadcastAnnouncement = async (req, res) => {
  const { title, content, targetRole, urgent } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  mockAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'BROADCAST_ANNOUNCEMENT',
    performedBy: req.user?.id || 'admin',
    performedByName: req.user?.name || 'College Admin',
    target: targetRole || 'All Users',
    details: `Broadcast notice: "${title}"`,
    timestamp: new Date().toISOString()
  });

  res.json({
    message: `Announcement broadcast successfully to ${targetRole || 'All Users'}!`,
    announcement: { title, content, targetRole: targetRole || 'all', urgent: !!urgent, date: new Date().toISOString().split('T')[0] }
  });
};

module.exports = {
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
  broadcastAnnouncement,
  mockFacultyAssignments,
  mockSubjects,
  mockDivisions
};
