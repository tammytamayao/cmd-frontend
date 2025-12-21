"use client";

type Props = {
  type: "success" | "error" | "info" | "warning";
  message: string;
};

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

export function NotificationBanner({ type, message }: Props) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 shadow-sm text-sm font-medium ${styles[type]}`}
      role="alert"
    >
      {message}
    </div>
  );
}
