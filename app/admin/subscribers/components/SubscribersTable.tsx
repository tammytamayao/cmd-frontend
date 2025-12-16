"use client";

import { formatDate } from "@/lib/helpers";
import type { AdminSubscriber } from "@/lib/types";
import type { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminDataTable } from "@/app/components/admin/AdminDataTable";

type SubscriberTableProps = {
  subscribers: AdminSubscriber[];
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onRowClick: (subscriber: AdminSubscriber) => void;
  onEdit: (subscriber: AdminSubscriber) => void;
};

export function SubscriberTable({
  subscribers,
  meta,
  onPageChange,
  onRowClick,
  onEdit,
}: SubscriberTableProps) {
  return (
    <AdminDataTable
      columns={[
        { key: "subscriber_id", label: "SUBSCRIBER ID" },
        { key: "subscriber_name", label: "SUBSCRIBER NAME" },
        { key: "address", label: "ADDRESS" },
        { key: "installation_date", label: "INSTALLATION DATE" },
        { key: "package_plan", label: "PACKAGE PLAN" },
        { key: "package_speed", label: "PACKAGE SPEED" },
        { key: "actions", label: "", align: "right" },
      ]}
      rows={subscribers}
      rowKey={(s) => s.id}
      onRowClick={onRowClick}
      renderRow={(s) => (
        <>
          <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
            {s.serial_number || `SUB-${String(s.id).padStart(5, "0")}`}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900">
            {s.last_name}, {s.first_name}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900">
            {s.zone || "Unknown"}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900">
            {s.date_installed ? formatDate(s.date_installed) : "-"}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900">
            {s.package || "-"} {s.plan || "-"}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900">
            Up to {s.package_speed ?? 0} Mbps
          </td>
          <td className="px-4 py-3 text-sm text-right">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(s);
              }}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          </td>
        </>
      )}
      meta={meta}
      onPageChange={onPageChange}
    />
  );
}
