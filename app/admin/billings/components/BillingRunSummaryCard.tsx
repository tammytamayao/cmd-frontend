"use client";

import { formatCurrency } from "@/lib/helpers";
import { BillingRunSummaryProps } from "@/lib/types";

export function BillingRunSummaryCard({
  billingType,
  displayAccountsSelected,
  baseAmount,
  adjustmentsBatchTotal,
  totalBillingAmount,
  summaryError,
  formatPeso,
}: BillingRunSummaryProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Billing Run Summary
        </h3>
      </div>

      <div className="px-5 py-4 space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
          <div className="text-xs text-gray-500">Billing Type</div>
          <div className="text-xs font-semibold text-gray-900">
            {billingType}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
          <div className="text-xs text-gray-500">Accounts Selected</div>
          <div className="text-base font-semibold text-gray-900">
            {displayAccountsSelected}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
          <div className="text-xs text-gray-500">
            Subtotal Subscription (all accounts)
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(baseAmount)}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
          <div className="text-xs text-gray-500">
            Total Charge / Discount (all accounts)
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatPeso(adjustmentsBatchTotal)}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
          <div className="text-xs text-gray-500">
            Total Subscription (all accounts)
          </div>
          <div className="text-base font-semibold text-gray-900">
            {formatCurrency(totalBillingAmount)}
          </div>
        </div>

        {summaryError && (
          <p className="mt-1 text-[11px] text-red-500">{summaryError}</p>
        )}

        <p className="mt-1 text-[11px] text-gray-400">
          Subtotal subscription and Total charge / discount is pre-calculated
          based on given data multiplied by the number of accounts selected
          while Total Subscription is the combined amount.
        </p>
      </div>
    </div>
  );
}
