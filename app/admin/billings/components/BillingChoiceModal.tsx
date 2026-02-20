"use client";

import { AdminModal } from "@/app/components/admin/AdminModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSingle: () => void;
  onMultiple: () => void;
  onBatch: () => void;
};

export function BillingChoiceModal({
  open,
  onClose,
  onSingle,
  onMultiple,
  onBatch,
}: Props) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Add Billing"
      bodyClassName="text-sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-gray-600">
          Choose how you want to create billing records.
        </p>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={onSingle}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50 transition"
          >
            <div className="font-medium text-gray-900">Single billing</div>
            <div className="text-xs text-gray-500">
              Create one billing record for a subscriber.
            </div>
          </button>

          <button
            type="button"
            onClick={onMultiple}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50 transition"
          >
            <div className="font-medium text-gray-900">Multiple billing</div>
            <div className="text-xs text-gray-500">
              Create billing records for multiple subscribers in one submission.
            </div>
          </button>

          <button
            type="button"
            onClick={onBatch}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50 transition"
          >
            <div className="font-medium text-gray-900">Batch billing</div>
            <div className="text-xs text-gray-500">
              Go to batch workflow to generate multiple billings.
            </div>
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
