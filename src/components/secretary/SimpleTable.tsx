import type { ReactNode } from "react";
import { AlertBadge } from "./AlertBadge";
import type { AlertLevel } from "@/lib/secretary/types";

export type SimpleTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  alertLevel?: (row: T) => AlertLevel | undefined;
};

export function SimpleTable<T extends { id: string }>({
  columns,
  rows,
  empty = "Δεν υπάρχουν εγγραφές.",
}: {
  columns: SimpleTableColumn<T>[];
  rows: T[];
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-ink-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-surface-muted/60 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/40">
              {columns.map((c) => {
                const level = c.alertLevel?.(row);
                return (
                  <td key={c.key} className="px-3 py-2 align-top text-ink">
                    {level ? (
                      <div className="flex flex-col gap-1">
                        <AlertBadge level={level} className="w-fit" />
                        {c.render(row)}
                      </div>
                    ) : (
                      c.render(row)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
