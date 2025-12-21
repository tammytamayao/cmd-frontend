"use client";

import React from "react";
import { AdminSubscriber } from "@/lib/types";
import { formatDate } from "@/lib/helpers";
import { AdminModal } from "@/app/components/admin/AdminModal";

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

type Props = {
  open: boolean;
  subscriber: AdminSubscriber | null;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
};

export function SubscriberDetailsModal({
  open,
  subscriber,
  onClose,
  loading = false,
  error = null,
}: Props) {
  const packagePlan = subscriber
    ? `${subscriber.package ?? ""}${subscriber.plan ?? ""}`.trim() || "-"
    : "-";

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Subscriber Details"
      maxWidthClassName="max-w-5xl"
      bodyClassName="max-h-[75vh] overflow-auto space-y-6 bg-gray-50"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      }
    >
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

      {!loading && !error && !subscriber && (
        <div className="text-center text-gray-500 py-6">
          No subscriber selected.
        </div>
      )}

      {subscriber && (
        <>
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

          <Section
            title="Package Plan Information"
            subtitle="Installation, plan details, and device identifiers"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Collector">
                <ReadOnlyValue value={subscriber.collector ?? "-"} />
              </Field>

              <Field label="Installation Date">
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
                  value={`₱ ${(subscriber.brate ?? 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}`}
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
        </>
      )}
    </AdminModal>
  );
}
