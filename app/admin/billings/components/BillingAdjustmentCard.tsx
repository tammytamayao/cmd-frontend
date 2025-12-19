"use client";

import { BillingAdjustmentProps } from "@/lib/types";

export function BillingAdjustmentCard({
  adjustmentNotes,
  onAdjustmentNotesChange,
  adjAmount,
  onAdjAmountChange,
  onAddAdjustment,
  onRemoveAdjustment,
  adjustments,
  formatPeso,
}: BillingAdjustmentProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          2. Charges &amp; Adjustments
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Apply bulk charges or credits per account in this billing run (for
          example promos or penalties). These will be applied to all selected
          accounts.
        </p>
      </div>

      <div className="px-6 py-5 space-y-4 text-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={adjustmentNotes}
              onChange={(e) => onAdjustmentNotesChange(e.target.value)}
              placeholder="e.g. Seasonal Discount, Installation Fee"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Charge / Discount (per account)
            </label>
            <input
              type="number"
              step="0.01"
              value={adjAmount}
              onChange={(e) => onAdjAmountChange(e.target.value)}
              placeholder="e.g. 500 or -100"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={onAddAdjustment}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
            >
              Add
            </button>
          </div>
        </div>

        {adjustments.length > 0 ? (
          <div className="mt-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Applied Charges &amp; Discounts (per account)
            </p>
            <ul className="space-y-1.5">
              {adjustments.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
                >
                  <div>
                    <span className="font-medium">{item.description}</span>
                    <span className="ml-2 text-[11px] text-gray-500">
                      {item.amount >= 0 ? "Charge" : "Credit"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono ${
                        item.amount >= 0 ? "text-gray-900" : "text-emerald-700"
                      }`}
                    >
                      {item.amount >= 0 ? "₱" : "-₱"}
                      {formatPeso(Math.abs(item.amount))}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveAdjustment(item.id)}
                      className="text-[11px] text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">
            No charges or discounts added yet. Leave this blank if you just want
            to create base billings.
          </p>
        )}
      </div>
    </div>
  );
}
