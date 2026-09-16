"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  CertificationFields,
  EducationFields,
  EntryFields,
  ExperienceFields,
  SectionType,
  SkillsFields,
  SummaryFields,
} from "@/lib/api/types";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

interface EntryFieldsFormProps {
  sectionType: SectionType;
  fields: EntryFields;
  onSave: (fields: EntryFields) => void;
}

export function EntryFieldsForm({
  sectionType,
  fields,
  onSave,
}: EntryFieldsFormProps) {
  const [local, setLocal] = useState(fields);
  const skillLevelId = useId();
  const debouncedSave = useDebouncedCallback(
    (next: EntryFields) => onSave(next),
    600,
  );

  // Entries can also be edited inline in the preview panel — when that PATCH
  // lands and refetches, this form's `fields` prop changes out from under it.
  // Re-sync unless the user currently has a field in this form focused, so an
  // edit made elsewhere doesn't get silently stuck showing stale text here.
  const isFocusedRef = useRef(false);
  useEffect(() => {
    if (!isFocusedRef.current) setLocal(fields);
  }, [fields]);

  const set = (patch: Partial<EntryFields>) => {
    const next = { ...local, ...patch } as EntryFields;
    setLocal(next);
    debouncedSave(next);
  };

  function renderFields() {
    if (sectionType === "SUMMARY") {
      const f = local as SummaryFields;
      return (
        <Textarea
          label="Summary"
          rows={4}
          maxLength={2000}
          value={f.text}
          onChange={(e) =>
            set({ text: e.target.value } as Partial<SummaryFields>)
          }
        />
      );
    }

    if (sectionType === "EXPERIENCE") {
      const f = local as ExperienceFields;
      return (
        <div className="space-y-sm">
          <Input
            label="Job title"
            value={f.jobTitle}
            onChange={(e) =>
              set({ jobTitle: e.target.value } as Partial<ExperienceFields>)
            }
          />
          <Input
            label="Company"
            value={f.company}
            onChange={(e) =>
              set({ company: e.target.value } as Partial<ExperienceFields>)
            }
          />
          <div className="grid grid-cols-2 gap-sm">
            <Input
              label="Start date"
              placeholder="Mar 2020"
              value={f.startDate}
              onChange={(e) =>
                set({ startDate: e.target.value } as Partial<ExperienceFields>)
              }
            />
            <Input
              label="End date"
              placeholder="Present"
              value={f.endDate ?? ""}
              disabled={f.isCurrent}
              onChange={(e) =>
                set({ endDate: e.target.value } as Partial<ExperienceFields>)
              }
            />
          </div>
          <label className="flex items-center gap-xs text-body-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={!!f.isCurrent}
              onChange={(e) =>
                set({
                  isCurrent: e.target.checked,
                  endDate: e.target.checked ? "" : f.endDate,
                } as Partial<ExperienceFields>)
              }
              className="rounded-sm border-outline-variant text-primary-container focus:ring-primary-container"
            />
            I currently work here
          </label>
          <Textarea
            label="Description"
            rows={4}
            value={f.description}
            onChange={(e) =>
              set({ description: e.target.value } as Partial<ExperienceFields>)
            }
          />
        </div>
      );
    }

    if (sectionType === "EDUCATION") {
      const f = local as EducationFields;
      return (
        <div className="space-y-sm">
          <Input
            label="Degree"
            value={f.degree}
            onChange={(e) =>
              set({ degree: e.target.value } as Partial<EducationFields>)
            }
          />
          <Input
            label="School"
            value={f.school}
            onChange={(e) =>
              set({ school: e.target.value } as Partial<EducationFields>)
            }
          />
          <div className="grid grid-cols-2 gap-sm">
            <Input
              label="Start date"
              placeholder="Sep 2016"
              value={f.startDate}
              onChange={(e) =>
                set({ startDate: e.target.value } as Partial<EducationFields>)
              }
            />
            <Input
              label="End date"
              placeholder="Jun 2020"
              value={f.endDate ?? ""}
              onChange={(e) =>
                set({ endDate: e.target.value } as Partial<EducationFields>)
              }
            />
          </div>
        </div>
      );
    }

    if (sectionType === "SKILLS") {
      const f = local as SkillsFields;
      return (
        <div className="grid grid-cols-2 gap-sm">
          <Input
            label="Skill"
            value={f.name}
            onChange={(e) =>
              set({ name: e.target.value } as Partial<SkillsFields>)
            }
          />
          <div>
            <label
              className="block text-label-md text-on-surface-variant mb-xs"
              htmlFor={skillLevelId}
            >
              Level
            </label>
            <select
              id={skillLevelId}
              value={f.level ?? ""}
              onChange={(e) =>
                set({
                  // Explicit null (not undefined) so it survives JSON.stringify and
                  // actually clears the field server-side — a merge-patch can't
                  // remove a key that's simply missing from the body.
                  level: (e.target.value || null) as SkillsFields["level"],
                } as Partial<SkillsFields>)
              }
              className="w-full h-10 px-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary-container"
            >
              <option value="">Unspecified</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      );
    }

    if (sectionType === "CERTIFICATIONS") {
      const f = local as CertificationFields;
      return (
        <div className="space-y-sm">
          <Input
            label="Certification"
            value={f.name}
            onChange={(e) =>
              set({ name: e.target.value } as Partial<CertificationFields>)
            }
          />
          <div className="grid grid-cols-2 gap-sm">
            <Input
              label="Issuer"
              value={f.issuer ?? ""}
              onChange={(e) =>
                set({ issuer: e.target.value } as Partial<CertificationFields>)
              }
            />
            <Input
              label="Date"
              placeholder="Jun 2023"
              value={f.date ?? ""}
              onChange={(e) =>
                set({ date: e.target.value } as Partial<CertificationFields>)
              }
            />
          </div>
        </div>
      );
    }

    // CUSTOM
    const f = local as { title?: string; text: string };
    return (
      <div className="space-y-sm">
        <Input
          label="Title"
          value={f.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
        />
        <Textarea
          label="Text"
          rows={4}
          value={f.text}
          onChange={(e) => set({ text: e.target.value })}
        />
      </div>
    );
  }

  return (
    <div
      onFocusCapture={() => {
        isFocusedRef.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          isFocusedRef.current = false;
        }
      }}
    >
      {renderFields()}
    </div>
  );
}
