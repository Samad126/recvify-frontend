import { cn } from "@/lib/utils/cn";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

/** Material Symbols Outlined glyph — 20px / 2px stroke per the design system. */
export function Icon({ name, className, filled }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : undefined }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
