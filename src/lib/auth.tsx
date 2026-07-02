import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getSession, login as doLogin, logout as doLogout, register as doRegister, seed, type Role, type User } from "./store";

interface Ctx {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<User>;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    seed();
    setUser(getSession());
    const handler = () => setUser(getSession());
    window.addEventListener("ebms:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("ebms:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = doLogin(email, password);
    setUser(u);
    return u;
  }, []);
  const register = useCallback(async (name: string, email: string, password: string, role: Role = "user") => {
    const u = doRegister(name, email, password, role);
    setUser(u);
    return u;
  }, []);
  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
