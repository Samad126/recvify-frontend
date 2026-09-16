import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store/auth-store";
import type { ApiErrorBody, ApiErrorCode, ApiSuccess } from "./types";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** `message` is semicolon-joined when the backend reports multiple validation errors. */
  get fieldMessages(): string[] {
    return this.message.split("; ").filter(Boolean);
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const hasBody = res.status !== 204;
  const body = hasBody ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const errorBody = body as ApiErrorBody | null;
    throw new ApiError(
      res.status,
      errorBody?.error?.code ?? "INTERNALSERVERERROR",
      errorBody?.error?.message ?? res.statusText,
    );
  }

  return (body as ApiSuccess<T> | null)?.data as T;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/** Public endpoints: no Authorization header, but cookies are always sent for the refresh flow. */
export async function publicFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(res);
}

let refreshPromise: Promise<string | null> | null = null;

/** Calls POST /auth/refresh once, deduping concurrent callers onto a single in-flight request. */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { accessToken } = await publicFetch<{
          accessToken: string;
          refreshToken: string;
        }>("/auth/refresh", { method: "POST" });
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      } catch {
        useAuthStore.getState().clear();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/** Authenticated endpoints: attaches the bearer token and retries once through a 401 refresh. */
export async function authedFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const doRequest = async (token: string | null) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return res;
  };

  let token = useAuthStore.getState().accessToken;
  let res = await doRequest(token);

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      res = await doRequest(token);
    }
  }

  return parseResponse<T>(res);
}
