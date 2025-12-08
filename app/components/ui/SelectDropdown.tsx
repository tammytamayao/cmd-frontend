"use client";

import { useState, useRef, useEffect } from "react";

type SelectDropdownProps<T extends string | number> = {
  value: T | null;
  options: readonly T[]; // ✅ allow readonly arrays & tuples
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
  placeholder?: string;
  className?: string;
};

export function SelectDropdown<T extends string | number>({
  value,
  options,
  onChange,
  getLabel,
  placeholder = "Select...",
  className = "",
}: SelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const currentLabel =
    value !== null && value !== undefined
      ? getLabel?.(value) ?? String(value)
      : placeholder;

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <span className={!value ? "text-gray-400" : ""}>{currentLabel}</span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Options */}
      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
          {options.map((opt) => {
            const label = getLabel?.(opt) ?? String(opt);
            const selected = value === opt;
            return (
              <button
                key={String(opt)}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left ${
                  selected
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
