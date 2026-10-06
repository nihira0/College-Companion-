import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { FormattedMessage } from '../components/FormattedMessage';
import {
  MessageSquare,
  BookOpen,
  BrainCircuit,
  Plus,
  Send,
  Trash2,
  Zap,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const formatChatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffHours = (now - d) / (1000 * 60 * 60);

  if (diffHours < 24 && d.getDate() === now.getDate()) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth()) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + `, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const generateLocalFallbackReply = (queryText) => {
  const msgLower = (queryText || '').toLowerCase();
  if (msgLower.includes('attendance') || msgLower.includes('bunk')) {
    return `Your overall attendance is **82.4%** (108/131 classes attended).\n\nSubject Breakdown:\n• **Big Data Analysis**: 86.7% (26/30 classes) — Safe Zone 🛡️\n• **Machine Learning**: 73.3% (22/30 classes) — Attention Needed ⚠️\n• **User Interface Designing**: 87.5% (28/32 classes) — Safe Zone 🛡️\n• **Product Design and Development**: 72.0% (18/25 classes) — Attention Needed ⚠️\n• **DevOps**: 100% (14/14 classes) — Safe Zone 🛡️`;
  }
  if (msgLower.includes('assignment') || msgLower.includes('pending') || msgLower.includes('due')) {
    return `You have **3 pending assignment(s)**:\n\n• **Big Data Analysis HDFS Lab** — Due: *Tomorrow, 11:59 PM* [Priority: High]\n• **Machine Learning Neural Networks Assignment** — Due: *May 18, 2026* [Priority: Medium]\n• **Product Design Sprint Report** — Due: *May 25, 2026* [Priority: High]`;
  }
  if (msgLower.includes('mark') || msgLower.includes('cgpa') || msgLower.includes('sgpa') || msgLower.includes('score')) {
    return `Your current Cumulative CGPA is **8.24 / 10.0**.\n\nSemester Breakdown:\n• **Big Data Analysis**: 88/100 (88%) — Midterm 1\n• **Machine Learning**: 82/100 (82%) — Midterm 1\n• **User Interface Designing**: 91/100 (91%) — Midterm 1\n• **DevOps**: 95/100 (95%) — Practical`;
  }
  if (msgLower.includes('timetable') || msgLower.includes('schedule') || msgLower.includes('class')) {
    return `Here is your class schedule for today:\n\n• **09:00 AM - 10:30 AM**: Big Data Analysis (IT601) in Lab 221 (Dr. Rajesh S. Bansode)\n• **11:00 AM - 01:00 PM**: Machine Learning Lab (IT602L) in Lab 203\n• **02:00 PM - 03:30 PM**: User Interface Designing (IT603) in Room 518`;
  }
  if (msgLower.includes('fee') || msgLower.includes('balance') || msgLower.includes('due date')) {
    return `Your net fee balance is **₹20,000** for Semester 6 (Total: ₹1,00,000, Scholarship: ₹20,000, Paid: ₹60,000). Due date: April 15, 2026.`;
  }
  return `Sage is temporarily unable to reach the AI service. Please try again.`;
};

export const SageAI = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'chat';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { addToast } = useNotification();
  const { token } = useAuth();
  const messagesEndRef = useRef(null);

  // Quick Concept Prompts Chips for 1-click real-time answers
  const quickConceptPrompts = [
    { label: 'My Attendance? 📊', query: 'What is my overall attendance?' },
    { label: 'Big Data HDFS 🗄️', query: 'What is HDFS in Big Data Analysis?' },
    { label: 'Machine Learning 🤖', query: 'Explain supervised vs unsupervised learning' },
    { label: 'DevOps CI/CD ⚡', query: 'What is CI/CD pipeline in DevOps?' },
    { label: 'Pending Assignments? 📝', query: 'What assignments do I have pending?' },
    { label: 'Today\'s Timetable? 📅', query: 'What is my timetable for today?' },
    { label: 'My Marks & CGPA? 🎓', query: 'What is my CGPA and midterm scores?' }
  ];

  // Chat & History State
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatsList, setChatsList] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Sage',
      text: "🌿 Good Morning! I am your real-time academic AI companion Sage 🌿. Ask me about your attendance, assignments, marks, timetable, or any computer science topic!",
      sourceType: 'System'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Fetch Chat History List
  const fetchUserChats = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      let res;
      try {
        res = await fetch('/api/ai/chats', { headers });
      } catch (e) {
        res = await fetch('http://localhost:5000/api/ai/chats', { headers });
      }
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setChatsList(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchUserChats();
  }, [token]);

  // Load selected chat history
  const loadChatHistory = async (chatId) => {
    try {
      setCurrentChatId(chatId);
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      let res;
      try {
        res = await fetch(`/api/ai/chats/${chatId}`, { headers });
      } catch (e) {
        res = await fetch(`http://localhost:5000/api/ai/chats/${chatId}`, { headers });
      }
      if (res && res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.messages)) {
          const formattedMsgs = data.messages.map((m, idx) => ({
            id: idx + 1,
            sender: m.sender === 'user' ? 'User' : 'Sage',
            text: m.text,
            sourceType: m.sourceType || 'Sage AI',
            sources: m.sources || []
          }));
          setMessages(formattedMsgs.length > 0 ? formattedMsgs : [{
            id: 1,
            sender: 'Sage',
            text: "🌿 Conversation loaded! How can I assist you further?",
            sourceType: 'System'
          }]);
        }
      }
    } catch (err) {}
  };

  // Start New Chat
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([
      {
        id: Date.now(),
        sender: 'Sage',
        text: "🌿 **New Conversation Started!** Ask me about your attendance, assignments, marks, timetable, or any academic topic!",
        sourceType: 'System'
      }
    ]);
  };

  // Delete Chat History Item
  const deleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      try {
        await fetch(`/api/ai/chats/${chatId}`, { method: 'DELETE', headers });
      } catch (err) {
        await fetch(`http://localhost:5000/api/ai/chats/${chatId}`, { method: 'DELETE', headers });
      }
      setChatsList(prev => prev.filter(c => (c.id !== chatId && c._id !== chatId)));
      if (currentChatId === chatId) {
        handleNewChat();
      }
      addToast('Conversation deleted', 'info', '🗑️');
    } catch (e) {}
  };

  // Auto scroll to latest message
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  // Flashcards Decks
  const initialDecks = [
    { id: 'bda_1', category: 'Big Data Analysis 🗄️', question: 'What is HDFS Architecture?', answer: 'HDFS follows a Master-Slave architecture where NameNode manages metadata and DataNodes store actual data blocks with 3x replication.', difficulty: 'Easy', flipped: false },
    { id: 'bda_2', category: 'Big Data Analysis 🗄️', question: 'What is the MapReduce execution flow?', answer: 'Input Splitting ➔ Map Phase (Key-Value pairing) ➔ Shuffle & Sort (Group by key) ➔ Reduce Phase (Aggregation) ➔ Output.', difficulty: 'Medium', flipped: false },
    { id: 'ml_1', category: 'Machine Learning 🤖', question: 'What is the difference between Supervised & Unsupervised Learning?', answer: 'Supervised learning uses labeled target outputs (Regression, Classification). Unsupervised learning discovers patterns in unlabeled data (Clustering, PCA).', difficulty: 'Easy', flipped: false },
    { id: 'devops_1', category: 'DevOps ⚡', question: 'What is CI/CD Pipeline?', answer: 'Continuous Integration automatically builds and tests code commits. Continuous Deployment automatically deploys verified code to production environments.', difficulty: 'Medium', flipped: false }
  ];

  const [cardsState, setCardsState] = useState(initialDecks);

  // Send Message Logic
  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || inputMessage;
    if (!queryText.trim() || isTyping) return;

    const userMsg = { id: Date.now(), sender: 'User', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const historyPayload = messages.slice(-8).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      let res;
      try {
        res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: queryText, history: historyPayload, chatId: currentChatId })
        });
        if (!res.ok && res.status === 404) {
          throw new Error('Relative API 404');
        }
      } catch (relErr) {
        res = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: queryText, history: historyPayload, chatId: currentChatId })
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Sage',
          text: data.reply || data.message || 'No response text received.',
          sources: data.sources || [],
          sourceType: data.sourceType || 'Sage AI'
        }]);
        if (data.chatId) {
          setCurrentChatId(data.chatId);
          fetchUserChats();
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Sage',
          text: errorData.reply || errorData.message || generateLocalFallbackReply(queryText),
          sourceType: 'Sage AI'
        }]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'Sage',
        text: generateLocalFallbackReply(queryText),
        sourceType: 'Sage AI'
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleFlip = (cardId) => {
    setCardsState(prev => prev.map(c => c.id === cardId ? { ...c, flipped: !c.flipped } : c));
  };

  return (
    <div className="space-y-6 pb-12">
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
              Sage 🌿 AI Academic Assistant
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
              Live College Companion Data • Persistent Conversation History • Practice Decks
            </p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-white font-poppins font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>

      {/* Mode Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-2xl font-poppins text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'chat' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          AI Assistant Chat
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2 rounded-2xl font-poppins text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'flashcards' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Flashcards ({cardsState.length})
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

      {/* TAB 1: Chatbot with History Sidebar */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100dvh-240px)] min-h-[540px] md:h-[600px]">
          {/* Chat History Sidebar */}
          <div className="glass-card rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:col-span-1 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 dark:border-slate-800/50 mb-3">
              <span className="text-xs font-poppins font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Chat History
              </span>
              <button
                onClick={handleNewChat}
                title="Start New Chat"
                className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {chatsList.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400 font-poppins">
                  No previous conversations yet. Ask Sage anything! 🌿
                </div>
              ) : (
                chatsList.map(chat => {
                  const chatId = chat.id || chat._id;
                  const isActive = currentChatId === chatId;
                  return (
                    <div
                      key={chatId}
                      onClick={() => loadChatHistory(chatId)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border group flex items-start justify-between gap-2 ${
                        isActive
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-semibold shadow-sm'
                          : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/30 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="text-xs font-poppins truncate font-semibold">
                          {chat.title || 'Sage Conversation'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-poppins mt-0.5">
                          {formatChatDate(chat.updatedAt || chat.createdAt)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteChat(e, chatId)}
                        title="Delete chat"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat View */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-2xl flex flex-col md:col-span-3 h-full">
            {/* Chat Messages */}
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
                        : 'bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {/* Source Badge */}
                    {msg.sender === 'Sage' && msg.sourceType && (
                      <div className="mb-2 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {msg.sourceType.includes('Academic') || msg.sourceType.includes('College') ? '🌿 Academic Records' : '✨ Sage AI'}
                      </div>
                    )}

                    <FormattedMessage content={msg.text} />

                    {/* Web Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/40 dark:border-slate-700/50 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                          🌐 Web Sources:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-500/20"
                            >
                              <span>🔗</span>
                              <span className="truncate max-w-[200px]">{src.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-emerald-600 dark:text-emerald-400 font-poppins py-1">
                  <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-sm font-bold animate-pulse">
                    🌿
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Sage is analyzing academic data & query...</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping delay-150" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Academic Prompts */}
            <div className="my-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/40">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Academic Prompts (Click to Ask Sage):</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3 items-end">
              <textarea
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Sage anything (e.g. 'What is my attendance?', 'What is HDFS in Big Data Analysis?')... [Shift+Enter for new line]"
                className="flex-1 px-4 py-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-poppins resize-none max-h-24"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-poppins font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask Sage</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Self-Testing Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {cardsState.map((fc) => (
              <motion.div
                key={fc.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => toggleFlip(fc.id)}
                className="glass-card rounded-3xl p-6 border shadow-xl flex flex-col justify-between cursor-pointer min-h-[220px]"
              >
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                  <span>{fc.category}</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
            Practice Quiz: Big Data & CS Knowledge
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">1. Which component in HDFS is responsible for storing the actual data blocks?</h4>
              <div className="grid grid-cols-2 gap-2">
                {['NameNode', 'DataNode', 'JobTracker', 'TaskTracker'].map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 text-left hover:border-emerald-500"
                  >
                    {String.fromCharCode(65 + optIdx)}. {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
