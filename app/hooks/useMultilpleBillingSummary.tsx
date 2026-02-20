// app/admin/billings/multiple/hooks/useMultipleBillingSummary.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminMultipleBillingSummary } from "@/lib/api";

export type MultipleBillingSummary = {
  group: string;
  accounts_selected: number;
  base_amount: number;
  billing_start?: string | null;
  billing_end?: string | null;
  existing_count?: number | null;
};

export function useMultipleBillingSummary(params: {
  subscriberIds: number[];
  billingStart?: string;
  billingEnd?: string;
  adjustmentsPerAccount: number;
}) {
  const { subscriberIds, billingStart, billingEnd, adjustmentsPerAccount } =
    params;

  const [summary, setSummary] = useState<MultipleBillingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (subscriberIds.length === 0) {
        setSummary(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetchAdminMultipleBillingSummary(
          subscriberIds,
          undefined,
          {
            billing_start: billingStart || undefined,
            billing_end: billingEnd || undefined,
          },
        );

        if (!cancelled) setSummary(res as MultipleBillingSummary);
      } catch (e) {
        if (cancelled) return;
        setSummary(null);
        setError(
          e instanceof Error ? e.message : "Failed to load billing summary.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subscriberIds.join(","), billingStart, billingEnd]); // stable dependency

  const accountsSelected = subscriberIds.length;

  const derived = useMemo(() => {
    const baseAmount = summary?.base_amount ?? 0;
    const adjustmentsBatchTotal = adjustmentsPerAccount * accountsSelected;
    const totalBillingAmount = baseAmount + adjustmentsBatchTotal;

    return {
      baseAmount,
      adjustmentsBatchTotal,
      totalBillingAmount,
    };
  }, [summary, adjustmentsPerAccount, accountsSelected]);

  return {
    summary,
    loading,
    error,
    accountsSelected,
    derived,
  };
}
