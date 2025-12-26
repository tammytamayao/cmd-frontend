"use client";

import React from "react";
import {
  PACKAGE_PLAN_OPTIONS,
  SubscriberFormBase,
  type AdminSubscriber,
  type PackagePlanOption,
} from "@/lib/types";
import { computePackagePlanLabel, formatDate } from "@/lib/helpers";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";

import {
  Field,
  ReadOnlyValue,
  Section,
} from "@/app/admin/subscribers/components/SubscriberFormParts";

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

// ---------------- Read-only sections ----------------

export function SubscriberPersonalInfoReadOnly({
  subscriber,
}: {
  subscriber: AdminSubscriber;
}) {
  return (
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
  );
}

export function SubscriberPlanInfoReadOnly({
  subscriber,
}: {
  subscriber: AdminSubscriber;
}) {
  const packagePlan = computePackagePlanLabel(subscriber);

  return (
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
              <ReadOnlyValue value={subscriber.tvconnect ? "Yes" : "No"} />
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
  );
}

// ---------------- Editable sections (generic) ----------------

export function SubscriberPersonalInfoEdit<T extends SubscriberFormBase>({
  form,
  setForm,
}: {
  form: T;
  setForm: Setter<T>;
}) {
  return (
    <Section
      title="Personal Information"
      subtitle="Basic subscriber details and contact information"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Last Name *">
          <input
            required
            value={form.last_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, last_name: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="TAMAYAO"
          />
        </Field>

        <Field label="First Name *">
          <input
            required
            value={form.first_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, first_name: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="PRINCESS CONNIE"
          />
        </Field>

        <Field label="Phone Number *">
          <input
            required
            value={form.phone_number}
            onChange={(e) =>
              setForm((p) => ({ ...p, phone_number: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="0995xxxxxxx"
          />
        </Field>

        <Field label="Alternative Phone">
          <input
            value={form.alternative_phone}
            onChange={(e) =>
              setForm((p) => ({ ...p, alternative_phone: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Zone / Address">
          <input
            required
            value={form.zone}
            onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. DANGAN RM"
          />
        </Field>
      </div>
    </Section>
  );
}

export function SubscriberPlanInfoEdit<T extends SubscriberFormBase>({
  form,
  setForm,
}: {
  form: T;
  setForm: Setter<T>;
}) {
  return (
    <Section
      title="Package Plan Information"
      subtitle="Installation, plan details, and device identifiers"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Collector">
          <input
            required
            value={form.collector}
            onChange={(e) =>
              setForm((p) => ({ ...p, collector: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. MERVIN PEREZ"
          />
        </Field>

        <Field label="Installation Date">
          <input
            required
            type="date"
            value={form.date_installed}
            onChange={(e) =>
              setForm((p) => ({ ...p, date_installed: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Subscriber Number">
          <input
            required
            value={form.serial_number}
            onChange={(e) =>
              setForm((p) => ({ ...p, serial_number: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="105959-210"
          />
        </Field>

        <div className="md:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Package Plan">
              <SelectDropdown<PackagePlanOption>
                value={
                  form.package
                    ? form.plan
                      ? (`${form.package}${form.plan}` as PackagePlanOption)
                      : (form.package as PackagePlanOption)
                    : null
                }
                options={PACKAGE_PLAN_OPTIONS}
                placeholder="Select…"
                onChange={(opt: string) => {
                  const v = String(opt).trim().toUpperCase();
                  if (v.length === 1) {
                    setForm((p) => ({ ...p, package: v, plan: "" }));
                  } else {
                    setForm((p) => ({ ...p, package: v[0], plan: v.slice(1) }));
                  }
                }}
                getLabel={(v: string) => String(v)}
              />
            </Field>

            <Field label="TV Enabled">
              <div className="flex items-center gap-2 h-[38px] rounded-lg px-3 bg-white">
                <input
                  type="checkbox"
                  checked={form.tvconnect}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tvconnect: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Enabled</span>
              </div>
            </Field>
          </div>
        </div>

        <Field label="Amount (brate)">
          <input
            required
            inputMode="numeric"
            value={form.brate}
            onChange={(e) => setForm((p) => ({ ...p, brate: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="2299"
          />
        </Field>

        <Field label="Package Speed (Mbps)">
          <input
            required
            inputMode="numeric"
            value={form.package_speed}
            onChange={(e) =>
              setForm((p) => ({ ...p, package_speed: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="320"
          />
        </Field>

        <Field label="MC Address">
          <input
            required
            value={form.mc_address}
            onChange={(e) =>
              setForm((p) => ({ ...p, mc_address: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="04AB084D5174"
          />
        </Field>

        <Field label="STB Number">
          <input
            required
            value={form.stb}
            onChange={(e) => setForm((p) => ({ ...p, stb: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="S200959895"
          />
        </Field>

        <Field label="CAS ID">
          <input
            required
            value={form.cas}
            onChange={(e) => setForm((p) => ({ ...p, cas: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="76394047"
          />
        </Field>
      </div>
    </Section>
  );
}
