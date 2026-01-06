"use client";

import { BillingConfigurationProps } from "@/lib/types";

export function BillingConfigurationCard({
  billingStart,
  onBillingStartChange,
  billingEnd,
  onBillingEndChange,
  dueDate,
  onDueDateChange,
}: BillingConfigurationProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          1. Configuration
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Define the parameters for this billing run. This run will bill all
          subscribers.
        </p>
      </div>

      <div className="px-6 py-5 space-y-5 text-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Billing Start
            </label>
            <input
              type="date"
              value={billingStart}
              onChange={(e) => onBillingStartChange(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Start date of the billing coverage period.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Billing End
            </label>
            <input
              type="date"
              value={billingEnd}
              min={billingStart || undefined}
              onChange={(e) => onBillingEndChange(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              End date of the billing coverage period.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              min={billingEnd || billingStart || undefined}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              The date subscribers are expected to pay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
