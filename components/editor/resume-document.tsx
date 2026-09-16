"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type {
  CertificationFields,
  ContactInfo,
  CvSection,
  EducationFields,
  EntryFieldStyles,
  ExperienceFields,
  SkillsFields,
  StyleOverrides,
  SummaryFields,
  TemplateDetail,
} from "@/lib/api/types";
import { API_BASE_URL } from "@/lib/config";
import { SECTION_META } from "@/lib/constants/section-meta";
import { fieldCss, resolveStyle } from "@/lib/utils/style-cascade";
import { EditableText } from "./editable-text";
import { ElementStylePopover } from "./element-style-popover";

/** Present only in editor mode — omitted (and every text node rendered static) on the public share page. */
export interface EditHandlers {
  onEditContact?: (patch: Partial<ContactInfo>) => void;
  onEditEntryField?: (
    sectionId: string,
    entryId: string,
    patch: Record<string, unknown>,
  ) => void;
  /** fieldKey scopes the style to just that one piece of text within the entry (e.g. "jobTitle" vs "company"). */
  onEntryFieldStyleChange?: (
    sectionId: string,
    entryId: string,
    fieldKey: string,
    style: StyleOverrides,
  ) => void;
  onSectionTitleChange?: (sectionId: string, title: string) => void;
  onSectionStyleChange?: (sectionId: string, style: StyleOverrides) => void;
  /** The header has no section/entry of its own — fieldKey is "fullName" | "title" | "email" | "phone" | "location". */
  onHeaderFieldStyleChange?: (fieldKey: string, style: StyleOverrides) => void;
}

/** Wraps one text node so a focus-within on it reveals its own, independently-scoped style popover. */
function StyleGroup({
  editable,
  label,
  override,
  onStyleChange,
  className,
  inline,
  children,
}: {
  editable: boolean;
  label: string;
  override: StyleOverrides | null | undefined;
  onStyleChange?: (style: StyleOverrides) => void;
  className?: string;
  inline?: boolean;
  children: ReactNode;
}) {
  const Tag = inline ? "span" : "div";
  if (!editable || !onStyleChange) {
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <Tag
      className={`group relative ${inline ? "inline-block" : ""} ${className ?? ""}`}
    >
      <ElementStylePopover
        label={label}
        override={override}
        onChange={onStyleChange}
      />
      {children}
    </Tag>
  );
}

