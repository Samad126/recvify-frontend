import { authedFetch } from "./http";
import type { User } from "./types";

export function getMe() {
  return authedFetch<User>("/users/me");
}

export function updateMe(
  payload: Partial<Pick<User, "firstName" | "lastName" | "avatarUrl">>,
) {
  return authedFetch<User>("/users/me", { method: "PATCH", body: payload });
}
