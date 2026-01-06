"use client";

import type { ReactNode } from "react";
import { Pagination, PaginationMeta } from "@/app/components/admin/Pagination";

export type AdminTableColumn = {
  key: string;
  label?: string;
  align?: "left" | "right" | "center";
  className?: string; // th classes
};

type AdminDataTableProps<T> = {
  columns: AdminTableColumn[];
  rows: T[];

  rowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;

  renderRow: (row: T, index: number) => ReactNode;

  meta?: PaginationMeta | null;
  onPageChange?: (page: number) => void;

  zebra?: boolean; // default true
};

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  renderRow,
  meta,
  onPageChange,
  zebra = true,
}: AdminDataTableProps<T>) {
  return (
    <>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={[
                  "px-4 py-3 text-xs font-medium text-gray-500",
                  c.align === "right"
                    ? "text-right"
                    : c.align === "center"
                    ? "text-center"
                    : "text-left",
                  c.className || "",
                ].join(" ")}
              >
                {c.label ?? ""}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={rowKey(row, idx)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={[
                zebra ? (idx % 2 === 0 ? "bg-white" : "bg-gray-50/60") : "",
                onRowClick
                  ? "cursor-pointer hover:bg-blue-50/40 transition-colors"
                  : "",
              ].join(" ")}
            >
              {renderRow(row, idx)}
            </tr>
          ))}
        </tbody>
      </table>

      {meta && onPageChange && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </>
  );
}
