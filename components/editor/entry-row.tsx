"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { CvEntry, SectionType } from "@/lib/api/types";
import { getEntrySummary } from "@/lib/utils/entry-summary";
import { EntryFieldsForm } from "./entry-fields-form";

interface EntryRowProps {
  sectionType: SectionType;
  entry: CvEntry;
  onSave: (fields: CvEntry["fieldsJson"]) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function EntryRow({
  sectionType,
  entry,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: EntryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { title, subtitle } = getEntrySummary(sectionType, entry.fieldsJson);

  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <div className="p-md hover:bg-surface-container-low transition-colors group flex items-start gap-sm">
        <div className="flex flex-col gap-0 pt-xs opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="text-outline hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none"
          >
            <Icon name="keyboard_arrow_up" className="!text-base" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="text-outline hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none"
          >
            <Icon name="keyboard_arrow_down" className="!text-base" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 text-left"
        >
          <div className="flex justify-between items-start gap-sm">
            <h4 className="text-headline-md text-on-surface text-[15px]">
              {title}
            </h4>
            <Icon
              name="expand_more"
              className={`text-outline transition-transform duration-200 !text-lg ${expanded ? "rotate-180" : ""}`}
            />
          </div>
          {subtitle && (
            <div className="text-on-surface-variant text-body-sm mt-xs">
              {subtitle}
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all p-xs rounded hover:bg-surface-container"
        >
          <Icon name="delete" className="!text-base" />
        </button>
      </div>

      {expanded && (
        <div className="px-md pb-md">
          <EntryFieldsForm
            sectionType={sectionType}
            fields={entry.fieldsJson}
            onSave={onSave}
          />
        </div>
      )}
    </div>
  );
}
