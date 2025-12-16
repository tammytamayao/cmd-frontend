import { PaymentsTabProps } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  paymentTone2,
  paymentLabel,
} from "@/lib/helpers";
import { EmptyStateTab } from "@/app/components/EmptyStateTab";
import { StatusPill } from "@/app/components/ui/StatusPill";

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

              <StatusPill
                label={paymentLabel(p.status)}
                tone={paymentTone2(p.status)}
              />
            </div>

            <p className="mt-3 text-lg font-semibold text-gray-900">
              {formatCurrency(p.amount)}
            </p>

            <button
              onClick={() => onViewPayment(p.id)}
              className="mt-3 inline-flex items-center rounded-lg border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white hover:bg-indigo-50 hover:border-indigo-600 active:bg-indigo-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            >
              View details
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="[&>th]:text-left [&>th]:font-semibold [&>th]:py-3 [&>th]:px-4">
              <th className="w-[15%]">Payment Date</th>
              <th className="w-[15%]">Due Date</th>
              <th className="w-[15%]">Payment Method</th>
              <th className="w-[15%]">Status</th>
              <th className="w-[15%]">Reference No.</th>
              <th className="w-[15%]"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="[&>td]:py-4 [&>td]:px-4">
                <td className="text-gray-900">{formatDate(p.payment_date)}</td>
                <td className="text-gray-900">{formatDate(p.payment_date)}</td>
                <td className="text-gray-700">{p.payment_method}</td>
                <td>
                  <StatusPill
                    label={paymentLabel(p.status)}
                    tone={paymentTone2(p.status)}
                  />
                </td>
                <td className="text-gray-700">{p.reference_number || "-"}</td>
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
