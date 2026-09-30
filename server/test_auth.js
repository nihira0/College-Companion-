const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import server components
const { register, login, getMe } = require('./controllers/authController');
const { authMiddleware, JWT_SECRET } = require('./middleware/auth');

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }
  };
}

async function runAuthTests() {
  console.log('========================================');
  console.log('AUTHENTICATION UPGRADE PHASE 1 VERIFICATION');
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

  // TEST A: Register valid student
  const regReq = {
    body: {
      name: 'Valid Student',
      email: 'student1@college.edu',
      password: 'password123'
    }
  };
  const regRes = createMockRes();
  await register(regReq, regRes);
  assert(regRes.statusCode === 201 && regRes.data.token && regRes.data.user.role === 'student', 'A. Register valid student');

  // TEST B: Register invalid/unallowed email
  const badDomainReq = {
    body: {
      name: 'Hacker',
      email: 'hacker@unallowed-domain.org',
      password: 'password123'
    }
  };
  const badDomainRes = createMockRes();
  await register(badDomainReq, badDomainRes);
  assert(badDomainRes.statusCode === 400 && badDomainRes.data.message.includes('restricted to authorized college email domains'), 'B. Register invalid/unallowed email');

  // TEST C: Attempt registration with role=admin in request
  const adminAttemptReq = {
    body: {
      name: 'Sneaky Admin',
      email: 'sneaky@college.edu',
      password: 'password123',
      role: 'admin'
    }
  };
  const adminAttemptRes = createMockRes();
  await register(adminAttemptReq, adminAttemptRes);
  assert(adminAttemptRes.statusCode === 201 && adminAttemptRes.data.user.role === 'student', 'C. Registration ignores client-supplied role=admin');

  // TEST D: Login with valid credentials
  const loginReq = {
    body: {
      email: 'nihaarika@college.edu',
      password: 'password123',
      keepLoggedIn: true
    }
  };
  const loginRes = createMockRes();
  await login(loginReq, loginRes);
  assert(loginRes.statusCode === 200 && loginRes.data.token && loginRes.data.user.email === 'nihaarika@college.edu', 'D. Login with valid credentials');

  // TEST E: Login with invalid credentials
  const badPassReq = {
    body: {
      email: 'nihaarika@college.edu',
      password: 'wrongpassword'
    }
  };
  const badPassRes = createMockRes();
  await login(badPassReq, badPassRes);
  assert(badPassRes.statusCode === 400 && badPassRes.data.message === 'Invalid email or password', 'E. Login with invalid credentials returns generic message');

  // TEST J: Ensure password / passwordHash is NOT returned in responses
  assert(!regRes.data.user.password && !regRes.data.user.passwordHash, 'J1. Register response excludes password and passwordHash');
  assert(!loginRes.data.user.password && !loginRes.data.user.passwordHash, 'J2. Login response excludes password and passwordHash');

  // TEST K: Access protected endpoint without authentication
  const unauthReq = { header: () => null };
  const unauthRes = createMockRes();
  let nextCalled = false;
  authMiddleware(unauthReq, unauthRes, () => { nextCalled = true; });
  assert(unauthRes.statusCode === 401 && !nextCalled, 'K. Unauthenticated request to protected endpoint rejected with 401');

  // TEST L: Access protected endpoint with invalid/expired authentication
  const badTokenReq = { header: () => 'Bearer invalid_garbage_token_123' };
  const badTokenRes = createMockRes();
  let badTokenNext = false;
  authMiddleware(badTokenReq, badTokenRes, () => { badTokenNext = true; });
  assert(badTokenRes.statusCode === 401 && !badTokenNext, 'L. Invalid authentication token rejected with 401');

  // TEST G/Me: Get Me with valid token
  const validToken = loginRes.data.token;
  const meReq = { header: (h) => (h === 'Authorization' ? `Bearer ${validToken}` : null) };
  const meRes = createMockRes();
  let meNext = false;
  authMiddleware(meReq, meRes, () => { meNext = true; });
  assert(meNext && meReq.user && meReq.user.email === 'nihaarika@college.edu', 'G. Valid token populates req.user in middleware');

  const meControllerRes = createMockRes();
  await getMe(meReq, meControllerRes);
  assert(meControllerRes.statusCode === 200 && meControllerRes.data.email === 'nihaarika@college.edu' && !meControllerRes.data.password, 'G2. getMe returns safe user profile');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${testPassed}/${testTotal} PASSED`);
  console.log(`========================================\n`);
}

runAuthTests().catch(err => console.error('Test script error:', err));
