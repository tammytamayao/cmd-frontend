"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

type AdminSidebarProps = {
  active: "subscribers" | "payments" | "billings" | "reports";
};

export function AdminSidebar({ active }: AdminSidebarProps) {
  const router = useRouter();

  const navButtonClasses = (isActive: boolean) =>
    [
      "flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm",
      isActive
        ? "bg-indigo-50 text-indigo-700 font-medium"
        : "text-gray-600 hover:bg-gray-50",
    ].join(" ");

  const go = (path: string) => router.push(path);

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100">
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-semibold">
          A
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Admin</div>
          <div className="text-xs text-gray-500">Billing Department</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {/* Subscribers */}
        <button
          type="button"
          onClick={() => go("/admin/subscribers")}
          className={navButtonClasses(active === "subscribers")}
        >
          <span>🏠</span>
          <span>Subscribers</span>
        </button>

        {/* Payments */}
        <button
          type="button"
          onClick={() => go("/admin/payments")}
          className={navButtonClasses(active === "payments")}
        >
          <span>💳</span>
          <span>Payments</span>
        </button>

        {/* Billings */}
        <button
          type="button"
          onClick={() => go("/admin/billings")}
          className={navButtonClasses(active === "billings")}
        >
          <span>📄</span>
          <span>Billings</span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-4"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 text-xs text-gray-400">
        © {new Date().getFullYear()} CMD
      </div>
    </aside>
  );
}
