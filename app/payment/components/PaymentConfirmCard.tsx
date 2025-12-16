"use client";

import { ReceiptUpload } from "@/app/payment/components/ReceiptUpload";
import { PaymentConfirmProps } from "@/lib/types";

export function PaymentConfirmCard({
  inputId,
  receiptRequired,
  accept,
  file,
  uploadError,
  onFiles,
  onDrop,
  onRemove,
  submitError,
  submitDisabled,
  submitting,
  onSubmit,
}: PaymentConfirmProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden self-start">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Confirm Your Payment
        </h2>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-600 mb-4">
          {receiptRequired
            ? "Please upload your payment receipt to submit your payment."
            : "Uploading a receipt is optional; you can still submit without it."}
        </p>

        <ReceiptUpload
          inputId={inputId}
          accept={accept}
          required={receiptRequired}
          file={file}
          error={uploadError}
          onFiles={onFiles}
          onDrop={onDrop}
          onRemove={onRemove}
        />

        {submitError && (
          <p className="mt-3 text-sm text-red-600">{submitError}</p>
        )}

        <button
          onClick={onSubmit}
          disabled={submitDisabled}
          className="mt-4 w-full h-12 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Payment"}
        </button>
      </div>
    </section>
  );
}
