import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { BookOpen, Plus, Search, Sparkles, X, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export const Notes = () => {
  const { addToast } = useNotification();
  const [notes, setNotes] = useState([
    { id: 'note_1', title: 'DBMS Chapter 3: Normalization Cheat Sheet', subject: 'DBMS', content: '1NF: Atomic values. 2NF: No partial dependency on candidate key. 3NF: No transitive dependency (X -> Y where neither is key). BCNF: For X -> Y, X must be super key!', color: 'emerald' },
    { id: 'note_2', title: 'OS Deadlock Coffman Conditions', subject: 'Operating Systems', content: '1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait. Prevention requires breaking at least 1 condition.', color: 'amber' },
    { id: 'note_3', title: 'CN Lab Viva Quick Recall', subject: 'Computer Networks', content: 'TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK. OSI Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.', color: 'purple' },
    { id: 'note_4', title: 'Web Tech React Hooks Rules', subject: 'Web Dev', content: '1. Only call hooks at top level 2. Only call hooks from React function components or custom hooks 3. Dependency arrays determine re-renders.', color: 'teal' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('DBMS');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('emerald');

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNoteObj = {
      id: `note_${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      content: newContent,
      color: newColor
    };

    setNotes([newNoteObj, ...notes]);
    addToast(`New note "${newTitle}" created!`, 'success', '📓');
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">📓</span>
            Academic Notes Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
            Subject-wise quick recall cards, lecture summaries, and personal revision notes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Note
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter notes by subject or keyword (e.g. 'normalization', 'OS')..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-card text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-poppins shadow-sm"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <motion.div
            key={note.id}
            whileHover={{ y: -4 }}
            className={`glass-card rounded-3xl p-6 border shadow-lg flex flex-col justify-between ${
              note.color === 'emerald'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : note.color === 'amber'
                ? 'border-amber-500/30 bg-amber-500/5'
                : note.color === 'purple'
                ? 'border-purple-500/30 bg-purple-500/5'
                : 'border-teal-500/30 bg-teal-500/5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-200/50">
                  {note.subject}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Card #{note.id.slice(-3)}</span>
              </div>

              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">
                {note.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-poppins leading-relaxed whitespace-pre-line">
                {note.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/30 dark:border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
              <span>Updated Recently</span>
              <button
                onClick={() => addToast(`Copied "${note.title}" to clipboard!`, 'info', '📋')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Copy Text
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40">
              <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                Create Academic Note Card
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Semaphore Types"
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
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Theme Color</label>
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="emerald">Emerald 🌿</option>
                    <option value="amber">Amber ☀️</option>
                    <option value="purple">Purple 🌙</option>
                    <option value="teal">Teal 🌊</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Content</label>
                <textarea
                  rows="4"
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Key formulas, definitions, code snippets..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins font-semibold shadow-lg shadow-emerald-500/25"
              >
                Save Note Card
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
