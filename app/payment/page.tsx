"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { getToken } from "@/lib/auth";
import { createPayment } from "@/lib/api";
import type { Billing, PaymentMethod } from "@/lib/types";

import { useAuthCurrentUser } from "@/app/hooks/useAuthCurrentUser";
import { useOpenBillings } from "@/app/hooks/useOpenBillings";
import { useReceiptUpload } from "@/app/hooks/useReceiptUpload";
import { PaymentInstructions } from "@/app/payment/components/PaymentInstructions";
import { PaymentFormCard } from "@/app/payment/components/PaymentFormCard";
import { formatRangeLabel } from "@/lib/helpers";
import { PaymentConfirmCard } from "@/app/payment/components/PaymentConfirmCard";

export default function PaymentPage() {
  const router = useRouter();
  const fileInputId = useId();

  const token = useMemo(() => getToken(), []);
  const { user, loading: authLoading } = useAuthCurrentUser();

  const { billings, billingsLoading, billingId, setBillingId } =
    useOpenBillings(token);

  const [payment_method, setPaymentMethod] = useState<PaymentMethod>("GCASH");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const upload = useReceiptUpload();

  const selectedBilling = useMemo<Billing | null>(() => {
    return billings.find((b) => String(b.id) === String(billingId)) || null;
  }, [billings, billingId]);

  const fullName = user?.full_name ?? "Customer";
  const planName = user?.plan ?? "-";
  const packageName = user?.package ?? "-";
  const reference = user?.serial_number ?? "-";

  const amount = selectedBilling?.amount ?? user?.brate ?? 0;

  const billingPeriodLabel = selectedBilling
    ? formatRangeLabel(selectedBilling.start_date, selectedBilling.end_date)
    : "—";

  const receiptRequired =
    payment_method === "GCASH" ||
    payment_method === "BANK_TRANSFER" ||
    payment_method === "CASH";

  const submitDisabled =
    submitting || !billingId || (receiptRequired && !upload.file);

  const onSubmitPayment = async () => {
    if (!token) return;

    if (!user?.id) {
      setSubmitError("Missing subscriber information.");
      return;
    }
    if (!billingId) {
      setSubmitError("Please select a billing period to pay.");
      return;
    }
    if (receiptRequired && !upload.file) {
      setSubmitError("Please upload your payment receipt before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    upload.setUploadError(null);

    try {
      const bankDetails = {
        bank_name: "BPI",
        account_name: "CMD UnliFiberMax",
        account_no: "1234 5678 90",
      };
      const gcashBillerName = "CMD Cable Vision Inc";

      const form = new FormData();
      form.append("subscriber_id", String(user.id));
      form.append("billing_id", String(billingId));
      form.append("full_name", fullName);
      form.append("plan_name", planName);
      form.append("package_name", packageName);
      form.append("amount", String(amount));
      form.append("billing_period", billingPeriodLabel);
      form.append("payment_method", payment_method);

      if (payment_method === "GCASH") {
        form.append("payee_name", gcashBillerName);
        form.append("gcash_reference", reference);
      } else if (payment_method === "BANK_TRANSFER") {
        form.append("bank_name", bankDetails.bank_name);
        form.append("account_name", bankDetails.account_name);
        form.append("account_no", bankDetails.account_no);
      }

      if (upload.file) form.append("receipt", upload.file);

      await createPayment(form, token);
      alert("Payment submitted for verification. Thank you!");
      upload.setFile(null);
      router.replace("/billing");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!user) return null;

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
            <PaymentFormCard
              fullName={fullName}
              packageName={packageName}
              planName={planName}
              amount={Number(amount || 0)}
              billings={billings}
              billingsLoading={billingsLoading}
              billingId={billingId}
              onBillingChange={setBillingId}
              paymentMethod={payment_method}
              onPaymentMethodChange={setPaymentMethod}
            />

            <div className="space-y-6">
              <PaymentInstructions
                method={payment_method}
                amount={Number(amount || 0)}
                reference={reference}
              />

              <PaymentConfirmCard
                inputId={fileInputId}
                receiptRequired={receiptRequired}
                accept={upload.accept}
                file={upload.file}
                uploadError={upload.uploadError}
                onFiles={upload.onFiles}
                onDrop={upload.onDrop}
                onRemove={() => upload.setFile(null)}
                submitError={submitError}
                submitDisabled={submitDisabled}
                submitting={submitting}
                onSubmit={onSubmitPayment}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
