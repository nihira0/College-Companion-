import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FileText, Plus, CheckCircle2, Circle, Clock, Filter, Sparkles, X, Trash2, Send, CheckSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Assignments = () => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  // State
  const [selectedClass, setSelectedClass] = useState('div_ita_1');
  const [selectedSubject, setSelectedSubject] = useState('Big Data Analysis');
  const [assignments, setAssignments] = useState([
    { id: 'ass_1', title: 'Big Data Analysis HDFS & MapReduce Lab', subject: 'Big Data Analysis', dueDate: 'Tomorrow, 11:59 PM', priority: 'High', completed: false, details: 'Submit MapReduce program execution log and output files', divisionId: 'div_ita_1' },
    { id: 'ass_2', title: 'Machine Learning Neural Networks Assignment', subject: 'Machine Learning', dueDate: 'May 18, 2026', priority: 'Medium', completed: false, details: 'Train multi-layer perceptron on MNIST dataset', divisionId: 'div_itb_1' },
    { id: 'ass_3', title: 'User Interface Designing Figma Prototype', subject: 'User Interface Designing', dueDate: 'May 21, 2026', priority: 'Low', completed: true, details: 'Submit interactive Figma prototype link for mobile app', divisionId: 'div_ita_1' },
    { id: 'ass_4', title: 'Product Design Sprint Report', subject: 'Product Design and Development', dueDate: 'May 25, 2026', priority: 'High', completed: false, details: 'Prepare user persona and value proposition canvas', divisionId: 'div_itc_1' }
  ]);

  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Big Data Analysis');
  const [newDueDate, setNewDueDate] = useState('May 28, 2026');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDetails, setNewDetails] = useState('');
  const [targetClass, setTargetClass] = useState('div_ita_1');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('/api/academic/assignments', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAssignments(data);
          }
        }
      } catch (err) {}
    };
    fetchAssignments();
  }, [token]);

  const toggleComplete = async (id) => {
    setAssignments(prev => prev.map(item => {
      if (item.id === id || item._id === id) {
        const nextState = !item.completed;
        if (nextState) {
          addToast(`✅ ${item.title} Completed!`, 'success', '🌱');
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));

    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      await fetch(`/api/academic/assignments/${id}/toggle`, {
        method: 'PATCH',
        headers
      });
    } catch (e) {}
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      title: newTitle,
      subject: newSubject,
      dueDate: newDueDate,
      priority: newPriority,
      details: newDetails,
      divisionId: targetClass
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch('/api/academic/assignments', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newItem = await res.json();
        setAssignments(prev => [newItem, ...prev]);
        addToast(`Assignment "${newTitle}" published to class! 📢`, 'success', '📝');
      } else {
        const err = await res.json();
        addToast(err.message || 'Failed to create assignment', 'error');
      }
    } catch (err) {
      const newItem = {
        id: `ass_${Date.now()}`,
        ...payload,
        completed: false
      };
      setAssignments(prev => [newItem, ...prev]);
      addToast(`Assignment "${newTitle}" published!`, 'success', '📝');
    }

    setNewTitle('');
    setNewDetails('');
    setShowAddModal(false);
  };

  const handleDeleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => (a.id || a._id) !== id));
    addToast('Assignment removed', 'info');
  };

  const filteredAssignments = assignments.filter(item => {
    if (isFacultyOrAdmin) {
      if (selectedClass !== 'all' && item.divisionId && item.divisionId !== selectedClass) return false;
    }
    if (filter === 'Pending') return !item.completed;
    if (filter === 'Completed') return item.completed;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-extrabold text-xl sm:text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
            <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">📝</span>
            {isFacultyOrAdmin ? 'Faculty Assignment Publisher & Analytics' : 'My Academic Assignments'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
            {isFacultyOrAdmin
              ? 'Publish course deliverables to assigned classes, set deadlines, and track submission analytics.'
              : 'Track deadlines, submit deliverables, and manage your academic priorities cleanly.'}
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-poppins text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Publish New Assignment
          </button>
        )}
      </div>

      {/* Persistent Class & Subject Selector for Faculty */}
      {isFacultyOrAdmin && (
        <div className="glass-card rounded-2xl p-4 border border-slate-200/40 dark:border-slate-800/40 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-poppins">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Target Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <option value="all">All Assigned Classes</option>
                <option value="div_ita_1">IT-A (75 Students)</option>
                <option value="div_itb_1">IT-B (76 Students)</option>
                <option value="div_itc_1">IT-C (81 Students)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="DBMS">Database Management Systems</option>
                <option value="CN">Computer Networks</option>
                <option value="OS">Operating Systems</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              Submitted: 68/75 (90.6%)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold">
              Pending: 7 Students
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-3">
        <Filter className="w-4 h-4 text-slate-400 mr-2" />
        {['All', 'Pending', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl font-poppins text-xs font-medium transition-all ${
              filter === tab
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            {tab} ({tab === 'All' ? filteredAssignments.length : tab === 'Pending' ? filteredAssignments.filter(a => !a.completed).length : filteredAssignments.filter(a => a.completed).length})
          </button>
        ))}
      </div>

      {/* Assignments List Grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredAssignments.map(item => (
              <motion.div
                key={item.id || item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card rounded-3xl p-4 sm:p-5 border transition-all ${
                  item.completed && !isFacultyOrAdmin
                    ? 'border-emerald-500/30 bg-emerald-500/5 opacity-85'
                    : 'border-white/40 dark:border-slate-800/60 shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {!isFacultyOrAdmin && (
                      <button
                        onClick={() => toggleComplete(item.id || item._id)}
                        className="mt-1 text-emerald-500 hover:scale-115 transition-transform"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 ${item.completed && !isFacultyOrAdmin ? 'line-through text-slate-400' : ''}`}>
                          {item.title}
                        </h3>
                        {item.divisionId && (
                          <span className="px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-extrabold text-[10px]">
                            {item.divisionId === 'div_itb_1' ? 'IT-B' : item.divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.subject}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.priority === 'High'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : item.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.priority} Priority
                    </span>

                    {isFacultyOrAdmin && (
                      <button
                        onClick={() => handleDeleteAssignment(item.id || item._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {item.details && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 my-3">
                    {item.details}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-poppins">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {item.dueDate}</span>
                  </div>
                  {isFacultyOrAdmin ? (
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                      Published to Class Roster
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {item.completed ? 'Completed ✨' : 'Action Required'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center text-xs text-slate-400 font-poppins space-y-2">
          <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">No Assignments Found</p>
          <p>There are no assignments published for the selected class filter.</p>
        </div>
      )}

      {/* Add / Publish Modal */}
      {showAddModal && isFacultyOrAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> Publish Class Assignment
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs font-poppins">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Class / Division</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 font-bold"
                >
                  <option value="div_ita_1">IT-A (Division A)</option>
                  <option value="div_itb_1">IT-B (Division B)</option>
                  <option value="div_itc_1">IT-C (Division C)</option>
                  <option value="all">All Divisions</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. DBMS Query Optimization Lab Report"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Due Date</label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Description / Instructions</label>
                <textarea
                  rows="2"
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Instructions for students..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins font-semibold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Publish Assignment to Class
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
