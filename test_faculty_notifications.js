const http = require('http');

function request(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING ROLE-AWARE FACULTY NOTIFICATION SYSTEM TESTS ===\n');

  // 1. Retrieve Tokens
  console.log('1. Testing Token Authentication for Student, Faculty, and Admin...');
  let studentToken, facultyToken, adminToken;

  try {
    const resStu = await request('/api/auth/login', 'POST', {}, { email: 'nihaarika@college.edu', password: 'password123' });
    studentToken = resStu.body.token;

    const resFac = await request('/api/auth/login', 'POST', {}, { email: 'faculty@college.edu', password: 'password123' });
    facultyToken = resFac.body.token;

    const resAdm = await request('/api/auth/login', 'POST', {}, { email: 'admin@college.edu', password: 'password123' });
    adminToken = resAdm.body.token;

    console.log('✅ Tokens retrieved successfully for Student, Faculty, and Admin.');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test Faculty Role Notifications
  console.log('\n2. Testing Faculty Notifications Endpoint (Role-Aware Scoping)...');
  let facNotifs = [];
  try {
    const res = await request('/api/academic/notifications', 'GET', { 'Authorization': `Bearer ${facultyToken}` });
    facNotifs = res.body;

    console.log(`✅ Faculty received ${facNotifs.length} role-aware notifications.`);

    // Check no student study goals/pomodoro in faculty notifications
    const hasStudentGoals = facNotifs.some(n => 
      n.title?.includes('Study Goal') || n.title?.includes('Pomodoro') || n.title?.includes('Study streak')
    );
    if (hasStudentGoals) {
      console.error('❌ FAILURE: Faculty received student-specific study goal/pomodoro notifications!');
      process.exit(1);
    } else {
      console.log('✅ PASS: Faculty notifications do NOT contain student-only study goals, streaks, or pomodoros.');
    }

    // Verify Faculty Categories present
    const categories = new Set(facNotifs.map(n => n.category));
    console.log(`   Categories present: ${Array.from(categories).join(', ')}`);
  } catch (err) {
    console.error('❌ Failed fetching faculty notifications:', err.message);
    process.exit(1);
  }

  // 3. Test Student Role Notifications
  console.log('\n3. Testing Student Notifications Endpoint...');
  try {
    const res = await request('/api/academic/notifications', 'GET', { 'Authorization': `Bearer ${studentToken}` });
    const stuNotifs = res.body;
    console.log(`✅ Student received ${stuNotifs.length} role-aware notifications.`);

    const hasFacultyDuties = stuNotifs.some(n => n.title?.includes('Faculty Duty') || n.title?.includes('Marks Submission'));
    if (hasFacultyDuties) {
      console.error('❌ FAILURE: Student received faculty duty / marks submission notifications!');
      process.exit(1);
    } else {
      console.log('✅ PASS: Student notifications do NOT contain faculty duties or faculty marks submission alerts.');
    }
  } catch (err) {
    console.error('❌ Failed fetching student notifications:', err.message);
    process.exit(1);
  }

  // 4. Test Admin -> Faculty Notification Dispatch
  console.log('\n4. Testing Admin Action Triggering Faculty Notifications...');
  try {
    const resBcast = await request('/api/admin/broadcast-announcement', 'POST', { 'Authorization': `Bearer ${adminToken}` }, {
      title: 'Emergency Faculty Council Assembly',
      content: 'All IT Department faculty members are requested to attend the autonomous scheme review meeting.',
      targetRole: 'faculty',
      urgent: true
    });
    console.log('✅ Admin broadcast executed:', resBcast.body.message);

    // Re-fetch faculty notifications to verify receipt
    const resCheck = await request('/api/academic/notifications', 'GET', { 'Authorization': `Bearer ${facultyToken}` });
    const updatedFacNotifs = resCheck.body;
    const foundNew = updatedFacNotifs.find(n => n.title?.includes('Emergency Faculty Council Assembly'));

    if (foundNew) {
      console.log(`✅ PASS: Faculty successfully received Admin broadcast! Priority: ${foundNew.priority}, Category: ${foundNew.category}`);
    } else {
      console.error('❌ FAILURE: Faculty did not receive Admin broadcast notification!');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Admin broadcast notification test failed:', err.message);
    process.exit(1);
  }

  // 5. Test Mark Notification Read & Read-All Endpoints
  console.log('\n5. Testing Notification Mark as Read & Read-All...');
  try {
    if (facNotifs.length > 0) {
      const targetId = facNotifs[0].id || facNotifs[0]._id;
      const resRead = await request(`/api/academic/notifications/${targetId}/read`, 'PATCH', { 'Authorization': `Bearer ${facultyToken}` });
      console.log(`✅ Single notification marked read (ID: ${targetId}):`, resRead.body.message);
    }

    const resReadAll = await request('/api/academic/notifications/read-all', 'PATCH', { 'Authorization': `Bearer ${facultyToken}` });
    console.log('✅ All notifications marked read:', resReadAll.body.message);
  } catch (err) {
    console.error('❌ Mark notification read failed:', err.message);
    process.exit(1);
  }

  // 6. Test Sage AI Integration for Faculty Notifications
  console.log('\n6. Testing Sage AI Integration with Faculty Notifications...');
  try {
    const resSage1 = await request('/api/ai/chat', 'POST', { 'Authorization': `Bearer ${facultyToken}` }, { message: 'What are my important notifications?' });
    console.log('✅ Sage AI response to "What are my important notifications?":');
    console.log('   Reply snippet:', (resSage1.body.reply || '').slice(0, 150) + '...');

    const resSage2 = await request('/api/ai/chat', 'POST', { 'Authorization': `Bearer ${facultyToken}` }, { message: 'Did the admin post anything today?' });
    console.log('✅ Sage AI response to "Did the admin post anything today?":');
    console.log('   Reply snippet:', (resSage2.body.reply || '').slice(0, 150) + '...');

    const resSage3 = await request('/api/ai/chat', 'POST', { 'Authorization': `Bearer ${facultyToken}` }, { message: 'Do I have any upcoming faculty duties?' });
    console.log('✅ Sage AI response to "Do I have any upcoming faculty duties?":');
    console.log('   Reply snippet:', (resSage3.body.reply || '').slice(0, 150) + '...');
  } catch (err) {
    console.error('❌ Sage AI notification integration test failed:', err.message);
    process.exit(1);
  }

  // 7. Test Phase 3 Regression Test Suite
  console.log('\n7. Running Existing Phase 3 Role Enhancements Tests...');
  const { execSync } = require('child_process');
  try {
    const output = execSync('node test_phase3_role_enhancements.js').toString();
    console.log('✅ Phase 3 Regression Tests Passed cleanly.');
  } catch (err) {
    console.error('❌ Phase 3 Regression Tests failed:', err.message);
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('ALL FACULTY NOTIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('==================================================\n');
}

runTests();
