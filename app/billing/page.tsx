"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { fetchBillings, fetchPayments, fetchCurrentUser } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  formatCurrency,
  formatDate,
  normalizeBillingStatus,
  paymentTone,
  titleCase,
} from "@/lib/helpers";
import { YearDropdown } from "../components/ui/YearDropdown";
import { Segmented } from "../components/ui/Segmented";
import { Badge } from "../components/ui/Badge";

// --- types ---
type Payment = {
  id: string | number;
  payment_date: string;
  amount: number;
  payment_method: string;
  status: string;
  attachment?: string | null;
  reference_number?: string | null;
};
type Billing = {
  id: string | number;
  start_date: string;
  end_date: string;
  due_date: string;
  amount: number;
  status: string;
  payments: Payment[];
};
type Me = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  plan: string;
  brate: number;
  serial_number: string;
};

function BillingsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"bills" | "payments">("bills");
  const [filter, setFilter] = useState<number>(2025);

  const [billings, setBillings] = useState<Billing[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [token] = useState<string | null>(() => getToken());
  const [me, setMe] = useState<Me | null>(null);

  // fetch current subscriber (me)
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const data = await fetchCurrentUser(token);
        if (!alive) return;
        setMe(data as Me);
      } catch (e) {
        // ignore; me remains null
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
    // Prefer serial_number for human-friendly lookups; fallback to ID.
    const subscriber = (me?.id && String(me.id)) || "";

    if (!subscriber) {
      alert("Missing subscriber info. Please try reloading the page.");
      return;
    }

    const qs = new URLSearchParams({ subscriber });

    router.push(`/payment?${qs.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 py-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Billing &amp; Payment History
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
                  { label: "Bills", value: "bills" },
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

            {/* Content */}
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
                                {formatDate(b.start_date)} –{" "}
                                {formatDate(b.end_date)}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Due {formatDate(b.due_date)}
                              </p>
                            </div>
                            <div>
                              {status === "paid" && (
                                <Badge tone="green">Paid</Badge>
                              )}
                              {status === "overdue" && (
                                <Badge tone="red">Overdue</Badge>
                              )}
                              {status === "unpaid" && (
                                <Badge tone="gray">Open</Badge>
                              )}
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
                                {formatDate(b.start_date)} –{" "}
                                {formatDate(b.end_date)}
                              </td>
                              <td className="text-gray-900">
                                {formatCurrency(b.amount)}
                              </td>
                              <td className="text-gray-700">
                                {formatDate(b.due_date)}
                              </td>
                              <td>
                                {status === "paid" && (
                                  <Badge tone="green">Paid</Badge>
                                )}
                                {status === "overdue" && (
                                  <Badge tone="red">Overdue</Badge>
                                )}
                                {status === "unpaid" && (
                                  <Badge tone="gray">Open</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile cards */}
                  <ul className="sm:hidden divide-y divide-gray-100">
                    {(payments ?? []).map((p) => (
                      <li key={p.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatDate(p.payment_date)}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {p.payment_method || "-"} • Ref:{" "}
                              {p.reference_number || "-"}
                            </p>
                          </div>
                          <Badge tone={paymentTone(p.status)}>
                            {titleCase(p.status)}
                          </Badge>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-gray-900">
                          {formatCurrency(p.amount)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop/tablet table */}
                  <div className="hidden sm:block w-full overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr className="[&>th]:text-left [&>th]:font-semibold [&>th]:py-3 [&>th]:px-4">
                          <th className="w-[30%]">Payment Date</th>
                          <th className="w-[20%]">payment_method</th>
                          <th className="w-[15%]">Status</th>
                          <th className="w-[20%]">Reference #</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(payments ?? []).map((p) => (
                          <tr key={p.id} className="[&>td]:py-4 [&>td]:px-4">
                            <td className="text-gray-900">
                              {formatDate(p.payment_date)}
                            </td>
                            <td className="text-gray-700">
                              {p.payment_method}
                            </td>
                            <td>
                              <Badge tone={paymentTone(p.status)}>
                                {titleCase(p.status)}
                              </Badge>
                            </td>
                            <td className="text-gray-700">
                              {p.reference_number ? p.reference_number : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(BillingsPage), { ssr: false });
