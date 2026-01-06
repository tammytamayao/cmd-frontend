"use client";

import { LoginMode } from "@/lib/types";

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: LoginMode;
  onChange: (m: LoginMode) => void;
}) {
  const isSubscriber = mode === "subscriber";

  return (
    <div className="flex mb-6 rounded-full bg-gray-100 p-1 text-sm font-medium">
      <button
        type="button"
        onClick={() => onChange("subscriber")}
        className={`flex-1 py-2 rounded-full transition ${
          isSubscriber ? "bg-white shadow-sm text-red-600" : "text-gray-500"
        }`}
      >
        Subscriber
      </button>
      <button
        type="button"
        onClick={() => onChange("admin")}
        className={`flex-1 py-2 rounded-full transition ${
          !isSubscriber ? "bg-white shadow-sm text-red-600" : "text-gray-500"
        }`}
      >
        Staff / Admin
      </button>
    </div>
  );
}
