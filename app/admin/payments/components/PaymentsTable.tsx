"use client";
import { AdminDataTable } from "@/app/components/admin/AdminDataTable";
import { formatDate, statusBadgeClasses, titleCase } from "@/lib/helpers";
import { PaymentTableProps } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

export function PaymentsTable({
  payments,
  meta,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
}: PaymentTableProps) {
  return (
    <AdminDataTable
      columns={[
        { key: "subscriber_id", label: "SUBSCRIBER ID" },
        { key: "subscriber_name", label: "SUBSCRIBER NAME" },
        { key: "payment_date", label: "PAYMENT DATE" },
        { key: "billing_period", label: "BILLING PERIOD" },
        { key: "payment_method", label: "MODE OF PAYMENT" },
        { key: "payment_status", label: "PAYMENT STATUS" },
        { key: "actions", label: "", align: "right" },
      ]}
      rows={payments}
      rowKey={(p) => p.id}
      onRowClick={onRowClick}
      renderRow={(p) => (
        <>
          <td className="px-4 py-3 text-xs text-blue-600 font-medium">
            {p.subscriber?.serial_number || "—"}
          </td>

          <td className="px-4 py-3 align-middle">
            <span className="font-medium text-gray-900">
              {p.subscriber?.last_name}, {p.subscriber?.first_name}
            </span>
          </td>

          <td className="px-4 py-3 align-middle text-sm text-gray-900">
            {formatDate(p.payment_date)}
          </td>

          <td className="px-4 py-3 align-middle text-sm text-gray-700">
            {p.billing_period_start && p.billing_period_end ? (
              <>
                {formatDate(p.billing_period_start)} –{" "}
                {formatDate(p.billing_period_end)}
              </>
            ) : (
              <span className="text-gray-400">N/A</span>
            )}
          </td>

          <td className="px-4 py-3 align-middle text-sm text-gray-700">
            {p.payment_method || "—"}
          </td>

          <td className="px-4 py-3 align-middle">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClasses(
                p.status
              )}`}
            >
              {titleCase(p.status)}
            </span>
          </td>

          <td className="px-4 py-3 align-middle text-right">
            <div className="inline-flex items-center gap-2">
              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(p);
                }}
                title="Edit payment"
                className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition"
              >
                <Pencil size={16} />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p);
                }}
                title="Delete payment"
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