function SectionBody({
  section,
  editable,
  styleLayers,
  handlers,
}: {
  section: CvSection;
  editable: boolean;
  styleLayers: (StyleOverrides | null | undefined)[];
  handlers: EditHandlers;
}) {
  const entries = [...section.entries].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const editField = (entryId: string, patch: Record<string, unknown>) =>
    handlers.onEditEntryField?.(section.id, entryId, patch);
  const fieldStyle = (fieldStyles: EntryFieldStyles | null, key: string) =>
    resolveStyle(...styleLayers, fieldStyles?.[key]);
  const setFieldStyle = (entryId: string, key: string, style: StyleOverrides) =>
    handlers.onEntryFieldStyleChange?.(section.id, entryId, key, style);

  if (section.sectionType === "SUMMARY") {
    return (
      <>
        {entries.map((entry) => {
          const f = entry.fieldsJson as SummaryFields;
          const fs = entry.styleOverridesJson;
          const s = fieldStyle(fs, "text");
          return (
            <StyleGroup
              key={entry.id}
              editable={editable}
              label="Summary"
              override={fs?.text}
              onStyleChange={(v) => setFieldStyle(entry.id, "text", v)}
            >
              <EditableText
                as="p"
                editable={editable}
                multiline
                value={f.text}
                placeholder="Write a short professional summary…"
                onCommit={(text) => editField(entry.id, { text })}
                className="text-body-md text-on-surface-variant whitespace-pre-line"
                style={fieldCss(s, 14)}
              />
            </StyleGroup>
          );
        })}
      </>
    );
  }

  if (section.sectionType === "EXPERIENCE") {
    return (
      <div className="space-y-md">
        {entries.map((entry) => {
          const f = entry.fieldsJson as ExperienceFields;
          const fs = entry.styleOverridesJson;
          const title = fieldStyle(fs, "jobTitle");
          const company = fieldStyle(fs, "company");
          const desc = fieldStyle(fs, "description");
          const startDateStyle = fieldStyle(fs, "startDate");
          const endDateStyle = fieldStyle(fs, "endDate");
          return (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline mb-xs gap-sm">
                <StyleGroup
                  editable={editable}
                  label="Job title"
                  override={fs?.jobTitle}
                  onStyleChange={(v) => setFieldStyle(entry.id, "jobTitle", v)}
                >
                  <EditableText
                    as="h3"
                    editable={editable}
                    value={f.jobTitle}
                    placeholder="Job title"
                    onCommit={(jobTitle) => editField(entry.id, { jobTitle })}
                    className="text-[16px] text-on-surface font-semibold"
                    style={fieldCss(title, 16)}
                  />
                </StyleGroup>
                <span className="text-body-sm text-on-surface-variant whitespace-nowrap flex items-center gap-xs">
                  <StyleGroup
                    editable={editable}
                    label="Start date"
                    override={fs?.startDate}
                    onStyleChange={(v) =>
                      setFieldStyle(entry.id, "startDate", v)
                    }
                    inline
                  >
                    <EditableText
                      editable={editable}
                      value={f.startDate}
                      placeholder="Start"
                      onCommit={(startDate) =>
                        editField(entry.id, { startDate })
                      }
                      style={fieldCss(startDateStyle, 13)}
                    />
                  </StyleGroup>
                  {" - "}
                  {f.isCurrent ? (
                    "Present"
                  ) : (
                    <StyleGroup
                      editable={editable}
                      label="End date"
                      override={fs?.endDate}
                      onStyleChange={(v) =>
                        setFieldStyle(entry.id, "endDate", v)
                      }
                      inline
                    >
                      <EditableText
                        editable={editable}
                        value={f.endDate ?? ""}
                        placeholder="End"
                        onCommit={(endDate) => editField(entry.id, { endDate })}
                        style={fieldCss(endDateStyle, 13)}
                      />
                    </StyleGroup>
                  )}
                </span>
              </div>
              <StyleGroup
                editable={editable}
                label="Company"
                override={fs?.company}
                onStyleChange={(v) => setFieldStyle(entry.id, "company", v)}
                inline
                className="mb-sm"
              >
                <EditableText
                  as="p"
                  editable={editable}
                  value={f.company}
                  placeholder="Company"
                  onCommit={(company) => editField(entry.id, { company })}
                  className="text-body-md inline-block"
                  style={fieldCss(company, 14, true)}
                />
              </StyleGroup>
              <StyleGroup
                editable={editable}
                label="Description"
                override={fs?.description}
                onStyleChange={(v) => setFieldStyle(entry.id, "description", v)}
              >
                <EditableText
                  as="p"
                  editable={editable}
                  multiline
                  value={f.description}
                  placeholder="What did you do in this role?"
                  onCommit={(description) =>
                    editField(entry.id, { description })
                  }
                  className="text-body-md text-on-surface-variant whitespace-pre-line"
                  style={fieldCss(desc, 14)}
                />
              </StyleGroup>
            </div>
          );
        })}
      </div>
    );
  }

  if (section.sectionType === "EDUCATION") {
    return (
      <div className="space-y-md">
        {entries.map((entry) => {
          const f = entry.fieldsJson as EducationFields;
          const fs = entry.styleOverridesJson;
          const degree = fieldStyle(fs, "degree");
          const school = fieldStyle(fs, "school");
          const eduStart = fieldStyle(fs, "startDate");
          const eduEnd = fieldStyle(fs, "endDate");
          return (
            <div
              key={entry.id}
              className="flex justify-between items-baseline gap-sm"
            >
              <div>
                <StyleGroup
                  editable={editable}
                  label="Degree"
                  override={fs?.degree}
                  onStyleChange={(v) => setFieldStyle(entry.id, "degree", v)}
                >
                  <EditableText
                    as="h3"
                    editable={editable}
                    value={f.degree}
                    placeholder="Degree"
                    onCommit={(degree) => editField(entry.id, { degree })}
                    className="text-[16px] text-on-surface font-semibold"
                    style={fieldCss(degree, 16)}
                  />
                </StyleGroup>
                <StyleGroup
                  editable={editable}
                  label="School"
                  override={fs?.school}
                  onStyleChange={(v) => setFieldStyle(entry.id, "school", v)}
                >
                  <EditableText
                    as="p"
                    editable={editable}
                    value={f.school}
                    placeholder="School"
                    onCommit={(school) => editField(entry.id, { school })}
                    className="text-body-md"
                    style={fieldCss(school, 14, true)}
                  />
                </StyleGroup>
              </div>
              <span className="text-body-sm text-on-surface-variant whitespace-nowrap flex items-center gap-xs">
                <StyleGroup
                  editable={editable}
                  label="Start date"
                  override={fs?.startDate}
                  onStyleChange={(v) => setFieldStyle(entry.id, "startDate", v)}
                  inline
                >
                  <EditableText
                    editable={editable}
                    value={f.startDate}
                    placeholder="Start"
                    onCommit={(startDate) => editField(entry.id, { startDate })}
                    style={fieldCss(eduStart, 13)}
                  />
                </StyleGroup>
                {" - "}
                <StyleGroup
                  editable={editable}
                  label="End date"
                  override={fs?.endDate}
                  onStyleChange={(v) => setFieldStyle(entry.id, "endDate", v)}
                  inline
                >
                  <EditableText
                    editable={editable}
                    value={f.endDate ?? ""}
                    placeholder="End"
                    onCommit={(endDate) => editField(entry.id, { endDate })}
                    style={fieldCss(eduEnd, 13)}
                  />
                </StyleGroup>
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (section.sectionType === "SKILLS") {
    return (
      <div className="flex flex-wrap gap-xs">
        {entries.map((entry) => {
          const f = entry.fieldsJson as SkillsFields;
          const fs = entry.styleOverridesJson;
          const s = fieldStyle(fs, "name");
          return (
            <StyleGroup
              key={entry.id}
              editable={editable}
              label="Skill"
              override={fs?.name}
              onStyleChange={(v) => setFieldStyle(entry.id, "name", v)}
              inline
            >
              <span
                className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant text-label-md px-2 py-1 rounded"
                style={fieldCss(s, 12)}
              >
                <EditableText
                  editable={editable}
                  value={f.name}
                  placeholder="Skill"
                  onCommit={(name) => editField(entry.id, { name })}
                />
                {f.level ? ` · ${f.level}` : ""}
              </span>
            </StyleGroup>
          );
        })}
      </div>
    );
  }

  if (section.sectionType === "CERTIFICATIONS") {
    return (
      <div className="space-y-sm">
        {entries.map((entry) => {
          const f = entry.fieldsJson as CertificationFields;
          const fs = entry.styleOverridesJson;
          const name = fieldStyle(fs, "name");
          const issuer = fieldStyle(fs, "issuer");
          const date = fieldStyle(fs, "date");
          return (
            <div
              key={entry.id}
              className="flex justify-between items-baseline gap-sm"
            >
              <StyleGroup
                editable={editable}
                label="Certification"
                override={fs?.name}
                onStyleChange={(v) => setFieldStyle(entry.id, "name", v)}
                inline
              >
                <EditableText
                  as="span"
                  editable={editable}
                  value={f.name}
                  placeholder="Certification"
                  onCommit={(name) => editField(entry.id, { name })}
                  className="text-body-md text-on-surface"
                  style={fieldCss(name, 14)}
                />
              </StyleGroup>
              <span className="text-body-sm text-on-surface-variant whitespace-nowrap flex items-center gap-xs">
                <StyleGroup
                  editable={editable}
                  label="Issuer"
                  override={fs?.issuer}
                  onStyleChange={(v) => setFieldStyle(entry.id, "issuer", v)}
                  inline
                >
                  <EditableText
                    editable={editable}
                    value={f.issuer ?? ""}
                    placeholder="Issuer"
                    onCommit={(issuer) => editField(entry.id, { issuer })}
                    style={fieldCss(issuer, 13)}
                  />
                </StyleGroup>
                <StyleGroup
                  editable={editable}
                  label="Date"
                  override={fs?.date}
                  onStyleChange={(v) => setFieldStyle(entry.id, "date", v)}
                  inline
                >
                  <EditableText
                    editable={editable}
                    value={f.date ?? ""}
                    placeholder="Date"
                    onCommit={(date) => editField(entry.id, { date })}
                    style={fieldCss(date, 13)}
                  />
                </StyleGroup>
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {entries.map((entry) => {
        const f = entry.fieldsJson as { title?: string; text: string };
        const fs = entry.styleOverridesJson;
        const title = fieldStyle(fs, "title");
        const text = fieldStyle(fs, "text");
        return (
          <div key={entry.id}>
            <StyleGroup
              editable={editable}
              label="Title"
              override={fs?.title}
              onStyleChange={(v) => setFieldStyle(entry.id, "title", v)}
            >
              <EditableText
                as="h3"
                editable={editable}
                value={f.title ?? ""}
                placeholder="Title"
                onCommit={(t) => editField(entry.id, { title: t })}
                className="text-[16px] text-on-surface font-semibold mb-xs"
                style={fieldCss(title, 16)}
              />
            </StyleGroup>
            <StyleGroup
              editable={editable}
              label="Text"
              override={fs?.text}
              onStyleChange={(v) => setFieldStyle(entry.id, "text", v)}
            >
              <EditableText
                as="p"
                editable={editable}
                multiline
                value={f.text}
                placeholder="Text"
                onCommit={(t) => editField(entry.id, { text: t })}
                className="text-body-md text-on-surface-variant whitespace-pre-line"
                style={fieldCss(text, 14)}
              />
            </StyleGroup>
          </div>
        );
      })}
    </div>
  );
}

function isSidebarSection(
  structure: TemplateDetail["structureJson"] | undefined,
  sectionType: CvSection["sectionType"],
): boolean {
  const entry = structure?.sections?.find(
    (s) => s.type === sectionType.toLowerCase(),
  );
  return entry?.position === "sidebar";
}

function SectionBlock({
  section,
  editable,
  cvStyle,
  templateLayer,
  handlers,
  sidebar,
}: {
  section: CvSection;
  editable: boolean;
  cvStyle: StyleOverrides | null | undefined;
  templateLayer: StyleOverrides;
  handlers: EditHandlers;
  sidebar?: boolean;
}) {
  const sectionStyle = resolveStyle(
    templateLayer,
    cvStyle,
    section.styleOverridesJson,
  );
  return (
    <div key={section.id}>
      <StyleGroup
        editable={editable}
        label="Section header"
        override={section.styleOverridesJson}
        onStyleChange={(s) => handlers.onSectionStyleChange?.(section.id, s)}
      >
        <EditableText
          as="h2"
          editable={editable}
          value={section.title || SECTION_META[section.sectionType].label}
          placeholder={SECTION_META[section.sectionType].label}
          onCommit={(title) =>
            handlers.onSectionTitleChange?.(section.id, title)
          }
          className={`uppercase tracking-wider text-[14px] border-b pb-xs mb-md ${
            sidebar
              ? "text-on-surface border-outline-variant/70"
              : "text-on-surface border-outline-variant"
          }`}
          style={fieldCss(sectionStyle, 14, true)}
        />
      </StyleGroup>
      <SectionBody
        section={section}
        editable={editable}
        styleLayers={[templateLayer, cvStyle, section.styleOverridesJson]}
        handlers={handlers}
      />
    </div>
  );
}

export interface ResumeDocumentData {
  contactInfoJson: ContactInfo | null;
  sections: CvSection[];
  styleOverridesJson: StyleOverrides | null;
  /** Relative URL served by the backend (e.g. "/photos/xyz.jpg") — the caller prefixes it with API_BASE_URL. */
  photoUrl?: string | null;
  /** Drives layout (single/two-column + sidebar membership) and the per-template default font/color. */
  template?: TemplateDetail;
}

/** The "paper" resume rendering — shared by the editor's live preview and the public share page. */
export function ResumeDocument({
  contactInfoJson,
  sections,
  styleOverridesJson,
  photoUrl,
  template,
  editable = false,
  ...handlers
}: ResumeDocumentData & { editable?: boolean } & EditHandlers) {
  const templateLayer: StyleOverrides = {
    accentColor: template?.structureJson.accentColor,
    fontFamily: template?.structureJson.font,
  };
  const fieldOverrides = styleOverridesJson?.fieldOverrides;
  const titleStyle = resolveStyle(
    templateLayer,
    styleOverridesJson,
    fieldOverrides?.title,
  );
  const bodyStyle = resolveStyle(templateLayer, styleOverridesJson);
  const contact = contactInfoJson;
  const sortedSections = [...sections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const isTwoColumn = template?.structureJson.layout === "two-column";
  const mainSections = isTwoColumn
    ? sortedSections.filter(
        (s) => !isSidebarSection(template?.structureJson, s.sectionType),
      )
    : sortedSections;
  const sidebarSections = isTwoColumn
    ? sortedSections.filter((s) =>
        isSidebarSection(template?.structureJson, s.sectionType),
      )
    : [];

  const editContact = (patch: Partial<ContactInfo>) =>
    handlers.onEditContact?.(patch);
  const headerFieldStyle = (key: string, style: StyleOverrides) =>
    handlers.onHeaderFieldStyleChange?.(key, style);
  // Name/contact-line stay neutral by default (no template-driven tint) —
  // only an *explicit* accent (per-field or CV-wide) colors them, unlike the
  // title which inherits the template's accent like every other styled run.
  const neutralFont = (key: string) =>
    resolveStyle(templateLayer, styleOverridesJson, fieldOverrides?.[key]);

  const isDark = styleOverridesJson?.theme === "dark";

  return (
    <div
      className="bg-surface-container-lowest w-[794px] min-h-[1123px] shadow-flat-soft ring-1 ring-outline-variant/50 p-xl flex flex-col shrink-0"
      style={{
        fontSize: bodyStyle.fontSize ? `${bodyStyle.fontSize}px` : undefined,
        fontFamily: bodyStyle.fontFamily,
        // Tailwind v4 @theme tokens are real custom properties — overriding them
        // here cascades a dark palette to every text-on-surface/etc. utility below,
        // instead of the previous no-op "theme" toggle that only the PDF export obeyed.
        ...(isDark
          ? ({
              "--color-surface-container-lowest": "#1a1a1a",
              "--color-surface-container": "#2a2a2a",
              "--color-on-surface": "#e5e5e5",
              "--color-on-surface-variant": "#b3b3b3",
              "--color-outline-variant": "#444444",
              "--color-outline": "#666666",
            } as CSSProperties)
          : undefined),
      }}
    >
      <div className="border-b-2 border-on-surface pb-md mb-lg flex items-center gap-md">
        {photoUrl && (
          // biome-ignore lint/performance/noImgElement: user-uploaded photo, no next/image domain config for it
          <img
            src={`${API_BASE_URL}${photoUrl}`}
            alt=""
            className="size-[84px] rounded-full object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <StyleGroup
            editable={editable}
            label="Name"
            override={fieldOverrides?.fullName}
            onStyleChange={(s) => headerFieldStyle("fullName", s)}
          >
            <EditableText
              as="h1"
              editable={editable}
              value={contact?.fullName || ""}
              placeholder="Your Name"
              onCommit={(fullName) => editContact({ fullName })}
              className="text-headline-xl text-on-surface uppercase tracking-tight"
              style={fieldCss(neutralFont("fullName"), 32)}
            />
          </StyleGroup>
          <StyleGroup
            editable={editable}
            label="Title"
            override={fieldOverrides?.title}
            onStyleChange={(s) => headerFieldStyle("title", s)}
          >
            <EditableText
              as="p"
              editable={editable}
              value={contact?.title ?? ""}
              placeholder="Professional title"
              onCommit={(title) => editContact({ title })}
              className="text-headline-md mt-xs"
              style={fieldCss(titleStyle, 18, true)}
            />
          </StyleGroup>
          <div className="flex flex-wrap gap-md mt-sm text-on-surface-variant text-body-sm">
            {(editable || contact?.email) && (
              <span className="flex items-center gap-xs">
                <Icon name="mail" className="!text-sm" />
                <StyleGroup
                  editable={editable}
                  label="Email"
                  override={fieldOverrides?.email}
                  onStyleChange={(s) => headerFieldStyle("email", s)}
                  inline
                >
                  <EditableText
                    editable={editable}
                    value={contact?.email ?? ""}
                    placeholder="email@example.com"
                    onCommit={(email) => editContact({ email })}
                    style={fieldCss(neutralFont("email"), 13)}
                  />
                </StyleGroup>
              </span>
            )}
            {(editable || contact?.phone) && (
              <span className="flex items-center gap-xs">
                <Icon name="call" className="!text-sm" />
                <StyleGroup
                  editable={editable}
                  label="Phone"
                  override={fieldOverrides?.phone}
                  onStyleChange={(s) => headerFieldStyle("phone", s)}
                  inline
                >
                  <EditableText
                    editable={editable}
                    value={contact?.phone ?? ""}
                    placeholder="Phone"
                    onCommit={(phone) => editContact({ phone })}
                    style={fieldCss(neutralFont("phone"), 13)}
                  />
                </StyleGroup>
              </span>
            )}
            {(editable || contact?.location) && (
              <span className="flex items-center gap-xs">
                <Icon name="location_on" className="!text-sm" />
                <StyleGroup
                  editable={editable}
                  label="Location"
                  override={fieldOverrides?.location}
                  onStyleChange={(s) => headerFieldStyle("location", s)}
                  inline
                >
                  <EditableText
                    editable={editable}
                    value={contact?.location ?? ""}
                    placeholder="Location"
                    onCommit={(location) => editContact({ location })}
                    style={fieldCss(neutralFont("location"), 13)}
                  />
                </StyleGroup>
              </span>
            )}
          </div>
        </div>
      </div>

      {sortedSections.length === 0 && (
        <p className="text-body-sm text-on-surface-variant">
          Add sections on the left to see your resume take shape here.
        </p>
      )}

      {isTwoColumn ? (
        <div className="flex-1 flex gap-lg items-start">
          <div className="flex-[2] space-y-lg min-w-0">
            {mainSections.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                editable={editable}
                cvStyle={styleOverridesJson}
                templateLayer={templateLayer}
                handlers={handlers}
              />
            ))}
          </div>
          {sidebarSections.length > 0 && (
            <div className="flex-1 space-y-lg min-w-0 bg-surface-container/60 rounded-lg p-md -mt-1">
              {sidebarSections.map((section) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  editable={editable}
                  cvStyle={styleOverridesJson}
                  templateLayer={templateLayer}
                  handlers={handlers}
                  sidebar
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-lg">
          {sortedSections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              editable={editable}
              cvStyle={styleOverridesJson}
              templateLayer={templateLayer}
              handlers={handlers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
