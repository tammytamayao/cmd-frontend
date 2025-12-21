"use client";

import CompactDropdown from "@/app/components/ui/CompactDropdown";
import { formatCurrency, formatRangeLabel } from "@/lib/helpers";
import type { CreatePaymentProps, PaymentMethod } from "@/lib/types";

export function PaymentFormCard({
  fullName,
  packageName,
  planName,
  amount,
  billings,
  billingsLoading,
  billingId,
  onBillingChange,
  paymentMethod,
  onPaymentMethodChange,
}: CreatePaymentProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Payment Form</h2>
      </div>

      <div className="px-6 py-5 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500">Full Name</label>
            <div className="mt-1 font-medium text-gray-900">{fullName}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-500">Plan Name</label>
            <div className="mt-1 font-medium text-gray-900">
              {packageName}
              {planName}
            </div>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Total Amount Due
            </p>
            <p className="text-xl font-extrabold text-gray-900">
              {formatCurrency(Number(amount || 0))}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Period
          </label>

          <CompactDropdown
            value={billingId}
            options={billings.map((b) => b.id)}
            onChange={onBillingChange}
            placeholder={
              billingsLoading
                ? "Loading..."
                : billings.length === 0
                ? "No open/overdue billings"
                : "Select billing period"
            }
            getLabel={(v) => {
              const b = billings.find((x) => String(x.id) === String(v));
              return b ? formatRangeLabel(b.start_date, b.end_date) : String(v);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>

          <CompactDropdown
            value={paymentMethod}
            // options={["GCASH", "BANK_TRANSFER", "CASH"]} -> Remove Bank Transfer first
            options={["GCASH", "CASH"]}
            onChange={(v) => onPaymentMethodChange(v as PaymentMethod)}
            getLabel={(v) =>
              v === "GCASH"
                ? "GCash"
                : v === "BANK_TRANSFER"
                ? "Bank Transfer"
                : "Cash"
            }
          />
        </div>

        {paymentMethod === "CASH" ? (
          <div className="rounded-lg bg-amber-50 text-amber-900 text-sm px-4 py-3">
            You selected <b>Cash</b>. Please pay at our office or to an
            authorized collector. Uploading a receipt is <b>optional</b>.
          </div>
        ) : paymentMethod === "GCASH" ? (
          <div className="rounded-lg bg-blue-50 text-blue-800 text-sm px-4 py-3">
            You selected <b>GCash Bills Pay</b>. Follow the steps on the right
            to pay. Uploading a screenshot is <b>required</b>.
          </div>
        ) : (
          <div className="rounded-lg bg-blue-50 text-blue-800 text-sm px-4 py-3">
            You selected <b>Bank Transfer</b>. Scan the QR and complete the
            payment. Uploading proof is <b>required</b>.
          </div>
        )}
      </div>
    </section>
  );
}
