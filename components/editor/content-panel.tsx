"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as cvsApi from "@/lib/api/cvs";
import type { CvDetail, SectionType } from "@/lib/api/types";
import { SECTION_META, SECTION_TYPES } from "@/lib/constants/section-meta";
import { PersonalDetailsSection } from "./personal-details-section";
import { SectionAccordion } from "./section-accordion";

export function ContentPanel({ cv }: { cv: CvDetail }) {
  const queryClient = useQueryClient();

  const addSection = useMutation({
    mutationFn: (sectionType: SectionType) =>
      cvsApi.createSection(cv.id, { sectionType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cv", cv.id] }),
  });

  const sortedSections = [...cv.sections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <section className="w-2/5 min-w-[360px] max-w-[500px] border-r border-outline-variant bg-surface-container-lowest flex flex-col h-full">
      <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright flex-shrink-0">
        <h2 className="text-headline-md text-on-surface">Content Sections</h2>
        <select
          value=""
          disabled={addSection.isPending}
          onChange={(e) => {
            if (e.target.value)
              addSection.mutate(e.target.value as SectionType);
          }}
          className="text-primary-container text-label-md bg-transparent border-none focus:outline-none cursor-pointer"
        >
          <option value="">+ Add Section</option>
          {SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {SECTION_META[type].label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-md space-y-md">
        <PersonalDetailsSection cvId={cv.id} contactInfo={cv.contactInfoJson} />
        {sortedSections.map((section) => (
          <SectionAccordion key={section.id} cvId={cv.id} section={section} />
        ))}
      </div>
    </section>
  );
}
