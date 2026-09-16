"use client";

import { type DragEvent, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  fileName?: string;
}

export function UploadDropzone({
  onFileSelected,
  isUploading,
  fileName,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag handlers are a visual-only enhancement; the real, keyboard-accessible control is the file input underneath
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`w-full relative border-2 border-dashed rounded-lg p-xl flex flex-col items-center justify-center transition-colors duration-200 ${
        isDragging
          ? "border-primary bg-primary-fixed"
          : "border-primary-container bg-surface-bright hover:bg-surface-container-low"
      } ${isUploading ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
    >
      <input
        ref={inputRef}
        accept=".pdf,.doc,.docx"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        type="file"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
      <div className="w-16 h-16 rounded-full bg-primary-fixed/20 flex items-center justify-center mb-md">
        <Icon name="upload_file" className="text-primary-container !text-3xl" />
      </div>

      {isUploading ? (
        <>
          <h3 className="text-headline-md text-on-surface mb-xs">
            Reading {fileName ?? "your CV"}…
          </h3>
          <p className="text-body-sm text-on-surface-variant flex items-center gap-xs">
            <Icon name="sync" className="!text-sm animate-spin" />
            This can take a few seconds
          </p>
        </>
      ) : (
        <>
          <h3 className="text-headline-md text-on-surface mb-xs">
            Drag your CV here or browse
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            Supported formats: PDF, DOCX
          </p>
          <button
            type="button"
            className="mt-md bg-primary-container text-on-primary rounded px-md py-sm text-label-md pointer-events-none relative z-20"
          >
            Select File
          </button>
        </>
      )}
    </div>
  );
}
