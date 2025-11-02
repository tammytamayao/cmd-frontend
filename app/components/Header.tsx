"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

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
        {/* Left: Logo + Name */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900 text-lg">
            CMD UnliFiberMax
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <a className="font-medium text-gray-900" href="#">
            Dashboard
          </a>
          <a className="text-gray-600 hover:text-gray-900" href="#">
            Billing
          </a>
          <a className="text-gray-600 hover:text-gray-900" href="#">
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
            <span className="sr-only">Toggle Menu</span>
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
          <a className="block py-2 text-sm font-medium text-gray-900" href="#">
            Dashboard
          </a>
          <a className="block py-2 text-sm text-gray-700" href="#">
            Billing
          </a>
          <a className="block py-2 text-sm text-gray-700" href="#">
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
