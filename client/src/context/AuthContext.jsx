import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/http';

const AuthContext = createContext(null);
const userKey = 'resolveXUser';
const tokenKey = 'resolveXToken';
const oldUserKey = 'complaintDeskUser';
const oldTokenKey = 'complaintDeskToken';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(userKey) || localStorage.getItem(oldUserKey);
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch (_error) {
      localStorage.removeItem(userKey);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(oldUserKey);
      localStorage.removeItem(oldTokenKey);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey) || localStorage.getItem(oldTokenKey);
    if (!token) return;

    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem(userKey, JSON.stringify(data.user));
      })
      .catch(() => logout());
  }, []);

  async function login(credentials) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem(tokenKey, data.token);
      localStorage.setItem(userKey, JSON.stringify(data.user));
      localStorage.removeItem(oldTokenKey);
      localStorage.removeItem(oldUserKey);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem(tokenKey, data.token);
      localStorage.setItem(userKey, JSON.stringify(data.user));
      localStorage.removeItem(oldTokenKey);
      localStorage.removeItem(oldUserKey);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    localStorage.removeItem(oldTokenKey);
    localStorage.removeItem(oldUserKey);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAuthenticated: Boolean(user) }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
