"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { updateAdminPayment } from "@/lib/api";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";

type AdminPaymentSubscriber = {
  id: number | null;
  serial_number: string | null;
  first_name: string | null;
  last_name: string | null;
};

type AdminPaymentReceipt = {
  filename: string | null;
  size: number | null;
  mime_type: string | null;
  uploaded_at: string | null;
};

export type AdminPayment = {
  id: number;
  payment_date: string | null;
  amount: number;
  payment_method: string;
  status: string;
  attachment: string | null;
  reference_number: string | null;
  invoice_number?: string | null;
  billing_id: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  billing_status: string | null;
  subscriber: AdminPaymentSubscriber;
  receipt: AdminPaymentReceipt;
  receipt_url?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  payment: AdminPayment | null;
  onUpdated: (payment: AdminPayment) => void;
};

const STATUS_OPTIONS = ["Processing", "Completed", "Failed"] as const;
const METHOD_OPTIONS = ["GCash", "Cash", "Bank Transfer"] as const;

export function EditPaymentModal({ open, onClose, payment, onUpdated }: Props) {
  const [status, setStatus] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payment || !open) return;

    setStatus(payment.status || "");
    setPaymentMethod(payment.payment_method || "");
    setAmount(payment.amount != null ? String(payment.amount) : "");
    setReferenceNumber(payment.reference_number || "");
    setInvoiceNumber(payment.invoice_number || "");
    setError(null);
    setSaving(false);
  }, [payment, open]);

  if (!open || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    // ✅ FRONTEND VALIDATION: if Completed, invoice_number is required
    if (status === "Completed" && !invoiceNumber.trim()) {
      setError("Invoice number is required when status is Completed.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        status: status || undefined,
        payment_method: paymentMethod || undefined,
        amount: amount ? Number(amount) : undefined,
        reference_number: referenceNumber || null,
        invoice_number: invoiceNumber || null,
      };

      const res = await updateAdminPayment(payment.id, payload);
      onUpdated(res.data as AdminPayment);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update payment. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const saveDisabled =
    saving || (status === "Completed" && !invoiceNumber.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {payment.subscriber?.first_name} {payment.subscriber?.last_name}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto text-sm space-y-4">
            {/* read-only subscriber info */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-600">
              <div>
                Subscriber ID:{" "}
                <span className="font-mono">
                  {payment.subscriber?.serial_number || "—"}
                </span>
              </div>
              {payment.billing_period_start && payment.billing_period_end && (
                <div>
                  Billing Period: {formatDate(payment.billing_period_start)} –{" "}
                  {formatDate(payment.billing_period_end)}
                </div>
              )}
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-[11px] text-gray-400">
                Original: {formatCurrency(payment.amount)}
              </p>
            </div>

            {/* Payment method (custom dropdown) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Payment Method
              </label>
              <SelectDropdown<string>
                value={paymentMethod || null}
                options={[...METHOD_OPTIONS]}
                onChange={(v) => setPaymentMethod(v)}
                placeholder="Select method"
              />
            </div>

            {/* Status (custom dropdown) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Status
              </label>
              <SelectDropdown<string>
                value={status || null}
                options={[...STATUS_OPTIONS]}
                onChange={(v) => setStatus(v)}
                placeholder="Select status"
              />
            </div>

            {/* Reference number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. REF-12345678"
              />
            </div>

            {/* Invoice number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. INV-2025-0012"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveDisabled}
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
