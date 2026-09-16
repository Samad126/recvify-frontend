"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as cvsApi from "@/lib/api/cvs";
import type {
  ContactInfo,
  CvDetail,
  EntryFieldStyles,
  StyleOverrides,
} from "@/lib/api/types";
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

  // The backend replaces styleOverridesJson wholesale, so a single-field patch
  // has to be merged into the entry's current field-style map client-side first.
  const entryFieldStyle = useMutation({
    mutationFn: ({
      sectionId,
      entryId,
      fieldKey,
      style,
    }: {
      sectionId: string;
      entryId: string;
      fieldKey: string;
      style: StyleOverrides;
    }) => {
      const entry = cv.sections
        .find((s) => s.id === sectionId)
        ?.entries.find((e) => e.id === entryId);
      const next: EntryFieldStyles = {
        ...entry?.styleOverridesJson,
        [fieldKey]: style,
      };
      return cvsApi.updateEntryStyle(cv.id, sectionId, entryId, next);
    },
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

  // The header has no section/entry of its own — each of its fields (name,
  // title, email, ...) gets its own slot in cv.styleOverridesJson.fieldOverrides,
  // alongside the CV-wide base style the top toolbar edits.
  const headerFieldStyle = useMutation({
    mutationFn: ({
      fieldKey,
      style,
    }: {
      fieldKey: string;
      style: StyleOverrides;
    }) =>
      cvsApi.updateCv(cv.id, {
        styleOverridesJson: {
          ...cv.styleOverridesJson,
          fieldOverrides: {
            ...cv.styleOverridesJson?.fieldOverrides,
            [fieldKey]: style,
          },
        },
      }),
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
            onEntryFieldStyleChange={(sectionId, entryId, fieldKey, style) =>
              entryFieldStyle.mutate({ sectionId, entryId, fieldKey, style })
            }
            onSectionTitleChange={(sectionId, title) =>
              sectionTitle.mutate({ sectionId, title })
            }
            onSectionStyleChange={(sectionId, style) =>
              sectionStyle.mutate({ sectionId, style })
            }
            onHeaderFieldStyleChange={(fieldKey, style) =>
              headerFieldStyle.mutate({ fieldKey, style })
            }
          />
        </div>
      </div>
    </section>
  );
}
