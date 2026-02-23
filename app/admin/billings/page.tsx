"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  fetchAdminBillings,
  fetchAdminBilling,
  deleteAdminBilling,
} from "@/lib/api";

import type { AdminBilling } from "@/lib/types";
import { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

import { BillingDetailsModal } from "@/app/admin/billings/components/BillingDetailsModal";
import { EditBillingModal } from "@/app/admin/billings/components/EditBillingModal";
import { useRouter } from "next/navigation";

import { AdminTableCard } from "@/app/components/admin/AdminTableCard";
import { BillingsTable } from "@/app/admin/billings/components/BillingsTable";

import { AdminSearchInput } from "@/app/components/admin/AdminSearchInput";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useNotification } from "@/app/notification/NotificationProvider";
import { BillingChoiceModal } from "./components/BillingChoiceModal";
import { CreateBillingModal } from "./components/CreateBillingModal";
import { useConfirm } from "@/app/hooks/useConfirm";
import { ConfirmModal } from "@/app/components/ConfirmModal";

import { PasswordPromptModal } from "@/app/components/admin/PasswordPromptModal";

type PendingAction =
  | { type: "edit"; billingId: number }
  | { type: "delete"; billing: AdminBilling }
  | null;

type PwMode = "edit" | "delete"; // ✅ NEW

export default function AdminBillingsPage() {
  const [err, setErr] = useState<string | null>(null);
  const { notify } = useNotification();

  const [billings, setBillings] = useState<AdminBilling[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [loading, setLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<AdminBilling | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editBilling, setEditBilling] = useState<AdminBilling | null>(null);

  const [addChoiceOpen, setAddChoiceOpen] = useState(false);
  const [createSingleOpen, setCreateSingleOpen] = useState(false);

  const router = useRouter();
  const confirmModal = useConfirm();

  const [pwOpen, setPwOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [pwMode, setPwMode] = useState<PwMode>("edit"); // ✅ NEW

  const openBatch = () => {
    setAddChoiceOpen(false);
    router.push("/admin/billings/new");
  };

  const openSingle = () => {
    setAddChoiceOpen(false);
    setCreateSingleOpen(true);
  };

  const openMultiple = () => {
    setAddChoiceOpen(false);
    router.push("/admin/billings/multiple");
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const t = getToken();
      if (!t) {
        setErr("No token found. Please log in as staff.");
        return;
      }

      setLoading(true);
      setErr(null);

      try {
        const res = await fetchAdminBillings(page, t, { q: debouncedSearch });
        if (cancelled) return;

        setBillings(res.data);
        setMeta(res.meta);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load billings";
        setErr(msg);
        setBillings([]);
        setMeta(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

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
        e instanceof Error ? e.message : "Failed to load billing details",
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

  const requestEdit = (b: AdminBilling) => {
    setPendingAction({ type: "edit", billingId: b.id });
    setPwMode("edit"); // ✅ NEW
    setPwOpen(true);
  };

  const requestDelete = (b: AdminBilling) => {
    setPendingAction({ type: "delete", billing: b });
    setPwMode("delete"); // ✅ NEW
    setPwOpen(true);
  };

  const proceedAfterPassword = async () => {
    const t = getToken();
    if (!t || !pendingAction) return;

    if (pendingAction.type === "edit") {
      try {
        const res = await fetchAdminBilling(pendingAction.billingId, t);
        setEditBilling(res.data as AdminBilling);
        setEditOpen(true);
      } catch (e) {
        notify(
          "error",
          e instanceof Error
            ? e.message
            : "Failed to load billing for editing.",
        );
      } finally {
        setPendingAction(null);
      }
      return;
    }

    if (pendingAction.type === "delete") {
      const billing = pendingAction.billing;
      setPendingAction(null);

      const ok = await confirmModal.confirm({
        title: "Delete billing?",
        description: (
          <div className="space-y-2">
            <p>
              You are about to delete billing for{" "}
              <span className="font-semibold">
                {billing.subscriber?.last_name},{" "}
                {billing.subscriber?.first_name}
              </span>
              .
            </p>
            <p className="text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </div>
        ),
        confirmText: "Delete billing",
        cancelText: "Cancel",
        confirmTone: "danger",
      });

      if (!ok) return;

      try {
        await deleteAdminBilling(billing.id, t);

        setBillings((prev) =>
          prev ? prev.filter((x) => x.id !== billing.id) : prev,
        );

        notify("success", "Billing deleted.");
      } catch (e) {
        notify(
          "error",
          e instanceof Error ? e.message : "Failed to delete billing.",
        );
      }
    }
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditBilling(null);
  };

  const handleBillingUpdated = (updated: AdminBilling) => {
    setBillings((prev) =>
      prev
        ? prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
        : prev,
    );
    notify("success", "Billing updated.");
  };

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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar active="billings" />

      <main className="flex-1 flex flex-col">
        <AdminHeader
          title="Billing Accounts"
          subtitle="View and process all subscribers' billing records."
          actionLabel="Add Billing"
          onAction={() => setAddChoiceOpen(true)}
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
            loading={loading}
            emptyTitle={
              search.trim()
                ? "No billings match your search"
                : "No billing records yet"
            }
            emptyDescription={
              search.trim()
                ? "Try searching by subscriber number, name, billing status, or billing ID."
                : "Create a billing record to start tracking due dates and statuses."
            }
          >
            <BillingsTable
              billings={billings ?? []}
              meta={hasRows ? meta : null}
              onPageChange={setPage}
              onRowClick={(b) => handleViewDetails(b.id)}
              onEdit={(b) => requestEdit(b)} // ✅ gated
              onDelete={(b) => requestDelete(b)} // ✅ gated
              today={today}
            />
          </AdminTableCard>
        </section>
      </main>

      <BillingChoiceModal
        open={addChoiceOpen}
        onClose={() => setAddChoiceOpen(false)}
        onSingle={openSingle}
        onMultiple={openMultiple}
        onBatch={openBatch}
      />

      <CreateBillingModal
        open={createSingleOpen}
        onClose={() => setCreateSingleOpen(false)}
        onCreated={(newBilling: AdminBilling) => {
          setBillings((prev) => (prev ? [newBilling, ...prev] : [newBilling]));
          notify("success", "Billing created.");
        }}
      />

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
        billing={editBilling as AdminBilling | null}
        onUpdated={handleBillingUpdated}
      />

      <PasswordPromptModal
        open={pwOpen}
        onClose={() => {
          setPwOpen(false);
          setPendingAction(null);
        }}
        onConfirmed={proceedAfterPassword}
        title="Security Check"
        mode={pwMode}
      />

      <ConfirmModal
        open={confirmModal.open}
        onClose={confirmModal.close}
        title={confirmModal.options.title}
        description={confirmModal.options.description}
        confirmText={confirmModal.options.confirmText}
        cancelText={confirmModal.options.cancelText}
        confirmTone={confirmModal.options.confirmTone}
        onConfirm={confirmModal.accept}
      />
    </div>
  );
}
