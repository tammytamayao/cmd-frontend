"use client";

import { LoginMode } from "@/lib/types";

export function IdentityField({
  mode,
  serialNumber,
  email,
  onSerialChange,
  onEmailChange,
}: {
  mode: LoginMode;
  serialNumber: string;
  email: string;
  onSerialChange: (v: string) => void;
  onEmailChange: (v: string) => void;
}) {
  const isSubscriber = mode === "subscriber";

  if (isSubscriber) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">
          Subscriber Number
        </label>
        <input
          inputMode="text"
          autoComplete="off"
          placeholder="e.g. 105959-210"
          value={serialNumber}
          onChange={(e) => onSerialChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
      />
    </div>
  );
}
