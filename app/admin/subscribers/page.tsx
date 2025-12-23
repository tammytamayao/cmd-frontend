"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  fetchAllSubscribers,
  fetchAdminSubscriber,
  deleteAdminSubscriber,
} from "@/lib/api";
import { AdminSubscriber, Stats } from "@/lib/types";
import { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import { useRouter } from "next/navigation";
import { EditSubscriberModal } from "@/app/admin/subscribers/components/EditSubscriberModal";
import { SubscriberDetailsModal } from "@/app/admin/subscribers/components/SubscriberDetailsModal";

import { AdminTableCard } from "@/app/components/admin/AdminTableCard";
import { SubscriberTable } from "@/app/admin/subscribers/components/SubscribersTable";

import { AdminSearchInput } from "@/app/components/admin/AdminSearchInput";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useConfirm } from "@/app/hooks/useConfirm";
import { useNotification } from "@/app/notification/NotificationProvider";
import { ConfirmModal } from "@/app/components/ConfirmModal";

// ✅ add this
import { PasswordPromptModal } from "@/app/components/admin/PasswordPromptModal";

type PendingAction =
  | { type: "edit"; subscriber: AdminSubscriber }
  | { type: "delete"; subscriber: AdminSubscriber }
  | null;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<AdminSubscriber[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const router = useRouter();
  const { notify } = useNotification();
  const confirmModal = useConfirm();

  const [editing, setEditing] = useState<AdminSubscriber | null>(null);

  const [viewing, setViewing] = useState<AdminSubscriber | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewErr, setViewErr] = useState<string | null>(null);

  // ✅ Password modal state
  const [pwOpen, setPwOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const t = getToken();

      if (!t) {
        if (!cancelled) setErr("No token found. Please log in as staff.");
        return;
      }

      try {
        const data = await fetchAllSubscribers(page, t, debouncedSearch);
        if (cancelled) return;

        setStats(data.stats);
        setSubs(data.data);
        setMeta(data.meta);
        setErr(null);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load subscribers");
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  const hasRows = !!subs && subs.length > 0;

  async function openDetails(s: AdminSubscriber) {
    setViewErr(null);
    setViewLoading(true);
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

  // ✅ request edit (password first)
  const requestEditSubscriber = (s: AdminSubscriber) => {
    setPendingAction({ type: "edit", subscriber: s });
    setPwOpen(true);
  };

  // ✅ request delete (password first)
  const requestDeleteSubscriber = (s: AdminSubscriber) => {
    setPendingAction({ type: "delete", subscriber: s });
    setPwOpen(true);
  };

  // ✅ run action after password confirmed
  const proceedAfterPassword = async () => {
    const t = getToken();
    if (!t) {
      notify("error", "No token found. Please log in as staff.");
      setPendingAction(null);
      return;
    }
    if (!pendingAction) return;

    // EDIT
    if (pendingAction.type === "edit") {
      setEditing(pendingAction.subscriber);
      setPendingAction(null);
      return;
    }

    // DELETE
    if (pendingAction.type === "delete") {
      const s = pendingAction.subscriber;
      setPendingAction(null);

      const ok = await confirmModal.confirm({
        title: "Delete subscriber?",
        description: (
          <div className="space-y-2">
            <p>
              You are about to delete{" "}
              <span className="font-semibold">
                {s.last_name}, {s.first_name}
              </span>
              .
            </p>
            <p className="text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </div>
        ),
        confirmText: "Delete subscriber",
        cancelText: "Cancel",
        confirmTone: "danger",
      });

      if (!ok) return;

      try {
        await deleteAdminSubscriber(s.id, t);

        notify("success", "Subscriber deleted.");

        setSubs((prev) => (prev ? prev.filter((x) => x.id !== s.id) : prev));
        setViewing((prev) => (prev?.id === s.id ? null : prev));
        setEditing((prev) => (prev?.id === s.id ? null : prev));
      } catch (e) {
        notify(
          "error",
          e instanceof Error ? e.message : "Failed to delete subscriber."
        );
      }
    }
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
          rightSlot={
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search subscriber number, name, address…"
            />
          }
        />

        <section className="flex-1 px-8 py-6 space-y-6">
          <AdminTableCard
            hasRows={hasRows}
            emptyTitle={
              search.trim()
                ? "No subscribers match your search"
                : "No subscribers yet"
            }
            emptyDescription={
              search.trim()
                ? "Try searching by name, serial number, or ID."
                : "Add your first subscriber to get started."
            }
          >
            <SubscriberTable
              subscribers={subs ?? []}
              meta={hasRows ? meta : null}
              onPageChange={setPage}
              onRowClick={openDetails}
              onEdit={requestEditSubscriber} // ✅ gated
              onDelete={requestDeleteSubscriber} // ✅ gated
            />
          </AdminTableCard>
        </section>

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

        <EditSubscriberModal
          open={!!editing}
          subscriber={editing}
          onClose={() => setEditing(null)}
          onUpdated={(updated: AdminSubscriber) => {
            setSubs((prev) =>
              prev ? prev.map((x) => (x.id === updated.id ? updated : x)) : prev
            );

            setViewing((prev) => (prev?.id === updated.id ? updated : prev));
            notify("success", "Subscriber updated.");
          }}
        />
      </main>

      {/* ✅ Password Prompt first */}
      <PasswordPromptModal
        open={pwOpen}
        onClose={() => {
          setPwOpen(false);
          setPendingAction(null);
        }}
        onConfirmed={proceedAfterPassword}
        title="Security Check"
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
