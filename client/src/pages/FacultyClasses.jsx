import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  BookOpen,
  Layers,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FacultyClasses = () => {
  const { token, user } = useAuth();
  const { addToast } = useNotification();

  const [myClasses, setMyClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('div_ita_1');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedStudentForAdd, setSelectedStudentForAdd] = useState(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Remove Student Modal State
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [submittingRemove, setSubmittingRemove] = useState(false);

  const fetchClasses = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/academic/my-classes', { headers });
      if (res.ok) {
        const data = await res.json();
        setMyClasses(data);
        if (data.length > 0 && !selectedClassId) {
          setSelectedClassId(data[0].divisionId || 'div_ita_1');
        }
      }
    } catch (err) {}
  };

  const fetchStudents = async (divId) => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`/api/academic/class-students/${divId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      addToast('Failed to load class roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async (divId) => {
    setLoadingAvailable(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`/api/academic/available-students/${divId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAvailableStudents(data);
      }
    } catch (err) {
      addToast('Failed to load candidate student list', 'error');
    } finally {
      setLoadingAvailable(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [token]);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    }
  }, [selectedClassId, token]);

  const currentClassObj = myClasses.find(c => (c.divisionId || c.id) === selectedClassId) || {
    divisionName: 'IT-A',
    subjectName: 'Database Management Systems',
    subjectCode: 'IT601',
    academicYear: '2025-2026'
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setSelectedStudentForAdd(null);
    setAvailableSearch('');
    fetchAvailableStudents(selectedClassId);
  };

  const handleConfirmAddStudent = async () => {
    if (!selectedStudentForAdd) {
      return addToast('Please select a student to add', 'warning');
    }

    setSubmittingAdd(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/academic/class-students/add-roster', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          divisionId: selectedClassId,
          studentId: selectedStudentForAdd.id,
          subjectName: currentClassObj.subjectName,
          subjectCode: currentClassObj.subjectCode
        })
      });

      const data = await res.json();
      if (res.ok && data.notificationDelivered) {
        addToast(`Added ${selectedStudentForAdd.name} to roster & sent in-app notification! 🔔`, 'success', '🎓');
        setIsAddModalOpen(false);
        setSelectedStudentForAdd(null);
        fetchStudents(selectedClassId);
      } else {
        addToast(data.message || 'Notification delivery failed. Class addition cancelled.', 'error');
      }
    } catch (err) {
      addToast('Failed to add student to class roster', 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    setSubmittingRemove(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch('/api/academic/class-students/remove-roster', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          divisionId: selectedClassId,
          studentId: studentToRemove.id,
          subjectName: currentClassObj.subjectName,
          subjectCode: currentClassObj.subjectCode
        })
      });

      const data = await res.json();
      if (res.ok && data.notificationDelivered) {
        addToast(`Removed ${studentToRemove.name} & sent in-app notification! 🔔`, 'info', '📌');
        setStudentToRemove(null);
        fetchStudents(selectedClassId);
      } else {
        addToast(data.message || 'Notification delivery failed. Removal cancelled.', 'error');
      }
    } catch (err) {
      addToast('Failed to remove student from class roster', 'error');
    } finally {
      setSubmittingRemove(false);
    }
  };

  const filteredEnrolledStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableCandidates = availableStudents.filter(s =>
    s.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(availableSearch.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(availableSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30 shrink-0">
            👨‍🏫
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Faculty — Student Class Management
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-poppins mt-0.5">
              Faculty Workstation • Manage Assigned Class Rosters & In-App Student Notifications
            </p>
          </div>
        </div>

        <button
          onClick={() => { fetchClasses(); fetchStudents(selectedClassId); }}
          className="px-4 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-xs font-poppins font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Roster
        </button>
      </div>

      {/* Assigned Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {myClasses.length > 0 ? (
          myClasses.map(c => {
            const divId = c.divisionId || c.id;
            const isSelected = selectedClassId === divId;
            return (
              <motion.div
                key={divId}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-3xl transition-all border shadow-lg flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500 shadow-emerald-500/10'
                    : 'glass-card border-white/40 dark:border-slate-800/40 hover:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                      {c.subjectName} — {c.subjectCode || 'IT601'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-poppins text-slate-500 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                      {c.divisionName || 'IT-A'}
                    </span>
                    <span>• {isSelected ? filteredEnrolledStudents.length : 75} Students</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                  <button
                    onClick={() => setSelectedClassId(divId)}
                    className={`w-full py-2 rounded-2xl font-poppins text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> [ Manage Roster ]
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-3 p-6 glass-card rounded-3xl text-center text-xs text-slate-500">
            No assigned classes found.
          </div>
        )}
      </div>

      {/* Roster Management View */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-4">
        {/* Roster Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-poppins font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Students</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {currentClassObj.subjectName} ({currentClassObj.divisionName || 'IT-A'})
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-poppins mt-0.5">
              Authorized Roster • {filteredEnrolledStudents.length} Students Enrolled
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-poppins focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-poppins font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> + Add Student
            </button>
          </div>
        </div>

        {/* Student Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-poppins animate-pulse">
            Loading class student roster...
          </div>
        ) : filteredEnrolledStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-poppins">
              <thead>
                <tr className="border-b border-slate-200/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Roll No.</th>
                  <th className="pb-3 px-4">Student</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30">
                {filteredEnrolledStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                      {student.rollNo || index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div>{student.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setStudentToRemove(student)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white transition-colors font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 font-poppins">
            No students currently enrolled in this class roster.
          </div>
        )}
      </div>

      {/* ADD STUDENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card rounded-3xl p-6 border border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 shadow-2xl space-y-4 font-poppins"
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-500" />
                    Add Student to Class Roster
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {currentClassObj.subjectName} ({currentClassObj.divisionName || 'IT-A'})
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search candidate list */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  placeholder="Search available unassigned students..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              {/* Candidate Students List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {loadingAvailable ? (
                  <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                    Loading student list...
                  </div>
                ) : filteredAvailableCandidates.length > 0 ? (
                  filteredAvailableCandidates.map(s => {
                    const isSelected = selectedStudentForAdd?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudentForAdd(s)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-slate-800 dark:text-slate-100 shadow-sm'
                            : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-800/40 hover:bg-emerald-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">{s.name}</div>
                            <div className="text-[11px] text-slate-400">{s.email} • {s.rollNo}</div>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No available unassigned students found.
                  </div>
                )}
              </div>

              {/* Notification Guarantee Note */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                🔔 <span className="font-bold">Automatic Notification:</span> Confirming addition will immediately send an in-app notification to the student informing them they have been added to {currentClassObj.subjectName}.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedStudentForAdd || submittingAdd}
                  onClick={handleConfirmAddStudent}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
                >
                  {submittingAdd ? 'Adding...' : 'Confirm Addition'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REMOVE STUDENT CONFIRMATION MODAL */}
      <AnimatePresence>
        {studentToRemove && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card rounded-3xl p-6 border border-rose-500/30 bg-white/95 dark:bg-slate-900/95 shadow-2xl space-y-4 font-poppins"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                    Remove Student from Class Roster
                  </h3>
                  <p className="text-xs text-rose-500 font-medium">
                    {currentClassObj.subjectName} ({currentClassObj.divisionName || 'IT-A'})
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
                <p className="text-slate-700 dark:text-slate-200">
                  Are you sure you want to remove <span className="font-bold text-rose-600 dark:text-rose-400">{studentToRemove.name}</span> from <span className="font-bold">{currentClassObj.subjectName} ({currentClassObj.divisionName})</span>?
                </p>
                <p className="text-[11px] text-slate-500">
                  • Only class roster enrollment is removed.<br />
                  • Student account, global marks & attendance records will be preserved.<br />
                  • An immediate in-app notification will be delivered to the student.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStudentToRemove(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingRemove}
                  onClick={handleConfirmRemoveStudent}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5"
                >
                  {submittingRemove ? 'Removing...' : 'Confirm Removal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
