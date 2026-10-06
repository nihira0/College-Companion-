import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Sparkles, Filter, Edit3, Trash2, X, CheckCircle, AlertCircle, BookOpen, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const Timetable = () => {
  const { user, token } = useAuth();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';
  const studentDivisionId = user?.divisionId || 'div_ita_1';
  const studentDivisionName = user?.divisionName || (studentDivisionId === 'div_itb_1' ? 'IT-B' : studentDivisionId === 'div_itc_1' ? 'IT-C' : 'IT-A');

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [facultyClassFilter, setFacultyClassFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const [timetableSlots, setTimetableSlots] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  const [formData, setFormData] = useState({
    divisionId: 'div_ita_1',
    day: 'Monday',
    time: '09:00 AM - 10:30 AM',
    subject: '',
    code: '',
    room: '',
    type: 'Lecture',
    professor: user?.name || 'Faculty Member'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const defaultSlots = [
    { id: 'tt_1', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Monday', time: '09:00 AM - 10:30 AM', subject: 'Database Management Systems', code: 'IT601', room: 'Lab 221, B-Wing', professor: 'Dr. Rajesh S. Bansode', type: 'Lecture' },
    { id: 'tt_2', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Monday', time: '11:00 AM - 01:00 PM', subject: 'DBMS Laboratory', code: 'IT601L', room: 'Lab 203', professor: 'Dr. Rajesh S. Bansode', type: 'Practical Lab' },
    { id: 'tt_3', divisionId: 'div_itb_1', divisionName: 'IT-B', day: 'Monday', time: '02:00 PM - 03:30 PM', subject: 'Computer Networks', code: 'IT602', room: 'Class 518', professor: 'Mr. Vijay Kumar Yele', type: 'Lecture' },
    { id: 'tt_4', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Tuesday', time: '09:00 AM - 10:30 AM', subject: 'Software Engineering', code: 'IT604', room: 'Class 603', professor: 'Dr. Sangeeta Vhatkar', type: 'Lecture' },
    { id: 'tt_5', divisionId: 'div_itb_1', divisionName: 'IT-B', day: 'Tuesday', time: '11:00 AM - 12:30 PM', subject: 'Artificial Intelligence', code: 'IT605', room: 'Class 530', professor: 'Dr. Aruna Pavate', type: 'Lecture' },
    { id: 'tt_6', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Wednesday', time: '09:30 AM - 11:30 AM', subject: 'Computer Networks Lab', code: 'IT602L', room: 'Lab 221', professor: 'Mr. Vijay Kumar Yele', type: 'Practical Lab' },
    { id: 'tt_7', divisionId: 'div_ita_1', divisionName: 'IT-A', day: 'Thursday', time: '10:00 AM - 11:30 AM', subject: 'Operating Systems', code: 'IT603', room: 'Class 530', professor: 'Dr. Rahul Neve', type: 'Lecture' },
    { id: 'tt_8', divisionId: 'div_itc_1', divisionName: 'IT-C', day: 'Friday', time: '09:00 AM - 11:00 AM', subject: 'OS Simulation Lab', code: 'IT603L', room: 'Lab 204', professor: 'Dr. Rahul Neve', type: 'Practical Lab' }
  ];

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const endpoint = isFaculty 
        ? '/api/academic/timetable' 
        : `/api/academic/timetable?divisionId=${studentDivisionId}`;

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTimetableSlots(data);
          return;
        }
      }
      setTimetableSlots(defaultSlots);
    } catch (err) {
      console.warn('Failed to fetch timetable from server, using default dataset', err);
      setTimetableSlots(defaultSlots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [token, isFaculty, studentDivisionId]);

  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => setAlertMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  const handleOpenAddModal = () => {
    setEditingSlot(null);
    setFormData({
      divisionId: facultyClassFilter !== 'ALL' ? facultyClassFilter : 'div_ita_1',
      day: selectedDay,
      time: '09:00 AM - 10:30 AM',
      subject: '',
      code: '',
      room: '',
      type: 'Lecture',
      professor: user?.name || 'Faculty Member'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot) => {
    setEditingSlot(slot);
    setFormData({
      divisionId: slot.divisionId || 'div_ita_1',
      day: slot.day || selectedDay,
      time: slot.time || '09:00 AM - 10:30 AM',
      subject: slot.subject || '',
      code: slot.code || '',
      room: slot.room || '',
      type: slot.type || 'Lecture',
      professor: slot.professor || user?.name || 'Faculty Member'
    });
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.time || !formData.room) {
      setAlertMsg({ type: 'error', text: 'Subject, time slot, and room location are required.' });
      return;
    }

    try {
      const divName = formData.divisionId === 'div_itb_1' ? 'IT-B' : formData.divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A';
      const payload = { ...formData, divisionName: divName };
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      if (editingSlot) {
        const slotId = editingSlot.id || editingSlot._id;
        const res = await fetch(`/api/academic/timetable/${slotId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to update timetable slot');
        }

        setTimetableSlots(prev => prev.map(s => (s.id === slotId || s._id === slotId) ? { ...s, ...payload } : s));
        setAlertMsg({ type: 'success', text: `Successfully updated timetable slot for ${formData.subject}!` });
      } else {
        const res = await fetch('/api/academic/timetable', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to create timetable slot');
        }

        const data = await res.json();
        const newSlot = data?.slot || { ...payload, id: `tt_${Date.now()}` };
        setTimetableSlots(prev => [newSlot, ...prev]);
        setAlertMsg({ type: 'success', text: `Successfully added ${formData.subject} to ${formData.day} timetable!` });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save timetable slot:', err);
      setAlertMsg({ type: 'error', text: err.message || 'Failed to update timetable slot.' });
    }
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    const slotId = slotToDelete.id || slotToDelete._id;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/academic/timetable/${slotId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        throw new Error('Failed to delete slot from server');
      }

      setTimetableSlots(prev => prev.filter(s => s.id !== slotId && s._id !== slotId));
      setAlertMsg({ type: 'success', text: `Deleted ${slotToDelete.subject} slot from schedule.` });
      setIsDeleteModalOpen(false);
      setSlotToDelete(null);
    } catch (err) {
      console.error('Failed to delete timetable slot:', err);
      setAlertMsg({ type: 'error', text: 'Failed to delete timetable slot.' });
    }
  };

  const getFilteredSlots = () => {
    return timetableSlots.filter(s => {
      const dayMatch = s.day === selectedDay;
      let classMatch = true;
      if (isFaculty) {
        classMatch = facultyClassFilter === 'ALL' || s.divisionId === facultyClassFilter || s.divisionId === 'ALL';
      } else {
        classMatch = s.divisionId === studentDivisionId || s.divisionId === 'ALL' || s.divisionName === studentDivisionName;
      }
      return dayMatch && classMatch;
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Alert Banner */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
              alertMsg.type === 'error'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {alertMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-teal-500/10 text-teal-500">📅</span>
            {isFaculty ? 'Faculty Teaching Schedule' : 'Academic Schedule & Timetable'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
            {isFaculty 
              ? 'Manage and update class schedules, laboratory sessions, room allocations, and weekly teaching slots.' 
              : 'Interactive weekly class schedule, laboratory sessions, and real-time faculty updates.'}
          </p>
        </div>

        {isFaculty ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Filter className="w-4 h-4 text-teal-500 ml-2" />
              <select
                value={facultyClassFilter}
                onChange={(e) => setFacultyClassFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none pr-2"
              >
                <option value="ALL">All Classes</option>
                <option value="div_ita_1">IT-A (3rd Year)</option>
                <option value="div_itb_1">IT-B (3rd Year)</option>
                <option value="div_itc_1">IT-C (3rd Year)</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-poppins text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Schedule Slot</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 font-poppins text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>Division: {studentDivisionName} (3rd Year) • Live Faculty Synchronized 🔄</span>
          </div>
        )}
      </div>

      {/* Day selector tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/50 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2 rounded-2xl font-poppins text-xs font-semibold transition-all shrink-0 ${
                selectedDay === day
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <button
          onClick={fetchTimetable}
          title="Refresh Timetable"
          className="p-2 rounded-2xl text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-500/10 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Timeline Schedule Cards */}
      <div className="space-y-4">
        {getFilteredSlots().length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-slate-400 font-poppins space-y-2">
            <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">No teaching sessions scheduled for {selectedDay}.</p>
            <p className="text-xs">
              {isFaculty ? 'Click "+ Add Schedule Slot" to create a lecture or lab session.' : 'Enjoy your study or research break window.'}
            </p>
          </div>
        ) : (
          getFilteredSlots().map((slot, idx) => (
            <motion.div
              key={slot.id || slot._id || idx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-3xl p-5 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-poppins font-bold text-xs shrink-0 flex items-center gap-1.5 self-start">
                  <Clock className="w-4 h-4 shrink-0" />
                  {slot.time}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                      {slot.subject}
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300">
                      {slot.divisionName || (slot.divisionId === 'div_itb_1' ? 'IT-B' : slot.divisionId === 'div_itc_1' ? 'IT-C' : 'IT-A')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" /> {slot.room}
                    </span>
                    <span>• Course Code: {slot.code || 'IT601'}</span>
                    <span>• Instructor: {slot.professor || 'Faculty Member'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  slot.type?.includes('Lab') || slot.type === 'Practical'
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    : slot.type?.includes('Lecture')
                    ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {slot.type || 'Lecture'}
                </span>

                {isFaculty && (
                  <div className="flex items-center gap-1 bg-white/40 dark:bg-slate-800/40 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={() => handleOpenEditModal(slot)}
                      title="Edit Timetable Slot"
                      className="p-1.5 rounded-xl hover:bg-teal-500/15 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSlotToDelete(slot);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Delete Timetable Slot"
                      className="p-1.5 rounded-xl hover:bg-rose-500/15 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add / Edit Timetable Slot Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl p-6 md:p-8 max-w-lg w-full border border-white/40 dark:border-slate-700/60 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-2xl bg-teal-500/10 text-teal-500">📅</span>
                  <h2 className="font-poppins font-bold text-lg text-slate-800 dark:text-slate-100">
                    {editingSlot ? 'Update Timetable Slot' : 'Add New Schedule Slot'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSlot} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Division / Class
                    </label>
                    <select
                      value={formData.divisionId}
                      onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="div_ita_1">IT-A (3rd Year)</option>
                      <option value="div_itb_1">IT-B (3rd Year)</option>
                      <option value="div_itc_1">IT-C (3rd Year)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Day of Week
                    </label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {days.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Database Management Systems"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IT601"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Session Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Practical Lab">Practical Lab</option>
                      <option value="Office Hours">Office Hours</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Time Slot *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09:00 AM - 10:30 AM"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Room / Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab 221, B-Wing"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instructor / Faculty Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh S. Bansode"
                    value={formData.professor}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-poppins text-xs font-bold shadow-lg shadow-teal-500/25 transition-all"
                  >
                    {editingSlot ? 'Save Changes' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && slotToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full border border-rose-500/30 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-7 h-7" />
                <h2 className="font-poppins font-bold text-lg">Remove Timetable Slot?</h2>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-poppins leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-100">{slotToDelete.subject}</strong> ({slotToDelete.time}) from {slotToDelete.day}'s timetable?
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSlot}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-poppins text-xs font-bold shadow-lg shadow-rose-500/25 transition-all"
                >
                  Delete Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
