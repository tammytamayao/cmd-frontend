"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSearchInput } from "@/app/components/admin/AdminSearchInput";
import { useDebounce } from "@/app/hooks/useDebounce";
import { fetchAllSubscribers } from "@/lib/api";
import type {
  AdminSubscriber,
  SelectedSubscriber,
  SubscriberOption,
} from "@/lib/types";

export function SubscriberSelectionCard(props: {
  selected: SelectedSubscriber[];
  onAdd: (s: SelectedSubscriber) => void;
  onRemove: (id: number) => void;
}) {
  const { selected, onAdd, onRemove } = props;

  const [subscribers, setSubscribers] = useState<SubscriberOption[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const selectedIds = useMemo(
    () => new Set(selected.map((s) => s.id)),
    [selected],
  );

  // Reset list when dropdown opens or search changes
  useEffect(() => {
    if (!resultsOpen) return;
    setPage(1);
  }, [resultsOpen, debouncedSearch]);

  // Fetch subscribers when open + page changes
  useEffect(() => {
    if (!resultsOpen) return;

    let cancelled = false;

    const run = async () => {
      const isFirstPage = page === 1;

      if (isFirstPage) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetchAllSubscribers(page, undefined, debouncedSearch);

        if (cancelled) return;

        const opts: SubscriberOption[] = (res.data ?? []).map(
          (s: AdminSubscriber) => ({
            id: s.id,
            serial_number: s.serial_number,
            label:
              `${s.serial_number ?? "—"} — ${s.last_name ?? ""}, ${s.first_name ?? ""}`.trim(),
          }),
        );

        setSubscribers((prev) => (isFirstPage ? opts : [...prev, ...opts]));
        setHasMore(res.meta?.total_pages ? page < res.meta.total_pages : false);
      } catch (e) {
        if (cancelled) return;

        setError(
          e instanceof Error ? e.message : "Failed to load subscribers.",
        );
        if (page === 1) setSubscribers([]);
        setHasMore(false);
      } finally {
        if (cancelled) return;
        setLoading(false);
        setLoadingMore(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [resultsOpen, page, debouncedSearch]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div>
        <div className="text-sm font-semibold text-gray-900">Subscribers</div>
        <div className="text-xs text-gray-500">
          Search and add multiple subscribers to this billing run.
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <div
        className="relative"
        onMouseDown={() => setResultsOpen(true)}
        onFocus={() => setResultsOpen(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            setResultsOpen(false);
        }}
      >
        <AdminSearchInput
          value={search}
          onChange={(val: string) => {
            setSearch(val);
            setResultsOpen(true);
          }}
          placeholder="Search subscriber number, name, address…"
        />

        {resultsOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg z-20">
            {loading ? (
              <div className="px-3 py-2 text-xs text-gray-400">
                Loading subscribers…
              </div>
            ) : subscribers.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400">
                {debouncedSearch
                  ? "No subscribers match your search."
                  : "No subscribers found."}
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-100">
                  {subscribers.map((s) => {
                    const alreadyAdded = selectedIds.has(s.id);

                    return (
                      <li
                        key={s.id}
                        onMouseDown={(e) => {
                          // prevent blur before click
                          e.preventDefault();
                          if (alreadyAdded) return;

                          onAdd({
                            id: s.id,
                            label: s.label,
                            serial_number: s.serial_number,
                          });

                          // keep dropdown usable for adding more
                          setSearch("");
                          setPage(1);
                          setResultsOpen(true);
                        }}
                        className={[
                          "px-3 py-2 text-xs",
                          alreadyAdded
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "cursor-pointer hover:bg-blue-50",
                        ].join(" ")}
                      >
                        <div className="font-medium">{s.label}</div>
                        <div className="text-[10px] text-gray-400">
                          {alreadyAdded
                            ? "Already added"
                            : s.serial_number
                              ? `Serial: ${s.serial_number}`
                              : ""}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {hasMore && (
                  <div className="border-t border-gray-100 p-2">
                    <button
                      type="button"
                      disabled={loadingMore}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setPage((p) => p + 1)}
                      className="w-full rounded-md bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700">
          Selected ({selected.length})
        </div>

        {selected.length === 0 ? (
          <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl px-3 py-3">
            No subscribers selected yet.
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200">
            <ul className="divide-y divide-gray-100">
              {selected.map((s) => (
                <li
                  key={s.id}
                  className="px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">
                      {s.label}
                    </div>
                    {s.serial_number ? (
                      <div className="text-[10px] text-gray-400">
                        Serial: {s.serial_number}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    className="text-[11px] px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
