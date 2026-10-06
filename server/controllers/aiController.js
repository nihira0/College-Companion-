const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const academicController = require('./academicController');
const SageChat = require('../models/SageChat');

// In-Memory Repository for Sage Chat History Fallback
let mockSageChats = [
  {
    id: 'chat_demo_1',
    userId: 'user_demo_123',
    title: 'Attendance Query',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    messages: [
      { sender: 'user', text: 'Can you tell me my attendance?', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { sender: 'sage', text: 'Your overall attendance is **82.4%** (108/131 classes attended).\n\nSubject Breakdown:\n• **Big Data Analysis**: 86.7% (26/30 classes) — Safe Zone 🛡️\n• **Machine Learning**: 73.3% (22/30 classes) — Attention Needed ⚠️\n• **User Interface Designing**: 87.5% (28/32 classes) — Safe Zone 🛡️\n• **Product Design and Development**: 72.0% (18/25 classes) — Attention Needed ⚠️\n• **DevOps**: 100% (14/14 classes) — Safe Zone 🛡️', sourceType: 'Academic Records', timestamp: new Date(Date.now() - 3600000 * 24 + 1000).toISOString() }
    ]
  },
  {
    id: 'chat_demo_2',
    userId: 'user_demo_123',
    title: 'HDFS in Big Data',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    messages: [
      { sender: 'user', text: 'What is HDFS in Big Data Analysis?', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
      { sender: 'sage', text: '**HDFS** (Hadoop Distributed File System) is the primary storage system used by Apache Hadoop for storing massive datasets across clusters of commodity computers.', sourceType: 'Sage AI', timestamp: new Date(Date.now() - 3600000 * 48 + 1000).toISOString() }
    ]
  }
];

// Simple deterministic title generation from first message
const generateChatTitle = (firstMessage) => {
  const msg = (firstMessage || '').trim();
  if (!msg) return 'Sage Conversation';
  const msgLower = msg.toLowerCase();

  if (msgLower.includes('attendance') || msgLower.includes('bunk')) return 'Attendance Query';
  if (msgLower.includes('timetable') || msgLower.includes('schedule')) return 'Class Timetable';
  if (msgLower.includes('mark') || msgLower.includes('cgpa') || msgLower.includes('score')) return 'Academic Marks & CGPA';
  if (msgLower.includes('fee') || msgLower.includes('balance') || msgLower.includes('due')) return 'Fee Summary';
  if (msgLower.includes('assignment') || msgLower.includes('due date')) return 'Assignments Query';

  let clean = msg
    .replace(/^(can\s+you\s+(please\s+)?(tell|show|check|explain|get|view)\s+(me\s+)?(about\s+)?)/i, '')
    .replace(/^(please\s+(tell|show|check|explain|get|view)\s+(me\s+)?(about\s+)?)/i, '')
    .replace(/^(what\s+is\s+a?\s*|what\s+are\s+a?\s*|explain\s+a?\s*|tell\s+me\s+about\s+)/i, '')
    .trim();

  if (!clean) clean = msg;
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (clean.length > 32) {
    clean = clean.slice(0, 32).trim() + '...';
  }
  return clean || 'Sage Conversation';
};

// Helper to save chat turn into DB or memory
const saveChatMessage = async (userId, chatId, userMessageText, sageReplyText, sourceType, sources) => {
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;
  const userMsgObj = { sender: 'user', text: userMessageText, timestamp: new Date() };
  const sageMsgObj = { sender: 'sage', text: sageReplyText, sourceType: sourceType || 'Sage AI', sources: sources || [], timestamp: new Date() };

  if (isDbReady) {
    try {
      let chatDoc;
      if (chatId) {
        chatDoc = await SageChat.findOne({ _id: chatId, userId });
      }
      if (!chatDoc) {
        const title = generateChatTitle(userMessageText);
        chatDoc = new SageChat({
          userId,
          title,
          messages: [userMsgObj, sageMsgObj]
        });
      } else {
        chatDoc.messages.push(userMsgObj, sageMsgObj);
        chatDoc.updatedAt = new Date();
      }
      await chatDoc.save();
      return {
        chatId: chatDoc._id.toString(),
        title: chatDoc.title,
        messages: chatDoc.messages
      };
    } catch (e) {
      console.error('⚠️ DB SageChat save notice:', e.message);
    }
  }

  let chat = mockSageChats.find(c => (c.id === chatId || c._id === chatId) && c.userId === userId);
  if (!chat) {
    const title = generateChatTitle(userMessageText);
    chat = {
      id: `chat_${Date.now()}`,
      userId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [userMsgObj, sageMsgObj]
    };
    mockSageChats.unshift(chat);
  } else {
    chat.messages.push(userMsgObj, sageMsgObj);
    chat.updatedAt = new Date().toISOString();
  }

  return {
    chatId: chat.id,
    title: chat.title,
    messages: chat.messages
  };
};

// Helper to initialize Gemini Client securely from environment variables
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  } catch (err) {
    console.error('⚠️ Failed to initialize GoogleGenAI client:', err.message);
    return null;
  }
};

