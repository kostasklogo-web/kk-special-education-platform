"use client";

import { downloadCsv, rowsToCsv } from "@/lib/secretary/exports";

type ExportSpec = { filename: string; headers: string[]; rows: string[][] };

export function ExportButtons({ exports: specs }: { exports: ExportSpec[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {specs.map((s) => (
        <button
          key={s.filename}
          type="button"
          onClick={() => downloadCsv(s.filename, rowsToCsv(s.headers, s.rows))}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-muted"
        >
          {s.filename}
        </button>
      ))}
      <p className="w-full text-[10px] text-ink-faint">PDF: εκτύπωση από πρόγραμμα (Control Center) · Excel: CSV UTF-8</p>
    </div>
  );
}
