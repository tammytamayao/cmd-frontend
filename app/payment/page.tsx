"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../components/Header";
import { getToken } from "@/lib/auth";
import { fetchCurrentUser, createPayment } from "@/lib/api";
import CompactDropdown from "../components/ui/CompactDropdown";

type PaymentMethod = "GCASH" | "BANK_TRANSFER" | "CASH";

type Me = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  plan: string;
  brate: number;
  serial_number: string;
};

type Billing = {
  id: string | number;
  start_date: string;
  end_date: string;
  due_date: string;
  amount: number;
  status: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_RAILS_API_BASE || "http://localhost:3000";

function formatRangeLabel(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return `${start.toLocaleDateString("en-PH", opts)} – ${end.toLocaleDateString(
    "en-PH",
    opts
  )}`;
}

export default function PaymentPage() {
  const router = useRouter();

  // ===== Auth gate =====
  const [token] = useState<string | null>(() =>
    typeof window !== "undefined" ? getToken() : null
  );
  const [me, setMe] = useState<Me | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ===== Billings (open/overdue) =====
  const [billings, setBillings] = useState<Billing[]>([]);
  const [billingsLoading, setBillingsLoading] = useState(true);

  // ===== Form state =====
  const [payment_method, setPaymentMethod] = useState<PaymentMethod>("GCASH");
  const [billingId, setBillingId] = useState<string | number | null>(null);

  // Derived UI fields
  const planName = me?.plan ?? "Plan";
  const fullName = me?.full_name ?? "Customer";

  const selectedBilling = useMemo(
    () => billings.find((b) => String(b.id) === String(billingId)) || null,
    [billings, billingId]
  );

  const amount = selectedBilling?.amount ?? me?.brate ?? 0;
  const billingPeriodLabel = selectedBilling
    ? formatRangeLabel(selectedBilling.start_date, selectedBilling.end_date)
    : "—";

  // QR + payee/reference
  const qrUrl = "/gcash-qr-placeholder.png";
  const bankDetails = {
    bank_name: "BPI",
    account_name: "CMD UnliFiberMax",
    account_no: "1234 5678 90",
  };

  const gcashBillerName = "CMD Cable Vision Inc";
  const reference = me?.serial_number ?? "09123456789";

  // Receipt upload state (optional; backend ignores for now)
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Auth + Me =====
  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const data = (await fetchCurrentUser(token)) as Me;
        if (!alive) return;
        setMe(data);
      } catch {
        if (!alive) return;
        router.replace("/login");
      } finally {
        if (alive) setAuthLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, router]);

  // ===== Fetch open/overdue billings =====
  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        setBillingsLoading(true);
        const url = new URL(`${API_BASE}/api/v1/billings`);
        url.searchParams.set("status", "open,overdue");

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`billings fetch failed: ${res.status}`);
        const json = await res.json();
        const list: Billing[] = json?.data ?? [];

        // Sort by due_date DESC
        list.sort(
          (a, b) =>
            new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
        );

        if (!alive) return;

        setBillings(list);
        setBillingId(list.length > 0 ? list[0].id : null);
      } catch {
        if (!alive) return;
        setBillings([]);
        setBillingId(null);
      } finally {
        if (alive) setBillingsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  // ===== File upload utils (optional) =====
  const accept = useMemo(
    () => ["image/png", "image/jpeg", "application/pdf"],
    []
  );
  const maxBytes = 5 * 1024 * 1024;

  const onFiles = useCallback(
    (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) return;
      const f = files[0];
      if (!accept.includes(f.type)) {
        setError("Only PNG, JPG, or PDF files are allowed.");
        return;
      }
      if (f.size > maxBytes) {
        setError("File is larger than 5MB.");
        return;
      }
      setFile(f);
    },
    [accept]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  // ===== Submit payment (via helper) =====
  const onSubmitPayment = async () => {
    if (!me?.id) {
      setError("Missing subscriber information.");
      return;
    }
    if (!billingId) {
      setError("Please select a billing period to pay.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("subscriber_id", String(me.id));
      form.append("billing_id", String(billingId));
      form.append("full_name", fullName);
      form.append("plan_name", planName);
      form.append("amount", String(amount));
      form.append("billing_period", billingPeriodLabel);
      form.append("payment_method", payment_method); // Rails expects this

      if (payment_method === "GCASH") {
        form.append("payee_name", gcashBillerName);
        form.append("gcash_reference", reference);
      } else if (payment_method === "BANK_TRANSFER") {
        form.append("bank_name", bankDetails.bank_name);
        form.append("account_name", bankDetails.account_name);
        form.append("account_no", bankDetails.account_no);
      }
      // Optional: still send the file; API ignores for now
      if (file) form.append("receipt", file);

      await createPayment(form, token);
      alert("Payment submitted for verification. Thank you!");
      // Optional: reset UI
      // setFile(null);
      // router.replace("/billing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const showBankQR = payment_method === "BANK_TRANSFER";

  // ===== Auth gate UI =====
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100 px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="card p-6 bg-white border border-gray-200 rounded-xl">
              Checking your session…
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              Complete Your Payment
            </h1>
            <p className="text-gray-600 mt-1">
              Review your details before submitting payment.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* LEFT: Payment Form */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Form
                </h2>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Read-only plan + totals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">
                      Full Name
                    </label>
                    <div className="mt-1 font-medium text-gray-900">
                      {fullName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">
                      Plan Name
                    </label>
                    <div className="mt-1 font-medium text-gray-900">
                      {planName}
                    </div>
                  </div>
                  <div className="sm:col-span-2 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">
                      Total Amount Due
                    </p>
                    <p className="text-xl font-extrabold text-gray-900">
                      ₱{Number(amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Billing Period */}
                <div>
                  <label
                    htmlFor="billingPeriod"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Billing Period
                  </label>
                  <CompactDropdown
                    value={billingId}
                    options={billings.map((b) => b.id)}
                    onChange={(v) => setBillingId(v)}
                    placeholder={
                      billingsLoading
                        ? "Loading..."
                        : billings.length === 0
                        ? "No open/overdue billings"
                        : "Select billing period"
                    }
                    getLabel={(v) => {
                      const b = billings.find((x) => x.id === v);
                      return b
                        ? formatRangeLabel(b.start_date, b.end_date)
                        : String(v);
                    }}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Payment Method
                  </label>
                  <CompactDropdown
                    value={payment_method}
                    options={["GCASH", "BANK_TRANSFER", "CASH"]}
                    onChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    getLabel={(v) =>
                      v === "GCASH"
                        ? "GCash"
                        : v === "BANK_TRANSFER"
                        ? "Bank Transfer"
                        : "Cash"
                    }
                  />
                </div>

                {/* Helper note */}
                {payment_method === "CASH" ? (
                  <div className="rounded-lg bg-amber-50 text-amber-900 text-sm px-4 py-3">
                    You selected <b>Cash</b>. Please pay at our office or to an
                    authorized collector. Uploading a receipt is optional.
                  </div>
                ) : payment_method === "GCASH" ? (
                  <div className="rounded-lg bg-blue-50 text-blue-800 text-sm px-4 py-3">
                    You selected <b>GCash Bills Pay</b>. Follow the steps on the
                    right to pay via <b>{gcashBillerName}</b>. Upload is
                    optional for now.
                  </div>
                ) : (
                  <div className="rounded-lg bg-blue-50 text-blue-800 text-sm px-4 py-3">
                    You selected <b>Bank Transfer</b>. Scan the QR and complete
                    the payment. Upload is optional for now.
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT: Contextual panel */}
            <div className="space-y-6">
              {/* BANK TRANSFER: QR + bank details */}
              {showBankQR && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Scan to Pay (Bank Transfer)
                  </h2>

                  <div className="mt-4 grid place-items-center">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <Image
                        src={qrUrl}
                        alt="Bank Transfer QR Code"
                        width={220}
                        height={220}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mt-4 w-full max-w-sm mx-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-left">
                    <div className="grid gap-2 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">Bank</div>
                          <div className="font-medium text-gray-900">
                            {bankDetails.bank_name}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            Account Name
                          </div>
                          <div className="font-medium text-gray-900">
                            {bankDetails.account_name}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Account Number
                        </div>
                        <div className="font-mono text-sm text-gray-900">
                          {bankDetails.account_no}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CASH/GCASH panels omitted for brevity—UI stays same */}

              {/* Confirm + Upload + Submit Payment */}
              <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden self-start">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Confirm Your Payment
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Uploading a receipt is optional for now; you can still
                    submit without it.
                  </p>

                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className="mt-2 grid place-items-center h-44 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      accept={accept.join(",")}
                      className="hidden"
                      onChange={(e) => onFiles(e.target.files)}
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                        >
                          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 14h-2v-2h2Zm0-4h-2V6h2Z" />
                        </svg>
                      </div>
                      <p className="font-medium text-gray-700">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, or PDF (max. 5MB)
                      </p>
                    </div>
                  </label>

                  {file && (
                    <div className="mt-3 flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                      <span className="truncate max-w-[70%]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {error && (
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                  )}

                  <button
                    onClick={onSubmitPayment}
                    disabled={submitting || !billingId}
                    className="mt-4 w-full h-12 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Payment"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
