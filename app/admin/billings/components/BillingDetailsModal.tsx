"use client";

import {
  formatCurrency,
  formatDate,
  normalizeBillingStatus,
  statusBadgeClasses,
  titleCase,
} from "@/lib/helpers";
import type { AdminBilling } from "@/lib/types";
import { AdminModal } from "@/app/components/admin/AdminModal";

type BillingDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  billing: AdminBilling | null;
};

export function BillingDetailsModal({
  open,
  onClose,
  loading,
  error,
  billing,
}: BillingDetailsModalProps) {
  const subscriber = billing?.subscriber;
  const subscriberName = subscriber
    ? `${subscriber.last_name || ""}, ${subscriber.first_name || ""}`
    : "N/A";
  const subscriberId = subscriber?.serial_number || "—";
  const zone = subscriber?.zone || "—";

  const billingPeriod =
    billing?.start_date && billing?.end_date
      ? `${formatDate(billing.start_date)} – ${formatDate(billing.end_date)}`
      : "N/A";

  const today = new Date();
  const baseStatus = billing?.status
    ? normalizeBillingStatus(billing.status)
    : null;
  const isPaid = baseStatus === "paid";

  const dueDateObj = billing?.due_date
    ? new Date(billing.due_date as string)
    : null;
  const hasValidDueDate = !!dueDateObj && !Number.isNaN(dueDateObj.getTime());
  const isOverdue = !isPaid && hasValidDueDate && dueDateObj! < today;

  const uiStatus: "paid" | "overdue" | "unpaid" | null = !baseStatus
    ? null
    : isPaid
    ? "paid"
    : isOverdue
    ? "overdue"
    : "unpaid";

  const billedAmount = billing?.amount ? formatCurrency(billing.amount) : "-";
  const updatedAt = billing?.updated_at
    ? formatDate(billing.updated_at)
    : "N/A";

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Billing Details"
      bodyClassName="max-h-[70vh] overflow-y-auto text-sm"
      footer={
        <button
          onClick={onClose}
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
        >
          Close
        </button>
      }
    >
      {loading && (
        <div className="text-center text-gray-500 py-4">Loading billing...</div>
      )}

      {error && !loading && (
        <div className="text-center text-red-500 py-4 text-xs">{error}</div>
      )}

      {!loading && !error && !billing && (
        <div className="text-center text-gray-500 py-4">
          No billing selected.
        </div>
      )}

      {!loading && !error && billing && (
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold text-gray-500">Subscriber</h3>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-[11px] text-gray-400">Subscriber ID</dt>
                <dd className="font-medium text-indigo-600">{subscriberId}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-gray-400">Subscriber Name</dt>
                <dd className="font-medium text-gray-900">{subscriberName}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-gray-400">Address</dt>
                <dd className="text-gray-700">{zone}</dd>
              </div>
            </dl>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-semibold text-gray-500">Billing</h3>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-[11px] text-gray-400">Billing Period</dt>
                <dd className="text-gray-700">{billingPeriod}</dd>
              </div>

              <div>
                <dt className="text-[11px] text-gray-400">Status</dt>
                <dd className="mt-1">
                  {uiStatus ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(
                        uiStatus
                      )}`}
                    >
                      {titleCase(uiStatus)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] text-gray-400">Amount</dt>
                <dd className="text-gray-700">{billedAmount}</dd>
              </div>

              <div>
                <dt className="text-[11px] text-gray-400">Last Updated</dt>
                <dd className="text-gray-700">{updatedAt}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </AdminModal>
  );
}
