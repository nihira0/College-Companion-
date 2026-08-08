import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare, BookOpen, BrainCircuit, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export const SageWidget = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-emerald-500/30 shadow-xl"
    >
      {/* Decorative leafy background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

      {/* Companion Avatar & Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30 border border-emerald-300/40"
            >
              🌿
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-poppins font-bold text-base text-slate-800 dark:text-slate-100">
                  Sage 🌿
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  AI Companion
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Your leafy study buddy
              </p>
            </div>
          </div>

          <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
        </div>

        {/* Personalized Greeting */}
        <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40 mb-4">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-poppins leading-relaxed">
            "Hey Nihaarika! Need help summarizing notes, generating quick flashcards, or taking a practice DBMS quiz today?"
          </p>
        </div>
      </div>

      {/* Quick Interactive Actions */}
      <div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => navigate('/sage?tab=flashcards')}
            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Flashcards
          </button>
          <button
            onClick={() => navigate('/sage?tab=quiz')}
            className="px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Take Quiz
          </button>
        </div>

        <button
          onClick={() => navigate('/sage')}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-poppins text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all group"
        >
          <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
          [ Ask Sage 🌿 ]
        </button>
      </div>
    </motion.div>
  );
};
