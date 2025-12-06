import { getToken } from "@/lib/auth";
import { AdminSubscriber } from "./types";

export const API_BASE =
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

  return data;
}

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

export async function fetchPayment(id: string | number, token?: string | null) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `payment fetch failed: ${res.status}`);
  }
  return data;
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

export async function adminLogin(email: string, password: string) {
  const resp = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || "Admin login failed");
  }

  if (!data?.token) {
    throw new Error("No token returned from server.");
  }

  return data;
}

export async function fetchAllSubscribers(page = 1, token?: string | null) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/admin/subscribers`);
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `admin subscribers failed: ${res.status}`);
  }
  return data as {
    stats: {
      period_start: string;
      period_end: string;
      total_revenue: number;
      total_overdue: number;
      new_subscribers: number;
    };
    data: AdminSubscriber[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export async function fetchAllPaymentss(page: number, token: string) {
  const url = new URL(`${API_BASE}/api/admin/payments`);
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Error: ${res.status}`);
  }

  return {
    data: data.data || [],
    meta: data.meta || null,
  };
}

export async function fetchAdminPayment(
  id: number | string,
  token?: string | null
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/payments/${id}`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `admin payment fetch failed: ${res.status}`);
  }
  return data;
}

export async function updateAdminPayment(
  id: number | string,
  payload: {
    status?: string;
    payment_method?: string;
    amount?: number;
    reference_number?: string | null;
    invoice_number?: string | null;
  },
  token?: string | null
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/payments/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `admin payment update failed: ${res.status}`);
  }
  return data;
}
