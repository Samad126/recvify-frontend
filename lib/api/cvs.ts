import { authedFetch } from "./http";
import type { CvListItem, Paginated } from "./types";

export function listCvs(params: { page?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return authedFetch<Paginated<CvListItem>>(`/cvs${qs ? `?${qs}` : ""}`);
}

export function deleteCv(cvId: string) {
  return authedFetch<void>(`/cvs/${cvId}`, { method: "DELETE" });
}
