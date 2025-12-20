"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveToken } from "@/lib/auth";
import { login, adminLogin } from "@/lib/api";

type LoginMode = "subscriber" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("subscriber");

  const [serialNumber, setSerialNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (password.length < 6) {
      return setErr("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      if (mode === "subscriber") {
        const sn = serialNumber.trim();

        // Require at least "1234-1" shape (includes dash)
        if (!sn || sn.length < 6 || !sn.includes("-")) {
          setLoading(false);
          return setErr(
            "Please enter a valid serial number (e.g. 105959-210)."
          );
        }

        // NOTE: update your api.login() to send { serial_number: sn, password }
        const data = await login(sn, password);
        saveToken(data.token);
        router.push("/dashboard");
      } else {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
          setLoading(false);
          return setErr("Please enter a valid email address.");
        }

        const data = await adminLogin(trimmedEmail, password);
        saveToken(data.token);
        router.push("/admin/payments");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const isSubscriber = mode === "subscriber";

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6">CMD Login</h1>

        {/* Mode toggle */}
        <div className="flex mb-6 rounded-full bg-gray-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("subscriber")}
            className={`flex-1 py-2 rounded-full transition ${
              isSubscriber
                ? "bg-white shadow-sm text-indigo-600"
                : "text-gray-500"
            }`}
          >
            Subscriber
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`flex-1 py-2 rounded-full transition ${
              !isSubscriber
                ? "bg-white shadow-sm text-indigo-600"
                : "text-gray-500"
            }`}
          >
            Staff / Admin
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {isSubscriber ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                Serial Number
              </label>
              <input
                inputMode="text"
                autoComplete="off"
                placeholder="e.g. 105959-210"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
          )}

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
            {loading
              ? isSubscriber
                ? "Logging in..."
                : "Logging in as staff..."
              : isSubscriber
              ? "Log In"
              : "Log In as Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}
