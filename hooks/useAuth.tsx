"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/client";
import type { User } from "@/lib/types";

type AuthStatus = "loading" | "authed" | "anonymous";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string, nextPath?: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_PAGES = ["/signin", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    authApi
      .me()
      .then((u) => {
        if (active) {
          setUser(u);
          setStatus("authed");
        }
      })
      .catch(() => {
        if (active) setStatus("anonymous");
      });
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const u = await authApi.me();
      setUser(u);
      setStatus("authed");
      return true;
    } catch {
      setUser(null);
      setStatus("anonymous");
      return false;
    }
  }, []);

  // Client-side guard driven by the backend /me result (unlike the optimistic
  // proxy check, this knows whether the session is actually valid).
  useEffect(() => {
    if (status === "loading") return;
    if (status === "anonymous" && pathname.startsWith("/dashboard")) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authed" && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
      router.replace("/dashboard/datasets");
    } else if (status === "anonymous" && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
      // A session may exist (e.g. after the OAuth exchange, or a stale guard
      // bounce) even though the mount-time check failed. Re-verify so auth
      // pages self-heal: a valid session here redirects to the dashboard.
      const timer = setTimeout(() => {
        void refresh();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, pathname, router, refresh]);

  const login = useCallback(
    async (email: string, password: string, nextPath?: string) => {
      try {
        await authApi.login(email, password);
        const u = await authApi.me();
        setUser(u);
        setStatus("authed");
        const next =
          nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/signin")
            ? nextPath
            : "/dashboard/datasets";
        router.push(next);
      } catch (error) {
        throw new Error(apiErrorMessage(error));
      }
    },
    [router]
  );

  const register = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      try {
        await authApi.register(email, password, confirmPassword);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } catch (error) {
        throw new Error(apiErrorMessage(error));
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("anonymous");
      router.push("/signin");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
