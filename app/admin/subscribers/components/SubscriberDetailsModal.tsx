"use client";

import type { SubscriberDetailsModalProps } from "@/lib/types";
import { AdminModal } from "@/app/components/admin/AdminModal";
import {
  SubscriberPersonalInfoReadOnly,
  SubscriberPlanInfoReadOnly,
} from "@/app/admin/subscribers/components/SubscriberSections";

export function SubscriberDetailsModal({
  open,
  subscriber,
  onClose,
  loading = false,
  error = null,
}: SubscriberDetailsModalProps) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Subscriber Details"
      maxWidthClassName="max-w-5xl"
      bodyClassName="max-h-[75vh] overflow-auto space-y-6 bg-gray-50"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      }
    >
      {loading && (
        <div className="text-xs text-gray-700 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg">
          Loading latest details…
        </div>
      )}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && !subscriber && (
        <div className="text-center text-gray-500 py-6">
          No subscriber selected.
        </div>
      )}

      {subscriber && (
        <>
          <SubscriberPersonalInfoReadOnly subscriber={subscriber} />
          <SubscriberPlanInfoReadOnly subscriber={subscriber} />
        </>
      )}
    </AdminModal>
  );
}
