"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { Pagination, PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import { formatDate, statusBadgeClasses } from "@/lib/helpers";

import { fetchAllPaymentss } from "@/lib/api";

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

  subscriber: {
    id: number | null;
    serial_number: string | null;
    first_name: string | null;
    last_name: string | null;
  };

  receipt: {
    filename: string | null;
    size: number | null;
    mime_type: string | null;
    uploaded_at: string | null;
  };
};

export default function AdminPaymentsPage() {
  const token = getToken();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetchAllPaymentss(page, token)
      .then((res) => {
        if (cancelled) return;
        setPayments(res.data);
        setMeta(res.meta);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Failed to load payments");
      });

    return () => {
      cancelled = true;
    };
  }, [page, token]);

  const filteredPayments = payments?.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(p.id).includes(q) ||
      (p.reference_number || "").toLowerCase().includes(q) ||
      (p.payment_method || "").toLowerCase().includes(q)
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

  if (!payments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">Loading payments…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar active="payments" />

      <main className="flex-1 flex flex-col">
        <AdminHeader
          title="Payment Records"
          subtitle="Review recent payments, statuses, and billing periods."
        />

        {/* Table */}
        <section className="flex-1 px-8 py-6">
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
                    BILLING PERIOD
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    MODE OF PAYMENT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    PAYMENT STATUS
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
                    <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
                      {p.subscriber?.serial_number || "—"}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {p.subscriber?.last_name}, {p.subscriber?.first_name}
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

            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </section>
      </main>
    </div>
  );
}
