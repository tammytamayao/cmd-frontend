"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/helpers";
import type { AdminBilling } from "@/lib/types";
import { updateAdminBilling } from "@/lib/api";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";

export type AdminBillingForEdit = AdminBilling;

type EditBillingModalProps = {
  open: boolean;
  onClose: () => void;
  billing: AdminBillingForEdit | null;
  onUpdated: (updated: AdminBillingForEdit) => void;
};

// Allowed billing statuses
const STATUS_OPTIONS = ["open", "overdue", "paid"] as const;
type BillingStatusOption = (typeof STATUS_OPTIONS)[number];

export function EditBillingModal({
  open,
  onClose,
  billing,
  onUpdated,
}: EditBillingModalProps) {
  const [status, setStatus] = useState<BillingStatusOption | null>(null);
  const [amount, setAmount] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when billing changes / modal opens
  useEffect(() => {
    if (!billing) return;

    const currentStatus = billing.status as BillingStatusOption | null;
    if (currentStatus && STATUS_OPTIONS.includes(currentStatus)) {
      setStatus(currentStatus);
    } else {
      setStatus(null);
    }

    setAmount(billing.amount != null ? String(billing.amount) : "");
    setError(null);
  }, [billing, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billing) return;

    setSaving(true);
    setError(null);

    try {
      const payload: Parameters<typeof updateAdminBilling>[1] = {
        status: status || undefined,
        amount: amount ? Number(amount) : undefined,
      };

      const res = await updateAdminBilling(billing.id, payload);
      onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update billing."
      );
    } finally {
      setSaving(false);
    }
  };

  // Label mapping: conceptual grouping
  const getStatusLabel = (value: BillingStatusOption) => {
    switch (value) {
      case "open":
        return "Open";
      case "overdue":
        return "Overdue";
      case "paid":
        return "Paid";
      default:
        return value;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Edit Billing
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Update billing status and amount.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>✕
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 text-sm space-y-4">
          {!billing && (
            <div className="text-center text-gray-500">
              No billing selected.
            </div>
          )}

          {billing && (
            <>
              {/* Subscriber summary */}
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <div className="font-medium text-gray-800">
                  {billing.subscriber?.last_name},{" "}
                  {billing.subscriber?.first_name}
                </div>
                <div className="mt-0.5">
                  Subscriber ID:{" "}
                  <span className="font-mono text-indigo-600">
                    {billing.subscriber?.serial_number || "—"}
                  </span>
                </div>
              </div>

              {/* Read-only billing info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <p className="text-[11px] text-gray-400">Billing Period</p>
                  <p className="mt-0.5 text-gray-800">
                    {billing.start_date && billing.end_date
                      ? `${formatDate(billing.start_date)} – ${formatDate(
                          billing.end_date
                        )}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Last Updated</p>
                  <p className="mt-0.5 text-gray-800">
                    {billing.updated_at
                      ? formatDate(billing.updated_at)
                      : "N/A"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Amount */}
              <div>
                <label
                  htmlFor="billing-amount"
                  className="block text-xs font-medium text-gray-700"
                >
                  Amount (PHP)
                </label>
                <input
                  id="billing-amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status using SelectDropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <SelectDropdown<BillingStatusOption>
                    value={status}
                    options={STATUS_OPTIONS}
                    onChange={(val) => setStatus(val)}
                    getLabel={getStatusLabel}
                    placeholder="Select status"
                    className="text-xs"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  <span className="font-medium">Paid</span> includes{" "}
                  <code>paid</code> and <code>closed</code>.{" "}
                  <span className="font-medium">Unpaid</span> includes{" "}
                  <code>open</code> and <code>overdue</code>.
                </p>
              </div>
            </>
          )}

          {/* Footer buttons */}
          <div className="mt-4 flex justify-end space-x-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!billing || saving}
              className="inline-flex items-center rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
