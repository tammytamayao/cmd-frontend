"use client";

import { FinalizeRunProps } from "@/lib/types";

export function FinalizeRunCard({ submitting, onCancel }: FinalizeRunProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Finalize Run</h3>
      </div>

      <div className="px-5 py-4 space-y-3">
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? "Processing Batch Billing..."
            : "Process & Create Billings"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
