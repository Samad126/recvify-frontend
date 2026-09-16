"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import * as exportsApi from "@/lib/api/exports";
import * as templatesApi from "@/lib/api/templates";
import type { CvDetail, ExportFormat } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface FormatOption {
  value: ExportFormat;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

const FORMATS: FormatOption[] = [
  {
    value: "PDF",
    icon: "picture_as_pdf",
    iconBg: "bg-error-container",
    iconColor: "text-error",
    title: "PDF",
    subtitle: "Best for printing & sharing",
  },
  {
    value: "DOCX",
    icon: "description",
    iconBg: "bg-secondary-fixed",
    iconColor: "text-secondary",
    title: "DOCX",
    subtitle: "Editable Word format",
  },
  {
    value: "LINK",
    icon: "link",
    iconBg: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    title: "Web Link",
    subtitle: "Live shareable URL",
  },
];

export function ExportModal({
  cv,
  onClose,
}: {
  cv: CvDetail;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<ExportFormat>("PDF");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const templateQuery = useQuery({
    queryKey: ["template", cv.templateId],
    queryFn: () => templatesApi.getTemplate(cv.templateId),
  });

  const runExport = useMutation({
    mutationFn: (f: ExportFormat) => exportsApi.createExport(cv.id, f),
    onSuccess: async (result) => {
      if (result.format === "LINK" && result.shareSlug) {
        setShareUrl(`${window.location.origin}/share/${result.shareSlug}`);
      } else if (result.downloadUrl) {
        const extension = result.format === "PDF" ? "pdf" : "docx";
        await exportsApi.downloadExportFile(
          result.downloadUrl,
          `${cv.title}.${extension}`,
        );
      }
    },
  });

  const handleSelectFormat = (f: ExportFormat) => {
    setFormat(f);
    setCopied(false);
    if (f === "LINK" && !shareUrl) {
      runExport.mutate("LINK");
    }
  };

  const handlePrimaryAction = () => {
    if (format === "LINK") {
      if (shareUrl) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      } else {
        runExport.mutate("LINK");
      }
    } else {
      runExport.mutate(format);
    }
  };

  return (
    <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-flat-soft w-full max-w-[560px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-lg border-b border-outline-variant">
          <div>
            <h2 className="text-headline-lg text-on-surface">Export Resume</h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              Choose your preferred format to download or share.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors h-10 w-10 flex items-center justify-center"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="p-lg flex flex-col gap-lg">
          {templateQuery.data && (
            <div className="flex items-center gap-3 p-md bg-secondary-fixed/30 border border-secondary-fixed-dim rounded-lg">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Icon
                  name={templateQuery.data.isAtsFriendly ? "verified" : "info"}
                  className="text-on-secondary !text-base"
                />
              </div>
              <div>
                <h4 className="text-label-md text-on-surface">
                  ATS Optimization Check
                </h4>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {templateQuery.data.isAtsFriendly
                    ? "Passes ATS scan. Your formatting is clean and parsable."
                    : "This template isn't marked ATS-friendly — some formatting may not parse cleanly."}
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-label-md text-on-surface-variant uppercase mb-md">
              Select Format
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleSelectFormat(f.value)}
                  className={cn(
                    "text-left border rounded-lg p-md flex flex-col items-start gap-md h-full transition-colors bg-surface-container-lowest",
                    format === f.value
                      ? "border-primary-container"
                      : "border-outline-variant hover:border-outline",
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={cn(
                        "h-10 w-10 rounded flex items-center justify-center",
                        f.iconBg,
                      )}
                    >
                      <Icon name={f.icon} filled className={f.iconColor} />
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all",
                        format === f.value
                          ? "border-primary-container border-[5px]"
                          : "border-outline-variant",
                      )}
                    />
                  </div>
                  <div>
                    <h4 className="text-headline-md text-on-surface">
                      {f.title}
                    </h4>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      {f.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {format === "LINK" && shareUrl && (
            <div className="flex items-center gap-sm p-sm border border-outline-variant rounded-lg bg-surface-container-low">
              <Icon name="link" className="text-on-surface-variant" />
              <span className="text-body-sm text-on-surface truncate flex-1">
                {shareUrl}
              </span>
            </div>
          )}

          {runExport.isError && (
            <p className="text-body-sm text-error">
              Something went wrong. Please try again.
            </p>
          )}
        </div>

        <div className="p-lg border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-end gap-md">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-lg py-2 border border-outline-variant text-on-surface bg-surface-container-lowest rounded-lg text-label-md hover:bg-surface-container-highest transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={runExport.isPending}
            onClick={handlePrimaryAction}
            className="w-full sm:w-auto px-lg py-2 bg-primary-container text-on-primary rounded-lg text-label-md hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {format === "LINK" ? (
              <>
                <Icon
                  name={copied ? "check" : "content_copy"}
                  className="!text-lg"
                />
                {runExport.isPending
                  ? "Getting link…"
                  : copied
                    ? "Copied!"
                    : "Copy Link"}
              </>
            ) : (
              <>
                <Icon name="download" className="!text-lg" />
                {runExport.isPending ? "Preparing…" : `Download ${format}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
