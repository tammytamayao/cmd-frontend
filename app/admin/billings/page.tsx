"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { fetchAdminBillings, fetchAdminBilling } from "@/lib/api";
import {
  formatDate,
  titleCase,
  statusBadgeClasses,
  normalizeBillingStatus,
} from "@/lib/helpers";

import type { AdminBilling } from "@/lib/types";
import { Pagination, PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

import { BillingDetailsModal } from "@/app/components/BillingDetailsModal";
import {
  EditBillingModal,
  AdminBillingForEdit,
} from "@/app/components/EditBillingModal";

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

  // ---------- Main UI ----------

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Shared admin sidebar */}
      <AdminSidebar active="billings" />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Shared admin header */}
        <AdminHeader
          title="Billing Accounts"
          subtitle="View all subscribers' billing records."
        />

        {/* Table of billings */}
        <section className="flex-1 px-8 py-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {loading && (!billings || billings.length === 0) && (
              <div className="p-6 text-center text-gray-500">
                Loading billings...
              </div>
            )}

            {billings && billings.length === 0 && !loading && (
              <div className="p-6 text-center text-gray-500">
                No billing records found.
              </div>
            )}

            {billings && billings.length > 0 && (
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
                      ZONE
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      BILLING PERIOD
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      STATUS
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billings.map((b, idx) => (
                    <tr
                      key={b.id}
                      onClick={() => handleViewDetails(b.id)}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      } cursor-pointer hover:bg-indigo-50/50 transition-colors`}
                    >
                      {/* Subscriber ID */}
                      <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
                        {b.subscriber?.serial_number || "—"}
                      </td>

                      {/* Subscriber name */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {b.subscriber?.last_name},{" "}
                            {b.subscriber?.first_name}
                          </span>
                        </div>
                      </td>

                      {/* Zone */}
                      <td className="px-4 py-3 align-middle text-sm text-gray-700">
                        {b.subscriber?.zone || "—"}
                      </td>

                      {/* Billing period */}
                      <td className="px-4 py-3 align-middle text-sm text-gray-700">
                        {b.start_date && b.end_date ? (
                          <>
                            {formatDate(b.start_date)} –{" "}
                            {formatDate(b.end_date)}
                          </>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-middle">
                        {b.status ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(
                              normalizeBillingStatus(b.status)
                            )}`}
                          >
                            {titleCase(normalizeBillingStatus(b.status))}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions: Edit button that does NOT trigger row click */}
                      <td className="px-4 py-3 align-middle text-right space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(b.id);
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
            )}

            {/* Shared pagination component */}
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </section>
      </main>

      {/* View details modal */}
      <BillingDetailsModal
        open={detailsOpen}
        onClose={handleCloseDetails}
        loading={detailsLoading}
        error={detailsError}
        billing={selectedBilling}
      />

      {/* Edit billing modal */}
      <EditBillingModal
        open={editOpen}
        onClose={handleCloseEdit}
        billing={editBilling as AdminBillingForEdit | null}
        onUpdated={handleBillingUpdated}
      />
    </div>
  );
}
