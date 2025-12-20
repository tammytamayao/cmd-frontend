"use client";

import { useEffect, useState } from "react";
import { fetchOpenOrOverdueBillings } from "@/lib/api";
import type { Billing } from "@/lib/types";

export function useOpenBillings(token: string | null) {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingId, setBillingId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!token) return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const json = await fetchOpenOrOverdueBillings(token);
        const list: Billing[] = json?.data ?? [];

        list.sort(
          (a, b) =>
            new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
        );

        if (!alive) return;
        setBillings(list);
        setBillingId(list.length > 0 ? list[0].id : null);
      } catch (e) {
        if (!alive) return;
        console.error("Failed to load billings", e);
        setBillings([]);
        setBillingId(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  return { billings, billingsLoading: loading, billingId, setBillingId };
}
