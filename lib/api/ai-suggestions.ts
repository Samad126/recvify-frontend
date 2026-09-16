import { authedFetch } from "./http";
import type { AiSuggestion, SuggestionScope, SuggestionStatus } from "./types";

export function generateSuggestions(cvId: string, scope: SuggestionScope) {
  return authedFetch<AiSuggestion[]>(`/cvs/${cvId}/ai-suggestions/generate`, {
    method: "POST",
    body: { scope },
  });
}

export function listSuggestions(cvId: string) {
  return authedFetch<AiSuggestion[]>(`/cvs/${cvId}/ai-suggestions`);
}

export function updateSuggestion(
  cvId: string,
  suggestionId: string,
  payload: { status: SuggestionStatus; suggestedText?: string },
) {
  return authedFetch<AiSuggestion>(
    `/cvs/${cvId}/ai-suggestions/${suggestionId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function applySuggestions(cvId: string, ids: string[]) {
  return authedFetch<void>(`/cvs/${cvId}/ai-suggestions/apply`, {
    method: "POST",
    body: { ids },
  });
}
