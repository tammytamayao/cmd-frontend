"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import { createAdminSubscriber } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CreateSubscriberForm } from "@/lib/types";

import { NEW_SUBSCRIBER_INITIAL } from "@/app/admin/subscribers/components/SubscriberFormDefaults";
import {
  SubscriberPersonalInfoEdit,
  SubscriberPlanInfoEdit,
} from "@/app/admin/subscribers/components/SubscriberSections";

export default function AdminNewSubscriberPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateSubscriberForm>(
    NEW_SUBSCRIBER_INITIAL
  );
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

            <SubscriberPersonalInfoEdit form={form} setForm={setForm} />
            <SubscriberPlanInfoEdit form={form} setForm={setForm} />

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
