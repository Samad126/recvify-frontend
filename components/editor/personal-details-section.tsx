"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import * as cvsApi from "@/lib/api/cvs";
import type { ContactInfo } from "@/lib/api/types";
import { API_BASE_URL } from "@/lib/config";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

interface PersonalDetailsSectionProps {
  cvId: string;
  contactInfo: ContactInfo | null;
  photoUrl: string | null;
}

const EMPTY: ContactInfo = { fullName: "" };

export function PersonalDetailsSection({
  cvId,
  contactInfo,
  photoUrl,
}: PersonalDetailsSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [local, setLocal] = useState<ContactInfo>(contactInfo ?? EMPTY);
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const save = useMutation({
    mutationFn: (payload: ContactInfo) =>
      cvsApi.updateCv(cvId, { contactInfoJson: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cv", cvId] }),
  });
  const debouncedSave = useDebouncedCallback(
    (payload: ContactInfo) => save.mutate(payload),
    600,
  );

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => cvsApi.uploadCvPhoto(cvId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cv", cvId] }),
  });
  const removePhoto = useMutation({
    mutationFn: () => cvsApi.deleteCvPhoto(cvId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cv", cvId] }),
  });

  // Contact fields can also be edited inline in the preview panel — re-sync
  // from props when that happens, unless this form currently has focus.
  const isFocusedRef = useRef(false);
  useEffect(() => {
    if (!isFocusedRef.current) setLocal(contactInfo ?? EMPTY);
  }, [contactInfo]);

  const set = (patch: Partial<ContactInfo>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    debouncedSave(next);
  };

  return (
    <div
      className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden"
      onFocusCapture={() => {
        isFocusedRef.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          isFocusedRef.current = false;
        }
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={`w-full flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group ${
          expanded ? "bg-surface-bright border-b border-outline-variant" : ""
        }`}
      >
        <div className="flex items-center gap-sm text-on-surface text-headline-md">
          <Icon
            name="person"
            className="text-outline group-hover:text-on-surface-variant"
          />
          Personal Details
        </div>
        <Icon
          name="expand_more"
          className={`text-outline transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="p-md space-y-md">
          <div className="flex items-center gap-md">
            <div className="size-16 rounded-full overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
              {photoUrl ? (
                // biome-ignore lint/performance/noImgElement: user-uploaded photo, no next/image domain config for it
                <img
                  src={`${API_BASE_URL}${photoUrl}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon name="person" className="text-outline !text-2xl" />
              )}
            </div>
            <div className="flex flex-col gap-xs">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto.mutate(file);
                  e.target.value = "";
                }}
              />
              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadPhoto.isPending}
                  className="text-label-md text-primary-container hover:text-primary transition-colors disabled:opacity-50"
                >
                  {uploadPhoto.isPending
                    ? "Uploading…"
                    : photoUrl
                      ? "Replace photo"
                      : "Upload photo"}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => removePhoto.mutate()}
                    disabled={removePhoto.isPending}
                    className="text-label-md text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              {uploadPhoto.isError && (
                <p className="text-body-sm text-error">
                  Couldn't upload that photo — JPEG/PNG/WebP, up to 5MB.
                </p>
              )}
            </div>
          </div>
          <Input
            label="Full name"
            value={local.fullName}
            onChange={(e) => set({ fullName: e.target.value })}
          />
          <Input
            label="Professional title"
            value={local.title ?? ""}
            onChange={(e) => set({ title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-md">
            <Input
              label="Email"
              type="email"
              value={local.email ?? ""}
              onChange={(e) => set({ email: e.target.value })}
            />
            <Input
              label="Phone"
              value={local.phone ?? ""}
              onChange={(e) => set({ phone: e.target.value })}
            />
          </div>
          <Input
            label="Location"
            value={local.location ?? ""}
            onChange={(e) => set({ location: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
