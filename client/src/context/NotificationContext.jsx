import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const userRole = user?.role || 'student';

  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Role-Aware Default Initial Toasts
  useEffect(() => {
    if (userRole === 'faculty') {
      setToasts([
        {
          id: 't_fac_1',
          type: 'warning',
          message: 'Attendance Alert: 5 students in SE IT-A below 75%',
          time: '10 mins ago',
          icon: '⚠️',
          category: 'Students',
          priority: 'HIGH'
        },
        {
          id: 't_fac_2',
          type: 'info',
          message: 'ISE 1 Marks Submission Deadline: Friday 5:00 PM',
          time: '30 mins ago',
          icon: '📝',
          category: 'Academic',
          priority: 'HIGH'
        },
        {
          id: 't_fac_3',
          type: 'success',
          message: 'Faculty Duty Assigned: Zephyr 2026 Coordinator',
          time: '2 hours ago',
          icon: '🎯',
          category: 'Events',
          priority: 'HIGH'
        }
      ]);
    } else if (userRole === 'admin') {
      setToasts([
        {
          id: 't_adm_1',
          type: 'info',
          message: 'System Boot & Governance Checks Complete',
          time: 'Just now',
          icon: '⚙️',
          category: 'Admin',
          priority: 'MEDIUM'
        }
      ]);
    } else {
      // Student role toasts
      setToasts([
        {
          id: 't_stu_1',
          type: 'info',
          message: 'ISE 1 Timetable Published — Exams start Oct 14',
          time: 'Just now',
          icon: '📅',
          category: 'Academic',
          priority: 'HIGH'
        },
        {
          id: 't_stu_2',
          type: 'warning',
          message: 'Reminder: DBMS Assignment Due Tomorrow',
          time: '10 mins ago',
          icon: '⏰',
          category: 'Students',
          priority: 'HIGH'
        }
      ]);
    }
  }, [userRole]);

  // Fetch Live Notifications from Backend
  const fetchNotifications = useCallback(async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/academic/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        }
      }
    } catch (err) {}
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true } : n));
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      await fetch(`/api/academic/notifications/${id}/read`, {
        method: 'PATCH',
        headers
      });
    } catch (err) {}
  }, [token]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      await fetch('/api/academic/notifications/read-all', {
        method: 'PATCH',
        headers
      });
    } catch (err) {}
  }, [token]);

  // Add transient toast alert
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        activeCategory,
        setActiveCategory,
        markAsRead,
        markAllAsRead,
        addToast,
        removeToast,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
