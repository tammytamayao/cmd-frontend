"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { fetchAllSubscribers, fetchAdminSubscriber } from "@/lib/api";
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<AdminSubscriber[] | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  // server-side search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const router = useRouter();

  const [editing, setEditing] = useState<AdminSubscriber | null>(null);

  const [viewing, setViewing] = useState<AdminSubscriber | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewErr, setViewErr] = useState<string | null>(null);

  // reset page when raw search changes
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
              onEdit={setEditing}
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
          }}
        />
      </main>
    </div>
  );
}
