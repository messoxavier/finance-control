"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = { id: number; name: string; email: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // restaura do localStorage
  useEffect(() => {
    const t = localStorage.getItem("fc_token");
    const u = localStorage.getItem("fc_user");
    if (t) setToken(t);
    if (u) try { setUser(JSON.parse(u)); } catch {}
    setIsLoading(false);
  }, []);

  const persist = (t: string, u: User) => {
    localStorage.setItem("fc_token", t);
    localStorage.setItem("fc_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persist(res.token, res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    persist(res.token, res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fc_token");
    localStorage.removeItem("fc_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, token, isLoading, login, register, logout }), [
    user, token, isLoading, login, register, logout
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
