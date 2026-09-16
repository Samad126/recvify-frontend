import type { EntryFields, SectionType } from "@/lib/api/types";

/**
 * Backend `@IsNotEmpty()` rejects empty strings on entry creation (see
 * section-fields.dto.ts), so required fields here need placeholder text, not
 * "" — the user overwrites it via the autosaving field inputs right after.
 */
export function getDefaultEntryFields(sectionType: SectionType): EntryFields {
  switch (sectionType) {
    case "SUMMARY":
      return { text: "Write a short professional summary." };
    case "EXPERIENCE":
      return {
        jobTitle: "Job Title",
        company: "Company Name",
        startDate: "Present",
        endDate: "",
        description: "Describe your responsibilities and achievements.",
      };
    case "EDUCATION":
      return {
        school: "School Name",
        degree: "Degree",
        startDate: "Present",
        endDate: "",
      };
    case "SKILLS":
      return { name: "New Skill" };
    case "CERTIFICATIONS":
      return { name: "New Certification" };
    default:
      return { text: "New entry" };
  }
}
