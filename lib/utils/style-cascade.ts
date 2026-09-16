import type { CSSProperties } from "react";
import type { StyleOverrides } from "@/lib/api/types";

export const DEFAULT_ACCENT_COLOR = "#0F766E";
export const DEFAULT_FONT_FAMILY = "Inter";
export const BASE_FONT_SIZE = 14;
export const DEFAULT_LINE_HEIGHT = 1.4;

/** PowerPoint-style preset sizes for the font-size picker; "Custom…" reveals a number input. */
export const FONT_SIZE_PRESETS = [
  8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48,
];

export interface ResolvedStyle {
  color: string;
  /** Same as `color`, but `undefined` when no layer set an accentColor at all — for text that should stay neutral (e.g. a job title) unless the user explicitly colors it, instead of always defaulting to the accent. */
  explicitColor: string | undefined;
  fontFamily: string;
  /** Relative to the 14px design baseline — multiply an element's base px size by this. */
  fontScale: number;
  fontSize: number;
  lineHeight: number;
  /** `undefined` unless a layer explicitly set it — bold/italic/underline are toggles, not cascaded defaults, so they must never silently un-style text that was never touched. */
  bold: boolean | undefined;
  italic: boolean | undefined;
  underline: boolean | undefined;
}

/**
 * Merges style layers from lowest to highest priority (e.g. template default,
 * then CV-level, then section-level, then entry-level) so a more specific
 * override always wins per-field, without clobbering fields it doesn't set.
 */
export function resolveStyle(
  ...layers: (StyleOverrides | null | undefined)[]
): ResolvedStyle {
  let color = DEFAULT_ACCENT_COLOR;
  let explicitColor: string | undefined;
  let fontFamily = DEFAULT_FONT_FAMILY;
  let fontSize = BASE_FONT_SIZE;
  let lineHeight = DEFAULT_LINE_HEIGHT;
  let bold: boolean | undefined;
  let italic: boolean | undefined;
  let underline: boolean | undefined;

  for (const layer of layers) {
    if (!layer) continue;
    if (layer.accentColor) {
      color = layer.accentColor;
      explicitColor = layer.accentColor;
    }
    if (layer.fontFamily) fontFamily = layer.fontFamily;
    if (layer.fontSize) fontSize = layer.fontSize;
    if (layer.lineHeight) lineHeight = layer.lineHeight;
    if (layer.bold !== undefined) bold = layer.bold;
    if (layer.italic !== undefined) italic = layer.italic;
    if (layer.underline !== undefined) underline = layer.underline;
  }

  return {
    color,
    explicitColor,
    fontFamily,
    fontSize,
    lineHeight,
    bold,
    italic,
    underline,
    fontScale: fontSize / BASE_FONT_SIZE,
  };
}

/**
 * Builds the inline style for one text node from its resolved style —
 * `basePx` is that node's design-baseline size (e.g. 16 for an entry title,
 * 14 for body text), `useAccent` picks whether it's accent-tinted by default
 * (company/school/section headers) or stays neutral until explicitly colored.
 */
export function fieldCss(
  style: ResolvedStyle,
  basePx: number,
  useAccent = false,
): CSSProperties {
  return {
    color: useAccent ? style.color : style.explicitColor,
    fontFamily: style.fontFamily,
    fontSize: basePx * style.fontScale,
    lineHeight: style.lineHeight,
    fontWeight: style.bold === undefined ? undefined : style.bold ? 700 : 400,
    fontStyle:
      style.italic === undefined
        ? undefined
        : style.italic
          ? "italic"
          : "normal",
    textDecoration:
      style.underline === undefined
        ? undefined
        : style.underline
          ? "underline"
          : "none",
  };
}
