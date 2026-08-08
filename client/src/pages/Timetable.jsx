import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Timetable = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const scheduleData = {
    Monday: [
      { time: '09:00 AM - 10:30 AM', subject: 'Database Management Systems', code: 'CS601', room: 'Lab 221, B wing', professor: 'Dr. Anil Vasoya', type: 'Lecture' },
      { time: '10:45 AM - 12:15 PM', subject: 'Computer Networks', code: 'CS602', room: 'class 518', professor: 'Mr. Vijay Kumar Yele', type: 'Lecture' },
      { time: '01:30 PM - 03:30 PM', subject: 'MIS Practical Lab', code: 'CS601L', room: 'lab 203', professor: 'Mrs. Minakshi Ghorpade', type: 'Practical' }
    ],
    Tuesday: [
      { time: '09:00 AM - 10:30 AM', subject: 'Software Engineering', code: 'CS603', room: 'class 603', professor: 'Dr. Sangeeta Vhatkar', type: 'Lecture' },
      { time: '11:00 AM - 12:30 PM', subject: 'Artificial Intelligence', code: 'CS604', room: 'class 530', professor: 'Dr. Aruna Pavate', type: 'Lecture' },
      { time: '02:00 PM - 04:00 PM', subject: 'Pomodoro Self-Study Slot 🌿', code: 'STUDY', room: 'Home', professor: 'Self', type: 'Self Study' }
    ],
    Wednesday: [
      { time: '09:30 AM - 11:30 AM', subject: 'Computer Networks Lab', code: 'CS602L', room: 'lab 221', professor: 'Mr. Vijay Kumar Yele', type: 'Practical' },
      { time: '01:00 PM - 02:30 PM', subject: 'Data Structure and Algorithm', code: 'CS601', room: 'class 619', professor: 'Ms. Nidhi Bhavsar', type: 'Lecture' }
    ],
    Thursday: [
      { time: '10:00 AM - 11:30 AM', subject: 'Big Data Analytics', code: 'CS605', room: 'class 530', professor: 'Dr. Aruna Pavate', type: 'Lecture' },
      { time: '01:30 PM - 03:30 PM', subject: 'Software Engineering Agile Sprint', code: 'CS604', room: 'lab 223', professor: 'Dr. Sangeeta Vhatkar', type: 'Practical' }
    ],
    Friday: [
      { time: '09:00 AM - 11:00 AM', subject: 'Operating Systems Lab', code: 'CS603L', room: 'OS Simulation Lab', professor: 'Dr. Vikram Seth', type: 'Practical' },
      { time: '11:30 AM - 01:00 PM', subject: 'Machine Learning', code: 'CS605L', room: 'lab 204', professor: 'Mrs. Jisha Tinsu', type: 'Practical' }
    ]
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-teal-500/10 text-teal-500">📅</span>
          Academic Schedule & Timetable
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
          Interactive weekly class schedule, laboratory sessions, and dedicated focus study slots.
        </p>
      </div>

      {/* Day selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/40 dark:border-slate-800/50">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2 rounded-2xl font-poppins text-xs font-semibold transition-all shrink-0 ${
              selectedDay === day
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timeline Schedule Cards */}
      <div className="space-y-4">
        {scheduleData[selectedDay].map((slot, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-3xl p-5 border border-white/40 dark:border-slate-800/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start md:items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-poppins font-bold text-xs shrink-0 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {slot.time}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                    {slot.subject}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {slot.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {slot.room}
                  </span>
                  <span>• Instructor: {slot.professor}</span>
                </p>
              </div>
            </div>

            <span className={`self-start md:self-auto text-[10px] font-bold px-3 py-1 rounded-full ${
              slot.type === 'Lab'
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                : slot.type === 'Self Study'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
            }`}>
              {slot.type}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
