import { create } from "zustand";
import type { User } from "@/lib/api/types";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  /** Whether the initial silent-refresh bootstrap has finished. */
  isInitialized: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setInitialized: (initialized: boolean) => void;
  clear: () => void;
}

/**
 * Access token lives only in memory (never localStorage) to avoid XSS-persistent
 * storage — a page refresh loses it and the app must silently re-derive it from
 * the httpOnly refresh cookie via POST /auth/refresh.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clear: () => set({ accessToken: null, user: null }),
}));
