"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { StyleOverrides } from "@/lib/api/types";
import { ACCENT_COLORS, FONT_OPTIONS } from "@/lib/constants/fonts";
import { cn } from "@/lib/utils/cn";
import { BASE_FONT_SIZE, DEFAULT_LINE_HEIGHT } from "@/lib/utils/style-cascade";
import { FontSizeInput } from "./font-size-input";

interface ElementStylePopoverProps {
  /** null/undefined fields inherit from the section/CV default. */
  override: StyleOverrides | null | undefined;
  onChange: (next: StyleOverrides) => void;
  label: string;
}

function ToggleButton({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded text-label-md text-on-surface-variant hover:bg-outline-variant/20",
        active && "bg-primary-container/20 text-primary-container",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Floating mini toolbar shown (via CSS :focus-within on the wrapping group,
 * see resume-document.tsx) while a specific entry/section is being edited —
 * lets color/font/size/weight be scoped to just that element instead of the
 * whole CV.
 */
export function ElementStylePopover({
  override,
  onChange,
  label,
}: ElementStylePopoverProps) {
  const fontSize = override?.fontSize ?? BASE_FONT_SIZE;
  const lineHeight = override?.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const hasOverride = !!(
    override &&
    Object.keys(override).some(
      (k) => override[k as keyof StyleOverrides] !== undefined,
    )
  );

  const patch = (next: Partial<StyleOverrides>) => {
    onChange({ ...override, ...next });
  };

  return (
    <div className="not-prose absolute -top-11 left-0 z-20 hidden flex-wrap items-center gap-xs whitespace-nowrap rounded-lg border border-outline-variant bg-surface-container-lowest p-xs shadow-flat-soft group-focus-within:flex">
      <span className="px-xs text-label-md text-on-surface-variant">
        {label}
      </span>
      <div className="h-4 w-px bg-outline-variant" />
      <div className="flex items-center gap-1">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Color ${color}`}
            onClick={() => patch({ accentColor: color })}
            style={{ backgroundColor: color }}
            className={cn(
              "size-4 rounded-full border border-outline-variant",
              override?.accentColor?.toLowerCase() === color.toLowerCase() &&
                "ring-2 ring-primary-container/50",
            )}
          />
        ))}
      </div>
      <div className="h-4 w-px bg-outline-variant" />
      <select
        value={override?.fontFamily ?? ""}
        onChange={(e) => patch({ fontFamily: e.target.value || undefined })}
        className="h-7 rounded border border-outline-variant bg-surface-container-lowest px-1 text-label-md text-on-surface focus:outline-none"
      >
        <option value="">Default font</option>
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <FontSizeInput
        value={fontSize}
        onChange={(size) => patch({ fontSize: size })}
      />
      <div className="h-4 w-px bg-outline-variant" />
      <div className="flex items-center gap-0.5">
        <ToggleButton
          title="Bold"
          active={override?.bold === true}
          onClick={() =>
            patch({ bold: override?.bold === true ? false : true })
          }
        >
          <span className="font-bold">B</span>
        </ToggleButton>
        <ToggleButton
          title="Italic"
          active={override?.italic === true}
          onClick={() =>
            patch({ italic: override?.italic === true ? false : true })
          }
        >
          <span className="italic">I</span>
        </ToggleButton>
        <ToggleButton
          title="Underline"
          active={override?.underline === true}
          onClick={() =>
            patch({ underline: override?.underline === true ? false : true })
          }
        >
          <span className="underline">U</span>
        </ToggleButton>
      </div>
      <div className="h-4 w-px bg-outline-variant" />
      <div className="flex items-center gap-1" title="Line height">
        <Icon
          name="format_line_spacing"
          className="!text-sm text-on-surface-variant"
        />
        <input
          type="number"
          min={1}
          max={3}
          step={0.1}
          value={lineHeight}
          onChange={(e) => {
            const next = Number.parseFloat(e.target.value);
            if (!Number.isNaN(next)) patch({ lineHeight: next });
          }}
          className="h-7 w-14 rounded border border-outline-variant bg-surface-container-lowest px-1 text-label-md text-on-surface focus:outline-none"
        />
      </div>
      {hasOverride && (
        <>
          <div className="h-4 w-px bg-outline-variant" />
          <button
            type="button"
            onClick={() => onChange({})}
            className="px-xs text-label-md text-on-surface-variant hover:text-error"
            title="Reset to the section/CV default"
          >
            Reset
          </button>
        </>
      )}
    </div>
  );
}
