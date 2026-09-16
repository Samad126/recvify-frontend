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

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type CvStatus = "DRAFT" | "COMPLETE" | string;

export interface CvListItem {
  id: string;
  title: string;
  templateId: string;
  status: CvStatus;
  isVariant: boolean;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  tagline: string;
  thumbnailUrl: string;
  industries: string[];
  styles: string[];
  isAtsFriendly: boolean;
  createdAt: string;
}
