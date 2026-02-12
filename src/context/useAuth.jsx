import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const setSession = (userObj, token) => {
    setUser(userObj);
    try {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    } catch (e) {
      // ignore
    }
  };

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) return { ok: false, error: 'Email and password are required' };
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Login failed' };
      setSession(data.user, data.token);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: 'Network error' };
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) return { ok: false, error: 'Name, email and password are required' };
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Registration failed' };
      setSession(data.user, data.token);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null, null);
  }, []);

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
