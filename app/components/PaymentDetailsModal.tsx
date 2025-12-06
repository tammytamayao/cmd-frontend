// app/billing/PaymentDetailsModal.tsx

import Image from "next/image";
import { PaymentDetail } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  statusBadgeClasses,
  titleCase,
} from "@/lib/helpers";

type PaymentDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  payment: PaymentDetail | null;
  loading: boolean;
  error: string | null;
};

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
  if (!open) return null;

  const statusClasses = payment
    ? statusBadgeClasses(payment.status)
    : "bg-gray-50 text-gray-700 ring-gray-100";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h2>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto text-sm">
          {loading && (
            <div className="text-center text-gray-500 py-4">
              Loading payment...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-4">{error}</div>
          )}

          {!loading && !error && payment && (
            <>
              <div className="space-y-2">
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
                  <span>
                    {payment && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClasses}`}
                      >
                        {statusLabel(payment.status)}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Reference #</span>
                  <span className="text-gray-900">
                    {payment.reference_number || "-"}
                  </span>
                </div>

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
              </div>

              {/* Receipt preview / link */}
              {payment.receipt_url && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Receipt
                  </p>

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
                    <a className=" text-indigo-600 text-sm font-medium">
                      Not Applicable
                    </a>
                  )}

                  {payment.receipt?.filename && (
                    <p className="mt-2 text-xs text-gray-500">
                      {payment.receipt.filename}{" "}
                      {payment.receipt.size
                        ? `• ${(payment.receipt.size / 1024).toFixed(1)} KB`
                        : ""}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
