"use client";

export type PaginationMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

type PaginationProps = {
  meta: PaginationMeta | null;
  onPageChange: (page: number) => void;
};

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta) return null;

  const { page, per_page, total, total_pages } = meta;

  const canPrev = page > 1;
  const canNext = page < total_pages;

  const from = total === 0 ? 0 : (page - 1) * per_page + 1;
  const to = Math.min(page * per_page, total);

  const handlePrev = () => {
    if (canPrev) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (canNext) onPageChange(page + 1);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
      <div>
        <span>
          Showing <span className="font-medium">{from}</span> to{" "}
          <span className="font-medium">{to}</span> of{" "}
          <span className="font-medium">{total}</span> results
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs bg-white hover:bg-gray-50"
        >
          Previous
        </button>
        <span className="text-xs text-gray-500">
          Page <span className="font-medium">{page}</span> of{" "}
          <span className="font-medium">{total_pages}</span>
        </span>
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs bg-white hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
