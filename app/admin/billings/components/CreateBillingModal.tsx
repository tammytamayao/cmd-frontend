"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminModal } from "@/app/components/admin/AdminModal";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";
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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<UiStatus>("Unpaid");

  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subsPage, setSubsPage] = useState(1);
  const [subsHasMore, setSubsHasMore] = useState(true);
  const [loadingMoreSubs, setLoadingMoreSubs] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when opening
  useEffect(() => {
    if (!open) return;

    setSubscribers([]);
    setSubscriberId(null);

    setStartDate("");
    setEndDate("");
    setDueDate("");
    setAmount("");
    setStatus("Unpaid");

    setError(null);
    setSaving(false);

    setSubsPage(1);
    setSubsHasMore(true);
    setLoadingMoreSubs(false);
  }, [open]);

  // Initial subscriber load
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setLoadingSubs(true);

    (async () => {
      try {
        const res = await fetchAllSubscribers(1);
        if (!alive) return;

        const opts: SubscriberOption[] = (res.data ?? []).map(
          (s: AdminSubscriber) => ({
            id: s.id,
            serial_number: s.serial_number,
            label: `${s.serial_number ?? "—"} — ${s.last_name ?? ""}, ${
              s.first_name ?? ""
            }`.trim(),
          })
        );

        setSubscribers(opts);
        setSubsPage(1);
        setSubsHasMore(res.meta.page < res.meta.total_pages);
      } catch (e) {
        if (!alive) return;
        setError(
          e instanceof Error ? e.message : "Failed to load subscribers."
        );
      } finally {
        if (alive) setLoadingSubs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  const loadMoreSubscribers = useCallback(async () => {
    if (!open) return;
    if (loadingSubs || loadingMoreSubs || !subsHasMore) return;

    setLoadingMoreSubs(true);
    const nextPage = subsPage + 1;

    try {
      const res = await fetchAllSubscribers(nextPage);
      const opts: SubscriberOption[] = (res.data ?? []).map(
        (s: AdminSubscriber) => ({
          id: s.id,
          serial_number: s.serial_number,
          label: `${s.serial_number ?? "—"} — ${s.last_name ?? ""}, ${
            s.first_name ?? ""
          }`.trim(),
        })
      );

      setSubscribers((prev) => [...prev, ...opts]);
      setSubsPage(nextPage);
      setSubsHasMore(nextPage < res.meta.total_pages);
    } catch {
      setSubsHasMore(false);
    } finally {
      setLoadingMoreSubs(false);
    }
  }, [open, loadingSubs, loadingMoreSubs, subsHasMore, subsPage]);

  const selectedSubscriberLabel = useMemo(() => {
    if (!subscriberId) return null;
    return subscribers.find((s) => s.id === subscriberId)?.label ?? null;
  }, [subscribers, subscriberId]);

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
        err instanceof Error ? err.message : "Failed to create billing."
      );
    } finally {
      setSaving(false);
    }
  };

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
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

        {/* Subscriber */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">
            Subscriber
          </label>
          <SelectDropdown<number>
            value={subscriberId}
            options={subscribers.map((s) => s.id)}
            onChange={(id) => setSubscriberId(id)}
            placeholder={
              loadingSubs ? "Loading subscribers..." : "Select subscriber"
            }
            getLabel={(id) =>
              subscribers.find((s) => s.id === id)?.label ?? String(id)
            }
            onLoadMore={loadMoreSubscribers}
            hasMore={subsHasMore}
            loadingMore={loadingMoreSubs}
          />
          {selectedSubscriberLabel && (
            <p className="text-[11px] text-gray-400">
              Creating billing for: {selectedSubscriberLabel}
            </p>
          )}
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Status</label>
            <SelectDropdown<string>
              value={status}
              options={[...STATUS_OPTIONS]}
              onChange={(v) => setStatus(v as UiStatus)}
              placeholder="Select status"
            />
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. 1500.00"
          />
        </div>
      </form>
    </AdminModal>
  );
}
