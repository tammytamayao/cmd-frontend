// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";
import { fetchAdminSubscribers, type AdminSubscriber } from "@/lib/api";

type PaginationMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

type Stats = {
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_overdue: number;
  new_subscribers: number;
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

function statusBadgeClasses(status: string | null): string {
  const normalized = (status || "").toLowerCase();

  if (normalized === "closed" || normalized === "paid") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }
  if (normalized === "overdue") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }
  if (normalized === "open") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-gray-50 text-gray-600 ring-gray-100";
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<AdminSubscriber[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const t = getToken();

      if (!t) {
        if (!cancelled) {
          setErr("No token found. Please log in as staff.");
        }
        return;
      }

      try {
        const data = await fetchAdminSubscribers(page, t);
        if (cancelled) return;

        setStats(data.stats);
        setSubs(data.data);
        setMeta(data.meta);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load dashboard");
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  const canPrev = meta ? meta.page > 1 : false;
  const canNext = meta ? meta.page < meta.total_pages : false;

  const filteredSubs = subs?.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (s.serial_number || "").toLowerCase().includes(q) ||
      String(s.id).includes(q)
    );
  });

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm">
          {err}
        </div>
      </div>
    );
  }

  if (!stats || !subs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (same style as payments page, but Dashboard active) */}
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
          {/* Subscribers (currently highlighted) */}
          <button
            type="button"
            onClick={() => router.push("/admin/subscribers")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium"
          >
            <span>🏠</span>
            <span>Subscribers</span>
          </button>

          {/* Payments */}
          <button
            type="button"
            onClick={() => router.push("/admin/payments")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
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

          {/* Logout */}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Subscriber Accounts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of subscriber information.
            </p>
          </div>
        </header>

        <section className="flex-1 px-8 py-6 space-y-6">
          {/* Subscribers table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    ACCOUNT ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    SUBSCRIBER NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    DUE DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs && filteredSubs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No subscribers match your search.
                    </td>
                  </tr>
                )}

                {filteredSubs?.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                  >
                    {/* Account ID */}
                    <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
                      {s.serial_number ||
                        `SUB-${String(s.id).padStart(5, "0")}`}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {s.first_name || s.last_name
                        ? `${s.first_name} ${s.last_name}`
                        : "Unknown"}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ₱
                      {(s.latest_billing_amount ?? s.brate ?? 0).toLocaleString(
                        "en-PH",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>

                    {/* Due date */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(s.latest_billing_due_date)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(
                          s.latest_billing_status
                        )}`}
                      >
                        {s.latest_billing_status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer pagination */}
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

              <div className="flex items-center gap-1">
                <button
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                  className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 disabled:opacity-40"
                >
                  ‹
                </button>
                {meta && (
                  <span className="px-2">
                    {meta.page} / {meta.total_pages}
                  </span>
                )}
                <button
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                  className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-600 disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
