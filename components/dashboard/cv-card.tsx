import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { CvListItem } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

interface CvCardProps {
  cv: CvListItem;
  onDelete: (cv: CvListItem) => void;
  isDeleting: boolean;
}

export function CvCard({ cv, onDelete, isDeleting }: CvCardProps) {
  return (
    <Link
      href={`/cvs/${cv.id}`}
      className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden group hover:border-primary-container transition-colors shadow-flat-soft flex flex-col h-full"
    >
      <div className="h-40 bg-surface-container-low border-b border-outline-variant relative flex items-center justify-center">
        <Icon name="description" className="text-outline-variant !text-5xl" />
        <div
          className={
            "absolute top-sm right-sm px-2 py-1 rounded-sm text-[10px] text-label-md " +
            (cv.isVariant
              ? "bg-primary-container text-on-primary-container"
              : "bg-surface-container text-on-surface")
          }
        >
          {cv.isVariant ? "Tailored Variant" : "Base CV"}
        </div>
      </div>
      <div className="p-md flex-1 flex flex-col">
        <h3
          className="text-headline-md text-on-surface truncate mb-xs"
          title={cv.title}
        >
          {cv.title}
        </h3>
        <p className="text-body-sm text-on-surface-variant mb-md">
          Last edited {formatRelativeTime(cv.updatedAt)}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <span className="inline-block bg-surface-container text-on-surface-variant text-label-md px-2 py-1 rounded">
            {cv.status}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(cv);
            }}
            disabled={isDeleting}
            title="Delete"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error disabled:opacity-50"
          >
            <Icon name="delete" />
          </button>
        </div>
      </div>
    </Link>
  );
}
