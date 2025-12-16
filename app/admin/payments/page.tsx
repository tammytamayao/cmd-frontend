"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

import { fetchAllPaymentss, fetchAdminPayment } from "@/lib/api";
import { PaymentDetailsModal } from "@/app/components/PaymentDetailsModal";
import {
  EditPaymentModal,
  AdminPayment as AdminPaymentForEdit,
} from "@/app/admin/payments/components/EditPaymentModal";
import { CreatePaymentModal } from "@/app/admin/payments/components/CreatePaymentModal";

// ✅ add this
import { AdminTableCard } from "@/app/components/admin/AdminTableCard";
import { PaymentsTable } from "@/app/admin/payments/components/PaymentsTable";

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

  // create modal state
  const [createOpen, setCreateOpen] = useState(false);

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
      (p.invoice_number || "").toLowerCase().includes(q) ||
      (p.payment_method || "").toLowerCase().includes(q) ||
      (p.subscriber?.serial_number || "").toLowerCase().includes(q) ||
      (p.subscriber?.last_name || "").toLowerCase().includes(q)
    );
  });

  const hasRows = !!filteredPayments && filteredPayments.length > 0;

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
          subtitle="Create and process payment of subscribers."
          actionLabel="Add Payment"
          onAction={() => setCreateOpen(true)}
        />

        <section className="flex-1 px-8 py-6">
          <AdminTableCard
            hasRows={hasRows}
            emptyTitle={
              search.trim()
                ? "No payments match your search"
                : "No payments yet"
            }
            emptyDescription={
              search.trim()
                ? "Try searching by invoice number, reference number, subscriber ID, or last name."
                : "Create your first payment record to get started."
            }
            emptyActionLabel="Add Payment"
            onEmptyAction={() => setCreateOpen(true)}
          >
            <PaymentsTable
              payments={filteredPayments ?? []}
              meta={hasRows ? meta : null}
              onPageChange={setPage}
              onRowClick={(p) => handleViewDetails(p.id)}
              onEdit={(p) => handleOpenEdit(p.id)}
            />
          </AdminTableCard>
        </section>
      </main>

      <PaymentDetailsModal
        open={detailsOpen}
        onClose={handleCloseModal}
        payment={selectedPayment}
        loading={detailsLoading}
        error={detailsError}
      />

      <EditPaymentModal
        open={editOpen}
        onClose={handleCloseEdit}
        payment={editPayment as AdminPaymentForEdit | null}
        onUpdated={handlePaymentUpdated}
      />

      <CreatePaymentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newPayment: AdminPayment) => {
          setPayments((prev) => (prev ? [newPayment, ...prev] : [newPayment]));
        }}
      />
    </div>
  );
}
