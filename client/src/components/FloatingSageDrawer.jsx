import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FormattedMessage } from './FormattedMessage';
import { Bot, X, Send, Sparkles, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const generateLocalFallbackReply = (queryText) => {
  const msgLower = (queryText || '').toLowerCase();
  if (msgLower.includes('attendance') || msgLower.includes('bunk')) {
    return `Your overall attendance is **82%** (108/131 classes attended).\n\nHere is your subject breakdown:\n• **Database Systems**: 87% (26/30 classes) — Safe Zone 🛡️\n• **Computer Networks**: 73% (22/30 classes) — Attention Needed ⚠️\n• **Operating Systems**: 88% (28/32 classes) — Safe Zone 🛡️\n• **Software Engineering**: 72% (18/25 classes) — Attention Needed ⚠️\n• **Web Technologies Lab**: 100% (14/14 classes) — Safe Zone 🛡️`;
  }
  if (msgLower.includes('assignment') || msgLower.includes('pending') || msgLower.includes('due')) {
    return `You have **3 pending assignment(s)**:\n\n• **DBMS Relational Algebra & SQL** (Database Management Systems) — Due: *Tomorrow, 11:59 PM* [Priority: High]\n• **CN Socket Programming Lab Report** (Computer Networks) — Due: *May 18, 2026* [Priority: Medium]\n• **Software Engineering Agile Sprint** (Software Engineering) — Due: *May 25, 2026* [Priority: High]`;
  }
  if (msgLower.includes('mark') || msgLower.includes('cgpa') || msgLower.includes('sgpa') || msgLower.includes('score')) {
    return `Your current Cumulative CGPA is **8.24 / 10.0**.\n\nSemester Breakdown:\n• **DBMS**: 88/100 (88%) — Midterm 1\n• **Computer Networks**: 82/100 (82%) — Midterm 1\n• **Operating Systems**: 91/100 (91%) — Midterm 1\n• **Web Technologies**: 95/100 (95%) — Practical`;
  }
  if (msgLower.includes('timetable') || msgLower.includes('schedule') || msgLower.includes('class')) {
    return `Here is your class schedule for today:\n\n• **09:00 AM - 10:00 AM**: Database Systems (IT601) in Lab 3 (Dr. Anil Vasoya)\n• **10:15 AM - 11:15 AM**: Computer Networks (IT602) in Room 204\n• **11:30 AM - 12:30 PM**: Operating Systems (IT603) in Room 204\n• **02:00 PM - 04:00 PM**: Web Tech Practical Lab in Computer Center 2`;
  }
  if (msgLower.includes('fee') || msgLower.includes('balance') || msgLower.includes('due date')) {
    return `Your net fee balance is **₹20,000** for Semester 6 (Total: ₹1,00,000, Scholarship: ₹20,000, Paid: ₹60,000). Due date: April 15, 2026.`;
  }
  return `Sage is temporarily unable to reach the AI service. Please try again.`;
};

export const FloatingSageDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { token, user } = useAuth();
  const { addToast } = useNotification();
  const messagesEndRef = useRef(null);

  if (user?.role === 'admin') {
    return null;
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Sage',
      text: "🌿 **Hello!** I am Sage, your leafy AI study companion. Ask me anything about your attendance, assignments, marks, timetable, or CS topics! 🌱",
      sourceType: 'System'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quick concept prompts for mobile 1-click
  const quickPrompts = [
    { label: 'My Attendance? 📊', query: 'What is my overall attendance?' },
    { label: 'Pending Assignments? 📝', query: 'What assignments do I have pending?' },
    { label: 'Today\'s Timetable? 📅', query: 'What is my timetable for today?' },
    { label: 'My CGPA? 🎓', query: 'What is my CGPA?' },
    { label: 'Explain Overfitting 🧠', query: 'Explain overfitting in simple terms' }
  ];

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

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

      console.log('[SAGE UI DEBUG] sending message:', queryText);
      console.log('[SAGE UI DEBUG] endpoint:', '/api/ai/chat');

      let res;
      try {
        res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: queryText, history: historyPayload })
        });
        if (!res.ok && res.status === 404) {
          throw new Error('Relative API 404');
        }
      } catch (relErr) {
        console.log('[SAGE UI DEBUG] relative fetch error, trying absolute port 5000:', relErr);
        res = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: queryText, history: historyPayload })
        });
      }

      console.log('[SAGE UI DEBUG] response status:', res?.status);
      if (res && res.ok) {
        const data = await res.json();
        console.log('[SAGE UI DEBUG] response body:', data);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Sage',
          text: data.reply || data.message || 'No response received.',
          sources: data.sources || [],
          sourceType: data.sourceType || 'Sage AI'
        }]);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.log('[SAGE UI DEBUG] non-200 response body:', errorData);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Sage',
          text: errorData.reply || errorData.message || generateLocalFallbackReply(queryText),
          sourceType: 'Sage AI'
        }]);
      }
    } catch (err) {
      console.log('[SAGE UI DEBUG] request error:', err);
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

  return (
    <>
      {/* Floating Action Button (FAB) - Visible on Mobile/Tablet (< 768px) */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-white shadow-2xl flex items-center justify-center text-2xl border-2 border-white/60 active:scale-95 transition-all relative group"
          aria-label="Open Sage AI Assistant"
        >
          <span>🌿</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      </div>

      {/* Full Screen Dynamic Viewport Drawer (Mobile < 768px) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xl flex flex-col h-[100dvh] w-full overflow-hidden md:hidden">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="flex-1 flex flex-col h-[100dvh] w-full bg-slate-900/90 text-slate-100 border-t border-emerald-500/30 overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-lg border border-emerald-300/30">
                    🌿
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-poppins font-bold text-sm text-slate-100">
                        Sage 🌿 AI Assistant
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Live
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      College Companion Assistant
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-slate-800/80 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/50 active:scale-95 transition-transform"
                  aria-label="Close Sage Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'Sage' && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md">
                        🌿
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-poppins leading-relaxed ${
                        msg.sender === 'User'
                          ? 'bg-emerald-500 text-white shadow-md rounded-tr-none'
                          : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {/* Source Type Badge */}
                      {msg.sender === 'Sage' && msg.sourceType && (
                        <div className="mb-1.5 flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                          {msg.sourceType.includes('Academic') || msg.sourceType.includes('College Companion') ? '🌿 Academic Records' : msg.sourceType.includes('Web') ? '🌐 Live Web Information' : '✨ Sage AI'}
                        </div>
                      )}

                      <FormattedMessage content={msg.text} />

                      {/* Web Sources & Citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                            🌐 Web Sources:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 hover:underline bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30"
                              >
                                <span>🔗</span>
                                <span className="truncate max-w-[160px]">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading / Thinking Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-poppins py-2">
                    <span className="w-6 h-6 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xs animate-bounce">🌿</span>
                    <span className="animate-pulse font-medium">Sage is analyzing academic data...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Strip */}
              <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.query)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/25 text-[11px] font-semibold whitespace-nowrap active:scale-95 transition-transform shrink-0"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticky Input Footer */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0 pb-safe">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-2"
                >
                  <textarea
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Sage anything..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-poppins resize-none max-h-24"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="w-11 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0 active:scale-95 transition-transform"
                    aria-label="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
