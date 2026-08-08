import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([
    {
  id: 't3',
  type: 'success',
  message: 'Daily Study Goal Completed',
  time: 'Today',
  icon: '🎯'
},
   {
  id: 't2',
  type: 'info',
  message: 'Reminder: AI Assignment Due Tomorrow',
  time: '10 mins ago',
  icon: '⏰'
},
    {
  id: 't4',
  type: 'info',
  message: 'Bookmarked "Data Structures Notes"',
  time: '2:30 PM',
  icon: '⭐'
}
  ]);

  const addToast = useCallback((message, type = 'success', icon = '✅') => {
    const id = `toast_${Date.now()}`;
    const newToast = { id, message, type, time: 'Just now', icon };
    setToasts(prev => [newToast, ...prev]);

    // Slide away & auto dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