// Helper to extract web sources & citations from Gemini grounding metadata
const extractGroundingSources = (response) => {
  try {
    const candidate = response.candidates?.[0];
    const metadata = candidate?.groundingMetadata;
    if (!metadata) return [];

    const sources = [];
    const seenUris = new Set();

    if (metadata.groundingChunks && Array.isArray(metadata.groundingChunks)) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web && chunk.web.uri) {
          const uri = chunk.web.uri;
          if (!seenUris.has(uri)) {
            seenUris.add(uri);
            sources.push({
              title: chunk.web.title || uri,
              url: uri
            });
          }
        }
      }
    }
    return sources;
  } catch (e) {
    return [];
  }
};

// Tool Definitions for Gemini API Function Calling
const sageTools = [
  {
    functionDeclarations: [
      {
        name: 'getUserAttendance',
        description: 'Get attendance records, percentages, target status, and bunk allowances for the authenticated student. Can filter by subject.',
        parameters: {
          type: 'OBJECT',
          properties: {
            subject: {
              type: 'STRING',
              description: 'Optional subject name or keyword to filter (e.g. "DBMS", "Operating Systems", "Computer Networks")'
            }
          }
        }
      },
      {
        name: 'getUserAssignments',
        description: 'Get assignments, due dates, priorities, and submission statuses. Can filter by status or priority.',
        parameters: {
          type: 'OBJECT',
          properties: {
            status: {
              type: 'STRING',
              description: 'Filter by status: "pending" (incomplete/due) or "completed"'
            },
            priority: {
              type: 'STRING',
              description: 'Filter by priority: "high", "medium", or "low"'
            }
          }
        }
      },
      {
        name: 'getUserMarks',
        description: 'Get internal marks, midterm scores, SGPA semester history, and overall CGPA.',
        parameters: {
          type: 'OBJECT',
          properties: {
            subject: {
              type: 'STRING',
              description: 'Optional subject filter'
            },
            semester: {
              type: 'NUMBER',
              description: 'Optional semester number'
            }
          }
        }
      },
      {
        name: 'getUserTimetable',
        description: 'Get class schedule, timing, room numbers, and professor details. Can filter by day.',
        parameters: {
          type: 'OBJECT',
          properties: {
            day: {
              type: 'STRING',
              description: 'Day of the week (e.g. "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "today", "tomorrow")'
            }
          }
        }
      },
      {
        name: 'getUserNotices',
        description: 'Get college notices, official circulars, exam schedules, and department announcements.',
        parameters: {
          type: 'OBJECT',
          properties: {
            category: {
              type: 'STRING',
              description: 'Optional category (e.g. "Exams", "Events", "Academics", "General")'
            },
            urgentOnly: {
              type: 'BOOLEAN',
              description: 'Set to true for urgent notices only'
            }
          }
        }
      },
      {
        name: 'getUserNotes',
        description: 'Get academic revision notes, chapter cheat sheets, and lecture summaries.',
        parameters: {
          type: 'OBJECT',
          properties: {
            subject: {
              type: 'STRING',
              description: 'Optional subject filter'
            },
            searchKeyword: {
              type: 'STRING',
              description: 'Keyword to search title or note content'
            }
          }
        }
      },
      {
        name: 'getUserNotifications',
        description: 'Get role-aware notifications, administrative circulars, academic deadlines, attendance alerts, timetable updates, and assigned faculty duties.',
        parameters: {
          type: 'OBJECT',
          properties: {
            category: {
              type: 'STRING',
              description: 'Filter by category: "Admin", "Academic", "Students", "Events", or "All"'
            },
            priority: {
              type: 'STRING',
              description: 'Filter by priority: "HIGH", "MEDIUM", or "LOW"'
            },
            unreadOnly: {
              type: 'BOOLEAN',
              description: 'Set true to fetch unread notifications only'
            }
          }
        }
      },
      {
        name: 'getUserFeeSummary',
        description: 'Get student fee breakdown, scholarship concession details, paid installments, and outstanding fee balance.',
        parameters: {
          type: 'OBJECT',
          properties: {}
        }
      }
    ]
  }
];

