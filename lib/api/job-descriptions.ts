import { authedFetch } from "./http";
import type { JobDescriptionAnalysis } from "./types";

export function analyzeJobDescription(cvId: string, rawText: string) {
  return authedFetch<JobDescriptionAnalysis>(
    `/cvs/${cvId}/job-descriptions/analyze`,
    {
      method: "POST",
      body: { rawText },
    },
  );
}

export function listJobDescriptions(cvId: string) {
  return authedFetch<JobDescriptionAnalysis[]>(`/cvs/${cvId}/job-descriptions`);
}

export function getJobDescription(cvId: string, jdId: string) {
  return authedFetch<JobDescriptionAnalysis>(
    `/cvs/${cvId}/job-descriptions/${jdId}`,
  );
}
