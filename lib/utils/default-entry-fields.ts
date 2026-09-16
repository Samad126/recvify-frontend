import type { EntryFields, SectionType } from "@/lib/api/types";

export function getDefaultEntryFields(sectionType: SectionType): EntryFields {
  switch (sectionType) {
    case "SUMMARY":
      return { text: "" };
    case "EXPERIENCE":
      return {
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      };
    case "EDUCATION":
      return { school: "", degree: "", startDate: "", endDate: "" };
    case "SKILLS":
      return { name: "" };
    case "CERTIFICATIONS":
      return { name: "" };
    default:
      return { text: "" };
  }
}
