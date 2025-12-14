"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";
import {
  createAdminPayment,
  fetchAllSubscribers,
  fetchAdminBillingsBySubscriber,
} from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/helpers";
import { AdminPayment } from "./EditPaymentModal";

type SubscriberOption = {
  id: number;
  label: string;
  serial_number?: string | null;
};

type BillingOption = {
  id: number;
  label: string;
  amount: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (payment: AdminPayment) => void;
};

const STATUS_OPTIONS = ["Processing", "Completed", "Failed"] as const;
const METHOD_OPTIONS = ["GCash", "Cash", "Bank Transfer"] as const;

export function CreatePaymentModal({ open, onClose, onCreated }: Props) {
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

  // ✅ pagination state for subscribers
  const [subsPage, setSubsPage] = useState(1);
  const [subsHasMore, setSubsHasMore] = useState(true);
  const [loadingMoreSubs, setLoadingMoreSubs] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reset when opened
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

    // reset subscriber pagination
    setSubscribers([]);
    setSubsPage(1);
    setSubsHasMore(true);
    setLoadingMoreSubs(false);
  }, [open]);

  // load subscribers page 1
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

  // ✅ load more subscribers
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

  // when subscriber changes, load billings (unpaid/overdue)
  useEffect(() => {
    if (!open || !subscriberId) return;

    let alive = true;
    setLoadingBills(true);
    setBillings([]);
    setBillingId(null);

    (async () => {
      try {
        // NOTE: your fetchAdminBillingsBySubscriber currently does not accept filters.
        // So we fetch subscriber billings and filter client-side for now.
        const res = await fetchAdminBillingsBySubscriber(subscriberId);
        if (!alive) return;

        const raw = res.data ?? [];

        // client-side filter: unpaid/overdue
        const filtered = raw.filter((b) => {
          const s = String(b.status || "").toLowerCase();
          if (s === "unpaid") return true;
          // "overdue" isn't a backend status in admin billings; treat as unpaid and due_date < today if you want:
          // return s === "unpaid" && b.due_date && new Date(b.due_date) < new Date();
          return false;
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

        // auto-select latest (controller orders created_at DESC)
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

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Payment
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto text-sm space-y-4">
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
              <label className="text-xs font-medium text-gray-700">
                Billing
              </label>

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
                className={
                  !subscriberId ? "opacity-60 pointer-events-none" : ""
                }
              />

              {selectedBilling && (
                <p className="text-[11px] text-gray-400">
                  Selected billing amount:{" "}
                  {formatCurrency(selectedBilling.amount)}
                </p>
              )}
            </div>

            {/* Amount (UI override only; backend currently uses billing.amount) */}
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

            {/* Status (UI only unless backend supports it on create) */}
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Receipt (required)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              <p className="text-[11px] text-gray-400">
                Upload a receipt image or PDF.
              </p>
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
              {saving ? "Creating..." : "Create payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
