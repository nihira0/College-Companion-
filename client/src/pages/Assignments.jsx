import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { FileText, Plus, CheckCircle2, Circle, Clock, Filter, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Assignments = () => {
  const { addToast } = useNotification();
  const [assignments, setAssignments] = useState([
    { id: 'ass_1', title: 'DBMS Relational Algebra & SQL', subject: 'Database Management Systems', dueDate: 'Tomorrow, 11:59 PM', priority: 'High', completed: false, details: 'Submit ER diagrams and Query outputs on Google Classroom' },
    { id: 'ass_3', title: 'OS Deadlock Resolution Essay', subject: 'Operating Systems', dueDate: 'May 21, 2026', priority: 'Low', completed: true, details: 'Banker algorithm simulation code attached' },
    { id: 'ass_4', title: 'Software Engineering Agile Sprint', subject: 'Software Engineering', dueDate: 'May 25, 2026', priority: 'High', completed: false, details: 'Prepare Jira user stories and velocity chart' }
  ]);

  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('DBMS');
  const [newDueDate, setNewDueDate] = useState('May 28, 2026');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDetails, setNewDetails] = useState('');

  const toggleComplete = (id) => {
    setAssignments(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState) {
          addToast(`✅ ${item.title} Completed!`, 'success', '🌱');
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: `ass_${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      dueDate: newDueDate,
      priority: newPriority,
      completed: false,
      details: newDetails
    };

    setAssignments([newItem, ...assignments]);
    addToast(`New Assignment "${newTitle}" added!`, 'info', '📝');
    setNewTitle('');
    setNewDetails('');
    setShowAddModal(false);
  };

  const filteredAssignments = assignments.filter(item => {
    if (filter === 'Pending') return !item.completed;
    if (filter === 'Completed') return item.completed;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">📝</span>
            Assignments Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
            Track deadlines, submit deliverables, and manage academic priorities cleanly.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

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
            {tab} ({tab === 'All' ? assignments.length : tab === 'Pending' ? assignments.filter(a => !a.completed).length : assignments.filter(a => a.completed).length})
          </button>
        ))}
      </div>

      {/* Assignments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredAssignments.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`glass-card rounded-3xl p-5 border transition-all ${
                item.completed
                  ? 'border-emerald-500/30 bg-emerald-500/5 opacity-85'
                  : 'border-white/40 dark:border-slate-800/60 shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className="mt-1 text-emerald-500 hover:scale-115 transition-transform"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 ${item.completed ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.subject}
                    </span>
                  </div>
                </div>

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
              </div>

              {item.details && (
                <p className="text-xs text-slate-600 dark:text-slate-300 my-3 pl-8">
                  {item.details}
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {item.dueDate}</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {item.completed ? 'Completed ✨' : 'Action Required'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                Add New Assignment
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. DBMS Query Optimization"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Details / Link</label>
                <textarea
                  rows="2"
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Additional instructions..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins font-semibold shadow-lg shadow-emerald-500/25"
              >
                Save Assignment
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
