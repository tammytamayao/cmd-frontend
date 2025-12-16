"use client";

import { useState } from "react";
import { fetchPayment } from "@/lib/api";
import type { PaymentDetail } from "@/lib/types";

export function usePaymentDetails(token: string | null) {
  const [open, setOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openForPayment = async (id: string | number) => {
    if (!token) return;

    setOpen(true);
    setLoading(true);
    setError(null);
    setPayment(null);

    try {
      const res = await fetchPayment(id, token);
      setPayment(res.data as PaymentDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setPayment(null);
    setError(null);
  };

  return { open, payment, loading, error, openForPayment, close };
}
