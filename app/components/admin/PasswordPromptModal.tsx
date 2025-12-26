"use client";

import { useMemo, useState } from "react";
import { AdminModal } from "@/app/components/admin/AdminModal";
import { PasswordPromptModalProps } from "@/lib/types";
import { expectedPasswordForNow } from "@/lib/helpers";

function PasswordPromptModalInner({
  onClose,
  onConfirmed,
}: Omit<PasswordPromptModalProps, "open">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expected = useMemo(() => expectedPasswordForNow(), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) return setError("Password is required.");
    if (password.trim() !== expected) return setError("Incorrect password.");

    onConfirmed();
    onClose();
  };

  return (
    <form id="password-prompt-form" onSubmit={submit} className="space-y-4">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter password"
        />
      </div>
    </form>
  );
}

export function PasswordPromptModal({
  open,
  onClose,
  onConfirmed,
  title = "Security Check",
}: PasswordPromptModalProps) {
  const modalKey = open ? "open" : "closed";

  return (
    <AdminModal
      key={modalKey}
      open={open}
      onClose={onClose}
      title={title}
      bodyClassName="text-sm"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="password-prompt-form"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Continue
          </button>
        </div>
      }
    >
      {open && (
        <PasswordPromptModalInner
          onClose={onClose}
          onConfirmed={onConfirmed}
          title={title}
        />
      )}
    </AdminModal>
  );
}
