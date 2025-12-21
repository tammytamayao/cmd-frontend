"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/helpers";
import type { AdminBilling } from "@/lib/types";
import { updateAdminBilling } from "@/lib/api";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";
import { AdminModal } from "@/app/components/admin/AdminModal";

export type AdminBillingForEdit = AdminBilling;

type EditBillingModalProps = {
  open: boolean;
  onClose: () => void;
  billing: AdminBillingForEdit | null;
  onUpdated: (updated: AdminBillingForEdit) => void;
};

const STATUS_OPTIONS = ["unpaid", "paid"] as const;
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

  useEffect(() => {
    if (!billing) return;

    const currentStatus = billing.status as BillingStatusOption | null;
    setStatus(
      currentStatus && STATUS_OPTIONS.includes(currentStatus)
        ? currentStatus
        : null
    );

    setAmount(billing.amount != null ? String(billing.amount) : "");
    setError(null);
  }, [billing, open]);

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

  const getStatusLabel = (value: BillingStatusOption) =>
    value === "unpaid" ? "Unpaid" : value === "paid" ? "Paid" : value;

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={
        billing
          ? `${billing.subscriber?.first_name || ""} ${
              billing.subscriber?.last_name || ""
            }`.trim() || "Edit Billing"
          : "Edit Billing"
      }
      footer={
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-billing-form"
            disabled={!billing || saving}
            className="inline-flex items-center rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      }
    >
      <form
        id="edit-billing-form"
        onSubmit={handleSubmit}
        className="text-sm space-y-4"
      >
        {!billing && (
          <div className="text-center text-gray-500">No billing selected.</div>
        )}

        {billing && (
          <>
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
                  {billing.updated_at ? formatDate(billing.updated_at) : "N/A"}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

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
            </div>
          </>
        )}
      </form>
    </AdminModal>
  );
}
