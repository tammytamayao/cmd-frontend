"use client";

import { Eye, EyeOff } from "lucide-react";

export function PasswordField({
  password,
  onChange,
  show,
  onToggleShow,
}: {
  password: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Password</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={onToggleShow}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
