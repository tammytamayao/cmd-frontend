"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import { createAdminSubscriber } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";

type FormState = {
  // Personal
  last_name: string;
  first_name: string;
  phone_number: string;
  alternative_phone: string;
  zone: string;

  // Registration
  collector: string;
  date_installed: string; // YYYY-MM-DD
  serial_number: string;
  tvconnect: boolean;

  // Plan
  package: string;
  plan: string;
  brate: string;
  package_speed: string;

  // Device IDs
  mc_address: string;
  stb: string;
  cas: string;

  requires_password_change: boolean;
};

const initial: FormState = {
  last_name: "",
  first_name: "",
  phone_number: "",
  alternative_phone: "",
  zone: "",

  collector: "",
  date_installed: "",
  serial_number: "",
  tvconnect: false,

  package: "",
  plan: "",
  brate: "",
  package_speed: "",

  mc_address: "",
  stb: "",
  cas: "",

  requires_password_change: true,
};

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

const PACKAGE_PLAN_OPTIONS = [
  "MA",
  "MB",
  "MC",
  "FM",
  "RB",
  "FC",
  "FT",
  "FH",
  "FO",
  "FG",
  "FP",
  "M",
  "R",
] as const;

type PackagePlanOption = (typeof PACKAGE_PLAN_OPTIONS)[number];

export default function AdminNewSubscriberPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      form.first_name.trim().length > 0 &&
      form.last_name.trim().length > 0 &&
      form.phone_number.trim().length > 0 &&
      form.serial_number.trim().length > 0
    );
  }, [form.first_name, form.last_name, form.phone_number, form.serial_number]);

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const token = getToken();
    if (!token) {
      setErr("No token found. Please log in as staff.");
      return;
    }

    if (!canSubmit) {
      setErr(
        "Please fill in First Name, Last Name, Phone & Subscriber Number."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        // personal
        last_name: form.last_name.trim(),
        first_name: form.first_name.trim(),
        phone_number: form.phone_number.trim(),
        alternative_phone: form.alternative_phone || null,
        zone: form.zone || null,

        // registration
        collector: form.collector || null,
        date_installed: form.date_installed || null,
        serial_number: form.serial_number || null,
        tvconnect: !!form.tvconnect,

        // plan
        package: form.package || null,
        plan: form.plan || null,
        brate: form.brate ? Number(form.brate) : null,
        package_speed: form.package_speed ? Number(form.package_speed) : null,

        // device IDs
        mc_address: form.mc_address || null,
        stb: form.stb || null,
        cas: form.cas || null,

        requires_password_change: !!form.requires_password_change,
      };

      await createAdminSubscriber(payload, token);
      router.push("/admin/subscribers");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create subscriber");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar active="subscribers" />

      <main className="flex-1 flex flex-col">
        <AdminHeader
          title="Subscriber Registration"
          subtitle="Create new subscriber and its additional information"
          rightSlot={
            <button
              type="button"
              onClick={() => router.push("/admin/subscribers")}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Back to List
            </button>
          }
        />

        <section className="flex-1 px-8 py-6">
          <form onSubmit={onSubmit} className="max-w-5xl space-y-6">
            {err && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
                {err}
              </div>
            )}

            {/* PERSONAL INFO */}
            <Section
              title="Personal Information"
              subtitle="Basic subscriber details and contact information"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Last Name *">
                  <input
                    required
                    value={form.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="TAMAYAO"
                  />
                </Field>

                <Field label="First Name *">
                  <input
                    required
                    value={form.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="PRINCESS CONNIE"
                  />
                </Field>

                <Field label="Phone Number *">
                  <input
                    required
                    value={form.phone_number}
                    onChange={(e) => update("phone_number", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="0995xxxxxxx"
                  />
                </Field>

                <Field label="Alternative Phone">
                  <input
                    value={form.alternative_phone}
                    onChange={(e) =>
                      update("alternative_phone", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </Field>

                <Field label="Zone / Address">
                  <input
                    value={form.zone}
                    onChange={(e) => update("zone", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="e.g. DANGAN RM"
                  />
                </Field>
              </div>
            </Section>

            {/* PACKAGE PLAN INFO */}
            <Section
              title="Package Plan Information"
              subtitle="Installation, plan details, and device identifiers"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Registration */}
                <Field label="Collector">
                  <input
                    value={form.collector}
                    onChange={(e) => update("collector", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="e.g. MERVIN PEREZ"
                  />
                </Field>

                <Field label="Installation Date">
                  <input
                    type="date"
                    value={form.date_installed}
                    onChange={(e) => update("date_installed", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </Field>

                <Field label="Subscriber Number">
                  <input
                    value={form.serial_number}
                    onChange={(e) => update("serial_number", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="105959-210"
                  />
                </Field>

                {/* Package Plan + TV Enabled (same column, 50/50) */}
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
                            update("package", v);
                            update("plan", "");
                          } else {
                            update("package", v[0]);
                            update("plan", v.slice(1));
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
                            update("tvconnect", e.target.checked)
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
                    inputMode="numeric"
                    value={form.brate}
                    onChange={(e) => update("brate", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="2299"
                  />
                </Field>

                <Field label="Package Speed (mbps)">
                  <input
                    inputMode="numeric"
                    value={form.package_speed}
                    onChange={(e) => update("package_speed", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="320"
                  />
                </Field>

                {/* Device IDs */}
                <Field label="MC Address">
                  <input
                    value={form.mc_address}
                    onChange={(e) => update("mc_address", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="04AB084D5174"
                  />
                </Field>

                <Field label="STB">
                  <input
                    value={form.stb}
                    onChange={(e) => update("stb", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="S200959895"
                  />
                </Field>

                <Field label="CAS">
                  <input
                    value={form.cas}
                    onChange={(e) => update("cas", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="76394047"
                  />
                </Field>
              </div>
            </Section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit || saving}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Create Subscriber"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
