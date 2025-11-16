"use client";

import { useEffect, useRef, useState } from "react";

export default function CompactDropdown<T extends string | number>({
  value,
  options,
  onChange,
  label,
  placeholder = "Select",
  getLabel = (v) => String(v),
}: {
  value: T | null;
  options: T[];
  onChange: (v: T) => void;
  label?: string;
  placeholder?: string;
  getLabel?: (v: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside tap
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const selectedLabel = value !== null ? getLabel(value) : placeholder;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full inline-flex items-center justify-between h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "" : "text-gray-500"}>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M5.5 7.5L10 12l4.5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 z-20"
        >
          <ul className="py-1 max-h-60 overflow-y-auto">
            {options.map((opt) => {
              const active = value === opt;
              return (
                <li key={String(opt)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {getLabel(opt)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
