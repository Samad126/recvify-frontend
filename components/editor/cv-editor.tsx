"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import * as cvsApi from "@/lib/api/cvs";
import { ContentPanel } from "./content-panel";
import { EditorTopBar } from "./editor-top-bar";
import { PreviewPanel } from "./preview-panel";

export function CvEditor({ cvId }: { cvId: string }) {
  const {
    data: cv,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["cv", cvId],
    queryFn: () => cvsApi.getCv(cvId),
  });

  if (isPending) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-container-lowest">
        <span className="size-6 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !cv) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-sm bg-surface-container-lowest text-center px-md">
        <p className="text-body-md text-on-surface-variant">
          Couldn't load this resume. It may not exist, or it belongs to someone
          else.
        </p>
        <Link
          href="/dashboard"
          className="text-primary-container hover:underline text-label-md"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface-container-lowest">
      <EditorTopBar cv={cv} />
      <main className="flex-1 flex overflow-hidden">
        <ContentPanel cv={cv} />
        <PreviewPanel cv={cv} />
      </main>
    </div>
  );
}
