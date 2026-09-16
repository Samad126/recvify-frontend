import type { SectionType } from "@/lib/api/types";

export const SECTION_META: Record<
  SectionType,
  { label: string; icon: string }
> = {
  SUMMARY: { label: "Professional Summary", icon: "summarize" },
  EXPERIENCE: { label: "Employment History", icon: "work" },
  EDUCATION: { label: "Education", icon: "school" },
  SKILLS: { label: "Skills", icon: "star" },
  CERTIFICATIONS: { label: "Certifications", icon: "workspace_premium" },
  CUSTOM: { label: "Custom Section", icon: "notes" },
};

export const SECTION_TYPES: SectionType[] = [
  "SUMMARY",
  "EXPERIENCE",
  "EDUCATION",
  "SKILLS",
  "CERTIFICATIONS",
  "CUSTOM",
];
