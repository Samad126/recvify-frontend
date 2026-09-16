"use client";

import { Icon } from "@/components/ui/icon";
import type { StyleOverrides } from "@/lib/api/types";
import { ACCENT_COLORS, FONT_OPTIONS } from "@/lib/constants/fonts";
import { cn } from "@/lib/utils/cn";
import { BASE_FONT_SIZE } from "@/lib/utils/style-cascade";

interface ElementStylePopoverProps {
  /** null/undefined fields inherit from the section/CV default. */
  override: StyleOverrides | null | undefined;
  onChange: (next: StyleOverrides) => void;
  label: string;
}

/**
 * Floating mini toolbar shown (via CSS :focus-within on the wrapping group,
 * see resume-document.tsx) while a specific entry/section is being edited —
 * lets color/font/size be scoped to just that element instead of the whole CV.
 */
export function ElementStylePopover({
  override,
  onChange,
  label,
}: ElementStylePopoverProps) {
  const fontSize = override?.fontSize ?? BASE_FONT_SIZE;
  const hasOverride = !!(
    override?.accentColor ||
    override?.fontFamily ||
    override?.fontSize
  );

  const patch = (next: Partial<StyleOverrides>) => {
    onChange({ ...override, ...next });
  };

  return (
    <div className="not-prose absolute -top-11 left-0 z-20 hidden items-center gap-xs whitespace-nowrap rounded-lg border border-outline-variant bg-surface-container-lowest p-xs shadow-flat-soft group-focus-within:flex">
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
      <div className="flex items-center rounded bg-surface-container p-0.5">
        <button
          type="button"
          aria-label="Decrease size"
          onClick={() => patch({ fontSize: Math.max(8, fontSize - 1) })}
          className="rounded p-0.5 text-on-surface-variant hover:bg-outline-variant/20 hover:text-on-surface"
        >
          <Icon name="text_decrease" className="!text-sm" />
        </button>
        <span className="w-6 text-center text-label-md text-on-surface">
          {fontSize}
        </span>
        <button
          type="button"
          aria-label="Increase size"
          onClick={() => patch({ fontSize: Math.min(32, fontSize + 1) })}
          className="rounded p-0.5 text-on-surface-variant hover:bg-outline-variant/20 hover:text-on-surface"
        >
          <Icon name="text_increase" className="!text-sm" />
        </button>
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
