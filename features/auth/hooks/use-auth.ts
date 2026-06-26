"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { LoginCredentials } from "@/features/auth/types/auth.types";
import { ROUTES } from "@/shared/constants";
import {
  fetchMeRequest,
  loginRequest,
  logoutRequest,
} from "@/features/auth/api/auth-client";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface UseAuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthState {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const refresh = React.useCallback(async () => {
    try {
      const current = await fetchMeRequest();
      setUser(current);
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const current = await fetchMeRequest();
        if (!cancelled) {
          setUser(current);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = React.useCallback(
    async (credentials: LoginCredentials) => {
      const loggedIn = await loginRequest(credentials);
      setUser(loggedIn);
      return loggedIn;
    },
    []
  );

  const logout = React.useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      router.push(ROUTES.LOGIN);
      router.refresh();
    }
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    refresh,
  };
}