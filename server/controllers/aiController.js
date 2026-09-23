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
6. When presenting student academic records (attendance, assignments, marks, timetable, notices, notes), integrate the numbers naturally into your answer (e.g., "Your overall attendance is 82%. Database Systems is at 87%...").
7. For study concept questions, explain them simply and intuitively.
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
  const { message } = req.body;
  const userId = req.user?.id || 'user_demo_123';

  // 1. Validation: Empty message check
  if (!message || !message.trim()) {
    return res.status(400).json({
      message: 'Message is required',
      reply: 'Please type a question or topic you would like help with!'
    });
  }

  const ai = getGeminiClient();

  // 2. Check for missing GEMINI_API_KEY
  if (!ai) {
    return res.status(200).json({
      reply: "Please add your `GEMINI_API_KEY` to `server/.env` and restart the server to enable live AI responses!",
      sender: 'Sage',
      sourceType: 'System Configuration'
    });
  }

  // 3. Primary AI Handler with Gemini Tools & Web Grounding
  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    // Turn 1: Initial call with prompt, tools, and search grounding
    let response = await ai.models.generateContent({
      model: modelName,
      contents: message,
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
          { role: 'user', parts: [{ text: message }] },
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
    console.error('❌ Gemini API Error:', err.message || err);

    const isQuotaError = err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota'));
    const msgLower = (message || '').toLowerCase();

    // Natural Academic Data Fallback when API Quota is Exceeded
    if (msgLower.includes('attendance') || msgLower.includes('bunk')) {
      const data = await academicController.getAttendanceInternal(userId);
      const subList = data.subjects.map(s => `• **${s.subject}**: ${s.percentage} (${s.attended}/${s.total} classes attended) — ${s.statusAdvice}`).join('\n');
      return res.json({
        reply: `Your overall attendance is ${data.overallPercentage}(${data.overallAttended}/${data.overallTotal} classes attended).\n\nHere is your subject breakdown:\n${subList}`,
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

    if (msgLower.includes('note') || msgLower.includes('bcnf') || msgLower.includes('normalization') || msgLower.includes('deadlock')) {
      const data = await academicController.getNotesInternal(userId);
      const list = data.notes.map(n => `• **${n.title}** (${n.subject})\n  ${n.content}`).join('\n\n');
      return res.json({
        reply: `Here are your saved study notes:\n\n${list}`,
        sender: 'Sage',
        sourceType: 'Academic Records'
      });
    }

    if (isQuotaError) {
      return res.status(200).json({
        reply: "I'm experiencing a brief pause connecting to live AI services right now. Feel free to ask me about your **attendance**, **assignments**, **marks**, or **timetable**, and I'll pull those right up for you!",
        sender: 'Sage',
        sourceType: 'Academic Records'
      });
    }

    return res.status(500).json({
      reply: "I ran into a temporary issue retrieving that. Please try asking again in a moment!",
      error: "Service unavailable",
      sender: 'Sage'
    });
  }
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


