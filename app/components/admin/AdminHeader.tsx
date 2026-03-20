"use client";

import type { ReactNode } from "react";

type AdminHeaderProps = {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
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
  const showActionButton = !!actionLabel && !!onAction;

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left content */}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-sm">{subtitle}</p>
        </div>

        {/* Right actions */}
        {(rightSlot || showActionButton) && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {rightSlot}

            {showActionButton && (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 sm:w-auto"
              >
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
