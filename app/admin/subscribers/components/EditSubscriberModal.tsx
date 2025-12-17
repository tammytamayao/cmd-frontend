"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminSubscriber, EditSubscriberForm } from "@/lib/types";
import { getToken } from "@/lib/auth";
import { updateAdminSubscriber } from "@/lib/api";
import { AdminModal } from "@/app/components/admin/AdminModal";
import {
  SubscriberPersonalInfoEdit,
  SubscriberPlanInfoEdit,
} from "@/app/admin/subscribers/components/SubscriberSections";
import { toEditSubscriberForm } from "@/lib/helpers";

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
  const [form, setForm] = useState<EditSubscriberForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscriber) {
      setForm(null);
      setErr(null);
      setSaving(false);
      return;
    }
    setForm(toEditSubscriberForm(subscriber));
    setErr(null);
    setSaving(false);
  }, [open, subscriber, subscriber?.id]);

  const canSave = useMemo(() => {
    if (!form) return false;
    return (
      form.last_name.trim() !== "" &&
      form.first_name.trim() !== "" &&
      form.phone_number.trim() !== "" &&
      form.zone.trim() !== "" &&
      form.collector.trim() !== "" &&
      form.date_installed.trim() !== "" &&
      form.serial_number.trim() !== "" &&
      form.package.trim() !== "" &&
      form.plan.trim() !== "" &&
      form.brate.trim() !== "" &&
      form.package_speed.trim() !== "" &&
      form.mc_address.trim() !== "" &&
      form.stb.trim() !== "" &&
      form.cas.trim() !== ""
    );
  }, [form]);

  async function save() {
    if (!subscriber || !form) return;

    setErr(null);

    const token = getToken();
    if (!token) {
      setErr("No token found. Please log in as staff.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        last_name: form.last_name.trim(),
        first_name: form.first_name.trim(),
        phone_number: form.phone_number.trim(),
        alternative_phone: form.alternative_phone.trim(),
        zone: form.zone.trim(),

        collector: form.collector.trim(),
        date_installed: form.date_installed,
        serial_number: form.serial_number.trim(),
        tvconnect: !!form.tvconnect,

        package: form.package.trim(),
        plan: form.plan.trim(),
        brate: Number(form.brate),
        package_speed: Number(form.package_speed),

        mc_address: form.mc_address.trim(),
        stb: form.stb.trim(),
        cas: form.cas.trim(),

        requires_password_change: !!form.requires_password_change,
      };

      const res = await updateAdminSubscriber(subscriber.id, payload, token);
      onUpdated(res.data);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update subscriber");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Edit Subscriber"
      maxWidthClassName="max-w-5xl"
      bodyClassName="max-h-[75vh] overflow-auto space-y-6 bg-gray-50"
      footer={
        <div className="flex items-center justify-end gap-2">
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
            disabled={!canSave || saving || !subscriber || !form}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      }
    >
      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
          {err}
        </div>
      )}

      {!subscriber || !form ? (
        <div className="text-center text-gray-500 py-6">
          No subscriber selected.
        </div>
      ) : (
        <>
          <SubscriberPersonalInfoEdit form={form} setForm={setForm} />
          <SubscriberPlanInfoEdit form={form} setForm={setForm} />
        </>
      )}
    </AdminModal>
  );
}
