interface ApplySuggestionsFooterProps {
  reviewedCount: number;
  totalCount: number;
  acceptedCount: number;
  isApplying: boolean;
  isApplied: boolean;
  onApply: () => void;
}

export function ApplySuggestionsFooter({
  reviewedCount,
  totalCount,
  acceptedCount,
  isApplying,
  isApplied,
  onApply,
}: ApplySuggestionsFooterProps) {
  const progressPct = totalCount
    ? Math.round((reviewedCount / totalCount) * 100)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-sm">
        <span className="text-body-sm text-on-surface-variant">
          {reviewedCount} of {totalCount} suggestions reviewed
        </span>
        <span className="text-label-md text-primary">{progressPct}%</span>
      </div>
      <div className="w-full bg-surface-container-highest rounded-full h-2 mb-md overflow-hidden">
        <div
          className="bg-primary-container h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <button
        type="button"
        disabled={acceptedCount === 0 || isApplying}
        onClick={onApply}
        className="w-full py-sm bg-primary-container text-on-primary rounded-lg text-label-md font-bold transition-colors shadow-flat-soft disabled:opacity-50 disabled:pointer-events-none"
      >
        {isApplied
          ? "Applied ✓"
          : isApplying
            ? "Applying…"
            : `Apply Accepted Changes (${acceptedCount})`}
      </button>
    </div>
  );
}
