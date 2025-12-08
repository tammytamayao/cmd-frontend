// app/components/admin/AdminHeader.tsx
"use client";

import type { ReactNode } from "react";

type AdminHeaderProps = {
  title: string;
  subtitle: string;

  // keep this for advanced / custom layouts if you ever need it
  rightSlot?: ReactNode;

  // new: simple built-in primary action button
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminHeader({
  title,
  subtitle,
  rightSlot,
  actionLabel,
  onAction,
}: AdminHeaderProps) {
  const showActionButton = actionLabel && onAction;

  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {rightSlot}
        {showActionButton && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </header>
  );
}
