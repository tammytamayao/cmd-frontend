"use client";

import type { BillingTableProps } from "@/lib/types";
import {
  formatDate,
  titleCase,
  statusBadgeClasses,
  normalizeBillingStatus,
} from "@/lib/helpers";
import { AdminDataTable } from "@/app/components/admin/AdminDataTable";
import { Pencil, Trash2 } from "lucide-react";

export function BillingsTable({
  billings,
  meta,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
  today = new Date(),
}: BillingTableProps) {
  return (
    <AdminDataTable
      columns={[
        { key: "subscriber_id", label: "SUBSCRIBER ID" },
        { key: "subscriber_name", label: "SUBSCRIBER NAME" },
        { key: "address", label: "ADDRESS" },
        { key: "billing_period", label: "BILLING PERIOD" },
        { key: "due_date", label: "DUE DATE" },
        { key: "status", label: "STATUS" },
        { key: "actions", label: "", align: "right" },
      ]}
      rows={billings}
      rowKey={(b) => b.id}
      onRowClick={onRowClick}
      renderRow={(b) => {
        const normalized = normalizeBillingStatus(b.status);
        const isPaid = normalized === "paid";

        const dueDateObj = new Date(b.due_date as string);
        const hasValidDueDate = !Number.isNaN(dueDateObj.getTime());
        const isOverdue = !isPaid && hasValidDueDate && dueDateObj < today;

        const uiStatus = isPaid ? "paid" : isOverdue ? "overdue" : "unpaid";

        return (
          <>
            <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
              {b.subscriber?.serial_number || "—"}
            </td>

            <td className="px-4 py-3 align-middle">
              <span className="font-medium text-gray-900">
                {b.subscriber?.last_name}, {b.subscriber?.first_name}
              </span>
            </td>

            <td className="px-4 py-3 align-middle text-sm text-gray-700">
              {b.subscriber?.zone || "—"}
            </td>

            <td className="px-4 py-3 align-middle text-sm text-gray-700">
              {b.start_date && b.end_date ? (
                <>
                  {formatDate(b.start_date)} – {formatDate(b.end_date)}
                </>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </td>

            <td className="px-4 py-3 align-middle text-sm text-gray-700">
              {formatDate(b.due_date as string)}
            </td>

            <td className="px-4 py-3 align-middle">
              {b.status ? (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(
                    uiStatus
                  )}`}
                >
                  {titleCase(uiStatus)}
                </span>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </td>

            <td className="px-4 py-3 align-middle text-right">
              <div className="inline-flex items-center gap-2">
                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(b);
                  }}
                  title="Edit billing"
                  className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 transition"
                >
                  <Pencil size={16} />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(b);
                  }}
                  title="Delete billing"
                  className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </>
        );
      }}
      meta={meta}
      onPageChange={onPageChange}
    />
  );
}
