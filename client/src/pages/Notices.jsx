import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Bell, AlertCircle, Calendar, Tag, Bookmark, Check, Plus, X, Users, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export const Notices = () => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const [bookmarked, setBookmarked] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academics');
  const [targetClass, setTargetClass] = useState('ALL');
  const [newContent, setNewContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  const classList = [
    { id: 'ALL', name: 'All Department Classes' },
    { id: 'div_ita_1', name: 'IT-A (3rd Year)' },
    { id: 'div_itb_1', name: 'IT-B (3rd Year)' },
    { id: 'div_itc_1', name: 'IT-C (3rd Year)' },
  ];

  const [notices, setNotices] = useState([
    {
      id: 'not_1',
      title: 'Final Semester Examination Schedule Released',
      date: 'May 12, 2026',
      category: 'Exams',
      targetClass: 'ALL',
      targetLabel: 'All Classes',
      content: 'The end-semester examinations for B.Tech Computer Science (6th Semester) will commence from June 5th, 2026. Hall tickets can be downloaded from the student portal starting May 25th.',
      urgent: true
    },
    {
      id: 'not_2',
      title: 'IT-A DBMS Relational Schema Lab Submission Extended',
      date: 'May 10, 2026',
      category: 'Academics',
      targetClass: 'div_ita_1',
      targetLabel: 'IT-A (3rd Year)',
      content: 'Deadline extension of 48 hours approved for IT-A students for the DBMS mini-project schema submission.',
      urgent: false
    },
    {
      id: 'not_4',
      title: 'Computer Networks Guest Lecture by Cisco Systems',
      date: 'May 05, 2026',
      category: 'Events',
      targetClass: 'div_itb_1',
      targetLabel: 'IT-B (3rd Year)',
      content: 'All IT-B students must attend the industry expert session on BGP routing algorithms in Auditorium 2.',
      urgent: true
    }
  ]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('/api/academic/notices', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setNotices(data);
          }
        }
      } catch (err) {}
    };
    fetchNotices();
  }, [token]);

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const classLabel = classList.find(c => c.id === targetClass)?.name || 'All Classes';
    const payload = {
      title: newTitle,
      category: newCategory,
      divisionId: targetClass,
      targetLabel: classLabel,
      content: newContent,
      urgent: isUrgent
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch('/api/academic/notices', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newItem = await res.json();
        setNotices(prev => [newItem, ...prev]);
        addToast(`Notice "${newTitle}" published for ${classLabel}!`, 'success', '📢');
      } else {
        const err = await res.json();
        addToast(err.message || 'Failed to publish notice', 'error');
      }
    } catch (err) {
      const newItem = {
        id: `not_${Date.now()}`,
        ...payload,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      };
      setNotices(prev => [newItem, ...prev]);
      addToast(`Notice "${newTitle}" published for ${classLabel}!`, 'success', '📢');
    }

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const toggleBookmark = (id) => {
    setBookmarked(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredNotices = selectedCategory === 'All'
    ? notices
    : notices.filter(n => n.category === selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">📢</span>
            Department Notices & Announcements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
            {isFacultyOrAdmin
              ? 'Faculty Management Workstation • Publish class-targeted notices and official department circulars.'
              : 'Stay updated with official college circulars, exam schedules, and class announcements.'}
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-poppins text-xs font-semibold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Publish Notice
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-3 overflow-x-auto">
        {['All', 'Exams', 'Events', 'Academics', 'General'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl font-poppins text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notice Cards */}
      <div className="space-y-4">
        {filteredNotices.map(notice => (
          <motion.div
            key={notice.id || notice._id}
            whileHover={{ y: -2 }}
            className={`glass-card rounded-3xl p-6 border shadow-lg transition-all ${
              notice.urgent ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/40 dark:border-slate-800/60'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {notice.urgent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> URGENT
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                    {notice.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1">
                    <Users className="w-3 h-3" /> {notice.targetLabel || 'All Classes'}
                  </span>
                </div>
                <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
                  {notice.title}
                </h3>
              </div>

              <button
                onClick={() => toggleBookmark(notice.id || notice._id)}
                className={`p-2 rounded-xl border transition-all ${
                  bookmarked.includes(notice.id || notice._id)
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                    : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/40 text-slate-400'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-poppins my-3">
              {notice.content}
            </p>

            <div className="pt-3 border-t border-slate-200/30 dark:border-slate-800/40 flex items-center justify-between text-xs text-slate-400 font-poppins">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" /> Date: {notice.date || 'Today'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Publish Notice Modal for Faculty/Admin */}
      {showAddModal && isFacultyOrAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                Publish Class Notice
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-4 text-xs font-poppins">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. End Semester Viva Voce Schedule"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Class</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    {classList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Academics">Academics</option>
                    <option value="Exams">Exams</option>
                    <option value="Events">Events</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-rose-500 rounded focus:ring-rose-400"
                  />
                  <span className="font-semibold text-rose-500">Mark as URGENT Notice</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Notice Content</label>
                <textarea
                  rows="4"
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Full notice message and instructions..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-poppins font-semibold shadow-lg shadow-amber-500/25"
              >
                Publish Notice to Class
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