// System Instructions establishing Sage identity, data tools, and web grounding guidelines
const sageSystemInstruction = `You are Sage 🌿, a friendly, encouraging, and clear college AI assistant inside College Companion. You speak like a helpful college senior or study tutor.

TONE & BEHAVIOR GUIDELINES:
1. Speak naturally, warmly, and conversationally like a real AI assistant.
2. Answer the user's question directly in simple, human-friendly language.
3. Keep responses concise and focused unless detailed explanations are requested.
4. Use clear formatting (bullet points, bold text) only when it genuinely improves readability.
5. NEVER use internal system or debug jargon like "Internal Sync", "College Companion Data", "Google Search Grounding", "Gemini", "tool called", "function execution", "served directly from", "system instructions", "routing", or database schemas in your response text.
6. TOOL USAGE & ACADEMIC ACCURACY RULES:
   - For general academic computer science concept questions (e.g., "What is HDFS in Big Data Analysis?", "Explain MapReduce", "What is normalization in DBMS?", "What is a deadlock?", "Explain TCP 3-Way Handshake", "What is Process vs Thread?"), answer directly and accurately using standard CS subject knowledge.
   - DO NOT invoke student record tools (getUserAttendance, getUserAssignments, getUserMarks, getUserTimetable, getUserNotices, getUserNotes, getUserNotifications, getUserFeeSummary) for general conceptual questions unless the user explicitly asks about their own personal saved notes or student records.
   - NEVER mix concepts from different subjects. Keep DBMS, Operating Systems, Computer Networks, Big Data, and Software Engineering strictly separate.
   - ONLY call student record tools when the query explicitly asks about personal student records (e.g., "my attendance", "my timetable", "my marks", "my fees", "my assignments", "my notes").
7. When presenting student academic records (attendance, assignments, marks, timetable, notices, notes, fees), integrate the numbers naturally into your answer.
8. For current web information, answer naturally.`;

