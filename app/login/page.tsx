"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) return setErr("Please enter a valid phone number.");
    if (password.length < 6)
      return setErr("Password must be at least 6 characters.");
    router.push("/dashboard"); // TODO: hook to Rails auth
  };

  return (
    /* Use dynamic viewport height to avoid mobile Safari offset */
    <main className="min-h-[100dvh] grid place-items-center px-4">
      <div className="w-full max-w-md card p-8">
        {/* Brand */}
        <div className="flex items-center justify-center mb-4">
          <svg width="26" height="20" viewBox="0 0 26 20" className="mr-2">
            <path
              d="M2 10c3-6 19-6 22 0"
              stroke="#6366F1"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="13" cy="10" r="3" fill="#6366F1" />
          </svg>
          <span className="font-semibold text-gray-800">ConnectNet</span>
        </div>

        <h1 className="text-2xl font-bold text-center">CMD Login</h1>
        <p className="text-center text-gray-500 mt-1 mb-6">
          Enter your credentials to access your account.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Phone */}
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium mb-1">Password</label>
              <a className="text-sm text-indigo-600 hover:underline" href="#">
                Forgot Password?
              </a>
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
            className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <a className="text-indigo-600 hover:underline" href="#">
            Sign Up
          </a>
        </p>
      </div>
    </main>
  );
}
