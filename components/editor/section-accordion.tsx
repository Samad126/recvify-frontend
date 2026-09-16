"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import * as cvsApi from "@/lib/api/cvs";
import type { CvEntry, CvSection, EntryFields } from "@/lib/api/types";
import { SECTION_META } from "@/lib/constants/section-meta";
import { getDefaultEntryFields } from "@/lib/utils/default-entry-fields";
import { EntryRow } from "./entry-row";

interface SectionAccordionProps {
  cvId: string;
  section: CvSection;
  defaultExpanded?: boolean;
}

export function SectionAccordion({
  cvId,
  section,
  defaultExpanded,
}: SectionAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? true);
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["cv", cvId] });

  const addEntry = useMutation({
    mutationFn: () =>
      cvsApi.createEntry(
        cvId,
        section.id,
        getDefaultEntryFields(section.sectionType),
      ),
    onSuccess: invalidate,
  });

  const updateEntry = useMutation({
    mutationFn: ({
      entryId,
      fields,
    }: {
      entryId: string;
      fields: EntryFields;
    }) => cvsApi.updateEntry(cvId, section.id, entryId, fields),
    onSuccess: invalidate,
  });

  const deleteEntry = useMutation({
    mutationFn: (entryId: string) =>
      cvsApi.deleteEntry(cvId, section.id, entryId),
    onSuccess: invalidate,
  });

  const reorderEntries = useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      cvsApi.reorderEntries(cvId, section.id, items),
    onSuccess: invalidate,
  });

  const deleteSection = useMutation({
    mutationFn: () => cvsApi.deleteSection(cvId, section.id),
    onSuccess: invalidate,
  });

  const sortedEntries = [...section.entries].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const move = (entry: CvEntry, direction: -1 | 1) => {
    const index = sortedEntries.findIndex((e) => e.id === entry.id);
    const swapWith = sortedEntries[index + direction];
    if (!swapWith) return;
    const items = sortedEntries.map((e) => ({
      id: e.id,
      sortOrder: e.sortOrder,
    }));
    items[index] = { id: entry.id, sortOrder: swapWith.sortOrder };
    items[index + direction] = { id: swapWith.id, sortOrder: entry.sortOrder };
    reorderEntries.mutate(items);
  };

  const meta = SECTION_META[section.sectionType];

  return (
    <div className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
      <div
        className={`w-full flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group ${
          expanded
            ? "bg-surface-bright border-b border-outline-variant"
            : "bg-surface-container-lowest"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-sm text-on-surface text-headline-md flex-1 text-left"
        >
          <Icon
            name={meta.icon}
            className="text-outline group-hover:text-on-surface-variant"
          />
          {section.title || meta.label}
        </button>
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Remove the "${section.title || meta.label}" section?`,
                )
              ) {
                deleteSection.mutate();
              }
            }}
            className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="delete" className="!text-lg" />
          </button>
          <button type="button" onClick={() => setExpanded((e) => !e)}>
            <Icon
              name="expand_more"
              className={`text-outline transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-surface">
          {sortedEntries.map((entry, index) => (
            <EntryRow
              key={entry.id}
              sectionType={section.sectionType}
              entry={entry}
              isFirst={index === 0}
              isLast={index === sortedEntries.length - 1}
              onSave={(fields) =>
                updateEntry.mutate({ entryId: entry.id, fields })
              }
              onDelete={() => deleteEntry.mutate(entry.id)}
              onMoveUp={() => move(entry, -1)}
              onMoveDown={() => move(entry, 1)}
            />
          ))}
          <div className="p-md bg-surface-container-lowest">
            <button
              type="button"
              onClick={() => addEntry.mutate()}
              disabled={addEntry.isPending}
              className="text-on-surface text-label-md flex items-center gap-xs hover:text-primary-container transition-colors disabled:opacity-50"
            >
              <Icon name="add" className="!text-base" /> Add {meta.label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
