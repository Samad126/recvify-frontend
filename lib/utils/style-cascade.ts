import type { StyleOverrides } from "@/lib/api/types";

export const DEFAULT_ACCENT_COLOR = "#0F766E";
export const DEFAULT_FONT_FAMILY = "Inter";
export const BASE_FONT_SIZE = 14;

export interface ResolvedStyle {
  color: string;
  /** Same as `color`, but `undefined` when no layer set an accentColor at all — for text that should stay neutral (e.g. a job title) unless the user explicitly colors it, instead of always defaulting to the accent. */
  explicitColor: string | undefined;
  fontFamily: string;
  /** Relative to the 14px design baseline — multiply an element's base px size by this. */
  fontScale: number;
  fontSize: number;
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

  for (const layer of layers) {
    if (!layer) continue;
    if (layer.accentColor) {
      color = layer.accentColor;
      explicitColor = layer.accentColor;
    }
    if (layer.fontFamily) fontFamily = layer.fontFamily;
    if (layer.fontSize) fontSize = layer.fontSize;
  }

  return {
    color,
    explicitColor,
    fontFamily,
    fontSize,
    fontScale: fontSize / BASE_FONT_SIZE,
  };
}
