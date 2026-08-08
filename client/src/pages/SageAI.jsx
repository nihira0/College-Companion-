import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import {
  MessageSquare,
  BookOpen,
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  RotateCw,
  Zap,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SageAI = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'chat';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { addToast } = useNotification();

  const [selectedSubject, setSelectedSubject] = useState('DBMS');

  // Quick Concept Prompts Chips for 1-click real-time answers
  const quickConceptPrompts = [
    { label: 'What is BCNF? 🗄️', query: 'What is BCNF in DBMS?' },
    { label: 'TCP 3-Way Handshake 📡', query: 'Explain TCP 3-Way Handshake' },
    { label: 'Coffman Deadlock Conditions 🖥️', query: 'What are Coffman Deadlock Conditions?' },
    { label: 'Process vs Thread ⚡', query: 'What is the difference between Process and Thread?' },
    { label: 'ACID Properties 🗄️', query: 'What are ACID properties in DBMS?' },
    { label: 'Virtual Memory Paging 🖥️', query: 'Explain Virtual Memory Paging' },
    { label: 'React Virtual DOM 🌐', query: 'What is React Virtual DOM?' },
    { label: 'QuickSort Complexity ⚡', query: 'What is QuickSort time complexity?' }
  ];

  // Real-time Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Sage',
      text: "🌿 **Good Morning, Nihaarika!** I am your real-time concept assistant Sage 🌿. Ask me any small or complex concept question (e.g. *What is BCNF?*, *Explain TCP Handshake*, *Process vs Thread*), or click any quick prompt chip below! 🌱"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Self-testing Flashcards Decks
  const initialDecks = {
    DBMS: [
      { id: 'db_1', category: 'DBMS 🗄️', question: 'What is 1NF (First Normal Form)?', answer: '1NF requires that each table cell contains a single atomic (indivisible) value, and each record is uniquely identifiable with a primary key.', difficulty: 'Easy', flipped: false, status: null },
      { id: 'db_2', category: 'DBMS 🗄️', question: 'What is 2NF (Second Normal Form)?', answer: '2NF requires being in 1NF and ensuring that no non-prime attribute depends on a proper subset of any candidate key (Eliminating partial dependencies).', difficulty: 'Medium', flipped: false, status: null },
      { id: 'db_3', category: 'DBMS 🗄️', question: 'What is 3NF (Third Normal Form)?', answer: '3NF requires being in 2NF and eliminating transitive dependencies (For any dependency X → Y, X must be a superkey or Y must be a prime attribute).', difficulty: 'Medium', flipped: false, status: null },
      { id: 'db_4', category: 'DBMS 🗄️', question: 'What is BCNF (Boyce-Codd Normal Form)?', answer: 'A stricter variant of 3NF where for EVERY non-trivial functional dependency X → Y, X MUST be a superkey.', difficulty: 'Hard', flipped: false, status: null }
    ],
    OS: [
      { id: 'os_1', category: 'Operating Systems 🖥️', question: 'What are the 4 Coffman Conditions for Deadlock?', answer: '1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait. Breaking any 1 condition prevents deadlock.', difficulty: 'Medium', flipped: false, status: null },
      { id: 'os_2', category: 'Operating Systems 🖥️', question: 'What is the difference between Process and Thread?', answer: 'A Process is an independent program execution with isolated memory. A Thread is a lightweight execution unit sharing process memory space.', difficulty: 'Easy', flipped: false, status: null },
      { id: 'os_3', category: 'Operating Systems 🖥️', question: 'What is Virtual Memory Paging?', answer: 'Paging divides memory into fixed-size blocks (Pages in virtual, Frames in physical RAM), allowing non-contiguous allocation.', difficulty: 'Medium', flipped: false, status: null }
    ],
    CN: [
      { id: 'cn_1', category: 'Computer Networks 📡', question: 'Explain the TCP 3-Way Handshake.', answer: '1. Client sends SYN ➔ 2. Server responds with SYN-ACK ➔ 3. Client sends ACK to establish reliable connection.', difficulty: 'Easy', flipped: false, status: null },
      { id: 'cn_2', category: 'Computer Networks 📡', question: 'What is the difference between TCP and UDP?', answer: 'TCP is connection-oriented and reliable. UDP is connectionless, lightweight, and low-latency.', difficulty: 'Easy', flipped: false, status: null }
    ]
  };

  const [cardsState, setCardsState] = useState(initialDecks);
  const currentDeck = cardsState[selectedSubject] || cardsState['DBMS'];

  // Quiz State
  const quizBank = {
    DBMS: [
      { id: 1, question: 'In SQL, which clause filters records after aggregation with GROUP BY?', options: ['WHERE', 'HAVING', 'ORDER BY', 'FILTER'], correctAnswer: 1, selectedAnswer: null, explanation: 'HAVING filters aggregate values (e.g. HAVING COUNT(*) > 5).' },
      { id: 2, question: 'Which normal form strictly eliminates transitive functional dependencies?', options: ['1NF', '2NF', '3NF', '4NF'], correctAnswer: 2, selectedAnswer: null, explanation: '3NF requires that no non-prime attribute is transitively dependent on candidate key.' }
    ]
  };

  const [quizzesState, setQuizzesState] = useState(quizBank);
  const [quizScore, setQuizScore] = useState(null);

  // Send Message Logic
  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || inputMessage;
    if (!queryText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'User', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText })
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'Sage', text: data.reply }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'Sage',
        text: `🌿 **Sage Real-time Concept Answer:** Regarding "${queryText}", remember to test yourself with active recall! Check out the Flashcards or Quiz tabs! 🌱`
      }]);
    }
  };

  const toggleFlip = (cardId) => {
    setCardsState(prev => ({
      ...prev,
      [selectedSubject]: prev[selectedSubject].map(c => c.id === cardId ? { ...c, flipped: !c.flipped } : c)
    }));
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'Sage',
        text: "🌿 **Chat reset!** I am ready to answer your concept questions. What shall we learn next? 🌱"
      }
    ]);
    addToast('Chat cleared 🌿', 'info', '🧹');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30 border border-emerald-300/40 shrink-0"
          >
            🌿
          </motion.div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Sage 🌿 Real-Time Concept AI Chatbot
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
              Instant concept answers • Crisp definitions • CS Decks • Self-Testing
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="px-3.5 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-xs font-poppins font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Mode Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/50 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-2xl font-poppins text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'chat' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Real-Time Concept Chat
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-2xl font-poppins text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'flashcards' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Flashcards ({currentDeck.length})
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-2xl font-poppins text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'quiz' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Take Quiz
          </button>
        </div>

        {/* CS Subject Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-poppins">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-card text-xs font-poppins font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 focus:outline-none"
          >
            <option value="DBMS">DBMS 🗄️</option>
            <option value="OS">Operating Systems 🖥️</option>
            <option value="CN">Computer Networks 📡</option>
          </select>
        </div>
      </div>

      {/* TAB 1: Real-Time Concept Chatbot */}
      {activeTab === 'chat' && (
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-2xl flex flex-col h-[540px]">
          {/* Chat Messages View */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'Sage' && (
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-base font-bold shrink-0 shadow-md">
                    🌿
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-3xl text-xs font-poppins leading-relaxed ${
                    msg.sender === 'User'
                      ? 'bg-emerald-500 text-white shadow-md rounded-tr-none'
                      : 'bg-white/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200/40 dark:border-slate-700/40 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-emerald-500 font-poppins animate-pulse">
                <span>🌿 Sage is answering your concept question...</span>
              </div>
            )}
          </div>

          {/* Quick Concept Prompts Bar */}
          <div className="my-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/40">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Concept Questions (Click to Ask Sage):</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {quickConceptPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold whitespace-nowrap transition-all shadow-sm shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Sage any concept question (e.g. 'What is BCNF?', 'Explain TCP 3-Way Handshake')..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-poppins"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Send className="w-4 h-4" />
              Ask Sage
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Self-Testing Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDeck.map((fc, idx) => (
              <motion.div
                key={fc.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleFlip(fc.id)}
                className="glass-card rounded-3xl p-6 border shadow-xl flex flex-col justify-between cursor-pointer min-h-[220px]"
              >
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                  <span>{fc.category}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {fc.difficulty}
                  </span>
                </div>

                <div className="my-4 text-center">
                  <h4 className="font-poppins font-bold text-xs text-slate-400 mb-1 uppercase tracking-wider">
                    {fc.flipped ? 'Answer' : 'Question (Click to flip)'}
                  </h4>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-poppins leading-relaxed">
                    {fc.flipped ? fc.answer : fc.question}
                  </p>
                </div>

                <div className="text-center text-[10px] font-bold text-emerald-500">
                  {fc.flipped ? 'Showing Answer ✨' : 'Showing Question 🌱'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Quizzes */}
      {activeTab === 'quiz' && (
        <div className="glass-card rounded-3xl p-6 border border-teal-500/30 shadow-2xl space-y-6">
          <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
            Practice Quiz: {selectedSubject}
          </h3>
          <div className="space-y-4">
            {(quizzesState[selectedSubject] || quizzesState['DBMS']).map((q, qIdx) => (
              <div key={q.id} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{qIdx + 1}. {q.question}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 text-left hover:border-emerald-500"
                    >
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
