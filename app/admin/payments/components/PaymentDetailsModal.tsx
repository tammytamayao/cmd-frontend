"use client";

import Image from "next/image";
import {
  formatCurrency,
  formatDate,
  statusBadgeClasses,
  titleCase,
} from "@/lib/helpers";
import { AdminModal } from "@/app/components/admin/AdminModal";
import { PaymentDetailsModalProps } from "@/lib/types";

function statusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === "processing") return "Processing";
  if (s === "completed" || s === "paid") return "Completed";
  if (s === "rejected" || s === "failed") return "Rejected";
  return titleCase(status);
}

export function PaymentDetailsModal({
  open,
  onClose,
  payment,
  loading,
  error,
}: PaymentDetailsModalProps) {
  const statusClasses = payment
    ? statusBadgeClasses(payment.status)
    : "bg-gray-50 text-gray-700 ring-gray-100";

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Payment Details"
      bodyClassName="max-h-[70vh] overflow-y-auto text-sm"
      footer={
        <button
          onClick={onClose}
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        >
          Close
        </button>
      }
    >
      {loading && (
        <div className="text-center text-gray-500 py-4">Loading payment...</div>
      )}

      {error && !loading && (
        <div className="text-center text-red-500 py-4">{error}</div>
      )}

      {!loading && !error && !payment && (
        <div className="text-center text-gray-500 py-4">
          No payment selected.
        </div>
      )}

      {!loading && !error && payment && (
        <>
          {/* Billing period */}
          {payment.billing_period_start && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Billing Period</span>
              <span className="text-gray-900 text-right">
                {formatDate(payment.billing_period_start as string)} –{" "}
                {payment.billing_period_end
                  ? formatDate(payment.billing_period_end as string)
                  : "-"}
              </span>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Payment Date</span>
              <span className="font-medium text-gray-900">
                {formatDate(payment.payment_date)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(payment.amount)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-900">
                {payment.payment_method}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Status</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClasses}`}
              >
                {statusLabel(payment.status)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Reference No.</span>
              <span className="text-gray-900">
                {payment.reference_number || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Invoice No.</span>
              <span className="text-gray-900">
                {payment.invoice_number || "-"}
              </span>
            </div>
          </div>

          {/* Receipt preview / link */}
          {payment.receipt_url && (
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Receipt</p>

              {payment.receipt?.mime_type?.startsWith("image/") ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={payment.receipt_url}
                    alt="Payment receipt"
                    width={800}
                    height={800}
                    className="w-full max-h-[320px] object-contain bg-gray-50"
                  />
                </div>
              ) : (
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                >
                  Open receipt
                </a>
              )}

              {payment.receipt?.filename && (
                <p className="mt-2 text-xs text-gray-500">
                  {payment.receipt.filename}
                  {payment.receipt.size
                    ? ` • ${(payment.receipt.size / 1024).toFixed(1)} KB`
                    : ""}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </AdminModal>
  );
}
