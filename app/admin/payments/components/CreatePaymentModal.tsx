"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";
import {
  createAdminPayment,
  fetchAllSubscribers,
  fetchAdminBillingsBySubscriber,
} from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/helpers";
import { AdminModal } from "@/app/components/admin/AdminModal";
import {
  AdminPayment,
  BillingOption,
  CreatePaymentModalProps,
  SubscriberOption,
} from "@/lib/types";

const STATUS_OPTIONS = ["Processing", "Completed", "Failed"] as const;
const METHOD_OPTIONS = ["GCash", "Cash", "Bank Transfer"] as const;

export function CreatePaymentModal({
  open,
  onClose,
  onCreated,
}: CreatePaymentModalProps) {
  const [subscribers, setSubscribers] = useState<SubscriberOption[]>([]);
  const [billings, setBillings] = useState<BillingOption[]>([]);

  const [subscriberId, setSubscriberId] = useState<number | null>(null);
  const [billingId, setBillingId] = useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [status, setStatus] = useState<string>("Processing");
  const [amount, setAmount] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);

  const [subsPage, setSubsPage] = useState(1);
  const [subsHasMore, setSubsHasMore] = useState(true);
  const [loadingMoreSubs, setLoadingMoreSubs] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setSubscriberId(null);
    setBillingId(null);
    setPaymentMethod("");
    setStatus("Processing");
    setAmount("");
    setReferenceNumber("");
    setInvoiceNumber("");
    setReceiptFile(null);
    setError(null);
    setBillings([]);

    setSubscribers([]);
    setSubsPage(1);
    setSubsHasMore(true);
    setLoadingMoreSubs(false);
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let alive = true;
    setLoadingSubs(true);

    (async () => {
      try {
        const res = await fetchAllSubscribers(1);
        if (!alive) return;

        const opts: SubscriberOption[] = (res.data ?? []).map((s) => ({
          id: s.id,
          serial_number: s.serial_number,
          label: `${s.serial_number ?? "—"} — ${s.last_name ?? ""}, ${
            s.first_name ?? ""
          }`.trim(),
        }));

        setSubscribers(opts);
        setSubsPage(1);
        setSubsHasMore(res.meta.page < res.meta.total_pages);
      } catch (e) {
        if (!alive) return;
        setError(
          e instanceof Error ? e.message : "Failed to load subscribers."
        );
      } finally {
        if (alive) setLoadingSubs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  const loadMoreSubscribers = useCallback(async () => {
    if (!open) return;
    if (loadingSubs || loadingMoreSubs || !subsHasMore) return;

    setLoadingMoreSubs(true);
    const nextPage = subsPage + 1;

    try {
      const res = await fetchAllSubscribers(nextPage);
      const opts: SubscriberOption[] = (res.data ?? []).map((s) => ({
        id: s.id,
        serial_number: s.serial_number,
        label: `${s.serial_number ?? "—"} — ${s.last_name ?? ""}, ${
          s.first_name ?? ""
        }`.trim(),
      }));

      setSubscribers((prev) => [...prev, ...opts]);
      setSubsPage(nextPage);
      setSubsHasMore(nextPage < res.meta.total_pages);
    } catch {
      setSubsHasMore(false);
    } finally {
      setLoadingMoreSubs(false);
    }
  }, [open, loadingSubs, loadingMoreSubs, subsHasMore, subsPage]);

  useEffect(() => {
    if (!open || !subscriberId) return;

    let alive = true;
    setLoadingBills(true);
    setBillings([]);
    setBillingId(null);

    (async () => {
      try {
        const res = await fetchAdminBillingsBySubscriber(subscriberId);
        if (!alive) return;

        const raw = res.data ?? [];

        const filtered = raw.filter((b) => {
          const s = String(b.status || "").toLowerCase();
          return s === "unpaid";
        });

        const opts: BillingOption[] = filtered.map((b) => ({
          id: b.id,
          amount: Number(b.amount ?? 0),
          label:
            b.start_date && b.end_date
              ? `${formatDate(b.start_date)} – ${formatDate(b.end_date)}`
              : `Billing #${b.id}`,
        }));

        setBillings(opts);

        if (opts.length) {
          setBillingId(opts[0].id);
          setAmount(String(opts[0].amount));
        }
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load billings.");
      } finally {
        if (alive) setLoadingBills(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, subscriberId]);

  const selectedBilling = useMemo(
    () => billings.find((b) => b.id === billingId) || null,
    [billings, billingId]
  );

  useEffect(() => {
    if (!selectedBilling) return;
    setAmount(String(selectedBilling.amount));
  }, [selectedBilling]);

  const saveDisabled =
    saving ||
    loadingSubs ||
    loadingBills ||
    !subscriberId ||
    !billingId ||
    !paymentMethod ||
    !status ||
    !receiptFile ||
    (status === "Completed" && !invoiceNumber.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subscriberId || !billingId) {
      setError("Please select a subscriber and a billing.");
      return;
    }
    if (!receiptFile) {
      setError("Receipt file is required.");
      return;
    }
    if (status === "Completed" && !invoiceNumber.trim()) {
      setError("Invoice number is required when status is Completed.");
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();
      form.set("billing_id", String(billingId));
      form.set("payment_method", paymentMethod);
      form.set("receipt", receiptFile);

      if (referenceNumber.trim())
        form.set("reference_number", referenceNumber.trim());
      if (invoiceNumber.trim())
        form.set("invoice_number", invoiceNumber.trim());

      const res = await createAdminPayment(form);
      onCreated(res.data as AdminPayment);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create payment."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Create Payment"
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
            form="create-payment-form"
            disabled={saveDisabled}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create payment"}
          </button>
        </div>
      }
    >
      <form
        id="create-payment-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Subscriber */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">
            Subscriber
          </label>
          <SelectDropdown<number>
            value={subscriberId}
            options={subscribers.map((s) => s.id)}
            onChange={(id) => setSubscriberId(id)}
            placeholder={
              loadingSubs ? "Loading subscribers..." : "Select subscriber"
            }
            getLabel={(id) =>
              subscribers.find((s) => s.id === id)?.label ?? String(id)
            }
            onLoadMore={loadMoreSubscribers}
            hasMore={subsHasMore}
            loadingMore={loadingMoreSubs}
          />
        </div>

        {/* Billing */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Billing</label>

          <SelectDropdown<number>
            value={billingId}
            options={billings.map((b) => b.id)}
            onChange={(id) => setBillingId(id)}
            placeholder={
              !subscriberId
                ? "Select subscriber first"
                : loadingBills
                ? "Loading billings..."
                : billings.length === 0
                ? "No unpaid billings"
                : "Select billing"
            }
            getLabel={(id) => {
              const b = billings.find((x) => x.id === id);
              return b
                ? `${b.label} • ${formatCurrency(b.amount)}`
                : String(id);
            }}
            className={!subscriberId ? "opacity-60 pointer-events-none" : ""}
          />

          {selectedBilling && (
            <p className="text-[11px] text-gray-400">
              Selected billing amount: {formatCurrency(selectedBilling.amount)}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Method */}
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

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Status</label>
          <SelectDropdown<string>
            value={status || null}
            options={[...STATUS_OPTIONS]}
            onChange={(v) => setStatus(v)}
            placeholder="Select status"
          />
          {status === "Completed" && (
            <p className="text-[11px] text-gray-400">
              Invoice number is required for Completed payments.
            </p>
          )}
        </div>

        {/* Reference */}
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

        {/* Invoice */}
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

        {/* Receipt */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-700">
            Receipt <span className="text-red-500">(required)</span>
          </label>

          <input
            id="admin-receipt-input"
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            className="sr-only"
            onChange={(e) => {
              setError(null);

              const f = e.target.files?.[0] ?? null;
              if (!f) {
                setReceiptFile(null);
                return;
              }

              const allowed = ["image/png", "image/jpeg", "application/pdf"];
              const maxBytes = 5 * 1024 * 1024;

              if (!allowed.includes(f.type)) {
                setError("Only PNG, JPG, or PDF files are allowed.");
                e.currentTarget.value = "";
                setReceiptFile(null);
                return;
              }

              if (f.size > maxBytes) {
                setError("File is larger than 5MB.");
                e.currentTarget.value = "";
                setReceiptFile(null);
                return;
              }

              setReceiptFile(f);
            }}
          />

          <label
            htmlFor="admin-receipt-input"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setError(null);

              const f = e.dataTransfer.files?.[0];
              if (!f) return;

              const allowed = ["image/png", "image/jpeg", "application/pdf"];
              const maxBytes = 5 * 1024 * 1024;

              if (!allowed.includes(f.type)) {
                setError("Only PNG, JPG, or PDF files are allowed.");
                return;
              }

              if (f.size > maxBytes) {
                setError("File is larger than 5MB.");
                return;
              }

              setReceiptFile(f);
            }}
            className={`group grid place-items-center rounded-xl border border-dashed px-4 py-5 transition-colors cursor-pointer
              ${
                receiptFile
                  ? "border-indigo-300 bg-indigo-50/40"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`h-10 w-10 rounded-full grid place-items-center transition-colors
                  ${
                    receiptFile
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 16a1 1 0 0 1-1-1V7.414L8.707 9.707a1 1 0 1 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L13 7.414V15a1 1 0 0 1-1 1Z" />
                  <path d="M4 14a1 1 0 0 1 1 1v3h14v-3a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z" />
                </svg>
              </div>

              <div className="text-sm font-medium text-gray-800">
                {receiptFile
                  ? "Receipt selected"
                  : "Click to upload or drag & drop"}
              </div>

              <div className="text-[11px] text-gray-500">
                PNG / JPG / PDF • max 5MB
              </div>
            </div>
          </label>

          {receiptFile && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
              <div className="min-w-0">
                <div className="truncate text-gray-900 font-medium">
                  {receiptFile.name}
                </div>
                <div className="text-[11px] text-gray-500">
                  {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                  {receiptFile.type === "application/pdf" ? "PDF" : "Image"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReceiptFile(null)}
                className="ml-3 inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-200"
              >
                Remove
              </button>
            </div>
          )}

          <p className="text-[11px] text-gray-400">
            Upload a receipt image or PDF for verification.
          </p>
        </div>
      </form>
    </AdminModal>
  );
}
