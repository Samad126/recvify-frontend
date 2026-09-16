"use client";

import { useEffect, useRef } from "react";
import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * The access token only ever lives in memory, so a full page reload loses it.
 * On first mount we silently try to trade the httpOnly refresh cookie for a
 * fresh access token and hydrate the current user before anything renders
 * behind an auth guard.
 */
export function useAuthBootstrap() {
  const ran = useRef(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const user = await usersApi.getMe();
        setUser(user);
      } catch {
        // No valid refresh cookie (or backend unreachable) — user stays signed out.
      } finally {
        setInitialized(true);
      }
    })();
  }, [setAccessToken, setUser, setInitialized]);
}
