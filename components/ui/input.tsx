import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label
          className="block text-label-md text-on-surface-variant mb-xs"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-sm py-sm border rounded-lg bg-surface-container-lowest text-body-md text-on-surface transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container",
          error ? "border-error" : "border-outline-variant",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-xs text-body-sm text-error">{error}</p>}
    </div>
  );
}
