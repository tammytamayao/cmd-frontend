"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { saveToken } from "@/lib/auth";
import { login, adminLogin } from "@/lib/api";
import { ModeToggle } from "@/app/login/components/ModeToggle";
import { IdentityField } from "@/app/login/components/IdentityField";
import { PasswordField } from "@/app/login/components/PasswordField";
import { normalizeError, validate } from "@/lib/helpers";
import { LoginMode } from "@/lib/types";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("subscriber");
  const isSubscriber = mode === "subscriber";

  const [serialNumber, setSerialNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErr(null);
    setPassword("");
    setShow(false);
    if (mode === "subscriber") setEmail("");
    else setSerialNumber("");
  }, [mode]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!password.trim()) return false;
    if (isSubscriber) return !!serialNumber.trim();
    return !!email.trim();
  }, [loading, password, isSubscriber, serialNumber, email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const v = validate(mode, serialNumber, email, password);
    if (!v.ok) {
      setErr(v.message);
      return;
    }

    setLoading(true);
    try {
      if (mode === "subscriber") {
        const data = await login(serialNumber.trim(), password.trim());
        saveToken(data.token);
        router.push("/dashboard");
      } else {
        const data = await adminLogin(email.trim(), password.trim());
        saveToken(data.token);
        router.push("/admin/payments");
      }
    } catch (e) {
      setErr(normalizeError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg"
            alt="CMD Logo"
            width={160}
            height={60}
            priority
          />
        </div>

        <ModeToggle mode={mode} onChange={setMode} />

        <form onSubmit={onSubmit} className="space-y-4">
          <IdentityField
            mode={mode}
            serialNumber={serialNumber}
            email={email}
            onSerialChange={setSerialNumber}
            onEmailChange={setEmail}
          />

          <PasswordField
            password={password}
            onChange={setPassword}
            show={show}
            onToggleShow={() => setShow((s) => !s)}
          />

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium transition"
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
