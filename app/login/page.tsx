"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_RAILS_API_BASE ?? "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) return setErr("Please enter a valid phone number.");
    if (password.length < 6)
      return setErr("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, password }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErr(data.error || "Login failed");
        return;
      }

      if (!data?.token) {
        setErr("No token returned from server.");
        return;
      }

      saveToken(data.token);
      router.push("/dashboard");
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6">CMD Login</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 09123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium mb-1">Password</label>
            </div>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto px-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
