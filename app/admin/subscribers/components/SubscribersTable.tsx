"use client";

import { formatDate } from "@/lib/helpers";
import type { AdminSubscriber } from "@/lib/types";
import type { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminDataTable } from "@/app/components/admin/AdminDataTable";
import { Pencil, Trash2 } from "lucide-react";

type SubscriberTableProps = {
  subscribers: AdminSubscriber[];
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onRowClick: (subscriber: AdminSubscriber) => void;
  onEdit: (subscriber: AdminSubscriber) => void;
  onDelete: (subscriber: AdminSubscriber) => void;
};

export function SubscriberTable({
  subscribers,
  meta,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
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
          <td className="px-4 py-3 text-xs text-blue-600 font-medium">
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
            {s.package || "-"}
            {s.plan || "-"}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900">
            Up to {s.package_speed ?? 0} Mbps
          </td>
          <td className="px-4 py-3 align-middle text-right">
            <div className="inline-flex items-center gap-2">
              {/* Edit */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(s);
                }}
                title="Edit subscriber"
                className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition"
              >
                <Pencil size={16} />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s);
                }}
                title="Delete subscriber"
                className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </>
      )}
      meta={meta}
      onPageChange={onPageChange}
    />
  );
}
