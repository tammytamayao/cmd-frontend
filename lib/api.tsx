import { getToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_RAILS_API_BASE || "http://localhost:3000";

export async function login(phone: string, password: string) {
  const resp = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phone, password }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || "Login failed");
  }

  if (!data?.token) {
    throw new Error("No token returned from server.");
  }

  return data; // expected { token, ... }
}

export async function fetchCurrentUser(token?: string | null) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");
  // Keep your existing endpoint:
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
  return res.json();
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
  return res.json();
}

export async function fetchOpenOrOverdueBillings(token?: string | null) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/v1/billings`);
  url.searchParams.set("status", "open,overdue");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`billings fetch failed: ${res.status}`);
  return res.json();
}

export async function createPayment(form: FormData, token?: string | null) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");
  const res = await fetch(`${API_BASE}/api/v1/payments`, {
    method: "POST",
    body: form,
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`payment create failed: ${res.status} ${txt}`);
  }
  return res.json();
}
