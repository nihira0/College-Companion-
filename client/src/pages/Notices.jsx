import React, { useState } from 'react';
import { Bell, AlertCircle, Calendar, Tag, Bookmark, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const Notices = () => {
  const [bookmarked, setBookmarked] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const notices = [
    {
      id: 'not_1',
      title: 'Final Semester Examination Schedule Released',
      date: 'May 12, 2026',
      category: 'Exams',
      content: 'The end-semester examinations for B.Tech Computer Science (6th Semester) will commence from June 5th, 2026. Hall tickets can be downloaded from the student portal starting May 25th.',
      urgent: true
    },
    {
      id: 'not_2',
      title: 'Annual Hackathon "HackNature 2026" Registration Open',
      date: 'May 10, 2026',
      category: 'Events',
      content: 'Team registrations are now open for the annual 36-hour hackathon until May 20th. Cash prizes up to $5,000 for top AI, Web Development, and Sustainability solutions.',
      urgent: false
    },
    {
      id: 'not_4',
      title: 'DBMS Assignment Submission Extension Request Approved',
      date: 'May 05, 2026',
      category: 'Academics',
      content: 'Department head has approved a 48-hour deadline extension for the relational database schema project. Revised submission cutoff is May 18th.',
      urgent: true
    }
  ];

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
      <div>
        <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">📢</span>
          Department Notices & Announcements
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
          Stay updated with official college circulars, exam schedules, and event updates.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-800/50 pb-3 overflow-x-auto">
        {['All', 'Exams', 'Events', 'Academics', 'General'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl font-poppins text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-white shadow-md'
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
            key={notice.id}
            whileHover={{ y: -2 }}
            className={`glass-card rounded-3xl p-6 border shadow-lg transition-all ${
              notice.urgent ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/40 dark:border-slate-800/60'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {notice.urgent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> URGENT
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                    {notice.category}
                  </span>
                </div>
                <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
                  {notice.title}
                </h3>
              </div>

              <button
                onClick={() => toggleBookmark(notice.id)}
                className={`p-2 rounded-xl border transition-all ${
                  bookmarked.includes(notice.id)
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
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Date: {notice.date}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
