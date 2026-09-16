"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import type { AiSuggestion } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface SuggestionCardProps {
  suggestion: AiSuggestion;
  onAccept: () => void;
  onReject: () => void;
  onUndo: () => void;
  onEdit: (suggestedText: string) => void;
}

export function SuggestionCard({
  suggestion: s,
  onAccept,
  onReject,
  onUndo,
  onEdit,
}: SuggestionCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(s.suggestedText);

  return (
    <div
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
          <span className="text-body-sm text-on-surface-variant">Rejected</span>
        )}
      </div>

      {editing ? (
        <div className="mb-md space-y-sm">
          <Textarea
            rows={4}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <div className="flex gap-sm justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low text-label-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onEdit(editValue);
                setEditing(false);
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
          <p className="line-through text-error mb-xs">{s.originalText}</p>
          <p className="text-on-surface">{s.suggestedText}</p>
        </div>
      )}

      {!editing && (
        <div className="flex gap-sm justify-end">
          {s.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low text-label-md transition-colors flex items-center gap-xs"
              >
                <Icon name="close" className="!text-sm" /> Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditValue(s.suggestedText);
                  setEditing(true);
                }}
                className="px-sm py-xs border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low text-label-md transition-colors flex items-center gap-xs"
              >
                <Icon name="edit" className="!text-sm" /> Edit
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="px-sm py-xs bg-primary-container text-on-primary rounded text-label-md transition-colors flex items-center gap-xs"
              >
                <Icon name="check" className="!text-sm" /> Accept
              </button>
            </>
          )}
          {s.status !== "PENDING" && (
            <button
              type="button"
              onClick={onUndo}
              className="px-sm py-xs text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded text-label-md transition-colors flex items-center gap-xs"
            >
              <Icon name="undo" className="!text-sm" /> Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
