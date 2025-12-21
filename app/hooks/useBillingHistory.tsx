"use client";

import { useEffect, useState } from "react";
import { fetchBillings, fetchPayments } from "@/lib/api";
import type { Billing, HistoryTab, Payment } from "@/lib/types";

export function useBillingHistory(
  token: string | null,
  tab: HistoryTab,
  year: number
) {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (tab === "bills") {
          const res = await fetchBillings(token, { year });
          if (!alive) return;
          setBillings((res.data as Billing[]) ?? []);
        } else {
          const res = await fetchPayments(token, { year });
          if (!alive) return;
          setPayments((res.data as Payment[]) ?? []);
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : String(err));
        if (tab === "bills") setBillings([]);
        else setPayments([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token, tab, year]);

  return { billings, payments, loading, error };
}
