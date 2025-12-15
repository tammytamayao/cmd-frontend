"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { fetchAllSubscribers, fetchAdminSubscriber } from "@/lib/api";
import { AdminSubscriber } from "@/lib/types";
import { Pagination, PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import { formatDate } from "@/lib/helpers";
import { useRouter } from "next/navigation";
import { EditSubscriberModal } from "@/app/components/EditSubscriberModal";
import { SubscriberDetailsModal } from "@/app/components/SubscriberDetailsModal";

type Stats = {
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_overdue: number;
  new_subscribers: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<AdminSubscriber[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const [editing, setEditing] = useState<AdminSubscriber | null>(null);

  // details modal state
  const [viewing, setViewing] = useState<AdminSubscriber | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewErr, setViewErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const t = getToken();

      if (!t) {
        if (!cancelled) setErr("No token found. Please log in as staff.");
        return;
      }

      try {
        const data = await fetchAllSubscribers(page, t);
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

  async function openDetails(s: AdminSubscriber) {
    setViewErr(null);
    setViewLoading(true);

    // show something immediately (fast), then replace with fresh data
    setViewing(s);

    const token = getToken();
    if (!token) {
      setViewErr("No token found. Please log in as staff.");
      setViewLoading(false);
      return;
    }

    try {
      const res = await fetchAdminSubscriber(s.id, token);
      setViewing(res.data);
    } catch (e) {
      setViewErr(e instanceof Error ? e.message : "Failed to load subscriber");
    } finally {
      setViewLoading(false);
    }
  }

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
      <AdminSidebar active="subscribers" />

      <main className="flex-1 flex flex-col">
        <AdminHeader
          title="Subscriber Accounts"
          subtitle="Overview of subscriber information."
          actionLabel="Add Subscriber"
          onAction={() => router.push("/admin/subscribers/new")}
        />

        <section className="flex-1 px-8 py-6 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    SUBSCRIBER ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    SUBSCRIBER NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    ADDRESS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    INSTALLATION DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    PACKAGE PLAN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    PACKAGE SPEED
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSubs && filteredSubs.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No subscribers match your search.
                    </td>
                  </tr>
                )}

                {filteredSubs?.map((s, idx) => (
                  <tr
                    key={s.id}
                    onClick={() => openDetails(s)}
                    className={[
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/60",
                      "cursor-pointer hover:bg-indigo-50/40",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
                      {s.serial_number ||
                        `SUB-${String(s.id).padStart(5, "0")}`}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      {s.last_name}, {s.first_name}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      {s.zone ? `${s.zone}` : "Unknown"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      {s.date_installed ? formatDate(s.date_installed) : "-"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      {s.package ? `${s.package}` : "-"}
                      {s.plan ? `${s.plan}` : "-"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      Up to {s.package_speed ? `${s.package_speed}` : "0"} mbps
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      ₱
                      {(s.brate ?? 0).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // ✅ prevent row click
                          setEditing(s);
                        }}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </section>

        {/* DETAILS MODAL */}
        <SubscriberDetailsModal
          open={!!viewing}
          subscriber={viewing}
          onClose={() => {
            setViewing(null);
            setViewErr(null);
            setViewLoading(false);
          }}
          loading={viewLoading}
          error={viewErr}
        />

        {/* EDIT MODAL */}
        <EditSubscriberModal
          open={!!editing}
          subscriber={editing}
          onClose={() => setEditing(null)}
          onUpdated={(updated: AdminSubscriber) => {
            setSubs((prev) =>
              prev ? prev.map((x) => (x.id === updated.id ? updated : x)) : prev
            );

            // keep details modal in sync if it’s open for same subscriber
            setViewing((prev) => (prev?.id === updated.id ? updated : prev));
          }}
        />
      </main>
    </div>
  );
}
