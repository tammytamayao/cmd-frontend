"use client";
import { AdminModal } from "@/app/components/admin/AdminModal";
import { AdminConfirmModalProps } from "@/lib/types";

export function ConfirmModal({
  open,
  onClose,
  title = "Confirm action",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmTone = "primary",
  loading = false,
  onConfirm,
}: AdminConfirmModalProps) {
  const confirmBtnClass =
    confirmTone === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      : "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500";

  return (
    <AdminModal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60 ${confirmBtnClass}`}
          >
            {loading ? "Working..." : confirmText}
          </button>
        </div>
      }
    >
      {description ? (
        <div className="text-sm text-gray-700 leading-6">{description}</div>
      ) : null}
    </AdminModal>
  );
}