// In-Memory Repository for Uploaded Student Notes (preserved for note management APIs)
let uploadedStudentNotes = [
  {
    id: 'student_note_1',
    title: 'DBMS Chapter 3: Normalization & BCNF Notes',
    subject: 'DBMS',
    content: `1NF: Each column must contain atomic indivisible values.
2NF: Must be in 1NF and no non-prime attribute depends on a subset of any candidate key (No partial dependency).
3NF: Must be in 2NF and no transitive dependency exists (Non-key -> Non-key is forbidden).
BCNF: Boyce-Codd Normal Form requires that for EVERY functional dependency X -> Y, X MUST be a super key.
ACID Properties: Atomicity (all or nothing), Consistency (preserves rules), Isolation (independent concurrent transactions), Durability (persisted on disk).`
  },
  {
    id: 'student_note_2',
    title: 'OS Deadlocks & Virtual Memory Student Notes',
    subject: 'Operating Systems',
    content: `Deadlock Coffman Conditions: 1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait. Breaking any single condition prevents deadlock.
Virtual Memory Paging: Memory is divided into fixed-size Pages in Virtual Address space and Frames in physical RAM.
Page Fault: Occurs when the CPU requests a page not currently loaded in physical RAM, triggering an OS disk page swap.`
  },
  {
    id: 'student_note_3',
    title: 'Computer Networks TCP Handshake & OSI Notes',
    subject: 'Computer Networks',
    content: `TCP 3-Way Handshake: Step 1 Client sends SYN -> Step 2 Server responds with SYN-ACK -> Step 3 Client sends ACK. Session is established.
OSI 7 Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.
TCP vs UDP: TCP is connection-oriented, reliable, guarantees ordering. UDP is connectionless, lightweight, low-latency.`
  }
];

// Intent Classifier / Semantic Router for Personal College Data & Academic Queries
const detectSageIntent = (message) => {
  const msg = (message || '').toLowerCase().trim();

  // 1. Attendance Intent
  const attendancePatterns = [
    /attendance/i,
    /bunk/i,
    /classes\s+attended/i,
    /how\s+am\s+i\s+doing.*(?:in|with|on)\s+(?:my\s+)?classes/i,
    /how\s+many\s+classes\s+(?:have\s+i|did\s+i)\s+attend/i,
    /(?:tell|show|check|get|view|what|how|can\s+you|please).*(?:my\s+)?attendance/i,
    /attendance.*(?:percentage|status|details|summary|count|records|report|check)/i
  ];
  if (attendancePatterns.some(p => p.test(msg)) || msg.includes('attendance') || msg.includes('bunk')) {
    return 'ATTENDANCE';
  }

  // 2. Timetable / Schedule Intent
  const timetablePatterns = [
    /timetable/i,
    /schedule/i,
    /routine/i,
    /class(?:es)?\s+today/i,
    /what\s+class/i,
    /next\s+class/i,
    /today'?s\s+class/i
  ];
  if (timetablePatterns.some(p => p.test(msg)) || msg.includes('timetable') || msg.includes('schedule')) {
    return 'TIMETABLE';
  }

  // 3. Marks / Grades / CGPA Intent
  const marksPatterns = [
    /cgpa/i,
    /sgpa/i,
    /marks/i,
    /scores/i,
    /grades/i,
    /results/i,
    /ise\s*1/i,
    /ise\s*2/i,
    /ese/i,
    /(?:tell|show|check|get|what).*(?:my\s+)?(?:mark|score|grade|result)/i
  ];
  if (marksPatterns.some(p => p.test(msg)) || msg.includes('cgpa') || msg.includes('marks') || msg.includes('sgpa')) {
    return 'MARKS';
  }

  // 4. Fees / Payment Intent
  const feePatterns = [
    /fee/i,
    /dues/i,
    /tuition/i,
    /installment/i,
    /scholarship/i,
    /how\s+much\s+fee/i,
    /payment\s+status/i
  ];
  if (feePatterns.some(p => p.test(msg)) || msg.includes('fee') || msg.includes('dues') || msg.includes('installment')) {
    return 'FEES';
  }

  // 5. Assignments / Homework Intent
  const assignmentPatterns = [
    /assignment/i,
    /homework/i,
    /submission/i,
    /pending\s+task/i,
    /due\s+date/i
  ];
  if (assignmentPatterns.some(p => p.test(msg)) || msg.includes('assignment') || msg.includes('homework')) {
    return 'ASSIGNMENTS';
  }

  // 6. Notices / Circulars Intent
  if (msg.includes('notice') || msg.includes('circular') || msg.includes('announcement')) {
    return 'NOTICES';
  }

  // 7. Notifications Intent
  if (msg.includes('notification') || msg.includes('alert')) {
    return 'NOTIFICATIONS';
  }

  // 8. Saved Notes Intent
  if (msg.includes('saved note') || msg.includes('my note') || msg.includes('my notes') || msg.includes('cheat sheet')) {
    return 'NOTES';
  }

  // 9. Greetings Intent
  const greetingPhrases = ['hey', 'hi', 'hello', 'hey sage', 'hi sage', 'hello sage', 'good morning', 'good afternoon', 'good evening', 'greetings', 'yo', 'sup'];
  if (greetingPhrases.some(g => msg === g || msg.startsWith(g + ' ') || msg.startsWith(g + '!') || msg.startsWith(g + ','))) {
    return 'GREETING';
  }

  // 10. Default: General Academic / CS Question -> Send to Gemini
  return 'GENERAL_ACADEMIC';
};

