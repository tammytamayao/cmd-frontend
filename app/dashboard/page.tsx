"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import FieldRow from "@/app/components/ui/FieldRow";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { useAuthCurrentUser } from "@/app/hooks/useAuthCurrentUser";
import PageShell from "@/app/components/PageShell";
import LoadingCard from "@/app/components/LoadingCard";

function AccountDetailsCard({
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

function AmountDueCard({
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
        className="mt-5 sm:mt-0 h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        Make a Payment
      </button>
    </div>
  );
}

function CurrentPlanCard({
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

function DashboardInner() {
  const router = useRouter();
  const { user, loading } = useAuthCurrentUser();

  if (loading) {
    return (
      <PageShell>
        <LoadingCard />
      </PageShell>
    );
  }

  if (!user) return null;

  return (
    <PageShell>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 order-1 lg:order-1">
          <AccountDetailsCard
            fullName={user.full_name}
            serialNumber={user.serial_number}
            zone={user.zone}
          />
        </div>

        <div className="lg:col-span-8 order-2 lg:order-1">
          <AmountDueCard
            amountDue={user.amount_due ?? 0}
            dueOn={user.due_on ?? null}
            onMakePayment={() => router.push(`/payment?subscriber=${user.id}`)}
          />
        </div>

        <div className="lg:col-span-4 order-3 lg:order-2">
          <CurrentPlanCard
            packageName={user.package}
            plan={user.plan}
            packageSpeed={user.package_speed}
            monthlyRate={user.brate ?? 0}
            installedOn={user.date_installed ?? null}
          />
        </div>
      </div>
    </PageShell>
  );
}

export default dynamic(() => Promise.resolve(DashboardInner), { ssr: false });
