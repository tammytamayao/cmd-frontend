"use client";

import { AdminSubscriber } from "@/lib/types";
import { formatDate } from "@/lib/helpers";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="text-[11px] font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-sm text-gray-900 break-words">{value}</div>
    </div>
  );
}

export function SubscriberDetailsModal({
  open,
  subscriber,
  onClose,
  loading = false,
  error = null,
}: {
  open: boolean;
  subscriber: AdminSubscriber | null;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}) {
  if (!open || !subscriber) return null;

  const subLabel =
    subscriber.serial_number || `SUB-${String(subscriber.id).padStart(5, "0")}`;

  const packagePlan =
    `${subscriber.package ?? ""}${subscriber.plan ?? ""}`.trim() || "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-4xl mx-4 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Subscriber Details
          </h2>
        </div>

        <div className="p-6 bg-gray-50 max-h-[75vh] overflow-auto space-y-4">
          {loading && (
            <div className="text-xs text-gray-700 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg">
              Loading latest details…
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Row
              label="Subscriber Name"
              value={
                `${subscriber.last_name ?? ""}, ${
                  subscriber.first_name ?? ""
                }`.trim() || "-"
              }
            />
            <Row label="Phone Number" value={subscriber.phone_number ?? "-"} />
            <Row
              label="Alternative Phone"
              value={subscriber.alternative_phone ?? "-"}
            />

            <Row label="Zone / Address" value={subscriber.zone ?? "-"} />
            <Row
              label="Date Installed"
              value={
                subscriber.date_installed
                  ? formatDate(subscriber.date_installed)
                  : "-"
              }
            />
            <Row label="Collector" value={subscriber.collector ?? "-"} />

            <Row label="Package Plan" value={packagePlan} />
            <Row
              label="Package Speed"
              value={`Up to ${subscriber.package_speed ?? 0} mbps`}
            />
            <Row
              label="Amount (brate)"
              value={`₱ ${(subscriber.brate ?? 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Row label="MC Address" value={subscriber.mc_address ?? "-"} />
            <Row label="STB" value={subscriber.stb ?? "-"} />
            <Row label="CAS" value={subscriber.cas ?? "-"} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Row
              label="TV Enabled"
              value={subscriber.tvconnect ? "Yes" : "No"}
            />
            <Row
              label="Requires Password Change"
              value={subscriber.requires_password_change ? "Yes" : "No"}
            />
            <Row label="Subscriber DB ID" value={subscriber.id} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
