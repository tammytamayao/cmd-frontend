export function formatCurrency(n: number) {
  return n.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
