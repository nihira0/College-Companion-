import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { BookOpen, Plus, Search, Sparkles, X, Tag, FileText, Download, Upload, Filter, Folder, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const Notes = () => {
  const { user, token } = useAuth();
  const { addToast } = useNotification();
  const isFaculty = user?.role === 'faculty';

  // Faculty State
  const [selectedClass, setSelectedClass] = useState('div_ita_1');
  const [selectedSubject, setSelectedSubject] = useState('Database Management Systems');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('All');

  const classes = [
    { id: 'div_ita_1', name: 'IT-A (3rd Year)', subject: 'Database Management Systems' },
    { id: 'div_itb_1', name: 'IT-B (3rd Year)', subject: 'Computer Networks' },
    { id: 'div_itc_1', name: 'IT-C (3rd Year)', subject: 'Software Engineering' },
  ];

  const facultyResources = [
    { id: 'res_1', title: 'Unit 3 DBMS Relational Algebra & SQL Cheat Sheet.pdf', type: 'Lecture Notes', classId: 'div_ita_1', subject: 'Database Management Systems', size: '2.4 MB', date: 'May 10, 2026', downloads: 68 },
    { id: 'res_2', title: 'Lab Manual: MySQL Indexing & Query Optimization Experiments', type: 'Lab Manual', classId: 'div_ita_1', subject: 'Database Management Systems', size: '4.1 MB', date: 'May 08, 2026', downloads: 72 },
    { id: 'res_3', title: 'Midterm 2 Sample Question Bank with Answers', type: 'Question Bank', classId: 'div_ita_1', subject: 'Database Management Systems', size: '1.8 MB', date: 'May 02, 2026', downloads: 84 },
    { id: 'res_4', title: 'Wireshark Packet Analysis & Subnetting Guide.pdf', type: 'Lecture Notes', classId: 'div_itb_1', subject: 'Computer Networks', size: '3.2 MB', date: 'May 11, 2026', downloads: 55 },
    { id: 'res_5', title: 'Software Requirement Specification (SRS) IEEE Template', type: 'Reference Material', classId: 'div_itc_1', subject: 'Software Engineering', size: '850 KB', date: 'May 04, 2026', downloads: 41 },
  ];

  const [resources, setResources] = useState(facultyResources);

  // Student State
  const [notes, setNotes] = useState([
    { id: 'note_1', title: 'DBMS Chapter 3: Normalization Cheat Sheet', subject: 'DBMS', content: '1NF: Atomic values. 2NF: No partial dependency on candidate key. 3NF: No transitive dependency (X -> Y where neither is key). BCNF: For X -> Y, X must be super key!', color: 'emerald' },
    { id: 'note_2', title: 'OS Deadlock Coffman Conditions', subject: 'Operating Systems', content: '1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait. Prevention requires breaking at least 1 condition.', color: 'amber' },
    { id: 'note_3', title: 'CN Lab Viva Quick Recall', subject: 'Computer Networks', content: 'TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK. OSI Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.', color: 'purple' },
    { id: 'note_4', title: 'Web Tech React Hooks Rules', subject: 'Web Dev', content: '1. Only call hooks at top level 2. Only call hooks from React function components or custom hooks 3. Dependency arrays determine re-renders.', color: 'teal' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newResourceType, setNewResourceType] = useState('Lecture Notes');
  const [newSubject, setNewSubject] = useState('DBMS');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('emerald');

  useEffect(() => {
    if (!isFaculty) {
      const fetchNotes = async () => {
        try {
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('/api/academic/notes', { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setNotes(data);
            }
          }
        } catch (err) {}
      };
      fetchNotes();
    }
  }, [isFaculty, token]);

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const currClassObj = classes.find(c => c.id === selectedClass);
    const newResObj = {
      id: `res_${Date.now()}`,
      title: newTitle,
      type: newResourceType,
      classId: selectedClass,
      subject: currClassObj?.subject || 'Database Management Systems',
      size: '1.5 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      downloads: 0
    };

    setResources(prev => [newResObj, ...prev]);
    addToast(`Resource "${newTitle}" published for ${currClassObj?.name}!`, 'success', '📁');
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      title: newTitle,
      subject: newSubject,
      content: newContent,
      color: newColor
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch('/api/academic/notes', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newItem = await res.json();
        setNotes(prev => [newItem, ...prev]);
        addToast(`New note "${newTitle}" created!`, 'success', '📓');
      }
    } catch (err) {
      setNotes(prev => [{ id: `note_${Date.now()}`, ...payload }, ...prev]);
      addToast(`New note "${newTitle}" created!`, 'success', '📓');
    }

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const filteredResources = resources.filter(r => {
    const matchesClass = r.classId === selectedClass;
    const matchesType = resourceTypeFilter === 'All' || r.type === resourceTypeFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesType && matchesSearch;
  });

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Faculty View (Resources Hub)
  if (isFaculty) {
    return (
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">📁</span>
              Class Resources & Courseware Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
              Faculty Management Workstation • Publish lecture slides, laboratory manuals, question banks, and reference materials for your assigned classes.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-poppins text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            Upload Course Resource
          </button>
        </div>

        {/* Class Selector Bar */}
        <div className="glass-card rounded-3xl p-5 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-3 overflow-x-auto">
          {['All', 'Lecture Notes', 'Lab Manual', 'Question Bank', 'Reference Material'].map(type => (
            <button
              key={type}
              onClick={() => setResourceTypeFilter(type)}
              className={`px-4 py-1.5 rounded-xl font-poppins text-xs font-semibold transition-all shrink-0 ${
                resourceTypeFilter === type
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 font-poppins space-y-2 glass-card rounded-3xl p-8">
              <Folder className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-sm">No courseware resources found matching your filters.</p>
              <p className="text-xs">Click "Upload Course Resource" to share course materials with this class.</p>
            </div>
          ) : (
            filteredResources.map(res => (
              <motion.div
                key={res.id}
                whileHover={{ y: -4 }}
                className="glass-card rounded-3xl p-6 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                      {res.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{res.size}</span>
                  </div>

                  <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{res.title}</span>
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-poppins">
                    Subject: <span className="font-semibold text-slate-700 dark:text-slate-300">{res.subject}</span>
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/30 dark:border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400 font-poppins">
                  <span>Uploaded: {res.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{res.downloads} Downloads</span>
                    <button
                      onClick={() => addToast(`Downloading "${res.title}"...`, 'success', '📥')}
                      className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Upload Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl border border-white/30"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40">
                <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                  Upload Class Course Resource
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddResource} className="space-y-4 text-xs font-poppins">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Resource Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Unit 4 Relational Query Optimization.pdf"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Resource Type</label>
                    <select
                      value={newResourceType}
                      onChange={(e) => setNewResourceType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Lecture Notes">Lecture Notes</option>
                      <option value="Lab Manual">Lab Manual</option>
                      <option value="Question Bank">Question Bank</option>
                      <option value="Reference Material">Reference Material</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-poppins font-semibold shadow-lg shadow-indigo-500/25"
                >
                  Publish Resource to Class
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Student View (Notes Hub)
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
            key={note.id || note._id}
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
                <span className="text-[10px] text-slate-400 font-medium">Card #{(note.id || note._id).slice(-3)}</span>
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

