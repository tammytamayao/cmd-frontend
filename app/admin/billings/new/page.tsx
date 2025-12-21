"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import {
  fetchAdminBillingBatchSummary,
  createAdminBillingBatch,
} from "@/lib/api";
import { BillingAdjustmentCard } from "@/app/admin/billings/components/BillingAdjustmentCard";
import { BillingConfigurationCard } from "@/app/admin/billings/components/BillingConfigurationCard";
import { BillingRunSummaryCard } from "@/app/admin/billings/components/BillingRunSummaryCard";
import { FinalizeRunCard } from "@/app/admin/billings/components/FinalizeRunCard";
import { AdjustmentItem, BatchSummary } from "@/lib/types";
import { formatCurrency, formatInt } from "@/lib/helpers";

function isValidISODate(d: string) {
  if (!d) return false;
  const dt = new Date(d);
  return !Number.isNaN(dt.getTime());
}

export default function AdminNewBillingPage() {
  const router = useRouter();

  // NEW: billing range
  const [billingStart, setBillingStart] = useState("");
  const [billingEnd, setBillingEnd] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [adjAmount, setAdjAmount] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
  const [nextAdjId, setNextAdjId] = useState(1);

  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const derived = useMemo(() => {
    const accountsSelected = batchSummary?.accounts_selected ?? 0;
    const baseAmount = batchSummary?.base_amount ?? 0;

    const adjustmentsPerAccount = adjustments.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const adjustmentsBatchTotal = adjustmentsPerAccount * accountsSelected;
    const totalBillingAmount = baseAmount + adjustmentsBatchTotal;

    return {
      accountsSelected,
      baseAmount,
      adjustmentsPerAccount,
      adjustmentsBatchTotal,
      totalBillingAmount,
    };
  }, [batchSummary, adjustments]);

  const displayAccountsSelected = summaryLoading
    ? "Loading..."
    : batchSummary
    ? formatInt(batchSummary.accounts_selected)
    : "—";

  const tryParseAdjAmount = (raw: string) => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleAddAdjustment = () => {
    const desc = adjustmentNotes.trim();
    const parsed = tryParseAdjAmount(adjAmount.trim());
    if (!desc || parsed === null) return;

    setAdjustments((prev) => [
      ...prev,
      { id: nextAdjId, description: desc, amount: parsed },
    ]);
    setNextAdjId((id) => id + 1);
    setAdjustmentNotes("");
    setAdjAmount("");
  };

  const handleRemoveAdjustment = (id: number) => {
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const result = await fetchAdminBillingBatchSummary("all", undefined);
        if (!cancelled) setBatchSummary(result);
      } catch (err: unknown) {
        if (cancelled) return;
        setBatchSummary(null);
        setSummaryError(
          err instanceof Error ? err.message : "Failed to load billing summary"
        );
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const buildPayload = (): Parameters<typeof createAdminBillingBatch>[0] => {
    const payload: Parameters<typeof createAdminBillingBatch>[0] = {
      group: "all",
      billing_start: billingStart,
      billing_end: billingEnd,
      due_date: dueDate,
    };

    if (adjustments.length > 0) {
      payload.adjustment_per_account = derived.adjustmentsPerAccount;
      payload.adjustment_notes = adjustments
        .map((a) => a.description)
        .join("; ");
    }

    return payload;
  };

  const confirmProceed = (accounts: number, adjPerAccount: number) =>
    window.confirm(
      `This will create billings for ${formatInt(accounts)} account(s).\n\n` +
        `Per-account adjustment: ${formatCurrency(adjPerAccount)}\n\n` +
        "Do you want to continue?"
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billingStart) return alert("Please select a billing start date.");
    if (!billingEnd) return alert("Please select a billing end date.");
    if (!isValidISODate(billingStart) || !isValidISODate(billingEnd)) {
      return alert("Please select valid billing start/end dates.");
    }
    if (billingStart > billingEnd) {
      return alert("Billing start date must be on or before billing end date.");
    }

    if (!dueDate) return alert("Please select a due date.");

    if (!batchSummary) {
      return alert(
        "Billing summary not loaded yet. Please wait a moment and try again."
      );
    }

    if (
      !confirmProceed(
        batchSummary.accounts_selected,
        derived.adjustmentsPerAccount
      )
    )
      return;

    try {
      setSubmitting(true);
      await createAdminBillingBatch(buildPayload());
      alert(
        `Batch billing successfully created for ${formatInt(
          batchSummary.accounts_selected
        )} account(s).`
      );
      router.push("/admin/billings");
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to create batch billings."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => router.push("/admin/billings");

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar active="billings" />

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
            <div className="space-y-6">
              <BillingConfigurationCard
                billingStart={billingStart}
                onBillingStartChange={setBillingStart}
                billingEnd={billingEnd}
                onBillingEndChange={setBillingEnd}
                dueDate={dueDate}
                onDueDateChange={setDueDate}
              />

              <BillingAdjustmentCard
                adjustmentNotes={adjustmentNotes}
                onAdjustmentNotesChange={setAdjustmentNotes}
                adjAmount={adjAmount}
                onAdjAmountChange={setAdjAmount}
                onAddAdjustment={handleAddAdjustment}
                onRemoveAdjustment={handleRemoveAdjustment}
                adjustments={adjustments}
                formatPeso={(n) => formatCurrency(n).replace(/^₱/, "").trim()}
              />
            </div>

            <div className="space-y-4">
              <BillingRunSummaryCard
                displayAccountsSelected={displayAccountsSelected}
                baseAmount={derived.baseAmount}
                adjustmentsBatchTotal={derived.adjustmentsBatchTotal}
                totalBillingAmount={derived.totalBillingAmount}
                summaryError={summaryError}
                formatPeso={(n) => formatCurrency(n).replace(/^₱/, "").trim()}
              />

              <FinalizeRunCard
                submitting={submitting}
                onCancel={handleCancel}
              />
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
