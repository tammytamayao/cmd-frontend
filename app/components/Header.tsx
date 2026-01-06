"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import Image from "next/image";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer py-2"
          onClick={() => router.push("/dashboard")}
        >
          <Image
            src="/logo.jpg"
            alt="CMD UnliFiberMax"
            width={160}
            height={48}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <a
            className="font-medium text-gray-900 hover:text-blue-600"
            href="/dashboard"
          >
            Dashboard
          </a>

          <a className="text-gray-600 hover:text-blue-600" href="/billing">
            Bills & Payments
          </a>

          <a className="text-gray-600 hover:text-blue-600" href="/support">
            Support
          </a>

          <button
            onClick={handleLogout}
            className="ml-3 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 rounded-md border border-gray-200 grid place-items-center hover:bg-gray-50"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        id="mobile-menu"
        className={`sm:hidden overflow-hidden transition-[max-height] duration-300 border-t border-gray-200 ${
          menuOpen ? "max-h-60" : "max-h-0"
        }`}
      >
        <div className="px-6 py-3 bg-white">
          <a
            className="block py-2 text-sm font-medium text-gray-900"
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </a>

          <a
            className="block py-2 text-sm text-gray-700"
            href="/billing"
            onClick={() => setMenuOpen(false)}
          >
            Bills & Payments
          </a>

          <a
            className="block py-2 text-sm text-gray-700"
            href="/support"
            onClick={() => setMenuOpen(false)}
          >
            Support
          </a>

          <button
            onClick={handleLogout}
            className="mt-2 block w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
