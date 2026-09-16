import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, className, ...props }: TextareaProps) {
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
      <textarea
        id={id}
        className={cn(
          "w-full px-sm py-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md text-on-surface transition-colors resize-y",
          "focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container",
          className,
        )}
        {...props}
      />
    </div>
  );
}
