"use client";

import { AdminSubscriber } from "@/lib/types";
import { formatDate } from "@/lib/helpers";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-gray-600">{label}</div>
      {children}
    </label>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ReadOnlyValue({ value }: { value: React.ReactNode }) {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
      {value}
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

      <div className="relative w-full max-w-5xl mx-4">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {/* Header (same vibe as Edit) */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Subscriber Details
            </h2>
          </div>

          <div className="p-6 max-h-[75vh] overflow-auto space-y-6 bg-gray-50">
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

            {/* PERSONAL INFO (same as Edit section) */}
            <Section
              title="Personal Information"
              subtitle="Basic subscriber details and contact information"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Last Name">
                  <ReadOnlyValue value={subscriber.last_name ?? "-"} />
                </Field>

                <Field label="First Name">
                  <ReadOnlyValue value={subscriber.first_name ?? "-"} />
                </Field>

                <Field label="Phone Number">
                  <ReadOnlyValue value={subscriber.phone_number ?? "-"} />
                </Field>

                <Field label="Alternative Phone">
                  <ReadOnlyValue value={subscriber.alternative_phone ?? "-"} />
                </Field>

                <Field label="Zone / Address">
                  <ReadOnlyValue value={subscriber.zone ?? "-"} />
                </Field>
              </div>
            </Section>

            {/* PACKAGE PLAN INFO (same as Edit section) */}
            <Section
              title="Package Plan Information"
              subtitle="Installation, plan details, and device identifiers"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Collector">
                  <ReadOnlyValue value={subscriber.collector ?? "-"} />
                </Field>

                <Field label="Date Installed">
                  <ReadOnlyValue
                    value={
                      subscriber.date_installed
                        ? formatDate(subscriber.date_installed)
                        : "-"
                    }
                  />
                </Field>

                <Field label="Subscriber Number">
                  <ReadOnlyValue value={subscriber.serial_number ?? "-"} />
                </Field>

                {/* Package Plan + TV Enabled (same structure as Edit) */}
                <div className="md:col-span-1">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Package Plan">
                      <ReadOnlyValue value={packagePlan} />
                    </Field>

                    <Field label="TV Enabled">
                      <ReadOnlyValue
                        value={subscriber.tvconnect ? "Yes" : "No"}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Amount (brate)">
                  <ReadOnlyValue
                    value={`₱ ${(subscriber.brate ?? 0).toLocaleString(
                      "en-PH",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}`}
                  />
                </Field>

                <Field label="Package Speed (Mbps)">
                  <ReadOnlyValue
                    value={`Up to ${subscriber.package_speed ?? 0} Mbps`}
                  />
                </Field>

                <Field label="MC Address">
                  <ReadOnlyValue value={subscriber.mc_address ?? "-"} />
                </Field>

                <Field label="STB">
                  <ReadOnlyValue value={subscriber.stb ?? "-"} />
                </Field>

                <Field label="CAS">
                  <ReadOnlyValue value={subscriber.cas ?? "-"} />
                </Field>
              </div>
            </Section>
          </div>

          {/* Footer (same as Edit) */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-white">
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
    </div>
  );
}
