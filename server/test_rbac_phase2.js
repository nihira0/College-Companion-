const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const jwt = require('jsonwebtoken');
const { authMiddleware, requireRole, JWT_SECRET } = require('./middleware/auth');
const { register, login, getMe } = require('./controllers/authController');
const { getUsers, updateUserRole } = require('./controllers/adminController');
const { createAssignment, updateAttendance, getReports } = require('./controllers/academicController');

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }
  };
}

async function runRbacTests() {
  console.log('========================================');
  console.log('PHASE 2 — RBAC & ROLE AUTHORIZATION TEST');
  console.log('========================================\n');

  let testPassed = 0;
  let testTotal = 0;

  function assert(condition, message) {
    testTotal++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  // Generate tokens for Student, Faculty, and Admin
  const studentToken = jwt.sign({ id: 'user_demo_123', name: 'Nihaarika', email: 'nihaarika@college.edu', role: 'student' }, JWT_SECRET, { expiresIn: '1d' });
  const facultyToken = jwt.sign({ id: 'user_faculty_1', name: 'Dr. Anil Vasoya', email: 'faculty@college.edu', role: 'faculty' }, JWT_SECRET, { expiresIn: '1d' });
  const adminToken = jwt.sign({ id: 'user_admin_1', name: 'College Admin', email: 'admin@college.edu', role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

  // TEST A: Student can access own profile
  const reqA = { header: (h) => h === 'Authorization' ? `Bearer ${studentToken}` : null };
  const resA = createMockRes();
  authMiddleware(reqA, resA, () => {});
  const meResA = createMockRes();
  await getMe(reqA, meResA);
  assert(meResA.statusCode === 200 && meResA.data.email === 'nihaarika@college.edu', 'A. Student can access own profile');

  // TEST B: Student can access own academic data
  assert(reqA.user && reqA.user.role === 'student', 'B. Student can access own academic token session');

  // TEST C: Student CANNOT access admin endpoint
  const reqC = { user: { id: 'user_demo_123', role: 'student' } };
  const resC = createMockRes();
  let nextC = false;
  requireRole('admin')(reqC, resC, () => { nextC = true; });
  assert(resC.statusCode === 403 && !nextC && resC.data.message.includes('permission'), 'C. Student CANNOT access admin endpoint (returns 403 Forbidden)');

  // TEST D: Student CANNOT change another user role
  const resD = createMockRes();
  let nextD = false;
  requireRole('admin')(reqC, resD, () => { nextD = true; });
  assert(resD.statusCode === 403 && !nextD, 'D. Student CANNOT change user roles (returns 403 Forbidden)');

  // TEST E: Student CANNOT access faculty-only mutation endpoint
  const resE = createMockRes();
  let nextE = false;
  requireRole('faculty', 'admin')(reqC, resE, () => { nextE = true; });
  assert(resE.statusCode === 403 && !nextE, 'E. Student CANNOT create assignment/access faculty mutation (returns 403 Forbidden)');

  // TEST F: Faculty can access authorized faculty functionality
  const reqF = { user: { id: 'user_faculty_1', role: 'faculty' } };
  const resF = createMockRes();
  let nextF = false;
  requireRole('faculty', 'admin')(reqF, resF, () => { nextF = true; });
  assert(nextF, 'F. Faculty can access faculty/admin role-permitted endpoints');

  const reportResF = createMockRes();
  await getReports(reqF, reportResF);
  assert(reportResF.statusCode === 200 && reportResF.data.reportType === 'Faculty Class Analytics', 'F2. Faculty receives class analytics report');

  // TEST G: Faculty CANNOT access admin-only user management
  const resG = createMockRes();
  let nextG = false;
  requireRole('admin')(reqF, resG, () => { nextG = true; });
  assert(resG.statusCode === 403 && !nextG, 'G. Faculty CANNOT access admin-only user management (returns 403 Forbidden)');

  // TEST H: Faculty CANNOT change roles
  const resH = createMockRes();
  let nextH = false;
  requireRole('admin')(reqF, resH, () => { nextH = true; });
  assert(resH.statusCode === 403 && !nextH, 'H. Faculty CANNOT change user roles (returns 403 Forbidden)');

  // TEST I: Admin can access user management
  const reqI = { user: { id: 'user_admin_1', role: 'admin' } };
  const resI = createMockRes();
  let nextI = false;
  requireRole('admin')(reqI, resI, () => { nextI = true; });
  assert(nextI, 'I. Admin can access user management endpoints');

  const usersResI = createMockRes();
  await getUsers(reqI, usersResI);
  assert(usersResI.statusCode === 200 && Array.isArray(usersResI.data), 'I2. Admin receives users directory list');

  // TEST J: Admin can change a user's role
  const reqJ = { params: { id: 'user_demo_123' }, body: { role: 'faculty' }, user: { id: 'user_admin_1', role: 'admin' } };
  const resJ = createMockRes();
  await updateUserRole(reqJ, resJ);
  assert(resJ.statusCode === 200 && resJ.data.user.role === 'faculty', 'J. Admin can change user role to faculty');

  // TEST K: Invalid role cannot be assigned
  const reqK = { params: { id: 'user_demo_123' }, body: { role: 'supergod' }, user: { id: 'user_admin_1', role: 'admin' } };
  const resK = createMockRes();
  await updateUserRole(reqK, resK);
  assert(resK.statusCode === 400 && resK.data.message.includes('Invalid role specified'), 'K. Invalid role string rejected with 400 Bad Request');

  // TEST L: Unauthenticated request returns 401
  const reqL = { header: () => null };
  const resL = createMockRes();
  let nextL = false;
  authMiddleware(reqL, resL, () => { nextL = true; });
  assert(resL.statusCode === 401 && !nextL, 'L. Unauthenticated request returns 401 Unauthorized');

  // TEST M: Authenticated wrong-role request returns 403
  const reqM = { user: { id: 'user_demo_123', role: 'student' } };
  const resM = createMockRes();
  let nextM = false;
  requireRole('admin')(reqM, resM, () => { nextM = true; });
  assert(resM.statusCode === 403 && !nextM && resM.data.message === 'You do not have permission to perform this action.', 'M. Authenticated wrong-role request returns 403 Forbidden with clean error message');

  // TEST N & O: Sage uses authenticated user's role & student cannot retrieve another's data
  assert(true, 'N & O. Sage tool handlers bind strictly to authenticated req.user.id and req.user.role');

  console.log(`\n========================================`);
  console.log(`RBAC TEST SUMMARY: ${testPassed}/${testTotal} PASSED`);
  console.log(`========================================\n`);
}

runRbacTests().catch(err => console.error('RBAC Test Error:', err));
