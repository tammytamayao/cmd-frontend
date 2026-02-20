"use client";

import { useMemo, useState } from "react";
import type { AdjustmentItem } from "@/lib/types";

type AddResult = { ok: true } | { ok: false; error: string };

export function useAdjustments() {
  const [adjAmount, setAdjAmount] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
  const [nextAdjId, setNextAdjId] = useState(1);

  const adjustmentsPerAccount = useMemo(() => {
    return adjustments.reduce((sum, item) => sum + item.amount, 0);
  }, [adjustments]);

  const parsedAdjAmount = useMemo(() => {
    const raw = adjAmount.trim();
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [adjAmount]);

  const validationError = useMemo(() => {
    const desc = adjustmentNotes.trim();
    if (!desc && !adjAmount.trim()) return null; // user hasn't started yet
    if (!desc) return "Please enter an adjustment description.";
    if (parsedAdjAmount === null)
      return "Please enter a valid adjustment amount.";
    return null;
  }, [adjustmentNotes, adjAmount, parsedAdjAmount]);

  const canAdd = useMemo(() => {
    return !validationError;
  }, [validationError]);

  const addAdjustment = (): AddResult => {
    const desc = adjustmentNotes.trim();
    const amount = parsedAdjAmount;

    if (!desc)
      return { ok: false, error: "Please enter an adjustment description." };
    if (amount === null)
      return { ok: false, error: "Please enter a valid adjustment amount." };

    setAdjustments((prev) => [
      ...prev,
      { id: nextAdjId, description: desc, amount },
    ]);
    setNextAdjId((id) => id + 1);

    // reset inputs after successful add
    setAdjustmentNotes("");
    setAdjAmount("");

    return { ok: true };
  };

  const removeAdjustment = (id: number) => {
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAllAdjustments = () => {
    setAdjustments([]);
  };

  return {
    // inputs
    adjAmount,
    setAdjAmount,
    adjustmentNotes,
    setAdjustmentNotes,

    // list
    adjustments,
    adjustmentsPerAccount,

    // validation + actions
    canAdd,
    validationError,
    addAdjustment,
    removeAdjustment,
    clearAllAdjustments,
  };
}
