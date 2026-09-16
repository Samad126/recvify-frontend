import { authedFetch, publicFetch } from "./http";
import type { AuthTokens, LoginPayload, RegisterPayload } from "./types";

export function register(payload: RegisterPayload) {
  return publicFetch<AuthTokens>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginPayload) {
  return publicFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function loginWithGoogle(googleAccessToken: string) {
  return publicFetch<AuthTokens>("/auth/google", {
    method: "POST",
    body: { accessToken: googleAccessToken },
  });
}

export function refresh() {
  return publicFetch<AuthTokens>("/auth/refresh", { method: "POST" });
}

export function logout() {
  return authedFetch<void>("/auth/logout", { method: "POST" });
}

export function forgotPassword(email: string) {
  return publicFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(payload: {
  userId: string;
  token: string;
  newPassword: string;
}) {
  return publicFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}
