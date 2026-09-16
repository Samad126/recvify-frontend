"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as cvsApi from "@/lib/api/cvs";
import type { ContactInfo, CvDetail, StyleOverrides } from "@/lib/api/types";
import { ResumeDocument } from "./resume-document";
import { StyleToolbar } from "./style-toolbar";

export function PreviewPanel({ cv }: { cv: CvDetail }) {
  const [zoom, setZoom] = useState(100);
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["cv", cv.id] });

  const editContact = useMutation({
    mutationFn: (patch: Partial<ContactInfo>) =>
      cvsApi.updateCv(cv.id, {
        contactInfoJson: { fullName: "", ...cv.contactInfoJson, ...patch },
      }),
    onSuccess: invalidate,
  });

  const editEntryField = useMutation({
    mutationFn: ({
      sectionId,
      entryId,
      patch,
    }: {
      sectionId: string;
      entryId: string;
      patch: Record<string, unknown>;
    }) => cvsApi.updateEntry(cv.id, sectionId, entryId, patch),
    onSuccess: invalidate,
  });

  const entryStyle = useMutation({
    mutationFn: ({
      sectionId,
      entryId,
      style,
    }: {
      sectionId: string;
      entryId: string;
      style: StyleOverrides;
    }) => cvsApi.updateEntryStyle(cv.id, sectionId, entryId, style),
    onSuccess: invalidate,
  });

  const sectionTitle = useMutation({
    mutationFn: ({ sectionId, title }: { sectionId: string; title: string }) =>
      cvsApi.updateSection(cv.id, sectionId, { title }),
    onSuccess: invalidate,
  });

  const sectionStyle = useMutation({
    mutationFn: ({
      sectionId,
      style,
    }: {
      sectionId: string;
      style: StyleOverrides;
    }) => cvsApi.updateSectionStyle(cv.id, sectionId, style),
    onSuccess: invalidate,
  });

  return (
    <section className="flex-1 bg-surface-container relative flex flex-col">
      <StyleToolbar cv={cv} zoom={zoom} onZoomChange={setZoom} />

      <div className="flex-1 overflow-auto p-xl flex justify-center bg-surface-container">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <ResumeDocument
            contactInfoJson={cv.contactInfoJson}
            sections={cv.sections}
            styleOverridesJson={cv.styleOverridesJson}
            template={cv.template}
            editable
            onEditContact={(patch) => editContact.mutate(patch)}
            onEditEntryField={(sectionId, entryId, patch) =>
              editEntryField.mutate({ sectionId, entryId, patch })
            }
            onEntryStyleChange={(sectionId, entryId, style) =>
              entryStyle.mutate({ sectionId, entryId, style })
            }
            onSectionTitleChange={(sectionId, title) =>
              sectionTitle.mutate({ sectionId, title })
            }
            onSectionStyleChange={(sectionId, style) =>
              sectionStyle.mutate({ sectionId, style })
            }
          />
        </div>
      </div>
    </section>
  );
}
