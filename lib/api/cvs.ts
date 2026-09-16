import { authedFetch } from "./http";
import type {
  ContactInfo,
  CreateCvFromUploadPayload,
  CvDetail,
  CvListItem,
  CvSection,
  EntryFields,
  Paginated,
  SectionType,
  StyleOverrides,
} from "./types";

export function listCvs(params: { page?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return authedFetch<Paginated<CvListItem>>(`/cvs${qs ? `?${qs}` : ""}`);
}

export function getCv(cvId: string) {
  return authedFetch<CvDetail>(`/cvs/${cvId}`);
}

export function deleteCv(cvId: string) {
  return authedFetch<void>(`/cvs/${cvId}`, { method: "DELETE" });
}

export function createCv(payload: { templateId: string; title?: string }) {
  return authedFetch<CvListItem>("/cvs", { method: "POST", body: payload });
}

export function createCvFromUpload(payload: CreateCvFromUploadPayload) {
  return authedFetch<CvDetail>("/cvs/from-upload", {
    method: "POST",
    body: payload,
  });
}

export function updateCv(
  cvId: string,
  payload: Partial<{
    title: string;
    templateId: string;
    styleOverridesJson: StyleOverrides;
    contactInfoJson: ContactInfo;
  }>,
) {
  return authedFetch<CvDetail>(`/cvs/${cvId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function createSection(
  cvId: string,
  payload: { sectionType: SectionType; title?: string },
) {
  return authedFetch<CvSection>(`/cvs/${cvId}/sections`, {
    method: "POST",
    body: payload,
  });
}

export function updateSection(
  cvId: string,
  sectionId: string,
  payload: { title?: string },
) {
  return authedFetch<CvSection>(`/cvs/${cvId}/sections/${sectionId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSection(cvId: string, sectionId: string) {
  return authedFetch<void>(`/cvs/${cvId}/sections/${sectionId}`, {
    method: "DELETE",
  });
}

export function reorderSections(
  cvId: string,
  items: { id: string; sortOrder: number }[],
) {
  return authedFetch<void>(`/cvs/${cvId}/sections/reorder`, {
    method: "PATCH",
    body: { items },
  });
}

export function createEntry(
  cvId: string,
  sectionId: string,
  fieldsJson: EntryFields,
) {
  return authedFetch<{
    id: string;
    fieldsJson: EntryFields;
    sortOrder: number;
  }>(`/cvs/${cvId}/sections/${sectionId}/entries`, {
    method: "POST",
    body: { fieldsJson },
  });
}

export function updateEntry(
  cvId: string,
  sectionId: string,
  entryId: string,
  fieldsJson: Partial<EntryFields>,
) {
  return authedFetch<{
    id: string;
    fieldsJson: EntryFields;
    sortOrder: number;
  }>(`/cvs/${cvId}/sections/${sectionId}/entries/${entryId}`, {
    method: "PATCH",
    body: { fieldsJson },
  });
}

export function deleteEntry(cvId: string, sectionId: string, entryId: string) {
  return authedFetch<void>(
    `/cvs/${cvId}/sections/${sectionId}/entries/${entryId}`,
    {
      method: "DELETE",
    },
  );
}

export function reorderEntries(
  cvId: string,
  sectionId: string,
  items: { id: string; sortOrder: number }[],
) {
  return authedFetch<void>(
    `/cvs/${cvId}/sections/${sectionId}/entries/reorder`,
    {
      method: "PATCH",
      body: { items },
    },
  );
}
