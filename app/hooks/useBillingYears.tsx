"use client";

import { useEffect, useState } from "react";
import { fetchBillings, fetchPayments } from "@/lib/api";

export function useBillingYears(token: string | null) {
  const currentYear = new Date().getFullYear();
  const [yearOptions, setYearOptions] = useState<number[]>([currentYear]);
  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    if (!token) return;

    let alive = true;

    (async () => {
      try {
        const [billRes, payRes] = await Promise.all([
          fetchBillings(token, { page: 1, perPage: 1 }),
          fetchPayments(token, { page: 1, perPage: 1 }),
        ]);

        if (!alive) return;

        const billMin = billRes?.meta?.min_year;
        const billMax = billRes?.meta?.max_year;

        const payMin = payRes?.meta?.min_year;
        const payMax = payRes?.meta?.max_year;

        const minY = Math.min(billMin ?? currentYear, payMin ?? currentYear);

        const maxY = Math.max(billMax ?? currentYear, payMax ?? currentYear);

        const years =
          maxY >= minY
            ? Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i)
            : [currentYear];

        setYearOptions(years);

        setYear((prev) => (prev < minY || prev > maxY ? maxY : prev));
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token, currentYear]);

  return { year, setYear, yearOptions };
}
