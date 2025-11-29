// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_RAILS_API_BASE || "http://localhost:3000";

type Payment = {
  id: number;
  payment_date: string | null;
  amount: number;
  payment_method: string;
  status: string;
  attachment: string | null;
  reference_number: string | null;
  billing_id: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  billing_status: string | null;
  receipt: {
    filename: string | null;
    size: number | null;
    mime_type: string | null;
    uploaded_at: string | null;
  };
};

type PaginationMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function statusBadgeClasses(status: string): string {
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

export default function AdminPaymentsPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = getToken();
    if (!t) {
      setErr("No token found. Please log in as staff.");
      return;
    }

    const load = async () => {
      try {
        const url = new URL(`${API_BASE}/api/admin/payments`);
        url.searchParams.set("page", String(page));

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${t}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error: ${res.status}`);

        setPayments(data.data || []);
        setMeta(data.meta || null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load payments");
      }
    };

    load();
  }, [page]);

  const canPrev = meta ? meta.page > 1 : false;
  const canNext = meta ? meta.page < meta.total_pages : false;

  const filteredPayments = payments?.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(p.id).includes(q) ||
      (p.reference_number || "").toLowerCase().includes(q) ||
      (p.payment_method || "").toLowerCase().includes(q)
    );
  });

  const handleLogout = () => {
    clearToken();
    router.push("/"); // or "/login" if that’s your login route
  };

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm">
          {err}
        </div>
      </div>
    );
  }

  if (!payments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">Loading payments…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Admin</div>
            <div className="text-xs text-gray-500">Billing Department</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </button>

          {/* Payments (current page – highlighted) */}
          <button
            type="button"
            onClick={() => router.push("/admin/payments")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium"
          >
            <span>💳</span>
            <span>Payments</span>
          </button>

          {/* Billings */}
          <button
            type="button"
            onClick={() => router.push("/admin/billings")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <span>📄</span>
            <span>Billings</span>
          </button>

          {/* Reports */}
          <button
            type="button"
            onClick={() => router.push("/admin/reports")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <span>📊</span>
            <span>Reports</span>
          </button>

          {/* Logout (NOW directly below Reports) */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-4"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 text-xs text-gray-400">
          © {new Date().getFullYear()} CMD
        </div>

        {/* Logout */}
        {/* <div className="px-3 pb-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
          <div className="px-2 pt-3 text-xs text-gray-400">
            © {new Date().getFullYear()} CMD
          </div>
        </div> */}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment Records
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review recent payments, statuses, and billing periods.
            </p>
          </div>

          <div className="w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by ID, reference, or method"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          </div>
        </header>

        {/* Filters + table */}
        <section className="flex-1 px-8 py-6">
          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500">Filter by:</span>

              <button className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1">
                <span className="text-gray-600">Payment Status</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </button>

              <button className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1">
                <span className="text-gray-600">Payment Method</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </button>

              <button className="text-xs text-indigo-600 ml-2">
                Clear all filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3 text-left text-xs font-medium text-gray-500">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Billing Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments && filteredPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No payments match your search.
                    </td>
                  </tr>
                )}

                {filteredPayments?.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          Payment #{p.id}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(p.payment_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-gray-700">
                      {p.billing_period_start && p.billing_period_end ? (
                        <>
                          {formatDate(p.billing_period_start)} –{" "}
                          {formatDate(p.billing_period_end)}
                        </>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-gray-900">
                      ₱
                      {p.amount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-gray-700">
                      {p.payment_method || "—"}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer / pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
              <div>
                {meta && (
                  <span>
                    Showing{" "}
                    <span className="font-medium">
                      {meta.total === 0
                        ? 0
                        : (meta.page - 1) * meta.per_page + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(meta.page * meta.per_page, meta.total)}
                    </span>{" "}
                    of <span className="font-medium">{meta.total}</span> results
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