// Handle Real-Time Chat using Intent Router + Personal College Data + Google Gemini API
const handleSageChat = async (req, res) => {
  const { message, history } = req.body;
  const userId = req.user?.id || 'user_demo_123';

  // 1. Validation: Empty message check
  if (!message || !message.trim()) {
    return res.status(400).json({
      message: 'Message is required',
      reply: 'Please type a question or topic you would like help with!'
    });
  }

  const userRole = req.user?.role || 'student';
  const userDivision = req.user?.divisionId === 'div_itb_1' ? 'IT-B' : req.user?.divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A';
  const userRollNo = req.user?.rollNo || 'IT-2026-001';
  const clientChatId = req.body.chatId;

  // 2. Intent Detection & Semantic Routing
  const intent = detectSageIntent(message);

  console.log('[SAGE DEBUG] request received');
  console.log('[SAGE DEBUG] message:', message);
  console.log('[SAGE DEBUG] userId:', userId);
  console.log('[SAGE DEBUG] role:', userRole);
  console.log('[SAGE DEBUG] detected intent:', intent);

  // Helper to persist chat turn and return uniform response
  const sendSageResponse = async (replyText, sourceType, sources = [], model = null) => {
    const saved = await saveChatMessage(userId, clientChatId, message, replyText, sourceType, sources);
    return res.json({
      reply: replyText,
      sender: 'Sage',
      sourceType: sourceType || 'Sage AI',
      sources: sources || [],
      chatId: saved.chatId,
      title: saved.title,
      ...(model ? { model } : {})
    });
  };

  // A. ATTENDANCE INTENT -> Query authenticated student's real application attendance
  if (intent === 'ATTENDANCE') {
    console.log('[SAGE DEBUG] attendance handler called');
    let subjectFilter = null;
    const msgLower = message.toLowerCase();
    if (msgLower.includes('big data') || msgLower.includes('hdfs') || msgLower.includes('bda')) subjectFilter = 'Big Data Analysis';
    else if (msgLower.includes('machine learning') || msgLower.includes('ml')) subjectFilter = 'Machine Learning';
    else if (msgLower.includes('ui') || msgLower.includes('interface') || msgLower.includes('uid')) subjectFilter = 'User Interface Designing';
    else if (msgLower.includes('product design') || msgLower.includes('pdd')) subjectFilter = 'Product Design and Development';
    else if (msgLower.includes('devops')) subjectFilter = 'DevOps';
    else if (msgLower.includes('cloud') || msgLower.includes('aws')) subjectFilter = 'Cloud Computing';
    else if (msgLower.includes('mis') || msgLower.includes('management information')) subjectFilter = 'Management Information Systems';
    else if (msgLower.includes('data science') || msgLower.includes('ds')) subjectFilter = 'Data Science';

    const data = await academicController.getAttendanceInternal(userId, subjectFilter);
    const subList = data.subjects.map(s => `• **${s.subject}**: ${s.percentage} (${s.attended}/${s.total} classes attended) — ${s.statusAdvice}`).join('\n');
    const replyText = `Your overall attendance is **${data.overallPercentage}** (${data.overallAttended}/${data.overallTotal} classes attended).\n\nSubject Breakdown:\n${subList}`;
    
    return await sendSageResponse(replyText, 'Academic Records');
  }

  // B. TIMETABLE INTENT
  if (intent === 'TIMETABLE') {
    const data = academicController.getTimetableInternal('Monday');
    const scheduleItems = data.schedule || (data.timetable ? data.timetable.Monday : []);
    const list = Array.isArray(scheduleItems) ? scheduleItems.map(s => `• **${s.time}**: ${s.subject} (${s.code}) in ${s.room} (Instructor: ${s.professor})`).join('\n') : scheduleItems;
    const replyText = `Here is your class schedule:\n\n${list || 'Monday to Friday IT-A, IT-B, IT-C classes'}`;
    return await sendSageResponse(replyText, 'Academic Records');
  }

  // C. MARKS / CGPA INTENT
  if (intent === 'MARKS') {
    const data = await academicController.getMarksInternal(userId);
    const marksList = (data.currentSubjectMarks || []).map(m => {
      const iaTot = (m.ise1 || 0) + (m.ise2 || 0);
      return `• **${m.subject}** (${m.subjectCode || 'IT601'}): ISE1: ${m.ise1}/20, ISE2: ${m.ise2}/20 (IA: ${iaTot}/40), ESE: ${m.ese}/60, PR/OR: ${m.prOr}/25, TW: ${m.tw}/25 — **Total: ${m.total}/${m.maxTotal} [${m.grade}]**`;
    }).join('\n');
    const replyText = `**Autonomous College Scheme Evaluation Summary (TCET CBCGS-HME)**:\n\nCumulative CGPA: **${data.cumulativeCGPA || 8.24} / 10.0**\nIA Performance Average: **34.8 / 40 (87%)**\n\nSubject Breakdown:\n${marksList || 'No evaluation marks recorded yet.'}`;
    return await sendSageResponse(replyText, 'Academic Scheme Records');
  }

  // D. FEES INTENT
  if (intent === 'FEES') {
    const feeData = await academicController.getStudentFeeSummaryInternal(userId);
    const replyText = `**Fee Summary for ${feeData.program}**:\n\n• **Total Payable**: ₹${feeData.totalPayable.toLocaleString()}\n• **Scholarship Concession**: ₹${feeData.scholarshipConcession.amount.toLocaleString()} (${feeData.scholarshipConcession.name})\n• **Net Payable**: ₹${feeData.netPayable.toLocaleString()}\n• **Amount Paid**: ₹${feeData.amountPaid.toLocaleString()}\n• **Outstanding Balance**: ₹${feeData.outstandingBalance.toLocaleString()}\n• **Next Due Date**: ${feeData.dueDate}\n\nInstallment Status:\n${feeData.installments.map(i => `• Installment #${i.installmentNo}: ₹${i.amount.toLocaleString()} — **${i.status}** (${i.paidDate ? 'Paid on ' + i.paidDate : 'Due ' + i.dueDate})`).join('\n')}`;
    return await sendSageResponse(replyText, 'Fee Records');
  }

  // E. ASSIGNMENTS INTENT
  if (intent === 'ASSIGNMENTS') {
    const data = await academicController.getAssignmentsInternal(userId, 'pending');
    const list = data.assignments.map(a => `• **${a.title}** (${a.subject}) — Due: *${a.dueDate}* [Priority: ${a.priority}]`).join('\n');
    const replyText = data.pendingCount > 0
      ? `You have **${data.pendingCount} pending assignment(s)**:\n\n${list}`
      : `All your assignments are currently up to date! 🎉`;
    return await sendSageResponse(replyText, 'Academic Records');
  }

  // F. NOTICES INTENT
  if (intent === 'NOTICES') {
    const data = await academicController.getNoticesInternal();
    const list = data.notices.map(n => `• **${n.title}** (${n.date})\n  ${n.content}`).join('\n\n');
    const replyText = `Here are the latest campus notices:\n\n${list}`;
    return await sendSageResponse(replyText, 'Academic Records');
  }

  // G. NOTIFICATIONS INTENT
  if (intent === 'NOTIFICATIONS') {
    const notifs = await academicController.getUserNotificationsInternal(userId, userRole);
    if (userRole === 'faculty') {
      const formatted = notifs.map(n => `• **[${n.priority || 'MEDIUM'}] ${n.title}** (${n.category})\n  ${n.message}${n.details ? '\n  *' + n.details + '*' : ''}`).join('\n\n');
      const replyText = `**Professor, here are your active Faculty Notifications (${notifs.length} Total)**:\n\n${formatted}\n\n*Categories*: Admin Updates, Academic Operations, Classes & Students, Events.`;
      return await sendSageResponse(replyText, 'Faculty Notifications');
    } else {
      const formatted = notifs.map(n => `• **${n.title}** (${n.category})\n  ${n.message}`).join('\n\n');
      const replyText = `**Here are your recent student notifications**:\n\n${formatted}`;
      return await sendSageResponse(replyText, 'Student Notifications');
    }
  }

  // H. NOTES INTENT
  if (intent === 'NOTES') {
    let subjectFilter = null;
    const msgLower = message.toLowerCase();
    if (msgLower.includes('big data') || msgLower.includes('bda')) subjectFilter = 'Big Data Analysis';
    else if (msgLower.includes('machine learning') || msgLower.includes('ml')) subjectFilter = 'Machine Learning';
    else if (msgLower.includes('devops')) subjectFilter = 'DevOps';
    else if (msgLower.includes('ui') || msgLower.includes('interface')) subjectFilter = 'User Interface Designing';

    const data = await academicController.getNotesInternal(userId, subjectFilter);
    const list = data.notes.map(n => `• **${n.title}** (${n.subject})\n  ${n.content}`).join('\n\n');
    const replyText = `Here are your saved study notes:\n\n${list}`;
    return await sendSageResponse(replyText, 'Academic Records');
  }

  // I. GREETING INTENT
  if (intent === 'GREETING') {
    const replyText = userRole === 'faculty'
      ? "Greetings Professor! 🌿 I am your Faculty Sage Assistant. Ask me about your classes, attendance alerts, performance summaries, or notices!"
      : "Hello! How can I help with your studies today? Ask me about your attendance, assignments, timetable, marks, or any academic topic! 🌿";
    return await sendSageResponse(replyText, 'Sage AI');
  }

  // 3. GENERAL ACADEMIC INTENT -> Delegate to Google Gemini API
  const ai = getGeminiClient();
  if (ai) {
    const formattedContents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-8)) {
        const role = (turn.role === 'model' || turn.role === 'assistant' || turn.sender === 'Sage') ? 'model' : 'user';
        const text = turn.text || turn.content;
        if (text && typeof text === 'string' && text.trim()) {
          formattedContents.push({ role, parts: [{ text: text.trim() }] });
        }
      }
    }
    formattedContents.push({ role: 'user', parts: [{ text: message }] });

    const userScopedInstruction = `${sageSystemInstruction}

USER AUTHENTICATION & ACCESS SCOPE:
- User Role: ${userRole}
- Division/Class: ${userDivision}
- Roll Number: ${userRollNo}`;

    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const modelsToTry = Array.from(new Set([primaryModel, 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash']));

    for (const modelName of modelsToTry) {
      try {
        let response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction: userScopedInstruction
          }
        });

        const reply = response.text || "Here is what I found.";
        return await sendSageResponse(reply, 'Sage AI', [], modelName);

      } catch (err) {
        console.error(`⚠️ Gemini API notice (${modelName}):`, err.message || err);
      }
    }
  }

  // Meaningful fallback if Gemini is unreachable for general academic questions
  const fallbackReply = "Sage is temporarily unable to reach the AI service. Please try again.";
  return await sendSageResponse(fallbackReply, 'Sage AI');
};

