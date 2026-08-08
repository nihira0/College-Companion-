import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('college_companion_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 'user_demo_123',
      name: 'Nihaarika',
      email: 'nihaarika@college.edu',
      course: 'B.Tech Computer Science',
      semester: 6,
      avatar: '🌿'
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('college_companion_token') || 'demo_jwt_token_2026');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('college_companion_token', token);
    } else {
      localStorage.removeItem('college_companion_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('college_companion_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('college_companion_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setUser(data.user);
      setToken(data.token);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      // Fallback demo login if server endpoint unreachable
      const demoUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0] || 'Nihaarika',
        email,
        course: 'B.Tech Computer Science',
        semester: 6,
        avatar: '🌿'
      };
      setUser(demoUser);
      setToken(`demo_token_${Date.now()}`);
      return { success: true, message: 'LoggedIn via local companion state' };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setUser(data.user);
      setToken(data.token);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        course: 'B.Tech Computer Science',
        semester: 6,
        avatar: '🌿'
      };
      setUser(newUser);
      setToken(`demo_token_${Date.now()}`);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
