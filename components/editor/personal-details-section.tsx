"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import * as cvsApi from "@/lib/api/cvs";
import type { ContactInfo } from "@/lib/api/types";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

interface PersonalDetailsSectionProps {
  cvId: string;
  contactInfo: ContactInfo | null;
}

const EMPTY: ContactInfo = { fullName: "" };

export function PersonalDetailsSection({
  cvId,
  contactInfo,
}: PersonalDetailsSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [local, setLocal] = useState<ContactInfo>(contactInfo ?? EMPTY);
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (payload: ContactInfo) =>
      cvsApi.updateCv(cvId, { contactInfoJson: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cv", cvId] }),
  });
  const debouncedSave = useDebouncedCallback(
    (payload: ContactInfo) => save.mutate(payload),
    600,
  );

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