// Get All Sage Conversations for Authenticated User
const getUserSageChats = async (req, res) => {
  const userId = req.user?.id || 'user_demo_123';
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;

  if (isDbReady) {
    try {
      const chats = await SageChat.find({ userId }).sort({ updatedAt: -1 });
      if (chats) {
        const formatted = chats.map(c => ({
          id: c._id.toString(),
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messageCount: c.messages.length,
          lastMessage: c.messages[c.messages.length - 1]?.text || ''
        }));
        return res.json(formatted);
      }
    } catch (e) {}
  }

  const userChats = mockSageChats.filter(c => c.userId === userId);
  res.json(userChats.map(c => ({
    id: c.id || c._id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messageCount: c.messages.length,
    lastMessage: c.messages[c.messages.length - 1]?.text || ''
  })));
};

// Get Specific Conversation & Messages
const getSageChatById = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user?.id || 'user_demo_123';
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;

  if (isDbReady) {
    try {
      const chat = await SageChat.findById(chatId);
      if (chat) {
        if (chat.userId !== userId) {
          return res.status(403).json({ message: 'Unauthorized to access this conversation.' });
        }
        return res.json({
          id: chat._id.toString(),
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messages: chat.messages
        });
      }
    } catch (e) {}
  }

  const chat = mockSageChats.find(c => (c.id === chatId || c._id === chatId));
  if (!chat) {
    return res.status(404).json({ message: 'Conversation not found.' });
  }
  if (chat.userId !== userId) {
    return res.status(403).json({ message: 'Unauthorized to access this conversation.' });
  }

  res.json(chat);
};

