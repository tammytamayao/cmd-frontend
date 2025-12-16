type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;

  // optional action
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyStateTab({
  title,
  description,
  className = "",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className={
        "w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center " +
        className
      }
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>

      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
