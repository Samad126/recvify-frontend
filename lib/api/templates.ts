import { publicFetch } from "./http";
import type { Paginated, Template, TemplateDetail } from "./types";

export interface ListTemplatesParams {
  search?: string;
  industry?: string;
  style?: string;
  atsOnly?: boolean;
  page?: number;
  limit?: number;
  sort?: "recent" | "name";
}

export function listTemplates(params: ListTemplatesParams = {}) {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.industry) search.set("industry", params.industry);
  if (params.style) search.set("style", params.style);
  if (params.atsOnly) search.set("atsOnly", "true");
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return publicFetch<Paginated<Template>>(`/templates${qs ? `?${qs}` : ""}`);
}

export function getTemplate(templateId: string) {
  return publicFetch<TemplateDetail>(`/templates/${templateId}`);
}
