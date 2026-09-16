"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import * as aiSuggestionsApi from "@/lib/api/ai-suggestions";
import type { AiSuggestion, SuggestionScope } from "@/lib/api/types";
import { ApplySuggestionsFooter } from "./apply-suggestions-footer";
import { SuggestionCard } from "./suggestion-card";

const SCOPES: { value: SuggestionScope; label: string }[] = [
  { value: "WHOLE_CV", label: "Whole CV" },
  { value: "SUMMARY", label: "Summary" },
  { value: "EXPERIENCE", label: "Experience" },
];

export function ImproveWithAiPanel({
  cvId,
  onClose,
}: {
  cvId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [pendingScope, setPendingScope] = useState<SuggestionScope | null>(
    null,
  );

  const suggestionsQuery = useQuery({
    queryKey: ["ai-suggestions", cvId],
    queryFn: () => aiSuggestionsApi.listSuggestions(cvId),
  });

  const invalidateSuggestions = () =>
    queryClient.invalidateQueries({ queryKey: ["ai-suggestions", cvId] });

  const generate = useMutation({
    mutationFn: (scope: SuggestionScope) =>
      aiSuggestionsApi.generateSuggestions(cvId, scope),
    onMutate: (scope) => setPendingScope(scope),
    onSuccess: invalidateSuggestions,
    onSettled: () => setPendingScope(null),
  });

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
    onSuccess: invalidateSuggestions,
  });

  const apply = useMutation({
    mutationFn: (ids: string[]) => aiSuggestionsApi.applySuggestions(cvId, ids),
    onSuccess: () => {
      invalidateSuggestions();
      queryClient.invalidateQueries({ queryKey: ["cv", cvId] });
    },
  });

  const suggestions = suggestionsQuery.data ?? [];
  const reviewedCount = suggestions.filter(
    (s) => s.status !== "PENDING",
  ).length;
  const acceptedIds = suggestions
    .filter((s) => s.status === "ACCEPTED" || s.status === "EDITED")
    .map((s) => s.id);

  return (
    <aside className="absolute top-0 right-0 h-full w-full md:w-[480px] bg-surface-container-lowest border-l border-outline-variant shadow-flat-soft flex flex-col z-30">
      <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest shrink-0">
        <div className="flex items-center gap-sm">
          <Icon name="auto_awesome" filled className="text-primary" />
          <h2 className="text-headline-md font-bold text-on-surface">
            Improve with AI
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-xs text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
        >
          <Icon name="close" />
        </button>
      </div>

      <div className="px-md py-sm border-b border-outline-variant bg-surface-bright overflow-x-auto shrink-0">
        <div className="flex gap-sm w-max">
          {SCOPES.map((scope) => (
            <button
              key={scope.value}
              type="button"
              disabled={generate.isPending}
              onClick={() => generate.mutate(scope.value)}
              className="px-sm py-xs rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high text-label-md border border-outline-variant transition-colors disabled:opacity-50 flex items-center gap-xs"
            >
              {generate.isPending && pendingScope === scope.value && (
                <Icon name="sync" className="!text-sm animate-spin" />
              )}
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-md space-y-md bg-surface">
        {generate.isPending && (
          <p className="text-body-sm text-on-surface-variant text-center py-lg">
            Analyzing your CV… this can take a few seconds.
          </p>
        )}

        {generate.isError && (
          <p className="text-body-sm text-error text-center py-md">
            Couldn't generate suggestions. Try again.
          </p>
        )}

        {!generate.isPending && suggestions.length === 0 && (
          <p className="text-body-sm text-on-surface-variant text-center py-lg">
            Pick a scope above to generate AI suggestions for this resume.
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
            onUndo={() => updateStatus.mutate({ id: s.id, status: "PENDING" })}
            onEdit={(suggestedText) =>
              updateStatus.mutate({ id: s.id, status: "EDITED", suggestedText })
            }
          />
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="p-md border-t border-outline-variant bg-surface-container-lowest shrink-0">
          <ApplySuggestionsFooter
            reviewedCount={reviewedCount}
            totalCount={suggestions.length}
            acceptedCount={acceptedIds.length}
            isApplying={apply.isPending}
            isApplied={apply.isSuccess}
            onApply={() => apply.mutate(acceptedIds)}
          />
        </div>
      )}
    </aside>
  );
}
