type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function EmptyStateTab({
  title,
  description,
  className = "",
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
    </div>
  );
}
