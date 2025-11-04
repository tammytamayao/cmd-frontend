// lib/api.ts
import { getToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_RAILS_API_BASE || "http://localhost:3000";

export async function fetchCurrentUser(token?: string | null) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");
  const res = await fetch(`${API_BASE}/api/v1/session/me`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`me fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchBillings(token?: string | null, year?: number) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");
  const url = new URL(`${API_BASE}/api/v1/billings`);
  if (year) url.searchParams.set("year", String(year));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`billings fetch failed: ${res.status}`);
  return res.json(); // { data, meta }
}

export async function fetchPayments(token?: string | null, year?: number) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");
  const url = new URL(`${API_BASE}/api/v1/payments`);
  if (year) url.searchParams.set("year", String(year));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`payments fetch failed: ${res.status}`);
  return res.json(); // { data, meta }
}

export async function fetchOpenOrOverdueBillings(token?: string | null) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  // API will handle filtering using the controller's `status` param
  const url = new URL(`${API_BASE}/api/v1/billings`);
  url.searchParams.set("status", "open,overdue"); // Rails controller must handle comma-separated values

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`billings fetch failed: ${res.status}`);
  return res.json();
}
