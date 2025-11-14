import { useEffect, useRef, useState } from "react";

export function YearDropdown({
  value,
  options,
  onChange,
  label = "Year",
}: {
  value: number;
  options: number[];
  onChange: (v: number) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center gap-2 h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setOpen((o) => !o)}
      >
        {value}
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
          className="absolute right-0 mt-2 w-28 rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 z-20"
        >
          <ul className="py-1">
            {options.map((y) => {
              const active = y === value;
              return (
                <li key={y}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(y);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1 text-sm ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {y}
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
