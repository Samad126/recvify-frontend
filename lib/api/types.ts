export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiErrorCode =
  | "BADREQUEST"
  | "NOTFOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNALSERVERERROR";

export interface ApiErrorBody {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

export type Plan = "FREE" | "PRO";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  plan: Plan;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
