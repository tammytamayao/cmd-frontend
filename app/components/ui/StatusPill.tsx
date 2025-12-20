"use client";

import { titleCase } from "@/lib/helpers";

type PillTone = "success" | "danger" | "warning" | "info" | "neutral";

const toneClasses: Record<PillTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  danger: "bg-rose-50 text-rose-700 ring-rose-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  info: "bg-sky-50 text-sky-700 ring-sky-100",
  neutral: "bg-gray-50 text-gray-600 ring-gray-100",
};

export function StatusPill({
  label,
  tone = "neutral",
  className = "",
}: {
  label: string;
  tone?: PillTone;
  className?: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 " +
        toneClasses[tone] +
        " " +
        className
      }
    >
      {titleCase(label)}
    </span>
  );
}
