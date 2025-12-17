"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { updateAdminPayment } from "@/lib/api";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";
import { AdminModal } from "@/app/components/admin/AdminModal";
import { AdminPayment, EditPaymentModalProps } from "@/lib/types";

const STATUS_OPTIONS = ["Processing", "Completed", "Failed"] as const;
const METHOD_OPTIONS = ["GCash", "Cash", "Bank Transfer"] as const;

export function EditPaymentModal({
  open,
  onClose,
  payment,
  onUpdated,
}: EditPaymentModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

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
    <AdminModal
      open={open}
      onClose={onClose}
      title={
        payment
          ? `${payment.subscriber?.first_name || ""} ${
              payment.subscriber?.last_name || ""
            }`.trim() || "Edit Payment"
          : "Edit Payment"
      }
      bodyClassName="max-h-[70vh] overflow-y-auto text-sm"
      footer={
        <div className="flex justify-end gap-3">
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
            form="edit-payment-form"
            disabled={saveDisabled}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      }
    >
      {!payment ? null : (
        <form
          id="edit-payment-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Amount</label>
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Status</label>
            <SelectDropdown<string>
              value={status || null}
              options={[...STATUS_OPTIONS]}
              onChange={(v) => setStatus(v)}
              placeholder="Select status"
            />
          </div>

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
        </form>
      )}
    </AdminModal>
  );
}
