"use client";

import Header from "@/app/components/Header";

export default function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className={`mx-auto max-w-7xl px-6 py-10 ${className}`}>
        {children}
      </main>
    </div>
  );
}
