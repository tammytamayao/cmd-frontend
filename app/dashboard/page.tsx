"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuthCurrentUser } from "@/app/hooks/useAuthCurrentUser";
import PageShell from "@/app/components/PageShell";
import LoadingCard from "@/app/components/LoadingCard";
import {
  AccountDetailsCard,
  AmountDueCard,
  CurrentPlanCard,
} from "./components/DashboardCards";

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
            billingStatus={user.latest_billing?.status ?? null}
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
