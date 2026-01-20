"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminModal } from "@/app/components/admin/AdminModal";
import { AdminSearchInput } from "@/app/components/admin/AdminSearchInput";
import { useDebounce } from "@/app/hooks/useDebounce";

import { fetchAllSubscribers, createAdminBilling } from "@/lib/api";
import type {
  AdminBilling,
  AdminSubscriber,
  SubscriberOption,
} from "@/lib/types";

const STATUS_OPTIONS = ["Unpaid", "Paid"] as const;
type UiStatus = (typeof STATUS_OPTIONS)[number];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (billing: AdminBilling) => void;
};

export function CreateBillingModal({ open, onClose, onCreated }: Props) {
  const [subscribers, setSubscribers] = useState<SubscriberOption[]>([]);
  const [subscriberId, setSubscriberId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<UiStatus>("Unpaid");

  const [loadingSubs, setLoadingSubs] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultsOpen, setResultsOpen] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (!open) return;

    setSubscribers([]);
    setSubscriberId(null);

    setSearch("");
    setStartDate("");
    setEndDate("");
    setDueDate("");
    setAmount("");
    setStatus("Unpaid");

    setError(null);
    setSaving(false);
    setLoadingSubs(false);
    setResultsOpen(false);
  }, [open]);

  // Load subscribers based on search
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingSubs(true);

    (async () => {
      try {
        // assuming fetchAllSubscribers(page, token?, query?)
        const res = await fetchAllSubscribers(1, undefined, debouncedSearch);

        if (cancelled) return;

        const opts: SubscriberOption[] = (res.data ?? []).map(
          (s: AdminSubscriber) => ({
            id: s.id,
            serial_number: s.serial_number,
            label: `${s.serial_number ?? "—"} — ${s.last_name ?? ""}, ${
              s.first_name ?? ""
            }`.trim(),
          }),
        );

        setSubscribers(opts);

        // If you wanted to auto-clear selection when not in results
        // you could keep this, but since we "lock" once selected and stop
        // searching, this won't normally fire after selection.
        if (subscriberId && !opts.some((s) => s.id === subscriberId)) {
          // optional: comment out if you *never* want auto-clearing
          // setSubscriberId(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load subscribers.",
          );
        }
      } finally {
        if (!cancelled) setLoadingSubs(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSubscriberLabel = useMemo(() => {
    if (!subscriberId) return null;
    return subscribers.find((s) => s.id === subscriberId)?.label ?? null;
  }, [subscribers, subscriberId]);

  const isSubscriberSelected = !!subscriberId && !!selectedSubscriberLabel;

  const normalizedStatus: "paid" | "unpaid" =
    status === "Paid" ? "paid" : "unpaid";

  const saveDisabled =
    saving ||
    loadingSubs ||
    !subscriberId ||
    !startDate ||
    !endDate ||
    !dueDate ||
    !amount ||
    Number(amount) <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subscriberId) return setError("Please select a subscriber.");
    if (!startDate || !endDate)
      return setError("Start and end date are required.");
    if (!dueDate) return setError("Due date is required.");
    if (!amount || Number(amount) <= 0)
      return setError("Amount must be greater than 0.");

    setSaving(true);
    try {
      const res = await createAdminBilling({
        subscriber_id: subscriberId,
        start_date: startDate,
        end_date: endDate,
        due_date: dueDate,
        amount: Number(amount),
        status: normalizedStatus,
      });

      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create billing.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClearSelection = () => {
    setSubscriberId(null);
    setSearch("");
    setResultsOpen(false);
  };

  const inputValue =
    isSubscriberSelected && selectedSubscriberLabel
      ? selectedSubscriberLabel
      : search;

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Create Billing (Single)"
      bodyClassName="max-h-[70vh] overflow-y-auto text-sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-billing-form"
            disabled={saveDisabled}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create billing"}
          </button>
        </div>
      }
    >
      <form
        id="create-billing-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Subscriber search */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">
            Subscriber
          </label>

          <div
            className="relative"
            onFocus={() => {
              if (!isSubscriberSelected) setResultsOpen(true);
            }}
            onBlur={(e) => {
              // close when focus leaves the whole container
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setResultsOpen(false);
              }
            }}
          >
            <AdminSearchInput
              value={inputValue}
              onChange={(val: string) => {
                if (isSubscriberSelected) return; // ignore typing when locked
                setSearch(val);
              }}
              placeholder={
                isSubscriberSelected
                  ? undefined
                  : "Search subscriber number, name, address…"
              }
              isDisabled={isSubscriberSelected}
            />

            {isSubscriberSelected && (
              <button
                type="button"
                onMouseDown={(e) => {
                  // prevent blur before click
                  e.preventDefault();
                }}
                onClick={handleClearSelection}
                className="absolute inset-y-0 right-2 my-auto text-[11px] px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Clear
              </button>
            )}

            {/* Dropdown only when NO subscriber selected */}
            {resultsOpen && !isSubscriberSelected && (
              <div className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg z-20">
                {loadingSubs ? (
                  <div className="px-3 py-2 text-xs text-gray-400">
                    Searching subscribers…
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400">
                    {debouncedSearch
                      ? "No subscribers match your search."
                      : "Start typing to search for a subscriber."}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {subscribers.map((s) => (
                      <li
                        key={s.id}
                        onMouseDown={(e) => {
                          // prevent blur before click
                          e.preventDefault();
                          setSubscriberId(s.id);
                          setResultsOpen(false);
                        }}
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                          subscriberId === s.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="font-medium text-gray-800">
                          {s.label}
                        </div>
                        {s.serial_number && (
                          <div className="text-[10px] text-gray-400">
                            Serial: {s.serial_number}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Start / End */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Due date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              min={endDate || startDate || undefined}
              onChange={(e) => setDueDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UiStatus)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 1500.00"
          />
        </div>
      </form>
    </AdminModal>
  );
}
