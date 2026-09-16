"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import * as cvsApi from "@/lib/api/cvs";
import * as templatesApi from "@/lib/api/templates";
import type { CvDetail, StyleOverrides } from "@/lib/api/types";
import { ACCENT_COLORS, FONT_OPTIONS } from "@/lib/constants/fonts";
import { cn } from "@/lib/utils/cn";

interface StyleToolbarProps {
  cv: CvDetail;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function StyleToolbar({ cv, zoom, onZoomChange }: StyleToolbarProps) {
  const queryClient = useQueryClient();
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const style = cv.styleOverridesJson ?? {};

  // The toolbar scrolls horizontally (overflow-x-auto), which per the CSS spec
  // forces its overflow-y to `auto` too — an `absolute` dropdown positioned
  // under the trigger button would get clipped by the toolbar's own height
  // instead of floating over the preview. `fixed` positioning (computed here)
  // escapes that ancestor clipping entirely.
  const openTemplatePicker = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    setTemplatePickerOpen(true);
  };

  useEffect(() => {
    if (!templatePickerOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!triggerRef.current?.parentElement?.contains(e.target as Node)) {
        setTemplatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [templatePickerOpen]);

  const templateQuery = useQuery({
    queryKey: ["template", cv.templateId],
    queryFn: () => templatesApi.getTemplate(cv.templateId),
  });

  const templatesQuery = useQuery({
    queryKey: ["templates", "switcher"],
    queryFn: () => templatesApi.listTemplates({ limit: 8, sort: "recent" }),
    enabled: templatePickerOpen,
  });

  const saveStyle = useMutation({
    mutationFn: (next: StyleOverrides) =>
      cvsApi.updateCv(cv.id, { styleOverridesJson: next }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cv", cv.id] }),
  });

  const switchTemplate = useMutation({
    mutationFn: (templateId: string) => cvsApi.updateCv(cv.id, { templateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv", cv.id] });
      setTemplatePickerOpen(false);
    },
  });

  const updateStyle = (patch: Partial<StyleOverrides>) => {
    saveStyle.mutate({ ...style, ...patch });
  };

  const fontSize = style.fontSize ?? 14;

  return (
    <div className="h-14 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-md shadow-sm z-20 overflow-x-auto">
      <div className="flex items-center gap-sm shrink-0">
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() =>
              templatePickerOpen
                ? setTemplatePickerOpen(false)
                : openTemplatePicker()
            }
            className="flex items-center gap-xs px-sm py-xs rounded border border-outline-variant text-on-surface text-label-md hover:bg-surface-container transition-colors"
          >
            <Icon name="dashboard_customize" className="!text-base" />
            {templateQuery.data?.name ?? "Template"}
            <Icon name="arrow_drop_down" className="!text-base" />
          </button>
          {templatePickerOpen && dropdownPos && (
            <div
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
              className="fixed w-72 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-flat-soft p-sm z-40 grid grid-cols-3 gap-sm"
            >
              {templatesQuery.data?.items.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTemplate.mutate(t.id)}
                  disabled={switchTemplate.isPending}
                  className={cn(
                    "text-left rounded border overflow-hidden",
                    t.id === cv.templateId
                      ? "border-primary-container"
                      : "border-outline-variant",
                  )}
                >
                  {/** biome-ignore lint/performance/noImgElement: external, unconfigured template thumbnail host */}
                  <img
                    src={t.thumbnailUrl}
                    alt={`${t.name} template preview`}
                    className="w-full aspect-[1/1.4] object-cover object-top"
                  />
                  <span className="block px-1 py-0.5 text-[10px] text-on-surface truncate">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-outline-variant" />

        <div className="flex gap-xs">
          <button
            type="button"
            aria-label="Light theme"
            onClick={() => updateStyle({ theme: "light" })}
            className={cn(
              "w-6 h-6 rounded-full bg-surface-container-lowest border border-outline-variant",
              (style.theme ?? "light") === "light" &&
                "ring-2 ring-primary-container/50",
            )}
          />
          <button
            type="button"
            aria-label="Dark theme"
            onClick={() => updateStyle({ theme: "dark" })}
            className={cn(
              "w-6 h-6 rounded-full bg-on-surface border border-outline-variant",
              style.theme === "dark" && "ring-2 ring-primary-container/50",
            )}
          />
        </div>

        <div className="h-4 w-px bg-outline-variant" />

        <select
          value={style.fontFamily ?? FONT_OPTIONS[0].value}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
          className="text-label-md border border-outline-variant rounded px-sm py-xs bg-surface-container-lowest text-on-surface focus:outline-none"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <div className="flex items-center bg-surface-container rounded p-xs">
          <button
            type="button"
            onClick={() => updateStyle({ fontSize: Math.max(8, fontSize - 1) })}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded hover:bg-outline-variant/20"
          >
            <Icon name="text_decrease" className="!text-base" />
          </button>
          <span className="text-body-sm px-xs w-8 text-center text-on-surface">
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() =>
              updateStyle({ fontSize: Math.min(32, fontSize + 1) })
            }
            className="text-on-surface-variant hover:text-on-surface p-xs rounded hover:bg-outline-variant/20"
          >
            <Icon name="text_increase" className="!text-base" />
          </button>
        </div>

        <div className="h-4 w-px bg-outline-variant" />

        <div className="flex gap-xs items-center">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Accent color ${color}`}
              onClick={() => updateStyle({ accentColor: color })}
              style={{ backgroundColor: color }}
              className={cn(
                "w-5 h-5 rounded-full border border-outline-variant cursor-pointer",
                (style.accentColor ?? "#0F766E").toLowerCase() ===
                  color.toLowerCase() && "ring-2 ring-primary-container/50",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-md shrink-0">
        <div className="flex items-center bg-surface-container rounded p-xs">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded hover:bg-outline-variant/20"
          >
            <Icon name="remove" className="!text-base" />
          </button>
          <span className="text-body-sm px-sm w-12 text-center text-on-surface">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(150, zoom + 10))}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded hover:bg-outline-variant/20"
          >
            <Icon name="add" className="!text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
