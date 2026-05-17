// src/context/AuthContext.jsx
// Provides auth state backed by localStorage.
// Lifetime: persists across page refreshes until logout() is called.
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, setCurrentUser } from "../mock/db";

const AuthContext = createContext(null);

const STORAGE_KEY = "dnd_session";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        setUser(stored);
        setCurrentUser(stored);
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const u = await loginUser(username, password);
    if (!u) throw new Error("Usuario o contraseña incorrectos");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setCurrentUser(u);
    setUser(u);
    return u;
  };

  const register = async (username, email, password) => {
    const u = await registerUser(username, email, password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setCurrentUser(u);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser({ id: null, isGM: false });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
