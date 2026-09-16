"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import * as cvsApi from "@/lib/api/cvs";
import type { CvDetail } from "@/lib/api/types";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

export function EditorTopBar({
  cv,
  onImprove,
}: {
  cv: CvDetail;
  onImprove: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(cv.title);
  const [menuOpen, setMenuOpen] = useState(false);

  const saveTitle = useMutation({
    mutationFn: (next: string) => cvsApi.updateCv(cv.id, { title: next }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv", cv.id] });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });
  const debouncedSaveTitle = useDebouncedCallback(
    (next: string) => saveTitle.mutate(next),
    600,
  );

  const deleteCv = useMutation({
    mutationFn: () => cvsApi.deleteCv(cv.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      router.push("/dashboard");
    },
  });

  return (
    <header className="h-16 w-full border-b border-outline-variant bg-surface flex items-center justify-between px-md flex-shrink-0 z-50">
      <div className="flex items-center gap-md min-w-0">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-on-surface-variant hover:text-on-surface p-sm rounded-full hover:bg-surface-container transition-colors"
        >
          <Icon name="arrow_back" />
        </button>
        <div className="h-6 w-px bg-outline-variant" />
        <div className="flex flex-col min-w-0">
          <input
            className="text-headline-md text-on-surface bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-64 truncate"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedSaveTitle(e.target.value);
            }}
          />
          <div className="flex items-center gap-xs text-secondary text-body-sm mt-0.5">
            {saveTitle.isPending ? (
              <span>Saving…</span>
            ) : (
              <>
                <Icon
                  name="check_circle"
                  filled
                  className="!text-sm text-tertiary-container"
                />
                <span>Saved {formatRelativeTime(cv.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-md">
        <Link
          href={`/cvs/${cv.id}/tailor`}
          className="h-10 px-md flex items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-label-md"
        >
          <Icon name="track_changes" />
          Tailor to Job
        </Link>
        <button
          type="button"
          onClick={onImprove}
          className="h-10 px-md flex items-center gap-sm rounded-lg bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors text-label-md"
        >
          <Icon name="auto_awesome" />
          Improve with AI
        </button>
        <div className="h-6 w-px bg-outline-variant" />
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="text-on-surface-variant hover:text-on-surface p-sm rounded-full hover:bg-surface-container transition-colors"
          >
            <Icon name="more_vert" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-xs w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-flat-soft py-xs z-50">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (
                    window.confirm(
                      `Delete "${cv.title}"? This can't be undone.`,
                    )
                  ) {
                    deleteCv.mutate();
                  }
                }}
                className="w-full text-left px-md py-sm text-body-sm text-error hover:bg-error-container/40"
              >
                Delete CV
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
