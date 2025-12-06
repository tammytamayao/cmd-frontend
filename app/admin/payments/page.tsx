"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { Pagination, PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import { formatDate, statusBadgeClasses, titleCase } from "@/lib/helpers";

import { fetchAllPaymentss, fetchAdminPayment } from "@/lib/api";
import { PaymentDetailsModal } from "@/app/components/PaymentDetailsModal";
import {
  EditPaymentModal,
  AdminPayment as AdminPaymentForEdit,
} from "@/app/components/EditPaymentModal";

// ---------------- Types ----------------

type AdminPaymentSubscriber = {
  id: number | null;
  serial_number: string | null;
  first_name: string | null;
  last_name: string | null;
};

type AdminPaymentReceipt = {
  filename: string | null;
  size: number | null;
  mime_type: string | null;
  uploaded_at: string | null;
};

type AdminPayment = {
  id: number;
  payment_date: string | null;
  amount: number;
  payment_method: string;
  status: string;
  attachment: string | null;
  reference_number: string | null;
  invoice_number?: string | null;
  billing_id: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  billing_status: string | null;
  subscriber: AdminPaymentSubscriber;
  receipt: AdminPaymentReceipt;
  receipt_url?: string | null;
};

// ---------------- Main Page ----------------

export default function AdminPaymentsPage() {
  const token = getToken();
  const [payments, setPayments] = useState<AdminPayment[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // view modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<AdminPayment | null>(null);

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
      (p.invoice_number || "").toLowerCase().includes(q) || // include invoice in search
      (p.payment_method || "").toLowerCase().includes(q) ||
      (p.subscriber?.serial_number || "").toLowerCase().includes(q) ||
      (p.subscriber?.last_name || "").toLowerCase().includes(q)
    );
  });

  const handleViewDetails = async (id: number) => {
    if (!token) return;

    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedPayment(null);

    try {
      const res = await fetchAdminPayment(id, token);
      setSelectedPayment(res.data as AdminPayment);
    } catch (e) {
      setDetailsError(
        e instanceof Error ? e.message : "Failed to load payment details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenEdit = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetchAdminPayment(id, token);
      setEditPayment(res.data as AdminPayment);
      setEditOpen(true);
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to load payment for editing."
      );
    }
  };

  const handleCloseModal = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
    setDetailsError(null);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditPayment(null);
  };

  // after successful update, update local list
  const handlePaymentUpdated = (updated: AdminPayment) => {
    setPayments((prev) =>
      prev
        ? prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        : prev
    );
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
                    PAYMENT DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    BILLING PERIOD
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    MODE OF PAYMENT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    PAYMENT STATUS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments && filteredPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      No payments match your search.
                    </td>
                  </tr>
                )}

                {filteredPayments?.map((p, idx) => (
                  <tr
                    key={p.id}
                    onClick={() => handleViewDetails(p.id)}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    } cursor-pointer hover:bg-indigo-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
                      {p.subscriber?.serial_number || "—"}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {p.subscriber?.last_name}, {p.subscriber?.first_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle text-sm text-gray-900">
                      {formatDate(p.payment_date)}
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

                    <td className="px-4 py-3 align-middle text-sm text-gray-700">
                      {p.payment_method || "—"}
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(
                          p.status
                        )}`}
                      >
                        {titleCase(p.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-middle text-right space-x-2">
                      {/* Edit button should not trigger row click */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(p.id);
                        }}
                        className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
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
      </main>

      {/* View details modal */}
      <PaymentDetailsModal
        open={detailsOpen}
        onClose={handleCloseModal}
        payment={selectedPayment}
        loading={detailsLoading}
        error={detailsError}
      />

      {/* Edit payment modal */}
      <EditPaymentModal
        open={editOpen}
        onClose={handleCloseEdit}
        payment={editPayment as AdminPaymentForEdit | null}
        onUpdated={handlePaymentUpdated}
      />
    </div>
  );
}
