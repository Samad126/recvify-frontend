"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { ApplySuggestionsFooter } from "@/components/editor/apply-suggestions-footer";
import { ExportModal } from "@/components/editor/export-modal";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { SuggestionCard } from "@/components/editor/suggestion-card";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import * as aiSuggestionsApi from "@/lib/api/ai-suggestions";
import * as cvsApi from "@/lib/api/cvs";
import * as jdApi from "@/lib/api/job-descriptions";
import type { AiSuggestion, JobDescriptionAnalysis } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

const CIRCUMFERENCE = 2 * Math.PI * 45;

export function TailorToJob({ cvId }: { cvId: string }) {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState("");
  const [analysis, setAnalysis] = useState<JobDescriptionAnalysis | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const cvQuery = useQuery({
    queryKey: ["cv", cvId],
    queryFn: () => cvsApi.getCv(cvId),
  });

  const historyQuery = useQuery({
    queryKey: ["job-descriptions", cvId],
    queryFn: () => jdApi.listJobDescriptions(cvId),
  });

  const analyze = useMutation({
    mutationFn: () => jdApi.analyzeJobDescription(cvId, rawText),
    onSuccess: (result) => {
      setAnalysis(result);
      queryClient.invalidateQueries({ queryKey: ["job-descriptions", cvId] });
    },
  });

  const loadAnalysis = useMutation({
    mutationFn: (jdId: string) => jdApi.getJobDescription(cvId, jdId),
    onSuccess: (result) => setAnalysis(result),
  });

  const patchSuggestion = (suggestion: AiSuggestion) => {
    setAnalysis((prev) =>
      prev
        ? {
            ...prev,
            aiSuggestions: prev.aiSuggestions.map((s) =>
              s.id === suggestion.id ? suggestion : s,
            ),
          }
        : prev,
    );
  };

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
      suggestedText,
    }: {
      id: string;
      status: AiSuggestion["status"];
      suggestedText?: string;
    }) =>
      aiSuggestionsApi.updateSuggestion(cvId, id, { status, suggestedText }),
    onSuccess: patchSuggestion,
  });

  const apply = useMutation({
    mutationFn: (ids: string[]) => aiSuggestionsApi.applySuggestions(cvId, ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cv", cvId] }),
  });

  const canAnalyze =
    rawText.trim().length >= 50 && rawText.trim().length <= 20000;
  const suggestions = analysis?.aiSuggestions ?? [];
  const reviewedCount = suggestions.filter(
    (s) => s.status !== "PENDING",
  ).length;
  const acceptedIds = suggestions
    .filter((s) => s.status === "ACCEPTED" || s.status === "EDITED")
    .map((s) => s.id);

  return (
    <div className="min-h-full flex flex-col bg-surface text-on-surface">
      <header className="h-16 flex items-center justify-between px-lg border-b border-outline-variant bg-surface-container-lowest shrink-0">
        <Link
          href={`/cvs/${cvId}`}
          className="text-on-surface hover:text-primary transition-colors flex items-center gap-xs"
        >
          <Icon name="arrow_back" />
          <span className="text-label-md">Back to Resume</span>
        </Link>
        <span className="text-headline-md font-bold text-primary">
          ResumeForge
        </span>
      </header>

      <main className="flex-1 py-xl px-md max-w-300 mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          <div className="lg:col-span-7 flex flex-col gap-xl">
            <div className="flex flex-col gap-sm">
              <h1 className="text-headline-xl text-on-surface">
                Tailor to Job Description
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                Optimize your resume for a specific role by comparing it against
                the job description.
              </p>
            </div>

            <section className="flex flex-col gap-md bg-surface-container-lowest border border-outline-variant rounded-lg p-lg relative">
              <div className="absolute -top-3 -left-3 bg-primary-container text-on-primary w-8 h-8 rounded-full flex items-center justify-center text-label-md shadow-flat-soft">
                1
              </div>
              <h2 className="text-headline-md text-on-surface flex items-center gap-sm">
                <Icon name="description" filled className="text-primary" />
                Job Details
              </h2>
              <div className="border-b border-outline-variant flex gap-md">
                <button
                  type="button"
                  className="pb-sm border-b-2 border-primary text-primary text-label-md"
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="pb-sm border-b-2 border-transparent text-on-surface-variant/50 cursor-not-allowed text-label-md"
                >
                  Job URL
                </button>
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="pb-sm border-b-2 border-transparent text-on-surface-variant/50 cursor-not-allowed text-label-md"
                >
                  Upload File
                </button>
              </div>
              <Textarea
                label="Paste the full job description here"
                placeholder="e.g. We are looking for a Senior Frontend Engineer to join our team..."
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              {analyze.isError && (
                <p className="text-body-sm text-error">
                  Couldn't analyze that job description. Try again.
                </p>
              )}
              <button
                type="button"
                disabled={!canAnalyze || analyze.isPending}
                onClick={() => analyze.mutate()}
                className="mt-sm bg-primary-container text-on-primary text-label-md py-md rounded-lg w-full hover:bg-primary transition-colors flex justify-center items-center gap-sm disabled:opacity-50"
              >
                <Icon
                  name={analyze.isPending ? "sync" : "analytics"}
                  className={analyze.isPending ? "animate-spin" : ""}
                />
                {analyze.isPending ? "Analyzing…" : "Analyze Match"}
              </button>

              {historyQuery.data && historyQuery.data.length > 0 && (
                <div className="pt-sm border-t border-outline-variant">
                  <p className="text-label-md text-on-surface-variant mb-xs">
                    Previous analyses — saved automatically, pick one up again
                    anytime
                  </p>
                  <div className="flex flex-wrap gap-xs">
                    {historyQuery.data.map((jd) => (
                      <button
                        key={jd.id}
                        type="button"
                        onClick={() => loadAnalysis.mutate(jd.id)}
                        className={`text-body-sm px-sm py-xs rounded border transition-colors ${
                          analysis?.id === jd.id
                            ? "border-primary-container bg-primary-container/10"
                            : "border-outline-variant hover:border-primary-container"
                        }`}
                      >
                        {jd.matchScore}% match ·{" "}
                        {formatRelativeTime(jd.createdAt)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {analysis && (
              <section className="flex flex-col gap-md">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg relative flex flex-col md:flex-row gap-lg items-center">
                  <div className="absolute -top-3 -left-3 bg-surface-container-high text-on-surface w-8 h-8 rounded-full flex items-center justify-center text-label-md border border-outline-variant shadow-flat-soft">
                    2
                  </div>
                  <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                    >
                      <circle
                        className="text-surface-container-high"
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-primary-container transition-all duration-1000 ease-out"
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={
                          CIRCUMFERENCE * (1 - analysis.matchScore / 100)
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-headline-xl text-primary font-bold">
                        {analysis.matchScore}%
                      </span>
                      <span className="text-label-md text-on-surface-variant">
                        Match
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col gap-sm">
                    <p className="text-body-md text-on-surface-variant">
                      {analysis.extractedKeywords.summary}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col gap-sm">
                    <h4 className="text-label-md text-on-surface flex items-center gap-xs">
                      <Icon
                        name="check_circle"
                        filled
                        className="text-primary !text-base"
                      />
                      Matched
                    </h4>
                    <div className="flex flex-wrap gap-xs">
                      {analysis.extractedKeywords.matched.map((kw) => (
                        <span
                          key={kw}
                          className="bg-surface-container-low text-on-surface-variant text-body-sm px-sm py-xs rounded border border-outline-variant"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col gap-sm">
                    <h4 className="text-label-md text-on-surface flex items-center gap-xs">
                      <Icon
                        name="warning"
                        filled
                        className="text-error !text-base"
                      />
                      Missing
                    </h4>
                    <div className="flex flex-wrap gap-xs">
                      {analysis.extractedKeywords.missing.map((kw) => (
                        <span
                          key={kw}
                          className="bg-surface-container-lowest text-error text-body-sm px-sm py-xs rounded border border-error"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-md">
                  <h2 className="text-headline-md text-on-surface">
                    Suggested Edits
                  </h2>
                  {suggestions.length === 0 && (
                    <p className="text-body-sm text-on-surface-variant">
                      No suggestions for this analysis.
                    </p>
                  )}
                  {suggestions.map((s) => (
                    <SuggestionCard
                      key={s.id}
                      suggestion={s}
                      onAccept={() =>
                        updateStatus.mutate({ id: s.id, status: "ACCEPTED" })
                      }
                      onReject={() =>
                        updateStatus.mutate({ id: s.id, status: "REJECTED" })
                      }
                      onUndo={() =>
                        updateStatus.mutate({ id: s.id, status: "PENDING" })
                      }
                      onEdit={(suggestedText) =>
                        updateStatus.mutate({
                          id: s.id,
                          status: "EDITED",
                          suggestedText,
                        })
                      }
                    />
                  ))}
                </div>

                {suggestions.length > 0 && (
                  <ApplySuggestionsFooter
                    reviewedCount={reviewedCount}
                    totalCount={suggestions.length}
                    acceptedCount={acceptedIds.length}
                    isApplying={apply.isPending}
                    isApplied={apply.isSuccess}
                    onApply={() => apply.mutate(acceptedIds)}
                  />
                )}
              </section>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-md text-on-surface">
                Resume Preview
              </h2>
              <button
                type="button"
                onClick={() => setExportOpen(true)}
                disabled={!cvQuery.data}
                className="flex items-center gap-xs text-label-md text-primary-container hover:text-primary transition-colors disabled:opacity-50"
              >
                <Icon name="file_download" className="!text-base" />
                Export tailored CV
              </button>
            </div>
            <div className="bg-surface-container-high rounded-lg border border-outline-variant flex-grow min-h-[600px] overflow-y-auto">
              {cvQuery.data && <PreviewPanel cv={cvQuery.data} />}
            </div>
          </div>
        </div>
      </main>

      {exportOpen && cvQuery.data && (
        <ExportModal cv={cvQuery.data} onClose={() => setExportOpen(false)} />
      )}
    </div>
  );
}
