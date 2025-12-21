"use client";

import type { ReactNode } from "react";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;

  title?: ReactNode;

  children: ReactNode;

  footer?: ReactNode;

  maxWidthClassName?: string;
  bodyClassName?: string;
};

export function AdminModal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClassName = "max-w-lg",
  bodyClassName = "",
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => {
        // close on backdrop click, but not when clicking inside the modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          "bg-white rounded-2xl shadow-xl w-full mx-4 overflow-hidden",
          maxWidthClassName,
        ].join(" ")}
      >
        {title !== undefined && (
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        <div className={["px-6 py-4", bodyClassName].join(" ")}>{children}</div>

        {footer && (
          <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
