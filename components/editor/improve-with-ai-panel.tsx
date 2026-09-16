"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import * as aiSuggestionsApi from "@/lib/api/ai-suggestions";
import type { AiSuggestion, SuggestionScope } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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
  const progressPct = suggestions.length
    ? Math.round((reviewedCount / suggestions.length) * 100)
    : 0;

  const startEdit = (s: AiSuggestion) => {
    setEditingId(s.id);
    setEditValue(s.suggestedText);
  };

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
          <div
            key={s.id}
            className={cn(
              "bg-surface-container-lowest border rounded-lg p-md transition-colors relative",
              s.status === "ACCEPTED" || s.status === "EDITED"
                ? "border-2 border-primary-container/30"
                : "border-outline-variant hover:border-outline",
            )}
          >
            {(s.status === "ACCEPTED" || s.status === "EDITED") && (
              <Icon
                name="check_circle"
                filled
                className="absolute top-sm right-sm text-primary-container !text-lg"
              />
            )}
            <div className="flex justify-between items-start mb-sm pr-lg gap-sm">
              <span className="text-label-md text-primary-container bg-primary-fixed-dim/20 px-xs py-0.5 rounded">
                {s.label}
              </span>
              {s.status === "REJECTED" && (
                <span className="text-body-sm text-on-surface-variant">
                  Rejected
                </span>
              )}
            </div>

            {editingId === s.id ? (
              <div className="mb-md space-y-sm">
                <Textarea
                  rows={4}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <div className="flex gap-sm justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low text-label-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateStatus.mutate({
                        id: s.id,
                        status: "EDITED",
                        suggestedText: editValue,
                      });
                      setEditingId(null);
                    }}
                    className="px-sm py-xs bg-primary-container text-on-primary rounded text-label-md transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "bg-surface-container-low p-sm rounded border border-outline-variant mb-md text-body-sm leading-relaxed",
                  s.status === "REJECTED" && "opacity-50",
                )}
              >
                <p className="line-through text-error mb-xs">
                  {s.originalText}
                </p>
                <p className="text-on-surface">{s.suggestedText}</p>
              </div>
            )}

            {editingId !== s.id && (
              <div className="flex gap-sm justify-end">
                {s.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({ id: s.id, status: "REJECTED" })
                      }
                      className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low text-label-md transition-colors flex items-center gap-xs"
                    >
                      <Icon name="close" className="!text-sm" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low text-label-md transition-colors flex items-center gap-xs"
                    >
                      <Icon name="edit" className="!text-sm" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({ id: s.id, status: "ACCEPTED" })
                      }
                      className="px-sm py-xs bg-primary-container text-on-primary rounded text-label-md transition-colors flex items-center gap-xs"
                    >
                      <Icon name="check" className="!text-sm" /> Accept
                    </button>
                  </>
                )}
                {s.status !== "PENDING" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus.mutate({ id: s.id, status: "PENDING" })
                    }
                    className="px-sm py-xs text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded text-label-md transition-colors flex items-center gap-xs"
                  >
                    <Icon name="undo" className="!text-sm" /> Undo
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="p-md border-t border-outline-variant bg-surface-container-lowest shrink-0">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-body-sm text-on-surface-variant">
              {reviewedCount} of {suggestions.length} suggestions reviewed
            </span>
            <span className="text-label-md text-primary">{progressPct}%</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2 mb-md overflow-hidden">
            <div
              className="bg-primary-container h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <button
            type="button"
            disabled={acceptedIds.length === 0 || apply.isPending}
            onClick={() => apply.mutate(acceptedIds)}
            className="w-full py-sm bg-primary-container text-on-primary rounded-lg text-label-md font-bold transition-colors shadow-flat-soft disabled:opacity-50 disabled:pointer-events-none"
          >
            {apply.isSuccess
              ? "Applied ✓"
              : apply.isPending
                ? "Applying…"
                : `Apply Accepted Changes (${acceptedIds.length})`}
          </button>
        </div>
      )}
    </aside>
  );
}
