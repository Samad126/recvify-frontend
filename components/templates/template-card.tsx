import type { Template } from "@/lib/api/types";

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  isCreating: boolean;
}

export function TemplateCard({
  template,
  onUse,
  isCreating,
}: TemplateCardProps) {
  return (
    <div className="group relative flex flex-col gap-sm">
      <div className="relative w-full aspect-[1/1.4] bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-flat-soft">
        {/** biome-ignore lint/performance/noImgElement: external, unconfigured template thumbnail host */}
        <img
          className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
          src={template.thumbnailUrl}
          alt={`${template.name} template preview`}
        />
        <div className="absolute inset-0 bg-inverse-surface/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onUse(template)}
            disabled={isCreating}
            className="text-label-md text-on-primary bg-primary-container rounded-lg px-lg py-md hover:bg-primary transition-colors shadow-flat-soft disabled:opacity-60"
          >
            {isCreating ? "Creating…" : "Use this template"}
          </button>
        </div>
        {template.isAtsFriendly && (
          <div className="absolute top-2 left-2 bg-surface-container-lowest/90 px-2 py-1 rounded text-[10px] text-label-md text-on-surface border border-outline-variant">
            ATS Optimized
          </div>
        )}
      </div>
      <div>
        <h3 className="text-headline-md text-on-surface">{template.name}</h3>
        <p className="text-body-sm text-on-surface-variant">
          {template.tagline}
        </p>
      </div>
    </div>
  );
}
