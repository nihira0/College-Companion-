const { GoogleGenAI } = require('@google/genai');
const academicController = require('./academicController');

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

// Tool Definitions for Gemini API Function Calling & Google Search Grounding
const sageTools = [
  { googleSearch: {} },
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
        description: 'Get internal marks, midterm scores, SGPA semester history, and overall CGPA (8.24).',
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
   - For general academic computer science concept questions (e.g., "What is NF in DBMS?", "Explain BCNF", "What is a deadlock?", "Explain TCP 3-Way Handshake", "What is Process vs Thread?"), answer directly and accurately using standard CS subject knowledge.
   - DO NOT invoke student record tools (getUserAttendance, getUserAssignments, getUserMarks, getUserTimetable, getUserNotices, getUserNotes) for general conceptual questions unless the user explicitly asks about their own personal saved notes or student records.
   - NEVER mix concepts from different subjects. Keep DBMS, Operating Systems, Computer Networks, and Software Engineering strictly separate.
   - ONLY call student record tools when the query explicitly asks about personal student records (e.g., "my attendance", "my timetable", "my marks", "my assignments", "my notes").
7. When presenting student academic records (attendance, assignments, marks, timetable, notices, notes), integrate the numbers naturally into your answer (e.g., "Your overall attendance is 82%. Database Systems is at 87%...").
8. For current web information, answer naturally (e.g., "The latest React release is React 19...").`;

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

// Handle Real-Time Chat using Google Gemini API + Function Calling Tools + Search Grounding
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

  const ai = getGeminiClient();

  // Parse multi-turn conversation history if provided by frontend
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

  // 2. Primary AI Handler with Gemini Tools & Web Grounding
  if (ai) {
    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

      // Turn 1: Initial call with prompt, tools, multi-turn history, and search grounding
      let response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: sageSystemInstruction,
          tools: sageTools
        }
      });

      // Check if Gemini requested Function Calls (College Companion data tools)
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const toolResultsParts = [];

        for (const call of functionCalls) {
          const { name, args } = call;
          let toolData;

          if (name === 'getUserAttendance') {
            toolData = await academicController.getAttendanceInternal(userId, args?.subject);
          } else if (name === 'getUserAssignments') {
            toolData = await academicController.getAssignmentsInternal(userId, args?.status, args?.priority);
          } else if (name === 'getUserMarks') {
            toolData = await academicController.getMarksInternal(userId, args?.subject, args?.semester);
          } else if (name === 'getUserTimetable') {
            toolData = academicController.getTimetableInternal(args?.day);
          } else if (name === 'getUserNotices') {
            toolData = await academicController.getNoticesInternal(args?.category, args?.urgentOnly);
          } else if (name === 'getUserNotes') {
            toolData = await academicController.getNotesInternal(userId, args?.subject, args?.searchKeyword);
          } else {
            toolData = { error: `Tool ${name} not recognized.` };
          }

          toolResultsParts.push({
            functionResponse: {
              name,
              response: { result: toolData }
            }
          });
        }

        // Turn 2: Send function execution results back to Gemini for final response synthesis
        const followUpResponse = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...formattedContents,
            response.candidates[0].content, // Model's assistant response containing function calls
            { role: 'user', parts: toolResultsParts }
          ],
          config: {
            systemInstruction: sageSystemInstruction,
            tools: sageTools
          }
        });

        const reply = followUpResponse.text || "Here is your academic information.";

        return res.json({
          reply,
          sender: 'Sage',
          sourceType: 'Academic Records',
          sources: [],
          model: modelName
        });
      }

      // Extract potential web search grounding metadata & citations
      const sources = extractGroundingSources(response);
      const reply = response.text || "Here is what I found.";
      const sourceType = sources.length > 0 ? 'Live Web Information' : 'Sage AI';

      return res.json({
        reply,
        sender: 'Sage',
        sourceType,
        sources,
        model: modelName
      });

    } catch (err) {
      console.error('⚠️ Gemini API execution notice:', err.message || err);
    }
  }

  // 3. Fallback Handler (Provides clean, subject-specific responses without cross-subject mixing)
  const msgLower = (message || '').toLowerCase();

  // Concept Query: Normalization / NF in DBMS
  if (msgLower.includes('normal form') || msgLower.includes('normalization') || msgLower.includes('bcnf') || msgLower.includes(' 1nf') || msgLower.includes(' 2nf') || msgLower.includes(' 3nf') || (msgLower.includes('nf') && msgLower.includes('dbms'))) {
    return res.json({
      reply: `**Normalization (NF) in DBMS** is the systematic approach of organizing database tables to minimize data redundancy and prevent insertion, update, and deletion anomalies.\n\nHere are the primary Normal Forms:\n\n• **1NF (First Normal Form)**: Requires that each column contains single, atomic (indivisible) values, and each record has a unique identifier.\n• **2NF (Second Normal Form)**: Must be in 1NF and eliminate *partial dependencies* (every non-key column must depend on the whole candidate key).\n• **3NF (Third Normal Form)**: Must be in 2NF and eliminate *transitive dependencies* (no non-prime attribute should depend on another non-prime attribute).\n• **BCNF (Boyce-Codd Normal Form)**: A stricter 3NF variant where for every functional dependency *X → Y*, **X MUST be a super key**.`,
      sender: 'Sage',
      sourceType: 'Sage AI'
    });
  }

  // Concept Query: Deadlocks & OS
  if (msgLower.includes('deadlock') || msgLower.includes('coffman') || msgLower.includes('page fault') || (msgLower.includes('paging') && msgLower.includes('os'))) {
    return res.json({
      reply: `**Deadlocks in Operating Systems** occur when a set of processes are permanently blocked because each holds a resource while waiting for another held by another process.\n\n**The 4 Coffman Conditions for Deadlock:**\n1. **Mutual Exclusion**: At least one resource is held in non-shareable mode.\n2. **Hold and Wait**: A process holds at least one resource and requests additional resources.\n3. **No Preemption**: Resources cannot be forcibly revoked from a process.\n4. **Circular Wait**: A closed chain of processes exists where each process waits for a resource held by the next.\n\n*Breaking any single condition prevents deadlocks completely!*`,
      sender: 'Sage',
      sourceType: 'Sage AI'
    });
  }

  // Concept Query: TCP 3-Way Handshake & Networks
  if (msgLower.includes('handshake') || msgLower.includes('tcp') || msgLower.includes('osi model') || msgLower.includes('osi layer')) {
    return res.json({
      reply: `**TCP 3-Way Handshake** is the standard process used by TCP/IP to establish a reliable connection between a client and server:\n\n1. **SYN (Synchronize)**: Client sends a segment with a sequence number to initiate connection.\n2. **SYN-ACK (Synchronize-Acknowledge)**: Server acknowledges the client's segment and sends its own SYN.\n3. **ACK (Acknowledge)**: Client sends an ACK back to the server. Connection established! 🎉`,
      sender: 'Sage',
      sourceType: 'Sage AI'
    });
  }

  // Personal Academic Records Fallbacks
  if (msgLower.includes('attendance') || msgLower.includes('bunk')) {
    const data = await academicController.getAttendanceInternal(userId);
    const subList = data.subjects.map(s => `• **${s.subject}**: ${s.percentage} (${s.attended}/${s.total} classes attended) — ${s.statusAdvice}`).join('\n');
    return res.json({
      reply: `Your overall attendance is **${data.overallPercentage}** (${data.overallAttended}/${data.overallTotal} classes attended).\n\nHere is your subject breakdown:\n${subList}`,
      sender: 'Sage',
      sourceType: 'Academic Records'
    });
  }

  if (msgLower.includes('assignment') || msgLower.includes('pending') || msgLower.includes('due')) {
    const data = await academicController.getAssignmentsInternal(userId, 'pending');
    const list = data.assignments.map(a => `• **${a.title}** (${a.subject}) — Due: *${a.dueDate}* [Priority: ${a.priority}]`).join('\n');
    return res.json({
      reply: data.pendingCount > 0
        ? `You have **${data.pendingCount} pending assignment(s)**:\n\n${list}`
        : `All your assignments are currently up to date! 🎉`,
      sender: 'Sage',
      sourceType: 'Academic Records'
    });
  }

  if (msgLower.includes('mark') || msgLower.includes('cgpa') || msgLower.includes('sgpa') || msgLower.includes('score')) {
    const data = await academicController.getMarksInternal(userId);
    const marksList = (data.currentSubjectMarks || []).map(m => `• **${m.subject}**: ${m.score}/${m.maxScore} (${m.percentage}) — ${m.type}`).join('\n');
    return res.json({
      reply: `Your current Cumulative CGPA is **${data.cumulativeCGPA || 8.24} / 10.0**.\n\nHere is your semester score breakdown:\n${marksList || 'No marks recorded yet.'}`,
      sender: 'Sage',
      sourceType: 'Academic Records'
    });
  }

  if (msgLower.includes('timetable') || msgLower.includes('schedule') || msgLower.includes('class')) {
    const data = academicController.getTimetableInternal('Monday');
    const scheduleItems = data.schedule || (data.timetable ? data.timetable.Monday : []);
    const list = (scheduleItems || []).map(s => `• **${s.time}**: ${s.subject} (${s.code}) in ${s.room} (Instructor: ${s.professor})`).join('\n');
    return res.json({
      reply: `Here is your class schedule for Monday:\n\n${list || 'No classes scheduled.'}`,
      sender: 'Sage',
      sourceType: 'Academic Records'
    });
  }

  if (msgLower.includes('notice') || msgLower.includes('circular') || msgLower.includes('exam')) {
    const data = await academicController.getNoticesInternal();
    const list = data.notices.map(n => `• **${n.title}** (${n.date})\n  ${n.content}`).join('\n\n');
    return res.json({
      reply: `Here are the latest campus notices:\n\n${list}`,
      sender: 'Sage',
      sourceType: 'Academic Records'
    });
  }

  if (msgLower.includes('note') || msgLower.includes('saved note') || msgLower.includes('my note')) {
    let subjectFilter = null;
    if (msgLower.includes('dbms')) subjectFilter = 'DBMS';
    else if (msgLower.includes('os') || msgLower.includes('operating')) subjectFilter = 'Operating Systems';
    else if (msgLower.includes('network') || msgLower.includes('cn')) subjectFilter = 'Computer Networks';

    const data = await academicController.getNotesInternal(userId, subjectFilter);
    const list = data.notes.map(n => `• **${n.title}** (${n.subject})\n  ${n.content}`).join('\n\n');
    return res.json({
      reply: `Here are your saved study notes:\n\n${list}`,
      sender: 'Sage',
      sourceType: 'Academic Records'
    });
  }

  return res.json({
    reply: "I am ready to help you! Ask me about your **attendance**, **assignments**, **marks**, **timetable**, or any CS subject concept like **DBMS Normalization**, **OS Deadlocks**, or **Networking**! 🌿",
    sender: 'Sage',
    sourceType: 'Sage AI'
  });
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
  uploadStudentNote,
  getUploadedStudentNotes,
  generateFlashcards,
  generateQuiz,
  explainConcept
};


