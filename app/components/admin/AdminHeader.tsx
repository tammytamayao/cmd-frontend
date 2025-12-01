"use client";

import type { ReactNode } from "react";

type AdminHeaderProps = {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
};

export function AdminHeader({ title, subtitle, rightSlot }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      {rightSlot && <div className="flex items-center gap-3">{rightSlot}</div>}
    </header>
  );
}
