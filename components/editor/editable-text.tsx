"use client";

import {
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/lib/utils/cn";

interface EditableTextProps {
  value: string;
  onCommit: (next: string) => void;
  /** When false, renders as plain static text (used by the read-only public share page). */
  editable: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Allows Enter to insert a newline instead of committing/blurring. */
  multiline?: boolean;
  placeholder?: string;
  onFocus?: () => void;
}

/**
 * A click-to-edit text node for the resume preview: shows a dashed outline on
 * hover/focus, commits on blur. Uncontrolled by design — the DOM owns the text
 * while focused, so a mid-typing refetch from an unrelated autosave elsewhere
 * on the page can't reset the user's cursor or in-progress keystrokes.
 */
export function EditableText({
  value,
  onCommit,
  editable,
  as: Tag = "span",
  className,
  style,
  multiline = false,
  placeholder,
  onFocus,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  if (!editable) {
    return (
      <Tag className={className} style={style}>
        {value || placeholder}
      </Tag>
    );
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const text = (e.currentTarget.textContent ?? "").trim();
    if (text !== value) onCommit(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === "Escape") {
      e.currentTarget.textContent = value;
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        className,
        "cursor-text rounded-sm outline-none transition-[outline-color] outline-1 outline-transparent outline-offset-2",
        "hover:outline-dashed hover:outline-outline",
        "focus:outline-dashed focus:outline-2 focus:outline-primary-container",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-outline",
      )}
      style={style}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    />
  );
}
