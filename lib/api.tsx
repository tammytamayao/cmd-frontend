import { getToken } from "@/lib/auth";
import { AdminBilling, AdminSubscriber, PaginationMeta } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_RAILS_API_BASE || "http://localhost:3000";

export async function login(serialNumber: string, password: string) {
  const resp = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serial_number: serialNumber, password }),
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

export async function fetchBillings(
  token?: string | null,
  opts?: { year?: number; page?: number; perPage?: number }
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/v1/billings`);

  if (opts?.year) url.searchParams.set("year", String(opts.year));
  if (opts?.page) url.searchParams.set("page", String(opts.page));
  if (opts?.perPage) url.searchParams.set("per_page", String(opts.perPage));

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
  url.searchParams.set("status", "unpaid,overdue");

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

export async function fetchAllSubscribers(
  page = 1,
  token?: string | null,
  q?: string
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/admin/subscribers`);
  url.searchParams.set("page", String(page));

  // ✅ add search query
  if (q && q.trim()) {
    url.searchParams.set("q", q.trim());
  }

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

export async function fetchAllPayments(
  page: number,
  token: string,
  q?: string
) {
  const url = new URL(`${API_BASE}/api/admin/payments`);
  url.searchParams.set("page", String(page));
  if (q && q.trim()) url.searchParams.set("q", q.trim());

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
  return data;
}

/**
 * ADMIN: BILLINGS (NEW)
 *
 * Backend:
 *   GET /api/admin/billings
 *     - optional ?page=
 *     - optional ?subscriber_id=123
 *
 *   GET /api/admin/billings/:id
 */

/**
 * List billings (optionally filtered by subscriber).
 * Includes subscriber data in each billing (as per controller).
 */
export async function fetchAdminBillings(
  page = 1,
  token?: string | null,
  opts?: {
    subscriberId?: number | string;
    q?: string;
  }
): Promise<{ data: AdminBilling[]; meta: PaginationMeta }> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/admin/billings`);
  url.searchParams.set("page", String(page));

  if (opts?.subscriberId != null) {
    url.searchParams.set("subscriber_id", String(opts.subscriberId));
  }

  if (opts?.q && opts.q.trim()) {
    url.searchParams.set("q", opts.q.trim());
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
    data: (data.data || []) as AdminBilling[],
    meta: (data.meta || null) as PaginationMeta,
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

// api.ts

export async function createAdminBillingBatch(
  payload: {
    group?: "all" | "specific";
    subscriber_ids?: (number | string)[];

    billing_start: string;
    billing_end: string;
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

export async function createAdminPayment(
  form: FormData,
  token?: string | null
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/payments`, {
    method: "POST",
    body: form,
    headers: { Authorization: `Bearer ${t}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `admin payment create failed: ${res.status}`);
  }
  return data; // { data: payment }
}

/**
 * Fetch a subscriber's billings for "select billing" dropdown.
 * (reuse existing admin billings endpoint)
 */
export async function fetchAdminBillingsBySubscriber(
  subscriberId: number | string,
  token?: string | null,
  opts?: {
    status?: string;
    page?: number;
    perPage?: number;
  }
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const url = new URL(`${API_BASE}/api/admin/billings`);
  url.searchParams.set("subscriber_id", String(subscriberId));

  if (opts?.status) {
    url.searchParams.set("status", opts.status);
  }

  if (opts?.page) {
    url.searchParams.set("page", String(opts.page));
  } else {
    url.searchParams.set("page", "1");
  }

  if (opts?.perPage) {
    url.searchParams.set("per_page", String(opts.perPage));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `admin billings failed: ${res.status}`);
  }

  return data as { data: AdminBilling[]; meta: PaginationMeta };
}

export async function createAdminSubscriber(
  payload: {
    collector?: string | null;
    zone?: string | null;
    date_installed?: string | null;
    last_name: string;
    first_name: string;
    phone_number: string;
    alternative_phone?: string | null;
    serial_number?: string | null;
    tvconnect?: boolean;
    package?: string | null;
    plan?: string | null;
    brate?: number | null;
    mc_address?: string | null;
    stb?: string | null;
    cas?: string | null;
    package_speed?: number | null;
    requires_password_change?: boolean;
  },
  token?: string | null
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/subscribers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscriber: payload }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `admin subscriber create failed: ${res.status}`
    );
  }
  return data as { data: AdminSubscriber };
}

export async function updateAdminSubscriber(
  id: number | string,
  payload: {
    collector?: string | null;
    zone?: string | null;
    date_installed?: string | null;
    last_name?: string | null;
    first_name?: string | null;
    phone_number?: string | null;
    alternative_phone?: string | null;
    serial_number?: string | null;
    tvconnect?: boolean;
    package?: string | null;
    plan?: string | null;
    brate?: number | null;
    mc_address?: string | null;
    stb?: string | null;
    cas?: string | null;
    package_speed?: number | null;
    requires_password_change?: boolean;
  },
  token?: string | null
) {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/subscribers/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscriber: payload }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `admin subscriber update failed: ${res.status}`
    );
  }
  return data as { data: AdminSubscriber };
}

export async function fetchAdminSubscriber(
  id: number | string,
  token?: string | null
): Promise<{ data: AdminSubscriber }> {
  const t = token ?? getToken();
  if (!t) throw new Error("no token");

  const res = await fetch(`${API_BASE}/api/admin/subscribers/${id}`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `admin subscriber fetch failed: ${res.status}`
    );
  }

  return data as { data: AdminSubscriber };
}
