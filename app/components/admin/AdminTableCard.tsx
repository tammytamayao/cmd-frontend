"use client";

import type { ReactNode } from "react";
import { EmptyStateTab } from "@/app/components/EmptyStateTab"; // adjust path if different

type AdminTableCardProps = {
  children: ReactNode; // your <table> + Pagination
  hasRows: boolean;
  loading?: boolean;

  emptyTitle: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;

  className?: string; // optional extra styling
};

export function AdminTableCard({
  children,
  hasRows,
  loading,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  className = "",
}: AdminTableCardProps) {
  return (
    <div
      className={
        "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm " +
        className
      }
    >
      {loading ? (
        <div className="p-10 text-center text-sm text-gray-500">Loading…</div>
      ) : hasRows ? (
        children
      ) : (
        <div className="p-6">
          <EmptyStateTab
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        </div>
      )}
    </div>
  );
}
