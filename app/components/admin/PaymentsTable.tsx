"use client";

import type { PaginationMeta } from "@/app/components/admin/Pagination";
import { AdminDataTable } from "@/app/components/admin/AdminDataTable";
import { formatDate, statusBadgeClasses, titleCase } from "@/lib/helpers";

type AdminPaymentSubscriber = {
  id: number | null;
  serial_number: string | null;
  first_name: string | null;
  last_name: string | null;
};

type AdminPaymentReceipt = {
  filename: string | null;
  size: number | null;
  mime_type: string | null;
  uploaded_at: string | null;
};

export type AdminPayment = {
  id: number;
  payment_date: string | null;
  amount: number;
  payment_method: string;
  status: string;
  attachment: string | null;
  reference_number: string | null;
  invoice_number?: string | null;
  billing_id: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  billing_status: string | null;
  subscriber: AdminPaymentSubscriber;
  receipt: AdminPaymentReceipt;
  receipt_url?: string | null;
};

type PaymentTableProps = {
  payments: AdminPayment[];
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;

  onRowClick: (payment: AdminPayment) => void;
  onEdit: (payment: AdminPayment) => void;
};

export function PaymentsTable({
  payments,
  meta,
  onPageChange,
  onRowClick,
  onEdit,
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
        { key: "actions", label: "ACTIONS", align: "right" },
      ]}
      rows={payments}
      rowKey={(p) => p.id}
      onRowClick={onRowClick}
      renderRow={(p) => (
        <>
          <td className="px-4 py-3 text-xs text-indigo-600 font-medium">
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

          <td className="px-4 py-3 align-middle text-right space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(p);
              }}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
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
