import type { CvDetail } from "@/lib/api/types";
import { ResumeDocument } from "./resume-document";

export function PreviewPanel({ cv }: { cv: CvDetail }) {
  return (
    <section className="flex-1 bg-surface-container relative flex flex-col">
      <div className="h-14 border-b border-outline-variant bg-surface-container-lowest flex items-center px-md flex-shrink-0">
        <span className="text-label-md text-on-surface-variant">
          Live Preview
        </span>
      </div>

      <div className="flex-1 overflow-auto p-xl flex justify-center bg-surface-container">
        <ResumeDocument
          contactInfoJson={cv.contactInfoJson}
          sections={cv.sections}
          styleOverridesJson={cv.styleOverridesJson}
        />
      </div>
    </section>
  );
}
