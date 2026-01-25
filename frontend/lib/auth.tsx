"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthRole = "client" | "lawyer" | "student";

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
};

type AuthContextValue = {
  currentUser: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as { user: AuthUser | null };
          setCurrentUser(data.user);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
  }, []);

  const setUser = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      setUser,
      logout,
    }),
    [currentUser, isLoading, logout, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
