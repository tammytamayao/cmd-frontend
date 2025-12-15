"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSubscriber } from "@/lib/types";
import { getToken } from "@/lib/auth";
import { updateAdminSubscriber } from "@/lib/api";
import { SelectDropdown } from "@/app/components/ui/SelectDropdown";

type EditForm = {
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

function toEditForm(s: AdminSubscriber): EditForm {
  return {
    last_name: s.last_name ?? "",
    first_name: s.first_name ?? "",
    phone_number: s.phone_number ?? "",
    alternative_phone: (s.alternative_phone ?? "") as string,
    zone: s.zone ?? "",

    collector: (s.collector ?? "") as string,
    date_installed: s.date_installed ?? "",
    serial_number: s.serial_number ?? "",
    tvconnect: !!s.tvconnect,

    package: (s.package ?? "") as string,
    plan: s.plan ?? "",
    brate: s.brate != null ? String(s.brate) : "",
    package_speed: s.package_speed != null ? String(s.package_speed) : "",

    mc_address: (s.mc_address ?? "") as string,
    stb: (s.stb ?? "") as string,
    cas: (s.cas ?? "") as string,

    requires_password_change: !!s.requires_password_change,
  };
}

/** same helpers you used on New Subscriber page */
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

export function EditSubscriberModal({
  open,
  subscriber,
  onClose,
  onUpdated,
}: {
  open: boolean;
  subscriber: AdminSubscriber | null;
  onClose: () => void;
  onUpdated: (updated: AdminSubscriber) => void;
}) {
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscriber) {
      setForm(null);
      setErr(null);
      setSaving(false);
      return;
    }
    setForm(toEditForm(subscriber));
    setErr(null);
    setSaving(false);
  }, [open, subscriber, subscriber?.id]);

  const canSave = useMemo(() => {
    if (!form) return false;
    return (
      form.first_name.trim().length > 0 &&
      form.last_name.trim().length > 0 &&
      form.phone_number.trim().length > 0
    );
  }, [form]);

  if (!open || !subscriber || !form) return null;

  const subLabel =
    subscriber.serial_number || `SUB-${String(subscriber.id).padStart(5, "0")}`;

  async function save() {
    if (!subscriber || !form) return; // hard guard

    setErr(null);

    const token = getToken();
    if (!token) {
      setErr("No token found. Please log in as staff.");
      return;
    }

    try {
      setSaving(true);

      const sub = subscriber; // ← IMPORTANT

      const payload = {
        last_name: form.last_name.trim(),
        first_name: form.first_name.trim(),
        phone_number: form.phone_number.trim(),
        alternative_phone: form.alternative_phone || null,
        zone: form.zone || null,

        collector: form.collector || null,
        date_installed: form.date_installed || null,
        serial_number: form.serial_number || null,
        tvconnect: !!form.tvconnect,

        package: form.package || null,
        plan: form.plan || null,
        brate: form.brate ? Number(form.brate) : null,
        package_speed: form.package_speed ? Number(form.package_speed) : null,

        mc_address: form.mc_address || null,
        stb: form.stb || null,
        cas: form.cas || null,

        requires_password_change: !!form.requires_password_change,
      };

      const res = await updateAdminSubscriber(sub.id, payload, token);
      onUpdated(res.data);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update subscriber");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-5xl mx-4">
        {/* header strip (matches your admin look) */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Subscriber
            </h2>
          </div>

          <div className="p-6 max-h-[75vh] overflow-auto space-y-6 bg-gray-50">
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
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, last_name: e.target.value } : p
                      )
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
                      setForm((p) =>
                        p ? { ...p, first_name: e.target.value } : p
                      )
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
                      setForm((p) =>
                        p ? { ...p, phone_number: e.target.value } : p
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="0995xxxxxxx"
                  />
                </Field>

                <Field label="Alternative Phone">
                  <input
                    value={form.alternative_phone}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, alternative_phone: e.target.value } : p
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </Field>

                <Field label="Zone / Address">
                  <input
                    value={form.zone}
                    onChange={(e) =>
                      setForm((p) => (p ? { ...p, zone: e.target.value } : p))
                    }
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
                <Field label="Collector">
                  <input
                    value={form.collector}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, collector: e.target.value } : p
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="e.g. MERVIN PEREZ"
                  />
                </Field>

                <Field label="Date Installed">
                  <input
                    type="date"
                    value={form.date_installed}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, date_installed: e.target.value } : p
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </Field>

                <Field label="Subscriber Number">
                  <input
                    value={form.serial_number}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, serial_number: e.target.value } : p
                      )
                    }
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
                            setForm((p) =>
                              p ? { ...p, package: v, plan: "" } : p
                            );
                          } else {
                            setForm((p) =>
                              p ? { ...p, package: v[0], plan: v.slice(1) } : p
                            );
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
                            setForm((p) =>
                              p ? { ...p, tvconnect: e.target.checked } : p
                            )
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
                    onChange={(e) =>
                      setForm((p) => (p ? { ...p, brate: e.target.value } : p))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="2299"
                  />
                </Field>

                <Field label="Package Speed (Mbps)">
                  <input
                    inputMode="numeric"
                    value={form.package_speed}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, package_speed: e.target.value } : p
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="320"
                  />
                </Field>

                <Field label="MC Address">
                  <input
                    value={form.mc_address}
                    onChange={(e) =>
                      setForm((p) =>
                        p ? { ...p, mc_address: e.target.value } : p
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="04AB084D5174"
                  />
                </Field>

                <Field label="STB">
                  <input
                    value={form.stb}
                    onChange={(e) =>
                      setForm((p) => (p ? { ...p, stb: e.target.value } : p))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="S200959895"
                  />
                </Field>

                <Field label="CAS">
                  <input
                    value={form.cas}
                    onChange={(e) =>
                      setForm((p) => (p ? { ...p, cas: e.target.value } : p))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="76394047"
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={save}
              disabled={!canSave || saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
