"use client";

import { useState } from "react";
import type { CvDetail } from "@/lib/api/types";
import { ResumeDocument } from "./resume-document";
import { StyleToolbar } from "./style-toolbar";

export function PreviewPanel({ cv }: { cv: CvDetail }) {
  const [zoom, setZoom] = useState(100);

  return (
    <section className="flex-1 bg-surface-container relative flex flex-col">
      <StyleToolbar cv={cv} zoom={zoom} onZoomChange={setZoom} />

      <div className="flex-1 overflow-auto p-xl flex justify-center bg-surface-container">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <ResumeDocument
            contactInfoJson={cv.contactInfoJson}
            sections={cv.sections}
            styleOverridesJson={cv.styleOverridesJson}
          />
        </div>
      </div>
    </section>
  );
}
