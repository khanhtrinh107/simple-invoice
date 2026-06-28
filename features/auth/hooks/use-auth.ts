"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { LoginCredentials } from "@/features/auth/types/auth.types";
import { ROUTES } from "@/shared/constants";
import { authStore } from "@/features/auth/hooks/auth-store";
import type { AuthUser } from "@/features/auth/hooks/auth-store";

export type { AuthUser } from "@/features/auth/hooks/auth-store";

interface UseAuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Subscribe to the module-level auth store.
 *
 * Multiple components can call `useAuth()` simultaneously (LoginForm,
 * HeaderUserMenu, ...) — only one network request to `/api/auth/me` is
 * ever in flight at a time thanks to the coalesced `ensureLoaded` on the
 * store.
 */
export function useAuth(): UseAuthState {
  const router = useRouter();
  const state = React.useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getState
  );

  // Kick off the (deduplicated) load on first mount of any subscriber.
  // We intentionally don't gate this on state — even if one consumer
  // already loaded the user, a fresh mount on a different subtree (e.g.
  // after a soft navigation re-mounted the header) should still be able
  // to refresh. The store guarantees the actual fetch only runs once.
  React.useEffect(() => {
    void authStore.ensureLoaded();
  }, []);

  const login = React.useCallback(
    async (credentials: LoginCredentials) => {
      return authStore.login(credentials);
    },
    []
  );

  const logout = React.useCallback(async () => {
    await authStore.logout();
    router.push(ROUTES.LOGIN);
    router.refresh();
  }, [router]);

  const refresh = React.useCallback(async () => {
    await authStore.refresh();
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.user !== null,
    login,
    logout,
    refresh,
  };
}