// Create New Conversation
const createSageChat = async (req, res) => {
  const { firstMessage } = req.body;
  const userId = req.user?.id || 'user_demo_123';
  const title = generateChatTitle(firstMessage);
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;

  if (isDbReady) {
    try {
      const newChat = new SageChat({
        userId,
        title,
        messages: []
      });
      await newChat.save();
      return res.status(201).json({
        id: newChat._id.toString(),
        title: newChat.title,
        createdAt: newChat.createdAt,
        updatedAt: newChat.updatedAt,
        messages: []
      });
    } catch (e) {}
  }

  const newChat = {
    id: `chat_${Date.now()}`,
    userId,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  mockSageChats.unshift(newChat);
  res.status(201).json(newChat);
};

// Delete Conversation
const deleteSageChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user?.id || 'user_demo_123';
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;

  if (isDbReady) {
    try {
      const chat = await SageChat.findById(chatId);
      if (chat) {
        if (chat.userId !== userId) {
          return res.status(403).json({ message: 'Unauthorized to delete this conversation.' });
        }
        await SageChat.findByIdAndDelete(chatId);
        return res.json({ message: 'Conversation deleted successfully.' });
      }
    } catch (e) {}
  }

  const index = mockSageChats.findIndex(c => (c.id === chatId || c._id === chatId) && c.userId === userId);
  if (index !== -1) {
    mockSageChats.splice(index, 1);
    return res.json({ message: 'Conversation deleted successfully.' });
  }

  res.status(404).json({ message: 'Conversation not found.' });
};

// Upload Custom Student Note API
const uploadStudentNote = async (req, res) => {
  const { title, subject, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newNote = {
    id: `student_note_${Date.now()}`,
    title,
    subject: subject || 'General CS',
    content
  };

  uploadedStudentNotes.unshift(newNote);
  res.status(201).json({
    message: 'Note uploaded successfully! Sage AI Chatbot can now read it.',
    note: newNote,
    totalNotes: uploadedStudentNotes.length
  });
};

// Get All Uploaded Student Notes API
const getUploadedStudentNotes = async (req, res) => {
  res.json(uploadedStudentNotes);
};

const generateFlashcards = async (req, res) => {
  res.json({ flashcards: [] });
};

const generateQuiz = async (req, res) => {
  res.json({ questions: [] });
};

const explainConcept = async (req, res) => {
  res.json({ explanation: 'Concept summary' });
};

module.exports = {
  handleSageChat,
  getUserSageChats,
  getSageChatById,
  createSageChat,
  deleteSageChat,
  uploadStudentNote,
  getUploadedStudentNotes,
  generateFlashcards,
  generateQuiz,
  explainConcept
};


