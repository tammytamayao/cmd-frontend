import { getToken } from "@/lib/auth";
import {
  AdminBilling,
  AdminSubscriber,
  Billing,
  PaginationMeta,
} from "./types";

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

/**
 * Subscriber billings (V1)
 * Backend supports:
 *   ?year=2025
 *   ?start_year=2024&end_year=2025
 *   ?status=paid,unpaid,overdue
 *     - overdue = unpaid + due_date < today (handled server-side)
 */
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

/**
 * Fetch billings that are NOT fully settled:
 *  - unpaid (including those that are overdue)
 *  - overdue (derived on the server as unpaid + past due_date)
 *
 * Backend: ?status=unpaid,overdue
 * (Your V1 controller ORs these together.)
 */

export type BillingListResponse = {
  data: Billing[];
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

/**
 * Fetch unpaid + overdue billings
 * backend treats "overdue" as (unpaid + due_date < today)
 */
export async function fetchOpenOrOverdueBillings(
  token?: string | null
): Promise<BillingListResponse> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/v1/billings`);
  url.searchParams.set("status", "unpaid,overdue");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `billings fetch failed: ${res.status}`);
  }

  return json as BillingListResponse;
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
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `admin payment update failed: ${res.status}`);
  }

  return data; // { data: { ...payment... } } from your controller
}

/**
 * ADMIN: BILLINGS
 *
 * Backend:
 *   GET /api/admin/billings
 *     - optional ?page=
 *     - optional ?subscriber_id=123
 *
 *   GET /api/admin/billings/:id
 */

export async function fetchAdminBillings(
  page = 1,
  token?: string | null,
  subscriberId?: number | string
): Promise<{ data: AdminBilling[]; meta: PaginationMeta }> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/admin/billings`);
  url.searchParams.set("page", String(page));

  if (subscriberId != null) {
    url.searchParams.set("subscriber_id", String(subscriberId));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `admin billings failed: ${res.status}`);
  }

  return {
    data: data.data as AdminBilling[],
    meta: data.meta as PaginationMeta,
  };
}

/** Get a single billing (with subscriber attached) */
export async function fetchAdminBilling(
  id: number | string,
  token?: string | null
): Promise<{ data: AdminBilling }> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/billings/${id}`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `admin billing fetch failed: ${res.status}`);
  }

  return {
    data: data.data as AdminBilling,
  };
}

export async function updateAdminBilling(
  id: number | string,
  payload: {
    status?: string;
    start_date?: string | null;
    end_date?: string | null;
    due_date?: string | null;
    amount?: number;
  },
  token?: string | null
): Promise<{ data: AdminBilling }> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/billings/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `admin billing update failed: ${res.status}`);
  }

  return {
    data: data.data as AdminBilling,
  };
}

// Get batch billing summary (all subscribers by default)
export async function fetchAdminBillingBatchSummary(
  group: "all" | "specific" = "all",
  subscriberIds?: (number | string)[],
  token?: string | null
): Promise<{ group: string; accounts_selected: number; base_amount: number }> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/admin/billings/batch_summary`);
  url.searchParams.set("group", group);

  if (group === "specific" && subscriberIds && subscriberIds.length > 0) {
    // send as comma-separated for simplicity
    url.searchParams.set("subscriber_ids", subscriberIds.join(","));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `admin billing batch summary failed: ${res.status}`
    );
  }

  return data as {
    group: string;
    accounts_selected: number;
    base_amount: number;
  };
}

export async function createAdminBillingBatch(
  payload: {
    group?: "all" | "specific";
    subscriber_ids?: (number | string)[];
    billing_month?: string | null;
    due_date: string;
    adjustment_per_account?: number;
    adjustment_notes?: string | null;
  },
  token?: string | null
): Promise<{
  group: string;
  accounts_selected: number;
  created_count: number;
}> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/billings/batch_create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `admin billing batch create failed: ${res.status}`
    );
  }

  return data as {
    group: string;
    accounts_selected: number;
    created_count: number;
  };
}
