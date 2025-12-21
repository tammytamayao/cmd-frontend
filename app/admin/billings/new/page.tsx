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

import { useNotification } from "@/app/notification/NotificationProvider";
import { useConfirm } from "@/app/hooks/useConfirm";
import { ConfirmModal } from "@/app/components/ConfirmModal"; // ✅ add

function isValidISODate(d: string) {
  if (!d) return false;
  const dt = new Date(d);
  return !Number.isNaN(dt.getTime());
}

export default function AdminNewBillingPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const confirmModal = useConfirm();

  const fail = (message: string) => {
    notify("error", message);
  };

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

    if (!desc) {
      notify("warning", "Please enter an adjustment description.");
      return;
    }
    if (parsed === null) {
      notify("warning", "Please enter a valid adjustment amount.");
      return;
    }

    setAdjustments((prev) => [
      ...prev,
      { id: nextAdjId, description: desc, amount: parsed },
    ]);
    setNextAdjId((id) => id + 1);
    setAdjustmentNotes("");
    setAdjAmount("");

    notify("success", "Adjustment added.");
  };

  const handleRemoveAdjustment = (id: number) => {
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
    notify("info", "Adjustment removed.");
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

        const msg =
          err instanceof Error ? err.message : "Failed to load billing summary";
        setSummaryError(msg);
        notify("error", msg);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [notify]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billingStart) return fail("Please select a billing start date.");
    if (!billingEnd) return fail("Please select a billing end date.");
    if (!isValidISODate(billingStart) || !isValidISODate(billingEnd)) {
      return fail("Please select valid billing start/end dates.");
    }
    if (billingStart > billingEnd) {
      return fail("Billing start date must be on or before billing end date.");
    }
    if (!dueDate) return fail("Please select a due date.");

    if (!batchSummary) {
      return fail(
        "Billing summary not loaded yet. Please wait a moment and try again."
      );
    }

    // ✅ Replace window.confirm with modal confirm
    const ok = await confirmModal.confirm({
      title: "Create batch billing?",
      description: (
        <div className="space-y-2">
          <p>
            This will create billings for{" "}
            <span className="font-semibold">
              {formatInt(batchSummary.accounts_selected)}
            </span>{" "}
            account(s).
          </p>
          <p>
            Per-account adjustment:{" "}
            <span className="font-semibold">
              {formatCurrency(derived.adjustmentsPerAccount)}
            </span>
          </p>
          <p className="text-gray-500">This action cannot be undone.</p>
        </div>
      ),
      confirmText: "Create billings",
      cancelText: "Cancel",
      confirmTone: "primary",
    });

    if (!ok) {
      notify("info", "Batch billing creation cancelled.");
      return;
    }

    try {
      setSubmitting(true);

      await createAdminBillingBatch(buildPayload());

      notify(
        "success",
        `Batch billing successfully created for ${formatInt(
          batchSummary.accounts_selected
        )} account(s).`
      );

      router.push("/admin/billings");
    } catch (err: unknown) {
      fail(
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

      <ConfirmModal
        open={confirmModal.open}
        onClose={confirmModal.close}
        title={confirmModal.options.title}
        description={confirmModal.options.description}
        confirmText={confirmModal.options.confirmText}
        cancelText={confirmModal.options.cancelText}
        confirmTone={confirmModal.options.confirmTone}
        loading={submitting}
        onConfirm={confirmModal.accept}
      />
    </div>
  );
}
