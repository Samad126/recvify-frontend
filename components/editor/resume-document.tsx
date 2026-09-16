import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type {
  CertificationFields,
  ContactInfo,
  CvSection,
  EducationFields,
  ExperienceFields,
  SkillsFields,
  StyleOverrides,
  SummaryFields,
  TemplateDetail,
} from "@/lib/api/types";
import { SECTION_META } from "@/lib/constants/section-meta";
import { resolveStyle } from "@/lib/utils/style-cascade";
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
  onEntryStyleChange?: (
    sectionId: string,
    entryId: string,
    style: StyleOverrides,
  ) => void;
  onSectionTitleChange?: (sectionId: string, title: string) => void;
  onSectionStyleChange?: (sectionId: string, style: StyleOverrides) => void;
}

/** Wraps one entry/section so a focus-within on any of its editable text nodes reveals its own style popover. */
function StyleGroup({
  editable,
  label,
  override,
  onStyleChange,
  className,
  children,
}: {
  editable: boolean;
  label: string;
  override: StyleOverrides | null | undefined;
  onStyleChange?: (style: StyleOverrides) => void;
  className?: string;
  children: ReactNode;
}) {
  if (!editable || !onStyleChange) {
    return <div className={className}>{children}</div>;
  }
  return (
    <div className={`group relative ${className ?? ""}`}>
      <ElementStylePopover
        label={label}
        override={override}
        onChange={onStyleChange}
      />
      {children}
    </div>
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
  const entryStyle = (entryId: string, style: StyleOverrides) =>
    handlers.onEntryStyleChange?.(section.id, entryId, style);

  if (section.sectionType === "SUMMARY") {
    return (
      <>
        {entries.map((entry) => {
          const f = entry.fieldsJson as SummaryFields;
          const style = resolveStyle(...styleLayers, entry.styleOverridesJson);
          return (
            <StyleGroup
              key={entry.id}
              editable={editable}
              label="Summary"
              override={entry.styleOverridesJson}
              onStyleChange={(s) => entryStyle(entry.id, s)}
            >
              <EditableText
                as="p"
                editable={editable}
                multiline
                value={f.text}
                placeholder="Write a short professional summary…"
                onCommit={(text) => editField(entry.id, { text })}
                className="text-body-md text-on-surface-variant whitespace-pre-line"
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: 14 * style.fontScale,
                }}
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
          const style = resolveStyle(...styleLayers, entry.styleOverridesJson);
          return (
            <StyleGroup
              key={entry.id}
              editable={editable}
              label="Experience entry"
              override={entry.styleOverridesJson}
              onStyleChange={(s) => entryStyle(entry.id, s)}
              className="[&]:block"
            >
              <div style={{ fontFamily: style.fontFamily }}>
                <div className="flex justify-between items-baseline mb-xs gap-sm">
                  <EditableText
                    as="h3"
                    editable={editable}
                    value={f.jobTitle}
                    placeholder="Job title"
                    onCommit={(jobTitle) => editField(entry.id, { jobTitle })}
                    className="text-[16px] text-on-surface font-semibold"
                    style={{ fontSize: 16 * style.fontScale }}
                  />
                  <span className="text-body-sm text-on-surface-variant whitespace-nowrap flex items-center gap-xs">
                    <EditableText
                      editable={editable}
                      value={f.startDate}
                      placeholder="Start"
                      onCommit={(startDate) =>
                        editField(entry.id, { startDate })
                      }
                    />
                    {" - "}
                    {f.isCurrent ? (
                      "Present"
                    ) : (
                      <EditableText
                        editable={editable}
                        value={f.endDate ?? ""}
                        placeholder="End"
                        onCommit={(endDate) => editField(entry.id, { endDate })}
                      />
                    )}
                  </span>
                </div>
                <EditableText
                  as="p"
                  editable={editable}
                  value={f.company}
                  placeholder="Company"
                  onCommit={(company) => editField(entry.id, { company })}
                  className="text-body-md mb-sm inline-block"
                  style={{ color: style.color, fontSize: 14 * style.fontScale }}
                />
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
                  style={{ fontSize: 14 * style.fontScale }}
                />
              </div>
            </StyleGroup>
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
          const style = resolveStyle(...styleLayers, entry.styleOverridesJson);
          return (
            <StyleGroup
              key={entry.id}
              editable={editable}
              label="Education entry"
              override={entry.styleOverridesJson}
              onStyleChange={(s) => entryStyle(entry.id, s)}
            >
              <div
                className="flex justify-between items-baseline gap-sm"
                style={{ fontFamily: style.fontFamily }}
              >
                <div>
                  <EditableText
                    as="h3"
                    editable={editable}
                    value={f.degree}
                    placeholder="Degree"
                    onCommit={(degree) => editField(entry.id, { degree })}
                    className="text-[16px] text-on-surface font-semibold"
                    style={{ fontSize: 16 * style.fontScale }}
                  />
                  <EditableText
                    as="p"
                    editable={editable}
                    value={f.school}
                    placeholder="School"
                    onCommit={(school) => editField(entry.id, { school })}
                    className="text-body-md"
                    style={{
                      color: style.color,
                      fontSize: 14 * style.fontScale,
                    }}
                  />
                </div>
                <span className="text-body-sm text-on-surface-variant whitespace-nowrap flex items-center gap-xs">
                  <EditableText
                    editable={editable}
                    value={f.startDate}
                    placeholder="Start"
                    onCommit={(startDate) => editField(entry.id, { startDate })}
                  />
                  {" - "}
                  <EditableText
                    editable={editable}
                    value={f.endDate ?? ""}
                    placeholder="End"
                    onCommit={(endDate) => editField(entry.id, { endDate })}
                  />
                </span>
              </div>
            </StyleGroup>
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
          const style = resolveStyle(...styleLayers, entry.styleOverridesJson);
          return (
            <StyleGroup
              key={entry.id}
              editable={editable}
              label="Skill"
              override={entry.styleOverridesJson}
              onStyleChange={(s) => entryStyle(entry.id, s)}
            >
              <span
                className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant text-label-md px-2 py-1 rounded"
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: 12 * style.fontScale,
                }}
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
          const style = resolveStyle(...styleLayers, entry.styleOverridesJson);
          return (
            <StyleGroup
              key={entry.id}
              editable={editable}
              label="Certification"
              override={entry.styleOverridesJson}
              onStyleChange={(s) => entryStyle(entry.id, s)}
            >
              <div
                className="flex justify-between items-baseline gap-sm"
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: 14 * style.fontScale,
                }}
              >
                <EditableText
                  as="h3"
                  editable={editable}
                  value={f.name}
                  placeholder="Certification"
                  onCommit={(name) => editField(entry.id, { name })}
                  className="text-body-md text-on-surface"
                />
                <span className="text-body-sm text-on-surface-variant whitespace-nowrap flex items-center gap-xs">
                  <EditableText
                    editable={editable}
                    value={f.issuer ?? ""}
                    placeholder="Issuer"
                    onCommit={(issuer) => editField(entry.id, { issuer })}
                  />
                  <EditableText
                    editable={editable}
                    value={f.date ?? ""}
                    placeholder="Date"
                    onCommit={(date) => editField(entry.id, { date })}
                  />
                </span>
              </div>
            </StyleGroup>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {entries.map((entry) => {
        const f = entry.fieldsJson as { title?: string; text: string };
        const style = resolveStyle(...styleLayers, entry.styleOverridesJson);
        return (
          <StyleGroup
            key={entry.id}
            editable={editable}
            label="Custom entry"
            override={entry.styleOverridesJson}
            onStyleChange={(s) => entryStyle(entry.id, s)}
          >
            <div style={{ fontFamily: style.fontFamily }}>
              <EditableText
                as="h3"
                editable={editable}
                value={f.title ?? ""}
                placeholder="Title"
                onCommit={(title) => editField(entry.id, { title })}
                className="text-[16px] text-on-surface font-semibold mb-xs"
                style={{ fontSize: 16 * style.fontScale }}
              />
              <EditableText
                as="p"
                editable={editable}
                multiline
                value={f.text}
                placeholder="Text"
                onCommit={(text) => editField(entry.id, { text })}
                className="text-body-md text-on-surface-variant whitespace-pre-line"
                style={{ fontSize: 14 * style.fontScale }}
              />
            </div>
          </StyleGroup>
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
          style={{
            fontFamily: sectionStyle.fontFamily,
            fontSize: 14 * sectionStyle.fontScale,
            // Section headers stay neutral by default (matching the base template)
            // — only tint them once this section has its own explicit color override.
            color: section.styleOverridesJson?.accentColor,
          }}
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
  /** Drives layout (single/two-column + sidebar membership) and the per-template default font/color. */
  template?: TemplateDetail;
}

/** The "paper" resume rendering — shared by the editor's live preview and the public share page. */
export function ResumeDocument({
  contactInfoJson,
  sections,
  styleOverridesJson,
  template,
  editable = false,
  ...handlers
}: ResumeDocumentData & { editable?: boolean } & EditHandlers) {
  const templateLayer: StyleOverrides = {
    accentColor: template?.structureJson.accentColor,
    fontFamily: template?.structureJson.font,
  };
  const headerStyle = resolveStyle(templateLayer, styleOverridesJson);
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

  const isDark = styleOverridesJson?.theme === "dark";

  return (
    <div
      className="bg-surface-container-lowest w-[794px] min-h-[1123px] shadow-flat-soft ring-1 ring-outline-variant/50 p-xl flex flex-col shrink-0"
      style={{
        fontSize: headerStyle.fontSize
          ? `${headerStyle.fontSize}px`
          : undefined,
        fontFamily: headerStyle.fontFamily,
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
      <div className="border-b-2 border-on-surface pb-md mb-lg">
        <EditableText
          as="h1"
          editable={editable}
          value={contact?.fullName || ""}
          placeholder="Your Name"
          onCommit={(fullName) => editContact({ fullName })}
          className="text-headline-xl text-on-surface uppercase tracking-tight"
        />
        <EditableText
          as="p"
          editable={editable}
          value={contact?.title ?? ""}
          placeholder="Professional title"
          onCommit={(title) => editContact({ title })}
          className="text-headline-md mt-xs"
          style={{ color: headerStyle.color }}
        />
        <div className="flex flex-wrap gap-md mt-sm text-on-surface-variant text-body-sm">
          {(editable || contact?.email) && (
            <span className="flex items-center gap-xs">
              <Icon name="mail" className="!text-sm" />
              <EditableText
                editable={editable}
                value={contact?.email ?? ""}
                placeholder="email@example.com"
                onCommit={(email) => editContact({ email })}
              />
            </span>
          )}
          {(editable || contact?.phone) && (
            <span className="flex items-center gap-xs">
              <Icon name="call" className="!text-sm" />
              <EditableText
                editable={editable}
                value={contact?.phone ?? ""}
                placeholder="Phone"
                onCommit={(phone) => editContact({ phone })}
              />
            </span>
          )}
          {(editable || contact?.location) && (
            <span className="flex items-center gap-xs">
              <Icon name="location_on" className="!text-sm" />
              <EditableText
                editable={editable}
                value={contact?.location ?? ""}
                placeholder="Location"
                onCommit={(location) => editContact({ location })}
              />
            </span>
          )}
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
