"use client";

import FieldRow from "@/app/components/ui/FieldRow";
import { formatCurrency, formatDate } from "@/lib/helpers";

export function AccountDetailsCard({
  fullName,
  serialNumber,
  zone,
}: {
  fullName: string;
  serialNumber: string;
  zone: string;
}) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-2">Account Details</h3>
      <hr />
      <FieldRow label="Subscriber Name" value={fullName} />
      <FieldRow label="Subscriber ID" value={serialNumber} copyable />
      <FieldRow label="Address" value={zone} />
    </div>
  );
}

export function AmountDueCard({
  amountDue,
  dueOn,
  onMakePayment,
}: {
  amountDue: number;
  dueOn: string | null;
  onMakePayment: () => void;
}) {
  const dueDate = (() => {
    const v = formatDate(dueOn);
    return v === "N/A" ? "" : v;
  })();

  return (
    <div className="card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-blue-600 mb-1">Amount Due</p>
        <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          {formatCurrency(amountDue ?? 0)}
        </p>

        {dueDate && (
          <p className="text-sm text-orange-600 mt-3">Due by {dueDate}</p>
        )}
      </div>

      <button
        onClick={onMakePayment}
        className="mt-5 sm:mt-0 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
      >
        Make a Payment
      </button>
    </div>
  );
}

export function CurrentPlanCard({
  packageName,
  plan,
  packageSpeed,
  monthlyRate,
  installedOn,
}: {
  packageName: string;
  plan: string;
  packageSpeed: number;
  monthlyRate: number;
  installedOn: string | null;
}) {
  const installed = (() => {
    const v = formatDate(installedOn);
    return v === "N/A" ? "" : v;
  })();

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-2">Current Plan</h3>
      <hr />
      <FieldRow label="Package Plan" value={`${packageName}${plan}`} />
      <FieldRow label="Speed" value={`Up to ${packageSpeed} Mbps`} />
      <FieldRow label="Monthly Rate" value={formatCurrency(monthlyRate ?? 0)} />
      {installed && <FieldRow label="Installed On" value={installed} />}
    </div>
  );
}
