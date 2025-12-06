import { Billing } from "@/lib/types";
import { Badge } from "./ui/Badge";
import {
  formatCurrency,
  formatDate,
  normalizeBillingStatus,
} from "@/lib/helpers";

type BillingsTabProps = {
  bills: Billing[];
};

export function BillingsTab({ bills }: BillingsTabProps) {
  return (
    <>
      {/* Mobile cards */}
      <ul className="sm:hidden divide-y divide-gray-100">
        {bills.map((b) => {
          const status = normalizeBillingStatus(b.status);
          return (
            <li key={b.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(b.start_date)} – {formatDate(b.end_date)}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Due {formatDate(b.due_date)}
                  </p>
                </div>
                <div>
                  {status === "paid" && <Badge tone="green">Paid</Badge>}
                  {status === "overdue" && <Badge tone="red">Overdue</Badge>}
                  {status === "unpaid" && <Badge tone="gray">Open</Badge>}
                </div>
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900">
                {formatCurrency(b.amount)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Desktop/tablet table */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="[&>th]:text-left [&>th]:font-semibold [&>th]:py-3 [&>th]:px-4">
              <th className="w-[40%]">Billing Period</th>
              <th className="w-[15%]">Amount</th>
              <th className="w-[20%]">Due Date</th>
              <th className="w-[15%]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bills.map((b) => {
              const status = normalizeBillingStatus(b.status);
              return (
                <tr key={b.id} className="[&>td]:py-4 [&>td]:px-4">
                  <td className="text-gray-900">
                    {formatDate(b.start_date)} – {formatDate(b.end_date)}
                  </td>
                  <td className="text-gray-900">{formatCurrency(b.amount)}</td>
                  <td className="text-gray-700">{formatDate(b.due_date)}</td>
                  <td>
                    {status === "paid" && <Badge tone="green">Paid</Badge>}
                    {status === "overdue" && <Badge tone="red">Overdue</Badge>}
                    {status === "unpaid" && <Badge tone="gray">Open</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
