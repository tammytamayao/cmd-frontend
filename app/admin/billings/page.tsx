"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { fetchAdminBillings, fetchAdminBilling } from "@/lib/api";

import type { AdminBilling } from "@/lib/types";
import { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

import { BillingDetailsModal } from "@/app/admin/billings/components/BillingDetailsModal";
import {
  EditBillingModal,
  AdminBillingForEdit,
} from "@/app/admin/billings/components/EditBillingModal";
import { useRouter } from "next/navigation";

import { AdminTableCard } from "@/app/components/admin/AdminTableCard";
import { BillingsTable } from "@/app/admin/billings/components/BillingsTable";

export default function AdminBillingsPage() {
  const [err, setErr] = useState<string | null>(null);

  const [billings, setBillings] = useState<AdminBilling[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ---------- View details modal state ----------
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<AdminBilling | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // ---------- Edit modal state ----------
  const [editOpen, setEditOpen] = useState(false);
  const [editBilling, setEditBilling] = useState<AdminBilling | null>(null);

  const router = useRouter();

  const handleOpenEdit = async (id: number) => {
    const t = getToken();
    if (!t) {
      alert("No token found. Please log in as staff.");
      return;
    }

    try {
      const res = await fetchAdminBilling(id, t);
      setEditBilling(res.data as AdminBilling);
      setEditOpen(true);
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to load billing for editing."
      );
    }
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditBilling(null);
  };

  // after successful update, update local list
  const handleBillingUpdated = (updated: AdminBillingForEdit) => {
    setBillings((prev) =>
      prev
        ? prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
        : prev
    );
  };

  // Check token and load billings
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const t = getToken();
      if (!t) {
        setErr("No token found. Please log in as staff.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetchAdminBillings(page, t);
        if (cancelled) return;

        setBillings(res.data);
        setMeta(res.meta);
        setErr(null);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load billings";
        setErr(msg);
        setBillings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [page]);

  // ---------- Handlers for view / edit ----------

  const handleViewDetails = async (id: number) => {
    const t = getToken();
    if (!t) {
      setDetailsError("No token found. Please log in as staff.");
      return;
    }

    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedBilling(null);

    try {
      const res = await fetchAdminBilling(id, t);
      setSelectedBilling(res.data as AdminBilling);
    } catch (e) {
      setDetailsError(
        e instanceof Error ? e.message : "Failed to load billing details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBilling(null);
    setDetailsError(null);
  };

  // ---------- Early states ----------

  if (err && !billings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm">
          {err}
        </div>
      </div>
    );
  }

  if (!billings && !err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">Loading billings…</div>
      </div>
    );
  }

  const today = new Date();
  const hasRows = !!billings && billings.length > 0;

  // ---------- Main UI ----------

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar active="billings" />

      <main className="flex-1 flex flex-col">
        <AdminHeader
          title="Billing Accounts"
          subtitle="View and process all subscribers' billing records."
          actionLabel="Add Billing"
          onAction={() => router.push("/admin/billings/new")}
        />

        <section className="flex-1 px-8 py-6">
          <AdminTableCard
            hasRows={hasRows}
            loading={loading && (!billings || billings.length === 0)}
            emptyTitle="No billing records yet"
            emptyDescription="Create a billing record to start tracking due dates and statuses."
            emptyActionLabel="Add Billing"
            onEmptyAction={() => router.push("/admin/billings/new")}
          >
            <BillingsTable
              billings={billings ?? []}
              meta={hasRows ? meta : null}
              onPageChange={setPage}
              onRowClick={(b) => handleViewDetails(b.id)}
              onEdit={(b) => handleOpenEdit(b.id)}
              today={today}
            />
          </AdminTableCard>
        </section>
      </main>

      <BillingDetailsModal
        open={detailsOpen}
        onClose={handleCloseDetails}
        loading={detailsLoading}
        error={detailsError}
        billing={selectedBilling}
      />

      <EditBillingModal
        open={editOpen}
        onClose={handleCloseEdit}
        billing={editBilling as AdminBillingForEdit | null}
        onUpdated={handleBillingUpdated}
      />
    </div>
  );
}
