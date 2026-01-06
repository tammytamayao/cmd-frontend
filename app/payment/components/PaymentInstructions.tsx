"use client";

import Image from "next/image";
import type { PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/helpers";

export function PaymentInstructions({
  method,
  amount,
  reference,
}: {
  method: PaymentMethod;
  amount: number;
  reference: string;
}) {
  const showBankQR = method === "BANK_TRANSFER";

  const qrUrl = "/gcash-qr-placeholder.png";
  const bankDetails = {
    bank_name: "BPI",
    account_name: "CMD UnliFiberMax",
    account_no: "1234 5678 90",
  };

  const gcashBillerName = "CMD Cable Vision Inc";

  return (
    <>
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
                    <div className="text-xs text-gray-500">Account Name</div>
                    <div className="font-medium text-gray-900">
                      {bankDetails.account_name}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Account Number</div>
                  <div className="font-mono text-sm text-gray-900">
                    {bankDetails.account_no}
                  </div>
                </div>

                {/* optional: show amount here too, consistent with your GCASH panel */}
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(Number(amount || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GCASH: step-by-step instructions */}
        {method === "GCASH" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Pay via GCash Bills Pay
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Use the steps below to pay your bill directly in the GCash app.
              Then upload a screenshot of the successful transaction.
            </p>

            <ol className="mt-4 space-y-3 text-sm text-gray-800">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                  1
                </span>
                <span>
                  Login to your <b>GCash</b> account.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                  2
                </span>
                <span>
                  Tap <b>Bills</b>.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                  3
                </span>
                <span>
                  Search for <b>{gcashBillerName}</b> and tap it.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                  4
                </span>
                <span>
                  Fill out the required fields then press <b>Next</b>
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                  5
                </span>
                <span>
                  Confirm payment then <b>Download Image Receipt</b>
                </span>
              </li>
            </ol>

            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Biller</span>
                  <span className="font-medium text-gray-900">
                    {gcashBillerName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subscriber/Account No.</span>
                  <span className="font-mono text-gray-900">{reference}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(Number(amount || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASH: simple reminder */}
        {method === "CASH" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Cash Payment Instructions
            </h2>
            <p className="text-sm text-gray-700 mt-2">
              Please pay at our office or to an authorized collector. Keep the
              receipt and upload a photo here to speed up verification. Upload
              is optional for cash payments.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
