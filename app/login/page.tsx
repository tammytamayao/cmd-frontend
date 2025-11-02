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
    router.push("/dashboard");
  };

  return (
    // <-- full screen, centered
    <main className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md card p-8">
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
            className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
          >
            Log In
          </button>
        </form>

        {/* <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <a className="text-indigo-600 hover:underline" href="#">
            Sign Up
          </a>
        </p> */}
      </div>
    </main>
  );
}
