"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import {
  fetchBillings,
  fetchPayments,
  fetchCurrentUser,
  fetchPayment,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { YearDropdown } from "../components/ui/YearDropdown";
import { Segmented } from "../components/ui/Segmented";
import { BillingsTab } from "@/app/components/BillingsTab";
import { PaymentsTab } from "@/app/components/PaymentsTab";
import { PaymentDetailsModal } from "@/app/components/PaymentDetailsModal";
import { Billing, Me, Payment, PaymentDetail } from "@/lib/types";

function BillingsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"bills" | "payments">("bills");
  const [filter, setFilter] = useState<number>(2025);

  const [billings, setBillings] = useState<Billing[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [token] = useState<string | null>(() => getToken());
  const [me, setMe] = useState<Me | null>(null);

  // Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(
    null
  );
  const [paymentModalLoading, setPaymentModalLoading] = useState(false);
  const [paymentModalError, setPaymentModalError] = useState<string | null>(
    null
  );

  // Fetch current user
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const data = await fetchCurrentUser(token);
        if (!alive) return;
        setMe(data as Me);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const loading =
    !!token &&
    (tab === "bills" ? billings === null : payments === null) &&
    !error;
  const notLoggedIn = !token;

  // Fetch billings/payments
  useEffect(() => {
    if (!token) return;

    let alive = true;
    const run = async () => {
      try {
        if (tab === "bills") {
          const res = await fetchBillings(token, filter);
          if (!alive) return;
          setError(null);
          setBillings(res.data as Billing[]);
        } else {
          const res = await fetchPayments(token, filter);
          if (!alive) return;
          setError(null);
          setPayments((res.data as Payment[]) ?? []);
        }
      } catch (err) {
        if (!alive) return;
        const message = err instanceof Error ? err.message : String(err);
        if (tab === "bills") setBillings([]);
        else setPayments([]);
        setError(message);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [token, filter, tab]);

  const bills = useMemo(() => billings ?? [], [billings]);

  const handleMakePayment = () => {
    const subscriber = (me?.id && String(me.id)) || "";

    if (!subscriber) {
      alert("Missing subscriber info. Please try reloading the page.");
      return;
    }

    const qs = new URLSearchParams({ subscriber });
    router.push(`/payment?${qs.toString()}`);
  };

  // Open payment details modal
  const handleViewPayment = async (id: string | number) => {
    if (!token) return;

    setPaymentModalOpen(true);
    setPaymentModalLoading(true);
    setPaymentModalError(null);
    setSelectedPayment(null);

    try {
      const res = await fetchPayment(id, token);
      setSelectedPayment(res.data as PaymentDetail);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setPaymentModalError(message);
    } finally {
      setPaymentModalLoading(false);
    }
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedPayment(null);
    setPaymentModalError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 py-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Billings &amp; Payments History
          </h1>

          {!notLoggedIn && (
            <button
              onClick={handleMakePayment}
              className="mt-5 sm:mt-0 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Make a Payment
            </button>
          )}
        </div>

        {notLoggedIn ? (
          <div className="mt-4 sm:mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 text-amber-900">
            You’re not logged in. Please sign in to view your billing history.
          </div>
        ) : (
          <>
            <div className="mt-4 sm:mt-5 flex flex-row flex-wrap items-center gap-3">
              <Segmented
                options={[
                  { label: "Billings", value: "bills" },
                  { label: "Payments", value: "payments" },
                ]}
                value={tab}
                onChange={(v) => setTab(v as "bills" | "payments")}
              />

              <div className="ml-auto">
                <YearDropdown
                  value={filter}
                  options={[2025, 2024]}
                  onChange={(y) => setFilter(y)}
                />
              </div>
            </div>

            <div className="mt-4 sm:mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-5 sm:p-6 text-center text-gray-500">
                  Loading...
                </div>
              ) : error ? (
                <div className="p-5 sm:p-6 text-center text-red-500">
                  {error}
                </div>
              ) : tab === "bills" ? (
                <BillingsTab bills={bills} />
              ) : (
                <PaymentsTab
                  payments={(payments ?? []) as Payment[]}
                  onViewPayment={handleViewPayment}
                />
              )}
            </div>
          </>
        )}
      </div>

      <PaymentDetailsModal
        open={paymentModalOpen}
        onClose={closePaymentModal}
        payment={selectedPayment}
        loading={paymentModalLoading}
        error={paymentModalError}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(BillingsPage), { ssr: false });
