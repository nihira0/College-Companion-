const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
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
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING PHASE 3 ROLE ENHANCEMENT & FEE MANAGEMENT INTEGRATION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  async function login(email, password, selectedRole) {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email, password, selectedRole });
    return res.body;
  }

  // 1. Authenticate Roles
  console.log('1. Testing Authentication Tokens...');
  let studentAuth = await login('nihaarika@college.edu', 'password123', 'student');
  if (!studentAuth.token) studentAuth = await login('nihaarika@college.edu', 'Student@123', 'student');
  
  let facultyAuth = await login('faculty@college.edu', 'password123', 'faculty');
  if (!facultyAuth.token) facultyAuth = await login('faculty@college.edu', 'Faculty@123', 'faculty');

  let adminAuth = await login('admin@college.edu', 'password123', 'admin');
  if (!adminAuth.token) adminAuth = await login('admin@college.edu', 'Admin@123', 'admin');

  if (studentAuth.token && facultyAuth.token && adminAuth.token) {
    console.log('✅ Tokens retrieved successfully for Student, Faculty, and Admin roles.');
    passed++;
  } else {
    console.error('❌ Failed to retrieve tokens:', { studentAuth, facultyAuth, adminAuth });
    failed++;
  }

  // 2. Student Fee Summary Endpoint
  console.log('\n2. Testing Student Fee Management Endpoints...');
  const feeRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/academic/fees/summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentAuth.token}` }
  });

  if (feeRes.status === 200 && feeRes.body.totalPayable && feeRes.body.itemizedBreakdown) {
    console.log(`✅ Student Fee Summary retrieved: Total ₹${feeRes.body.totalPayable.toLocaleString()}, Paid ₹${feeRes.body.amountPaid.toLocaleString()}, Net ₹${feeRes.body.netPayable.toLocaleString()}`);
    passed++;
  } else {
    console.error('❌ Failed to fetch Student Fee Summary:', feeRes);
    failed++;
  }

  // 3. Student Submit Fee Discrepancy Ticket
  console.log('\n3. Testing Student Discrepancy Query Ticket...');
  const ticketRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/academic/fees/queries',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${studentAuth.token}`,
      'Content-Type': 'application/json'
    }
  }, {
    subject: 'Verification of Installment Receipt REC-2026-0199',
    description: 'Payment was made on Jan 10th. Please confirm scholarship deduction.'
  });

  if (ticketRes.status === 201 && ticketRes.body.id) {
    console.log(`✅ Fee Query Ticket created successfully (ID: ${ticketRes.body.id})`);
    passed++;
  } else {
    console.error('❌ Failed to create Fee Query Ticket:', ticketRes);
    failed++;
  }

  // 4. Admin Overview Stats
  console.log('\n4. Testing Admin Overview Stats...');
  const statsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/overview-stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminAuth.token}` }
  });

  if (statsRes.status === 200 && statsRes.body.studentCount !== undefined) {
    console.log(`✅ Admin Overview Stats retrieved: ${statsRes.body.studentCount} Students, ${statsRes.body.facultyCount} Faculty, ₹${(statsRes.body.totalCollected / 10000000).toFixed(2)} Cr Collected.`);
    passed++;
  } else {
    console.error('❌ Failed to fetch Admin Overview Stats:', statsRes);
    failed++;
  }

  // 5. Admin Password Reset Trigger
  console.log('\n5. Testing Admin Password Reset Endpoint...');
  const resetRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/users/user_student_2/reset-password',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminAuth.token}` }
  });

  if (resetRes.status === 200 && resetRes.body.temporaryPassword) {
    console.log(`✅ Admin Password Reset succeeded! Generated temp password: ${resetRes.body.temporaryPassword}`);
    passed++;
  } else {
    console.error('❌ Failed password reset:', resetRes);
    failed++;
  }

  // 6. Admin Admissions Pipeline & Candidate Conversion
  console.log('\n6. Testing Admissions Pipeline & 1-Click Enrollment...');
  const admRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/admissions',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminAuth.token}` }
  });

  if (admRes.status === 200 && Array.isArray(admRes.body)) {
    console.log(`✅ Admissions Pipeline retrieved: ${admRes.body.length} applicants found.`);
    
    // Test converting an applicant
    const targetAdm = admRes.body[0];
    const convertRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/admissions/${targetAdm.id || targetAdm._id}/convert-to-student`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminAuth.token}` }
    });

    if (convertRes.status === 200 && convertRes.body.student) {
      console.log(`✅ Converted applicant ${targetAdm.studentName} into active enrolled student account (${convertRes.body.student.rollNo})!`);
      passed++;
    } else {
      console.error('❌ Failed applicant conversion:', convertRes);
      failed++;
    }
  } else {
    console.error('❌ Failed to fetch admissions pipeline:', admRes);
    failed++;
  }

  // 7. Admin Manual Payment Record
  console.log('\n7. Testing Admin Manual Payment Recording...');
  const payRecordRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/record-payment',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAuth.token}`,
      'Content-Type': 'application/json'
    }
  }, {
    userId: 'user_demo_123',
    amount: 20000,
    paymentMode: 'Online / UPI',
    remarks: 'Installment #3 Clearing'
  });

  if (payRecordRes.status === 200 && payRecordRes.body.transaction) {
    console.log(`✅ Manual Payment recorded successfully! Receipt: ${payRecordRes.body.transaction.receiptNo}`);
    passed++;
  } else {
    console.error('❌ Failed to record manual payment:', payRecordRes);
    failed++;
  }

  // 8. Admin Audit Logs & Broadcast Announcement
  console.log('\n8. Testing Audit Logs & Announcement Broadcast...');
  const broadcastRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/broadcast-announcement',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAuth.token}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Semester 6 Exam Fee Clearances',
    content: 'All students are requested to clear Installment #3 before April 15th.',
    targetRole: 'student'
  });

  const logsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/audit-logs',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminAuth.token}` }
  });

  if (broadcastRes.status === 200 && logsRes.status === 200 && Array.isArray(logsRes.body)) {
    console.log(`✅ Broadcast Notice published & ${logsRes.body.length} Audit Log events recorded!`);
    passed++;
  } else {
    console.error('❌ Failed Broadcast or Audit logs:', { broadcastRes, logsRes });
    failed++;
  }

  // 9. RBAC Security Restrictions
  console.log('\n9. Testing Security RBAC Guard (Student requesting Admin route)...');
  const forbiddenRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/overview-stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentAuth.token}` }
  });

  if (forbiddenRes.status === 403) {
    console.log('✅ RBAC Security Guard successfully blocked unauthorized student request to /api/admin/overview-stats (403 Forbidden).');
    passed++;
  } else {
    console.error('❌ RBAC Guard failed:', forbiddenRes);
    failed++;
  }

  console.log(`\n==================================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);
}

runTests().catch(console.error);
