import {
  AdminSubscriber,
  EditSubscriberForm,
  LoginMode,
  ValidationResult,
} from "./types";

export function formatCurrency(n: number) {
  return n.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
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
  // 🔹 NEW: rejected / failed
  if (normalized === "rejected" || normalized === "failed") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
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

export function titleCase(s: string) {
  if (!s) return s;
  return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}

export function validate(
  mode: LoginMode,
  serialNumber: string,
  email: string,
  password: string
): ValidationResult {
  const pwd = password.trim();
  if (pwd.length < 6)
    return { ok: false, message: "Password must be at least 6 characters." };

  if (mode === "subscriber") {
    const sn = serialNumber.trim();
    if (!sn || sn.length < 6 || !sn.includes("-")) {
      return {
        ok: false,
        message: "Please enter a valid serial number (e.g. 105959-210).",
      };
    }
    return { ok: true };
  }

  const em = email.trim();
  if (!em || !em.includes("@"))
    return { ok: false, message: "Please enter a valid email address." };

  return { ok: true };
}

export function normalizeError(e: unknown) {
  return e instanceof Error ? e.message : "Login failed";
}

export function billingTone(status: string): "success" | "danger" | "neutral" {
  const s = normalizeBillingStatus(status);
  if (s === "paid") return "success";
  if (s === "overdue") return "danger";
  return "neutral"; // unpaid
}

export function paymentTone(
  status: string
): "success" | "danger" | "info" | "neutral" {
  const s = status.toLowerCase();
  if (s === "completed" || s === "paid") return "success";
  if (s === "processing") return "info";
  if (s === "failed" || s === "rejected") return "danger";
  return "neutral";
}

export function paymentLabel(status: string) {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "Completed";
  if (s === "failed" || s === "rejected") return "Rejected";
  if (s === "processing") return "Processing";
  return titleCase(status);
}

export function formatRangeLabel(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const startText = Number.isNaN(start.getTime())
    ? startISO
    : start.toLocaleDateString("en-PH", opts);

  const endText = Number.isNaN(end.getTime())
    ? endISO
    : end.toLocaleDateString("en-PH", opts);

  return `${startText} – ${endText}`;
}

export function toEditSubscriberForm(s: AdminSubscriber): EditSubscriberForm {
  return {
    last_name: s.last_name ?? "",
    first_name: s.first_name ?? "",
    phone_number: s.phone_number ?? "",
    alternative_phone: (s.alternative_phone ?? "") as string,
    zone: s.zone ?? "",

    collector: (s.collector ?? "") as string,
    date_installed: s.date_installed ?? "",
    serial_number: s.serial_number ?? "",
    tvconnect: !!s.tvconnect,

    package: (s.package ?? "") as string,
    plan: s.plan ?? "",
    brate: s.brate != null ? String(s.brate) : "",
    package_speed: s.package_speed != null ? String(s.package_speed) : "",

    mc_address: (s.mc_address ?? "") as string,
    stb: (s.stb ?? "") as string,
    cas: (s.cas ?? "") as string,

    requires_password_change: !!s.requires_password_change,
  };
}

export function computePackagePlanLabel(s: AdminSubscriber | null): string {
  if (!s) return "-";
  return `${s.package ?? ""}${s.plan ?? ""}`.trim() || "-";
}

export function formatInt(n: number) {
  return n.toLocaleString("en-PH");
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function expectedPasswordForNow(now = new Date()) {
  const mm = pad2(now.getMonth() + 1);
  const yyyy = String(now.getFullYear());
  return `cmdcableunlifibermax${mm}${yyyy}`;
}
