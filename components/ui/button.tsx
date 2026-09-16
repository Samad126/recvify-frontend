import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "tertiary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-container text-on-primary hover:bg-primary",
  secondary:
    "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-low",
  tertiary:
    "bg-transparent text-on-surface-variant hover:bg-surface-container-low",
};

export function Button({
  variant = "primary",
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-sm rounded-lg px-md py-sm text-label-md transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
