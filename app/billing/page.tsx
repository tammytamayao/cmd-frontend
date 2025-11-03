// app/billing/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { fetchBillings, fetchPayments } from "@/lib/api";
import { getToken } from "@/lib/auth";

// --- tiny UI primitives ---
function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "gray";
}) {
  const map = {
    green: "bg-green-100 text-green-700 ring-green-200",
    red: "bg-red-100 text-red-700 ring-red-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 h-9 rounded-lg text-sm font-medium transition ${
            o.value === value
              ? "bg-white shadow text-gray-900"
              : "text-gray-700 hover:text-gray-900"
          }`}
          aria-pressed={o.value === value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// --- COMPACT custom Year dropdown (mobile-friendly, tight option spacing) ---
function YearDropdown({
  value,
  options,
  onChange,
  label = "Year",
}: {
  value: number;
  options: number[];
  onChange: (v: number) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // close on outside tap
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center gap-2 h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setOpen((o) => !o)}
      >
        {value}
        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M5.5 7.5L10 12l4.5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 mt-2 w-28 rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 z-20"
        >
          {/* tight option spacing: py-1 overall + each option py-1 */}
          <ul className="py-1">
            {options.map((y) => {
              const active = y === value;
              return (
                <li key={y}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(y);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1 text-sm ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {y}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- helpers ---
function formatCurrency(n: number) {
  return n.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function normalizeBillingStatus(s: string): "paid" | "overdue" | "unpaid" {
  const lower = s.toLowerCase();
  if (lower === "open" || lower === "unpaid") return "unpaid";
  if (lower === "overdue") return "overdue";
  if (lower === "closed" || lower === "paid") return "paid";
  return "paid";
}
function paymentTone(status: string): "green" | "red" | "gray" {
  const lower = status.toLowerCase();
  if (lower === "confirmed") return "green";
  if (lower === "processing") return "gray";
  if (lower === "failed") return "red";
  return "gray";
}
function titleCase(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}

// --- types ---
type Payment = {
  id: string | number;
  payment_date: string;
  amount: number;
  method: string;
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

function BillingsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"bills" | "payments">("bills");
  const [filter, setFilter] = useState<number>(2025);

  const [billings, setBillings] = useState<Billing[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [token] = useState<string | null>(() => getToken());

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 py-6 sm:py-8">
        {/* Header + CTA */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Billing &amp; Payment History
          </h1>

          {!notLoggedIn && (
            <button
              className="h-11 px-5 sm:px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium w-full sm:w-auto"
              onClick={() => router.push("/pay")}
              aria-label="Make a Payment"
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
            {/* Tabs + compact Year dropdown on same row */}
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
                              {p.method || "-"} • Ref:{" "}
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
                          <th className="w-[15%]">Amount</th>
                          <th className="w-[20%]">Method</th>
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
                            <td className="text-gray-900">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="text-gray-700">{p.method}</td>
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
