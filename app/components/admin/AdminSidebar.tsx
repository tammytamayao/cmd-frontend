"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import {
  Home,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

type AdminSidebarProps = {
  active: "subscribers" | "payments" | "billings" | "reports";
};

export function AdminSidebar({ active }: AdminSidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navButtonClasses = (isActive: boolean) =>
    [
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
      isActive
        ? "bg-blue-50 text-blue-700 font-medium"
        : "text-gray-600 hover:bg-gray-50",
    ].join(" ");

  const go = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const handleLogout = () => {
    clearToken();
    router.push("/");
    setOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-lg transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:translate-x-0 md:shadow-none",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Admin</div>
              <div className="text-xs text-gray-500">Billing Department</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
          <button
            type="button"
            onClick={() => go("/admin/subscribers")}
            className={navButtonClasses(active === "subscribers")}
          >
            <Home className="h-4 w-4" />
            <span>Subscribers</span>
          </button>

          <button
            type="button"
            onClick={() => go("/admin/payments")}
            className={navButtonClasses(active === "payments")}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
          </button>

          <button
            type="button"
            onClick={() => go("/admin/billings")}
            className={navButtonClasses(active === "billings")}
          >
            <FileText className="h-4 w-4" />
            <span>Billings</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </nav>

        <div className="border-t border-gray-100 px-3 py-4 text-xs text-gray-400">
          © {new Date().getFullYear()} CMD
        </div>
      </aside>
    </>
  );
}
