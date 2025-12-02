// app/admin/billings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";

type BillingCycle = "Monthly" | "Quarterly" | "Yearly";

export default function AdminBillingsPage() {
  const router = useRouter();

  // Simple auth guard error
  const [err, setErr] = useState<string | null>(null);

  // Form state
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");
  const [billingPeriod, setBillingPeriod] = useState<string>("October 2024");
  const [dueDate, setDueDate] = useState<string>(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD for <input type="date">
  );

  const [chargeDescription, setChargeDescription] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [charges, setCharges] = useState<
    { description: string; amount: number }[]
  >([]);

  // Fake summary numbers for now – later you can compute from backend
  const totalAccountsSelected = 1250;
  const invoicesToGenerate = 1250;
  const baseAmountToBeBilled = 92487.5;
  const extraChargesTotal = charges.reduce((sum, c) => sum + c.amount, 0);
  const totalAmountToBeBilled = baseAmountToBeBilled + extraChargesTotal;

  useEffect(() => {
    let cancelled = false;

    const checkToken = () => {
      const t = getToken();
      if (!t && !cancelled) {
        setErr("No token found. Please log in as staff.");
      }
    };

    checkToken();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  const onAddCharge = () => {
    if (!chargeDescription.trim() || !chargeAmount.trim()) return;

    const value = Number(chargeAmount);
    if (Number.isNaN(value)) return;

    setCharges((prev) => [
      ...prev,
      { description: chargeDescription.trim(), amount: value },
    ]);
    setChargeDescription("");
    setChargeAmount("");
  };

  const onGeneratePreview = () => {
    // Later: call backend endpoint to generate preview
    alert("Generate preview not wired yet – hook to backend later.");
  };

  const onProcessAndSend = () => {
    // Later: call backend to actually run batch billing
    alert("Process & send not wired yet – hook to backend later.");
  };

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm">
          {err}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Admin</div>
            <div className="text-xs text-gray-500">Billing Department</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => router.push("/admin/subscribers")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <span>🏠</span>
            <span>Subscribers</span>
          </button>

          {/* Payments */}
          <button
            type="button"
            onClick={() => router.push("/admin/payments")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <span>💳</span>
            <span>Payments</span>
          </button>

          {/* Billings (current page) */}
          <button
            type="button"
            onClick={() => router.push("/admin/billings")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium"
          >
            <span>📄</span>
            <span>Billings</span>
          </button>

          {/* Reports */}
          <button
            type="button"
            onClick={() => router.push("/admin/reports")}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <span>📊</span>
            <span>Reports</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-4"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 text-xs text-gray-400">
          © {new Date().getFullYear()} CMD
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Batch Billing Center
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and process bills for multiple subscribers at once.
            </p>
          </div>
        </header>

        <section className="flex-1 px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            {/* Left: configuration + charges */}
            <div className="space-y-6">
              {/* 1. Configuration */}
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    1. Configuration
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Define the parameters for this billing run.
                  </p>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Billing cycle + period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Billing Cycle
                      </label>
                      <select
                        value={billingCycle}
                        onChange={(e) =>
                          setBillingCycle(e.target.value as BillingCycle)
                        }
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      >
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Billing Period
                      </label>
                      <input
                        value={billingPeriod}
                        onChange={(e) => setBillingPeriod(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                        placeholder="e.g., October 2024"
                      />
                    </div>
                  </div>

                  {/* Due date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Invoice Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Charges & Adjustments */}
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    2. Charges & Adjustments
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Apply bulk charges or credits to all selected accounts.
                  </p>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Input row */}
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        placeholder="e.g., Seasonal Discount"
                        value={chargeDescription}
                        onChange={(e) => setChargeDescription(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Charge / Credit Amount
                      </label>
                      <input
                        placeholder="Enter amount, e.g. -100.00"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={onAddCharge}
                      className="h-10 md:h-[38px] rounded-lg bg-gray-900 text-white text-sm font-medium px-4 hover:bg-gray-800"
                    >
                      Add
                    </button>
                  </div>

                  {/* List of added charges */}
                  {charges.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 mt-2 text-xs">
                      <p className="mb-2 font-medium text-gray-700">
                        Applied Adjustments
                      </p>
                      <ul className="space-y-1">
                        {charges.map((c, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between text-gray-700"
                          >
                            <span>{c.description}</span>
                            <span>
                              {c.amount >= 0 ? "+" : "-"}₱
                              {Math.abs(c.amount).toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: summary + finalize */}
            <div className="space-y-6">
              {/* Billing run summary */}
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Billing Run Summary
                  </h2>
                </div>

                <div className="px-5 py-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      Total Accounts Selected
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {totalAccountsSelected.toLocaleString("en-PH")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      Invoices to Generate
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {invoicesToGenerate.toLocaleString("en-PH")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      Total Amount to be Billed
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      ₱
                      {totalAmountToBeBilled.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Finalize run */}
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Finalize Run
                  </h2>
                </div>

                <div className="px-5 py-4 space-y-3">
                  <button
                    type="button"
                    onClick={onGeneratePreview}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 hover:bg-indigo-100"
                  >
                    <span>👁️</span>
                    <span>Generate Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={onProcessAndSend}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white text-sm font-medium px-4 py-2 hover:bg-gray-800"
                  >
                    <span>▶</span>
                    <span>Process &amp; Send Invoices</span>
                  </button>

                  <button
                    type="button"
                    className="w-full text-xs text-gray-500 hover:text-gray-700 mt-1"
                  >
                    Cancel Run
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
