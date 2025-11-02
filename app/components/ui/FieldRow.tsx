"use client";

export default function FieldRow({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-blue-600">{label}</span>
      <span className="text-sm font-medium flex items-center gap-2">
        {value}
        {copyable && (
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-gray-500 hover:text-gray-700"
            title="Copy"
          >
            📋
          </button>
        )}
      </span>
    </div>
  );
}
