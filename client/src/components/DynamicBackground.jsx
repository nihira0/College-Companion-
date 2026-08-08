import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const DynamicBackground = () => {
  const { timeOfDay } = useTheme();

  // Background Gradients per theme
  const getGradient = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'from-sky-300 via-amber-100 to-emerald-200';
      case 'afternoon':
        return 'from-cyan-300 via-sky-200 to-emerald-300';
      case 'sunset':
        return 'from-indigo-900 via-rose-500 to-amber-400';
      case 'night':
      default:
        return 'from-slate-950 via-indigo-950 to-slate-900';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Sky Canvas Gradient */}
      <motion.div
        key={timeOfDay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className={`absolute inset-0 bg-gradient-to-b ${getGradient()}`}
      />

      {/* Celestial Element (Sun or Moon) */}
      <AnimatePresence mode="wait">
        {timeOfDay === 'morning' && (
          <motion.div
            key="sun-morning"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-12 left-1/3 w-32 h-32 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 blur-sm shadow-[0_0_80px_rgba(251,191,36,0.6)]"
          />
        )}

        {timeOfDay === 'afternoon' && (
          <motion.div
            key="sun-afternoon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-yellow-200 blur-sm shadow-[0_0_100px_rgba(254,240,138,0.8)]"
          />
        )}

        {timeOfDay === 'sunset' && (
          <motion.div
            key="sun-sunset"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 40, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-28 right-1/3 w-40 h-40 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 blur-sm shadow-[0_0_120px_rgba(249,115,22,0.9)]"
          />
        )}

        {timeOfDay === 'night' && (
          <motion.div
            key="moon-night"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-14 right-1/4 w-28 h-28 rounded-full bg-slate-100 blur-[1px] shadow-[0_0_60px_rgba(224,231,255,0.7)] overflow-hidden"
          >
            {/* Moon Craters */}
            <div className="absolute top-3 left-4 w-6 h-6 rounded-full bg-slate-200/60" />
            <div className="absolute bottom-4 right-5 w-8 h-8 rounded-full bg-slate-200/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star Field for Night */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0">
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2 + (i % 4),
                repeat: Infinity,
                delay: (i * 0.2) % 3,
              }}
              style={{
                top: `${(i * 17) % 60}%`,
                left: `${(i * 23) % 100}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
              }}
              className="absolute bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            />
          ))}
        </div>
      )}

      {/* Floating Clouds for Daytime */}
      {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
        <>
          <motion.div
            animate={{ x: ['-20%', '110%'] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="absolute top-16 left-0 w-80 h-24 bg-white/40 rounded-full blur-xl"
          />
          <motion.div
            animate={{ x: ['-30%', '120%'] }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear', delay: 10 }}
            className="absolute top-32 left-0 w-96 h-28 bg-white/30 rounded-full blur-xl"
          />
        </>
      )}

      {/* Landscape Silhouette Hills & Trees Layer */}
      <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden">
        {/* Far Background Hill */}
        <svg
          className="absolute bottom-0 w-full h-48 opacity-40"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={timeOfDay === 'night' ? '#1e1b4b' : timeOfDay === 'sunset' ? '#78350f' : '#047857'}
            d="M0,192L80,181.3C160,171,320,150,480,165.3C640,181,800,235,960,240C1120,245,1280,203,1360,181.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </svg>

        {/* Foreground Lush Hill & Animated Trees */}
        <svg
          className="absolute bottom-0 w-full h-36 opacity-70"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={timeOfDay === 'night' ? '#0f172a' : timeOfDay === 'sunset' ? '#451a03' : '#064e3b'}
            d="M0,128L60,149.3C120,171,240,213,360,213.3C480,213,600,171,720,165.3C840,160,960,192,1080,197.3C1200,203,1320,181,1380,170.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>

        {/* Floating Nature Leaves Animation */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            animate={{
              y: [0, -140],
              x: [0, (i % 2 === 0 ? 40 : -40)],
              rotate: [0, 360],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeInOut',
            }}
            style={{
              bottom: '10px',
              left: `${15 + i * 14}%`,
            }}
            className="absolute text-emerald-400 text-lg opacity-60 pointer-events-none"
          >
            🌿
          </motion.div>
        ))}
      </div>

      {/* Atmospheric Soft Vignette */}
      <div className="absolute inset-0 bg-radial-vignette opacity-20 pointer-events-none" />
    </div>
  );
};
