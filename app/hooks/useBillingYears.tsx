"use client";

import { useEffect, useState } from "react";
import { fetchBillings } from "@/lib/api";

export function useBillingYears(token: string | null) {
  const currentYear = new Date().getFullYear();
  const [yearOptions, setYearOptions] = useState<number[]>([currentYear]);
  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    if (!token) return;

    let alive = true;
    (async () => {
      try {
        const res = await fetchBillings(token, { page: 1, perPage: 1 });
        if (!alive) return;

        const minY = res?.meta?.min_year ?? currentYear;
        const maxY = res?.meta?.max_year ?? currentYear;

        const years = Array.from(
          { length: maxY - minY + 1 },
          (_, i) => maxY - i
        );
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
