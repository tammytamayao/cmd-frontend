export function formatCurrency(n: number) {
  return n.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function statusBadgeClasses(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized === "completed" || normalized === "paid") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }
  if (normalized === "processing") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }
  if (normalized === "overdue") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }
  if (normalized === "pending") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-gray-50 text-gray-600 ring-gray-100";
}

export function normalizeBillingStatus(
  s: string
): "paid" | "overdue" | "unpaid" {
  const lower = s.toLowerCase();
  if (lower === "open" || lower === "unpaid") return "unpaid";
  if (lower === "overdue") return "overdue";
  if (lower === "closed" || lower === "paid") return "paid";
  return "paid";
}

export function paymentTone(status: string): "green" | "red" | "gray" {
  const lower = status.toLowerCase();
  if (lower === "confirmed") return "green";
  if (lower === "processing") return "gray";
  if (lower === "failed") return "red";
  return "gray";
}

export function titleCase(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}
