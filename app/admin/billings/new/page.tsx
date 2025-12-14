// app/admin/billings/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import {
  fetchAdminBillingBatchSummary,
  createAdminBillingBatch,
} from "@/lib/api";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";

type AdjustmentItem = {
  id: number;
  description: string;
  amount: number; // positive for charge, negative for discount (per account)
};

type BatchSummary = {
  group: string;
  accounts_selected: number;
  base_amount: number; // total base amount for all selected accounts
};

const BILLING_MONTH_OPTIONS = [
  { value: "jan", label: "January" },
  { value: "feb", label: "February" },
  { value: "mar", label: "March" },
  { value: "apr", label: "April" },
  { value: "may", label: "May" },
  { value: "jun", label: "June" },
  { value: "jul", label: "July" },
  { value: "aug", label: "August" },
  { value: "sep", label: "September" },
  { value: "oct", label: "October" },
  { value: "nov", label: "November" },
  { value: "dec", label: "December" },
] as const;

export default function AdminNewBillingPage() {
  const router = useRouter();

  // ------- Configuration state -------
  const [billingMonth, setBillingMonth] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");

  // ------- Charges & adjustments (per account) -------
  const [adjAmount, setAdjAmount] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
  const [nextAdjId, setNextAdjId] = useState(1);

  // ------- Batch summary from backend -------
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Derived: total adjustments PER ACCOUNT (sum of all lines)
  const adjustmentsPerAccount = adjustments.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const accountsSelected = batchSummary?.accounts_selected ?? 0;

  // Derived: total adjustments for the whole batch
  const adjustmentsBatchTotal = adjustmentsPerAccount * accountsSelected;

  // Derived: total billing amount for the whole batch
  const totalBillingAmount =
    (batchSummary?.base_amount ?? 0) + adjustmentsBatchTotal;

  const handleAddAdjustment = () => {
    if (!adjustmentNotes.trim() || !adjAmount.trim()) return;

    const parsed = Number(adjAmount);
    if (Number.isNaN(parsed)) return;

    setAdjustments((prev) => [
      ...prev,
      { id: nextAdjId, description: adjustmentNotes.trim(), amount: parsed },
    ]);
    setNextAdjId((id) => id + 1);
    setAdjustmentNotes("");
    setAdjAmount("");
  };

  const handleRemoveAdjustment = (id: number) => {
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
  };

  // ------- Fetch batch summary (backend integration) -------
  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        setSummaryLoading(true);
        setSummaryError(null);

        // Always bill all subscribers; no per-subscriber selection.
        const result = await fetchAdminBillingBatchSummary("all", undefined);

        if (cancelled) return;
        setBatchSummary(result);
      } catch (err: unknown) {
        if (cancelled) return;

        let message = "Failed to load billing summary";
        if (err instanceof Error) {
          message = err.message;
        }

        setBatchSummary(null);
        setSummaryError(message);
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------- Form submit / navigation -------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billingMonth) {
      alert("Please select a billing month.");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    if (!batchSummary) {
      alert(
        "Billing summary not loaded yet. Please wait a moment and try again."
      );
      return;
    }

    const humanAccounts =
      batchSummary.accounts_selected.toLocaleString("en-PH");
    const proceed = window.confirm(
      `This will create billings for ${humanAccounts} account(s).\n\n` +
        `Per-account adjustment: ₱${adjustmentsPerAccount.toLocaleString(
          "en-PH",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}\n\n` +
        "Do you want to continue?"
    );

    if (!proceed) return;

    try {
      setSubmitting(true);

      // Build payload so that:
      // - if no adjustments: omit adjustment_per_account & adjustment_notes
      // - if there are adjustments: send sum per account + combined notes
      const payload: Parameters<typeof createAdminBillingBatch>[0] = {
        group: "all",
        billing_month: billingMonth,
        due_date: dueDate,
      };

      if (adjustments.length > 0) {
        payload.adjustment_per_account = adjustmentsPerAccount;
        payload.adjustment_notes = adjustments
          .map((a) => a.description)
          .join("; ");
      }

      await createAdminBillingBatch(payload);

      alert(
        `Batch billing successfully created for ${humanAccounts} account(s).`
      );
      router.push("/admin/billings");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create batch billings.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/billings");
  };

  const displayAccountsSelected = summaryLoading
    ? "Loading..."
    : batchSummary
    ? batchSummary.accounts_selected.toLocaleString("en-PH")
    : "—";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Shared admin sidebar */}
      <AdminSidebar active="billings" />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <AdminHeader
          title="Create Billing"
          subtitle="Set up a new billing run for all subscribers."
          rightSlot={
            <button
              type="button"
              onClick={() => router.push("/admin/billings")}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Back to Billings
            </button>
          }
        />

        <section className="flex-1 px-8 py-6">
          <form
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
          >
            {/* LEFT COLUMN – configuration + adjustments */}
            <div className="space-y-6">
              {/* 1. Configuration */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    1. Configuration
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Define the parameters for this billing run. This run will
                    bill all subscribers.
                  </p>
                </div>

                <div className="px-6 py-5 space-y-5 text-sm">
                  {/* Billing month + due date (same row) */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Billing Month
                      </label>
                      <div className="mt-1">
                        <SelectDropdown
                          value={billingMonth}
                          options={BILLING_MONTH_OPTIONS.map(
                            (opt) => opt.value
                          )}
                          onChange={(v: string) => setBillingMonth(v)}
                          getLabel={(v: string) =>
                            BILLING_MONTH_OPTIONS.find((opt) => opt.value === v)
                              ?.label ?? String(v)
                          }
                          placeholder="Select billing month"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-400">
                        Used to determine the coverage period for this billing
                        run.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <p className="mt-1 text-[11px] text-gray-400">
                        The date by which subscribers are expected to pay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Charges & Adjustments */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    2. Charges &amp; Adjustments
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Apply bulk charges or credits per account in this billing
                    run (for example promos or penalties). These will be applied
                    to all selected accounts.
                  </p>
                </div>

                <div className="px-6 py-5 space-y-4 text-sm">
                  {/* Add adjustment row */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        value={adjustmentNotes}
                        onChange={(e) => setAdjustmentNotes(e.target.value)}
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
                        onChange={(e) => setAdjAmount(e.target.value)}
                        placeholder="e.g. 500 or -100"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddAdjustment}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* List of adjustments */}
                  {adjustments.length > 0 && (
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
                              <span className="font-medium">
                                {item.description}
                              </span>
                              <span className="ml-2 text-[11px] text-gray-500">
                                {item.amount >= 0 ? "Charge" : "Credit"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-mono ${
                                  item.amount >= 0
                                    ? "text-gray-900"
                                    : "text-emerald-700"
                                }`}
                              >
                                {item.amount >= 0 ? "₱" : "-₱"}
                                {Math.abs(item.amount).toLocaleString("en-PH", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAdjustment(item.id)}
                                className="text-[11px] text-gray-400 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {adjustments.length === 0 && (
                    <p className="text-[11px] text-gray-400">
                      No charges or discounts added yet. Leave this blank if you
                      just want to create base billings.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN – summary */}
            <div className="space-y-4">
              {/* Billing run summary */}
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
                      Batch – All Subscribers
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">
                      Accounts Selected
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {displayAccountsSelected}
                    </div>
                  </div>

                  {/* Subtotal subscription amount (from backend) */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">
                      Subtotal Subscription (all accounts)
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₱
                      {(batchSummary?.base_amount ?? 0).toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                  </div>

                  {/* Total charge or discount (from adjustments) */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">
                      Total Charge / Discount (all accounts)
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₱
                      {adjustmentsBatchTotal.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  {/* Total Subscription (base + adjustments) */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">
                      Total Subscription (all accounts)
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      ₱
                      {totalBillingAmount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  {summaryError && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {summaryError}
                    </p>
                  )}

                  <p className="mt-1 text-[11px] text-gray-400">
                    Subtotal subscription and Total charge / discount is
                    pre-calculated based on given data multiplied by the number
                    of accounts selected while Total Subscription is the
                    combined amount.
                  </p>
                </div>
              </div>

              {/* Finalize run */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Finalize Run
                  </h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting
                      ? "Processing Batch Billing..."
                      : "Process & Create Billings"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
