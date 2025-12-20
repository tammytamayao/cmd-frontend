"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

import { fetchAllPayments, fetchAdminPayment } from "@/lib/api";
import { PaymentDetailsModal } from "@/app/admin/payments/components/PaymentDetailsModal";
import { EditPaymentModal } from "@/app/admin/payments/components/EditPaymentModal";
import { CreatePaymentModal } from "@/app/admin/payments/components/CreatePaymentModal";
import { AdminTableCard } from "@/app/components/admin/AdminTableCard";
import { PaymentsTable } from "@/app/admin/payments/components/PaymentsTable";
import { AdminPayment } from "@/lib/types";
import { AdminSearchInput } from "@/app/components/admin/AdminSearchInput";
import { useDebounce } from "@/app/hooks/useDebounce";

export default function AdminPaymentsPage() {
  const token = getToken();

  const [payments, setPayments] = useState<AdminPayment[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [tableLoading, setTableLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<AdminPayment | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    setTableLoading(true);
    setErr(null);

    fetchAllPayments(page, token, debouncedSearch)
      .then((res) => {
        if (cancelled) return;
        setPayments(res.data);
        setMeta(res.meta);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Failed to load payments");
      })
      .finally(() => {
        if (cancelled) return;
        setTableLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, token, debouncedSearch]);

  const hasRows = !!payments && payments.length > 0;

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

  const handlePaymentUpdated = (updated: AdminPayment) => {
    // Update the row in the currently displayed page (best effort)
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

  // Initial load only
  if (!payments && !tableLoading) {
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
          rightSlot={
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search subscriber number, status, name…"
            />
          }
        />

        <section className="flex-1 px-8 py-6">
          <AdminTableCard
            hasRows={hasRows}
            loading={tableLoading}
            emptyTitle={
              search.trim()
                ? "No payments match your search"
                : "No payments yet"
            }
            emptyDescription={
              search.trim()
                ? "Try searching by subscriber ID, payment method, last name or first name."
                : "Create your first payment record to get started."
            }
          >
            <PaymentsTable
              payments={payments ?? []}
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
        payment={editPayment as AdminPayment | null}
        onUpdated={handlePaymentUpdated}
      />

      <CreatePaymentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newPayment: AdminPayment) => {
          // If your server-side search is active, this might not match the current query
          // but it's still ok to optimistically insert if you want:
          setPayments((prev) => (prev ? [newPayment, ...prev] : [newPayment]));
        }}
      />
    </div>
  );
}
