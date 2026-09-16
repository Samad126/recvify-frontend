import { Icon } from "@/components/ui/icon";
import type {
  CertificationFields,
  CvDetail,
  CvSection,
  EducationFields,
  ExperienceFields,
  SkillsFields,
  SummaryFields,
} from "@/lib/api/types";
import { SECTION_META } from "@/lib/constants/section-meta";

function SectionBody({
  section,
  accentColor,
}: {
  section: CvSection;
  accentColor: string;
}) {
  const entries = [...section.entries].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  if (section.sectionType === "SUMMARY") {
    return (
      <>
        {entries.map((entry) => (
          <p
            key={entry.id}
            className="text-body-md text-on-surface-variant whitespace-pre-line"
          >
            {(entry.fieldsJson as SummaryFields).text}
          </p>
        ))}
      </>
    );
  }

  if (section.sectionType === "EXPERIENCE") {
    return (
      <div className="space-y-md">
        {entries.map((entry) => {
          const f = entry.fieldsJson as ExperienceFields;
          return (
            <div key={entry.id}>
              <div className="flex justify-between items-baseline mb-xs">
                <h3 className="text-[16px] text-on-surface font-semibold">
                  {f.jobTitle}
                </h3>
                <span className="text-body-sm text-on-surface-variant">
                  {f.startDate} - {f.isCurrent ? "Present" : f.endDate}
                </span>
              </div>
              <p className="text-body-md mb-sm" style={{ color: accentColor }}>
                {f.company}
              </p>
              <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                {f.description}
              </p>
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
          return (
            <div key={entry.id} className="flex justify-between items-baseline">
              <div>
                <h3 className="text-[16px] text-on-surface font-semibold">
                  {f.degree}
                </h3>
                <p className="text-body-md" style={{ color: accentColor }}>
                  {f.school}
                </p>
              </div>
              <span className="text-body-sm text-on-surface-variant whitespace-nowrap">
                {f.startDate} - {f.endDate}
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
          return (
            <span
              key={entry.id}
              className="inline-block bg-surface-container text-on-surface-variant text-label-md px-2 py-1 rounded"
            >
              {f.name}
              {f.level ? ` · ${f.level}` : ""}
            </span>
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
          return (
            <div key={entry.id} className="flex justify-between items-baseline">
              <h3 className="text-body-md text-on-surface">{f.name}</h3>
              <span className="text-body-sm text-on-surface-variant">
                {f.issuer} {f.date}
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
        return (
          <div key={entry.id}>
            {f.title && (
              <h3 className="text-[16px] text-on-surface font-semibold mb-xs">
                {f.title}
              </h3>
            )}
            <p className="text-body-md text-on-surface-variant whitespace-pre-line">
              {f.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function PreviewPanel({ cv }: { cv: CvDetail }) {
  const accentColor = cv.styleOverridesJson?.accentColor || "#0F766E";
  const fontSize = cv.styleOverridesJson?.fontSize;
  const contact = cv.contactInfoJson;
  const sortedSections = [...cv.sections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <section className="flex-1 bg-surface-container relative flex flex-col">
      <div className="h-14 border-b border-outline-variant bg-surface-container-lowest flex items-center px-md flex-shrink-0">
        <span className="text-label-md text-on-surface-variant">
          Live Preview
        </span>
      </div>

      <div className="flex-1 overflow-auto p-xl flex justify-center bg-surface-container">
        <div
          className="bg-surface-container-lowest w-[794px] min-h-[1123px] shadow-flat-soft ring-1 ring-outline-variant/50 p-xl flex flex-col shrink-0"
          style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
        >
          <div className="border-b-2 border-on-surface pb-md mb-lg">
            <h1 className="text-headline-xl text-on-surface uppercase tracking-tight">
              {contact?.fullName || "Your Name"}
            </h1>
            {contact?.title && (
              <p
                className="text-headline-md mt-xs"
                style={{ color: accentColor }}
              >
                {contact.title}
              </p>
            )}
            <div className="flex flex-wrap gap-md mt-sm text-on-surface-variant text-body-sm">
              {contact?.email && (
                <span className="flex items-center gap-xs">
                  <Icon name="mail" className="!text-sm" /> {contact.email}
                </span>
              )}
              {contact?.phone && (
                <span className="flex items-center gap-xs">
                  <Icon name="call" className="!text-sm" /> {contact.phone}
                </span>
              )}
              {contact?.location && (
                <span className="flex items-center gap-xs">
                  <Icon name="location_on" className="!text-sm" />{" "}
                  {contact.location}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-lg">
            {sortedSections.map((section) => (
              <div key={section.id}>
                <h2 className="text-headline-md uppercase tracking-wider text-[14px] text-on-surface border-b border-outline-variant pb-xs mb-md">
                  {section.title || SECTION_META[section.sectionType].label}
                </h2>
                <SectionBody section={section} accentColor={accentColor} />
              </div>
            ))}
            {sortedSections.length === 0 && (
              <p className="text-body-sm text-on-surface-variant">
                Add sections on the left to see your resume take shape here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
