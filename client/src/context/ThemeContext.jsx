import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Modes: 'morning', 'afternoon', 'sunset', 'night', 'auto'
  const [timeOfDay, setTimeOfDay] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'sunset';
    return 'night';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => timeOfDay === 'night');

  useEffect(() => {
    if (timeOfDay === 'night') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, [timeOfDay]);

  const toggleTimeOfDay = (mode) => {
    if (mode) {
      setTimeOfDay(mode);
    } else {
      const modes = ['morning', 'afternoon', 'sunset', 'night'];
      const currentIndex = modes.indexOf(timeOfDay);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      setTimeOfDay(nextMode);
    }
  };

  const getGreetingData = (userName = 'Nihaarika') => {
    switch (timeOfDay) {
      case 'morning':
        return {
          icon: '🌞',
          salutation: 'Good Morning',
          message: `Good Morning, ${userName}! Today looks like a great day to make progress.`,
          subtext: "Let's start today strong! 🌱"
        };
      case 'afternoon':
        return {
          icon: '🌤️',
          salutation: 'Good Afternoon',
          message: `Good Afternoon, ${userName}! Keep up the momentum.`,
          subtext: "Remember to take short breaks and hydrate! 🍃"
        };
      case 'sunset':
        return {
          icon: '🌅',
          salutation: 'Good Evening',
          message: `Good Evening, ${userName}! Sun is setting, review today's achievements.`,
          subtext: "Finish up your focus tasks before unwinding! 🌇"
        };
      case 'night':
      default:
        return {
          icon: '🌙',
          salutation: 'Good Night',
          message: `Good Evening, ${userName}! You've completed your key tasks today. Ready for one more?`,
          subtext: "Rest well to recharge your mind under the stars ✨"
        };
    }
  };

  return (
    <ThemeContext.Provider value={{ timeOfDay, setTimeOfDay, toggleTimeOfDay, isDarkMode, getGreetingData }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
