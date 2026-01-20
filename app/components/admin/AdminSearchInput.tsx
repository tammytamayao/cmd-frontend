"use client";

type AdminSearchInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search…",
  isDisabled = false,
}: AdminSearchInputProps) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-[400px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isDisabled}
      />
      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  );
}
