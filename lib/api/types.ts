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

export interface TemplateDetail extends Template {
  structureJson: {
    layout: "single-column" | "two-column";
    sections: { type: string; position: number; required: boolean }[];
    font: string;
    accentColor: string;
  };
}

export type SectionType =
  | "SUMMARY"
  | "EXPERIENCE"
  | "EDUCATION"
  | "SKILLS"
  | "CERTIFICATIONS"
  | "CUSTOM";

export interface SummaryFields {
  text: string;
}
export interface ExperienceFields {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
}
export interface EducationFields {
  school: string;
  degree: string;
  startDate: string;
  endDate?: string;
}
export interface SkillsFields {
  name: string;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}
export interface CertificationFields {
  name: string;
  issuer?: string;
  date?: string;
}
export interface CustomFields {
  title?: string;
  text: string;
}

export type EntryFields =
  | SummaryFields
  | ExperienceFields
  | EducationFields
  | SkillsFields
  | CertificationFields
  | CustomFields;

export interface CvEntry<T extends EntryFields = EntryFields> {
  id: string;
  fieldsJson: T;
  sortOrder: number;
}

export interface CvSection {
  id: string;
  sectionType: SectionType;
  title: string | null;
  sortOrder: number;
  entries: CvEntry[];
}

export interface ContactInfo {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface StyleOverrides {
  fontFamily?: string;
  fontSize?: number;
  accentColor?: string;
  theme?: "light" | "dark";
}

export interface CvDetail {
  id: string;
  title: string;
  templateId: string;
  status: CvStatus;
  isVariant: boolean;
  updatedAt: string;
  createdAt: string;
  styleOverridesJson: StyleOverrides | null;
  contactInfoJson: ContactInfo | null;
  sourceUploadId: string | null;
  sections: CvSection[];
}

export type ParsedStatus = "PENDING" | "PARSED" | "FAILED";

/** Mirrors the backend's ParsedResumeData shape (common/gemini/resume-schema.ts). */
export interface UploadParsedData {
  personal?: ContactInfo;
  summary?: string;
  experience?: ExperienceFields[];
  education?: EducationFields[];
  skills?: string[];
}

export interface Upload {
  id: string;
  parsedStatus: ParsedStatus;
  parsedData: UploadParsedData | null;
  createdAt: string;
}

export interface CreateCvFromUploadPayload {
  uploadId: string;
  templateId: string;
  title?: string;
  contactInfo: ContactInfo;
  summary?: string;
  experience?: ExperienceFields[];
  education?: EducationFields[];
  skills?: string[];
}

export type SuggestionScope = "WHOLE_CV" | "SUMMARY" | "EXPERIENCE";
export type SuggestionStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EDITED";
export type SuggestionSource = "IMPROVE" | "JD_TAILOR";

export interface AiSuggestion {
  id: string;
  sectionId: string;
  entryId: string;
  fieldKey: string;
  label: string;
  originalText: string;
  suggestedText: string;
  status: SuggestionStatus;
  source: SuggestionSource;
  createdAt: string;
}

export interface JobDescriptionAnalysis {
  id: string;
  rawText: string;
  sourceType: "PASTE";
  matchScore: number;
  extractedKeywords: {
    matched: string[];
    missing: string[];
    summary: string;
  };
  createdAt: string;
  aiSuggestions: AiSuggestion[];
}

export type ExportFormat = "PDF" | "DOCX" | "LINK";

export interface CvExport {
  id: string;
  format: ExportFormat;
  shareSlug: string | null;
  downloadUrl: string | null;
  createdAt: string;
}

export interface PublicCv {
  title: string;
  contactInfoJson: ContactInfo | null;
  styleOverridesJson: StyleOverrides | null;
  template: TemplateDetail;
  sections: CvSection[];
}
