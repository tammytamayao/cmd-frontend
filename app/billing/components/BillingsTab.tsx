import { Billing } from "@/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import {
  formatCurrency,
  formatDate,
  normalizeBillingStatus,
} from "@/lib/helpers";
import { EmptyStateTab } from "@/app/components/EmptyStateTab";

type BillingsTabProps = {
  bills: Billing[];
};

export function BillingsTab({ bills }: BillingsTabProps) {
  const today = new Date();

  if (!bills || bills.length === 0) {
    return (
      <EmptyStateTab
        title="No billings yet"
        description="When billing periods are generated, itll be displayed here."
      />
    );
  }

  return (
    <>
      <ul className="sm:hidden divide-y divide-gray-100">
        {bills.map((b) => {
          const normalized = normalizeBillingStatus(b.status);
          const isPaid = normalized === "paid";
          const dueDate = new Date(b.due_date);
          const isOverdue = !isPaid && dueDate < today;
          const isUnpaid = !isPaid && !isOverdue;

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
                  {isPaid && <Badge tone="green">Paid</Badge>}
                  {isOverdue && <Badge tone="red">Overdue</Badge>}
                  {isUnpaid && <Badge tone="gray">Unpaid</Badge>}
                </div>
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-900">
                {formatCurrency(b.amount)}
              </p>
            </li>
          );
        })}
      </ul>

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
              const normalized = normalizeBillingStatus(b.status);
              const isPaid = normalized === "paid";
              const dueDate = new Date(b.due_date);
              const isOverdue = !isPaid && dueDate < today;
              const isUnpaid = !isPaid && !isOverdue;

              return (
                <tr key={b.id} className="[&>td]:py-4 [&>td]:px-4">
                  <td className="text-gray-900">
                    {formatDate(b.start_date)} – {formatDate(b.end_date)}
                  </td>
                  <td className="text-gray-900">{formatCurrency(b.amount)}</td>
                  <td className="text-gray-700">{formatDate(b.due_date)}</td>
                  <td>
                    {isPaid && <Badge tone="green">Paid</Badge>}
                    {isOverdue && <Badge tone="red">Overdue</Badge>}
                    {isUnpaid && <Badge tone="gray">Unpaid</Badge>}
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
