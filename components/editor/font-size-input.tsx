"use client";

import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import { FONT_SIZE_PRESETS } from "@/lib/utils/style-cascade";

interface FontSizeInputProps {
  value: number;
  onChange: (size: number) => void;
  className?: string;
}

/**
 * PowerPoint-style font-size control: a dropdown of common sizes via
 * <datalist>, plus a plain number input so any custom value can still be
 * typed directly — replaces the old +/- stepper.
 */
export function FontSizeInput({
  value,
  onChange,
  className,
}: FontSizeInputProps) {
  const listId = useId();
  return (
    <>
      <input
        type="number"
        list={listId}
        min={6}
        max={96}
        step={0.5}
        value={value}
        onChange={(e) => {
          const next = Number.parseFloat(e.target.value);
          if (!Number.isNaN(next)) onChange(next);
        }}
        className={cn(
          "h-7 w-16 rounded border border-outline-variant bg-surface-container-lowest px-1 text-label-md text-on-surface focus:outline-none",
          className,
        )}
      />
      <datalist id={listId}>
        {FONT_SIZE_PRESETS.map((size) => (
          <option key={size} value={size} />
        ))}
      </datalist>
    </>
  );
}
