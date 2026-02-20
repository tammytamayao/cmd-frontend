// app/admin/billings/multiple/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

import { BillingAdjustmentCard } from "@/app/admin/billings/components/BillingAdjustmentCard";
import { BillingConfigurationCard } from "@/app/admin/billings/components/BillingConfigurationCard";
import { BillingRunSummaryCard } from "@/app/admin/billings/components/BillingRunSummaryCard";
import { FinalizeRunCard } from "@/app/admin/billings/components/FinalizeRunCard";

import { useNotification } from "@/app/notification/NotificationProvider";
import { useConfirm } from "@/app/hooks/useConfirm";
import { ConfirmModal } from "@/app/components/ConfirmModal";

import { createAdminMultipleBillings } from "@/lib/api";
import { formatCurrency, formatInt } from "@/lib/helpers";
import { SubscriberSelectionCard } from "../components/SubscriberSelectionCard";
import { useAdjustments } from "@/app/hooks/useAdjustments";
import { useMultipleBillingSummary } from "@/app/hooks/useMultilpleBillingSummary";
import { SelectedSubscriber } from "@/lib/types";

function isValidISODate(d: string) {
  if (!d) return false;
  const dt = new Date(d);
  return !Number.isNaN(dt.getTime());
}

export default function AdminMultipleBillingPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const confirmModal = useConfirm();

  const fail = (message: string) => notify("error", message);

  const [billingStart, setBillingStart] = useState("");
  const [billingEnd, setBillingEnd] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [selected, setSelected] = useState<SelectedSubscriber[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    adjAmount,
    setAdjAmount,
    adjustmentNotes,
    setAdjustmentNotes,
    adjustments,
    adjustmentsPerAccount,
    canAdd,
    validationError,
    addAdjustment,
    removeAdjustment,
  } = useAdjustments();

  const subscriberIds = useMemo(() => selected.map((s) => s.id), [selected]);

  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    accountsSelected,
    derived,
  } = useMultipleBillingSummary({
    subscriberIds,
    billingStart,
    billingEnd,
    adjustmentsPerAccount,
  });

  const buildPayload = (): Parameters<
    typeof createAdminMultipleBillings
  >[0] => {
    const payload: Parameters<typeof createAdminMultipleBillings>[0] = {
      subscriber_ids: subscriberIds,
      billing_start: billingStart,
      billing_end: billingEnd,
      due_date: dueDate,
    };

    if (adjustments.length > 0) {
      payload.adjustment_per_account = adjustmentsPerAccount;
      payload.adjustment_notes = adjustments
        .map((a) => a.description)
        .join("; ");
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountsSelected <= 0)
      return fail("Please add at least one subscriber.");
    if (!billingStart) return fail("Please select a billing start date.");
    if (!billingEnd) return fail("Please select a billing end date.");
    if (!isValidISODate(billingStart) || !isValidISODate(billingEnd)) {
      return fail("Please select valid billing start/end dates.");
    }
    if (billingStart > billingEnd) {
      return fail("Billing start date must be on or before billing end date.");
    }
    if (!dueDate) return fail("Please select a due date.");

    const ok = await confirmModal.confirm({
      title: "Create multiple billings?",
      description: (
        <div className="space-y-2">
          <p>
            This will create billings for{" "}
            <span className="font-semibold">{formatInt(accountsSelected)}</span>{" "}
            subscriber(s).
          </p>
          <p>
            Base amount (computed):{" "}
            <span className="font-semibold">
              {summaryLoading ? "Loading…" : formatCurrency(derived.baseAmount)}
            </span>
          </p>
          <p>
            Per-account adjustment:{" "}
            <span className="font-semibold">
              {formatCurrency(adjustmentsPerAccount)}
            </span>
          </p>

          {typeof summary?.existing_count === "number" &&
          summary.existing_count > 0 ? (
            <p className="text-amber-700">
              Existing billings for this period:{" "}
              <span className="font-semibold">
                {formatInt(summary.existing_count)}
              </span>{" "}
              (duplicates may be skipped)
            </p>
          ) : null}

          <p className="text-gray-500">This action cannot be undone.</p>
        </div>
      ),
      confirmText: "Create billings",
      cancelText: "Cancel",
      confirmTone: "primary",
    });

    if (!ok) {
      notify("info", "Multiple billing creation cancelled.");
      return;
    }

    try {
      setSubmitting(true);
      await createAdminMultipleBillings(buildPayload());

      notify(
        "success",
        `Multiple billing successfully created for ${formatInt(accountsSelected)} subscriber(s).`,
      );

      router.push("/admin/billings");
    } catch (err: unknown) {
      fail(
        err instanceof Error
          ? err.message
          : "Failed to create multiple billings.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => router.push("/admin/billings");

  const displayAccountsSelected = summaryLoading
    ? "Loading..."
    : formatInt(accountsSelected);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar active="billings" />

      <main className="flex-1 flex flex-col">
        <AdminHeader
          title="Multiple Billing"
          subtitle="Create a billing run for selected subscribers."
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
              <SubscriberSelectionCard
                selected={selected}
                onAdd={(s) =>
                  setSelected((prev) =>
                    prev.some((x) => x.id === s.id) ? prev : [...prev, s],
                  )
                }
                onRemove={(id) =>
                  setSelected((prev) => prev.filter((x) => x.id !== id))
                }
              />

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
                onAddAdjustment={() => {
                  const res = addAdjustment();
                  if (!res.ok) notify("warning", res.error);
                  else notify("success", "Adjustment added.");
                }}
                onRemoveAdjustment={(id) => {
                  removeAdjustment(id);
                  notify("info", "Adjustment removed.");
                }}
                adjustments={adjustments}
                formatPeso={(n) => formatCurrency(n).replace(/^₱/, "").trim()}
                addDisabled={!canAdd}
                validationError={validationError}
              />
            </div>

            <div className="space-y-4">
              <BillingRunSummaryCard
                billingType="Multiple Subscribers"
                displayAccountsSelected={
                  submitting ? "Creating..." : displayAccountsSelected
                }
                baseAmount={derived.baseAmount}
                adjustmentsBatchTotal={derived.adjustmentsBatchTotal}
                totalBillingAmount={derived.totalBillingAmount}
                summaryError={
                  accountsSelected === 0
                    ? "No subscribers selected."
                    : summaryError
                }
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
