import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Pomodoro = () => {
  const { addToast } = useNotification();

  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(2);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSecondsLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  }, [mode, workMinutes, breakMinutes]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        const nextCount = totalCompleted + 1;
        setTotalCompleted(nextCount);
        addToast(`🍅 Focus Session Complete! Your plant grew into stage ${getPlantStage(nextCount).label}!`, 'success', '🌱');
        setMode('break');
      } else {
        addToast('🌸 Break finished! Ready for another focus round?', 'info', '⚡');
        setMode('work');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode, totalCompleted, addToast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      addToast(`${mode === 'work' ? 'Focus Session' : 'Break'} Started!`, 'info', '⏱️');
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPlantStage = (count) => {
    if (count === 0) return { emoji: '🌱', label: 'Tiny Sprout', desc: 'Plant your seed of focus.' };
    if (count === 1) return { emoji: '🌿', label: 'Leafy Branch', desc: 'Growing sturdy leaves!' };
    if (count === 2) return { emoji: '🌸', label: 'Blooming Flower', desc: 'Focus is in full bloom!' };
    if (count >= 3) return { emoji: '🌳', label: 'Mighty Oak Tree', desc: 'Deeply rooted concentration mastery!' };
    return { emoji: '🌱', label: 'Sprout', desc: 'Keep going!' };
  };

  const currentPlant = getPlantStage(totalCompleted);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">🍅</span>
          Gamified Pomodoro Focus Garden
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-poppins">
          Every completed focus timer nurtures your plant from a sprout into a flourishing oak tree.
        </p>
      </div>

      {/* Main Focus Center Card */}
      <div className="max-w-2xl mx-auto glass-card rounded-3xl p-5 sm:p-8 border border-emerald-500/30 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 mb-6">
          <button
            onClick={() => { setMode('work'); setIsActive(false); }}
            className={`px-3.5 sm:px-5 py-2 rounded-xl font-poppins text-xs font-semibold transition-all ${
              mode === 'work' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => { setMode('break'); setIsActive(false); }}
            className={`px-3.5 sm:px-5 py-2 rounded-xl font-poppins text-xs font-semibold transition-all ${
              mode === 'break' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Rest Break (5m)
          </button>
        </div>

        {/* Animated Growing Plant Container */}
        <motion.div
          animate={{
            scale: isActive ? [1, 1.08, 1] : 1,
            rotate: isActive ? [0, 2, -2, 0] : 0
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-emerald-200/30 border border-emerald-400/40 flex flex-col items-center justify-center shadow-inner relative my-2"
        >
          <span className="text-5xl sm:text-6xl drop-shadow-md">{currentPlant.emoji}</span>
          <span className="absolute -bottom-3 px-3 py-0.5 rounded-full bg-emerald-500 text-white font-poppins font-bold text-[10px] shadow-sm">
            {currentPlant.label}
          </span>
        </motion.div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 mb-2 font-poppins">
          {currentPlant.desc}
        </p>

        {/* Big Digit Timer */}
        <div className="font-poppins font-black text-5xl sm:text-6xl md:text-7xl text-slate-800 dark:text-slate-100 tracking-wider my-4">
          {formatTime(secondsLeft)}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4 my-4 w-full max-w-sm">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 sm:py-3.5 rounded-2xl font-poppins text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-white shadow-xl transition-all ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isActive ? 'Pause Session' : 'Start Focus Session'}
          </button>

          <button
            onClick={resetTimer}
            title="Reset Timer"
            className="p-3 sm:p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/40 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Plant Growth Stages Progress Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200/30 dark:border-slate-800/40 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Completed Today: <strong className="text-emerald-500">{totalCompleted} sessions</strong></span>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              addToast(soundEnabled ? 'Ambient Forest Sounds Muted' : 'Ambient Lofi Rain Enabled 🌧️', 'info', '🎧');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? 'Forest Lofi On' : 'Ambient Audio'}
          </button>
        </div>
      </div>
    </div>
  );
};
