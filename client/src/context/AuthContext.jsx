import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('college_companion_token') || 
           sessionStorage.getItem('college_companion_token') || 
           null;
  });
  const [loading, setLoading] = useState(true);

  // Synchronize session with backend on app startup
  useEffect(() => {
    const verifySession = async () => {
      const activeToken = token || 
                          localStorage.getItem('college_companion_token') || 
                          sessionStorage.getItem('college_companion_token');

      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${activeToken}` };
        let res;
        try {
          res = await fetch('/api/auth/me', { headers });
          if (!res.ok && res.status === 404) {
            res = await fetch('http://localhost:5000/api/auth/me', { headers });
          }
        } catch (e) {
          res = await fetch('http://localhost:5000/api/auth/me', { headers });
        }

        if (res && res.ok) {
          const userData = await res.json();
          setUser(userData);
          setToken(activeToken);
        } else {
          // Token invalid or expired
          setUser(null);
          setToken(null);
          localStorage.removeItem('college_companion_token');
          sessionStorage.removeItem('college_companion_token');
          localStorage.removeItem('college_companion_user');
        }
      } catch (err) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('college_companion_token');
        sessionStorage.removeItem('college_companion_token');
        localStorage.removeItem('college_companion_user');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password, keepLoggedIn = true) => {
    setLoading(true);
    try {
      const payload = { email, password, keepLoggedIn };
      let res;
      try {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok && res.status === 404) {
          throw new Error('Fallback to direct port');
        }
      } catch (e) {
        res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return { success: false, message: data.message || 'Invalid email or password' };
      }

      setUser(data.user);
      setToken(data.token);

      if (keepLoggedIn) {
        localStorage.setItem('college_companion_token', data.token);
        sessionStorage.removeItem('college_companion_token');
      } else {
        sessionStorage.setItem('college_companion_token', data.token);
        localStorage.removeItem('college_companion_token');
      }
      localStorage.setItem('college_companion_user', JSON.stringify(data.user));

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || 'Unable to connect to authentication server' };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const payload = { name, email, password };
      let res;
      try {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok && res.status === 404) {
          throw new Error('Fallback to direct port');
        }
      } catch (e) {
        res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return { success: false, message: data.message || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('college_companion_token', data.token);
      localStorage.setItem('college_companion_user', JSON.stringify(data.user));

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || 'Unable to connect to server' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('college_companion_token');
    sessionStorage.removeItem('college_companion_token');
    localStorage.removeItem('college_companion_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
