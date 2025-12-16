// app/billing/PaymentsTab.tsx

import { Payment } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  statusBadgeClasses,
  titleCase,
} from "@/lib/helpers";
import { EmptyStateTab } from "./EmptyStateTab";

type PaymentsTabProps = {
  payments: Payment[];
  onViewPayment: (id: string | number) => void;
};

function renderStatus(status: string) {
  const normalized = status.toLowerCase();
  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 " +
    statusBadgeClasses(status);

  if (normalized === "processing") {
    return (
      <span className={baseClasses}>
        <span>Processing</span>
      </span>
    );
  }
  if (normalized === "completed" || normalized === "paid") {
    return (
      <span className={baseClasses}>
        <span>Completed</span>
      </span>
    );
  }
  if (normalized === "rejected" || normalized === "failed") {
    return (
      <span className={baseClasses}>
        <span>Rejected</span>
      </span>
    );
  }

  return <span className={baseClasses}>{titleCase(status)}</span>;
}

export function PaymentsTab({ payments, onViewPayment }: PaymentsTabProps) {
  if (!payments || payments.length === 0) {
    return (
      <EmptyStateTab
        title="No payments yet"
        description="Once payment is made, it’ll appear here with its details."
      />
    );
  }
  return (
    <>
      {/* Mobile cards */}
      <ul className="sm:hidden divide-y divide-gray-100">
        {payments.map((p) => (
          <li key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  {formatDate(p.payment_date)}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {p.payment_method || "-"} • {p.reference_number || "-"}
                </p>
              </div>
              {renderStatus(p.status)}
            </div>
            <p className="mt-3 text-lg font-semibold text-gray-900">
              {formatCurrency(p.amount)}
            </p>

            {/* View details button (mobile) */}
            <button
              onClick={() => onViewPayment(p.id)}
              className="mt-3 inline-flex items-center rounded-lg border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white hover:bg-indigo-50 hover:border-indigo-600 active:bg-indigo-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            >
              View details
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop/tablet table */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="[&>th]:text-left [&>th]:font-semibold [&>th]:py-3 [&>th]:px-4">
              <th className="w-[25%]">Payment Date</th>
              <th className="w-[20%]">Payment Method</th>
              <th className="w-[15%]">Status</th>
              <th className="w-[20%]">Reference #</th>
              <th className="w-[20%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="[&>td]:py-4 [&>td]:px-4">
                <td className="text-gray-900">{formatDate(p.payment_date)}</td>
                <td className="text-gray-700">{p.payment_method}</td>
                <td>{renderStatus(p.status)}</td>
                <td className="text-gray-700">
                  {p.reference_number ? p.reference_number : "-"}
                </td>
                <td>
                  <button
                    onClick={() => onViewPayment(p.id)}
                    className="inline-flex items-center rounded-lg border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white hover:bg-indigo-50 hover:border-indigo-600 active:bg-indigo-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                  >
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
