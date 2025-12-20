"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { getToken } from "@/lib/auth";
import { YearDropdown } from "@/app/components/ui/YearDropdown";
import { Segmented } from "@/app/components/ui/Segmented";
import { BillingsTab } from "@/app/billing/components/BillingsTab";
import { PaymentsTab } from "@/app/billing/components/PaymentsTab";
import { PaymentDetailsModal } from "@/app/components/PaymentDetailsModal";
import type { Billing, HistoryTab, Payment } from "@/lib/types";

import { useAuthCurrentUser } from "@/app/hooks/useAuthCurrentUser";
import { useBillingYears } from "@/app/hooks/useBillingYears";
import { useBillingHistory } from "@/app/hooks/useBillingHistory";
import { usePaymentDetails } from "@/app/hooks/usePaymentDetails";

function BillingsPage() {
  const router = useRouter();

  const { user: currentUser, loading: currentUserLoading } =
    useAuthCurrentUser();
  const token = useMemo(() => getToken(), []);

  const [tab, setTab] = useState<HistoryTab>("bills");
  const { year, setYear, yearOptions } = useBillingYears(token);
  const { billings, payments, loading, error } = useBillingHistory(
    token,
    tab,
    year
  );
  const modal = usePaymentDetails(token);

  const handleMakePayment = () => {
    const subscriber = currentUser?.id ? String(currentUser.id) : "";
    if (!subscriber) return;

    const qs = new URLSearchParams({ subscriber });
    router.push(`/payment?${qs.toString()}`);
  };

  if (currentUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 py-6 sm:py-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 py-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Billings &amp; Payments History
          </h1>

          <button
            onClick={handleMakePayment}
            className="mt-5 sm:mt-0 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            Make a Payment
          </button>
        </div>

        <div className="mt-4 sm:mt-5 flex flex-row flex-wrap items-center gap-3">
          <Segmented
            options={[
              { label: "Billings", value: "bills" },
              { label: "Payments", value: "payments" },
            ]}
            value={tab}
            onChange={(v) => setTab(v as HistoryTab)}
          />

          <div className="ml-auto">
            <YearDropdown
              value={year}
              options={yearOptions}
              onChange={setYear}
            />
          </div>
        </div>

        <div className="mt-4 sm:mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5 sm:p-6 text-center text-gray-500">
              Loading...
            </div>
          ) : error ? (
            <div className="p-5 sm:p-6 text-center text-red-500">{error}</div>
          ) : tab === "bills" ? (
            <BillingsTab bills={(billings ?? []) as Billing[]} />
          ) : (
            <PaymentsTab
              payments={(payments ?? []) as Payment[]}
              onViewPayment={modal.openForPayment}
            />
          )}
        </div>
      </div>

      <PaymentDetailsModal
        open={modal.open}
        onClose={modal.close}
        payment={modal.payment}
        loading={modal.loading}
        error={modal.error}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(BillingsPage), { ssr: false });
