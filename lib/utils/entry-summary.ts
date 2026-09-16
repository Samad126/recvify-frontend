import type {
  CertificationFields,
  EducationFields,
  EntryFields,
  ExperienceFields,
  SectionType,
  SkillsFields,
  SummaryFields,
} from "@/lib/api/types";

export function getEntrySummary(
  sectionType: SectionType,
  fields: EntryFields,
): { title: string; subtitle: string } {
  switch (sectionType) {
    case "SUMMARY": {
      const f = fields as SummaryFields;
      return { title: "Summary", subtitle: f.text?.slice(0, 60) ?? "" };
    }
    case "EXPERIENCE": {
      const f = fields as ExperienceFields;
      return {
        title: f.jobTitle || "Untitled role",
        subtitle: `${f.company ?? ""} | ${f.startDate ?? ""} - ${f.isCurrent ? "Present" : (f.endDate ?? "")}`,
      };
    }
    case "EDUCATION": {
      const f = fields as EducationFields;
      return {
        title: f.degree || "Untitled degree",
        subtitle: `${f.school ?? ""} | ${f.startDate ?? ""} - ${f.endDate ?? ""}`,
      };
    }
    case "SKILLS": {
      const f = fields as SkillsFields;
      return { title: f.name || "Untitled skill", subtitle: f.level ?? "" };
    }
    case "CERTIFICATIONS": {
      const f = fields as CertificationFields;
      return {
        title: f.name || "Untitled certification",
        subtitle: `${f.issuer ?? ""} ${f.date ?? ""}`.trim(),
      };
    }
    default: {
      const f = fields as { title?: string; text?: string };
      return {
        title: f.title || "Custom entry",
        subtitle: f.text?.slice(0, 60) ?? "",
      };
    }
  }
}
