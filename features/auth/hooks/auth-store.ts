import {
  fetchMeRequest,
  loginRequest,
  logoutRequest,
  type AuthUser,
} from "@/features/auth/api/auth-client";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}

type Listener = () => void;

let state: AuthState = { user: null, isLoading: false };
const listeners = new Set<Listener>();

let ensureLoadedPromise: Promise<AuthState> | null = null;

function notify() {
  listeners.forEach((l) => l());
}

function setLoading(v: boolean) {
  state = { ...state, isLoading: v };
  notify();
}

function setUser(user: AuthUser | null) {
  state = { ...state, user, isLoading: false };
  notify();
}

async function doFetchMe(): Promise<AuthState> {
  try {
    const user = await fetchMeRequest();
    return { user, isLoading: false };
  } catch {
    return { user: null, isLoading: false };
  }
}

export const authStore = {
  getState(): AuthState {
    return state;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Coalesced fetch — all concurrent callers get the same Promise,
   * so only one network request fires at a time regardless of how many
   * components mount simultaneously.
   */
  ensureLoaded(): Promise<AuthState> {
    if (state.user !== null || state.isLoading) {
      return Promise.resolve(state);
    }

    if (!ensureLoadedPromise) {
      setLoading(true);
      ensureLoadedPromise = doFetchMe().finally(() => {
        ensureLoadedPromise = null;
      });
    }

    return ensureLoadedPromise.then((result) => {
      state = result;
      notify();
      return result;
    });
  },

  async login(
    credentials: { username: string; password: string }
  ): Promise<AuthUser> {
    setLoading(true);
    try {
      const user = await loginRequest(credentials);
      setUser(user);
      return user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  },

  async logout(): Promise<void> {
    setLoading(true);
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  },

  async refresh(): Promise<void> {
    setLoading(true);
    try {
      const user = await fetchMeRequest();
      setUser(user);
    } catch {
      setUser(null);
    }
  },
};

export type { AuthUser };
