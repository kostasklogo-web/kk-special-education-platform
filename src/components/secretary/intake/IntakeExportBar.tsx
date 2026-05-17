"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";
import type { ClientIntake } from "@/lib/secretary/types";
import { getAllIntakes } from "@/lib/secretary/intake/store";
import {
  exportIntakeListExcel,
  exportPendingLeadsExcel,
  printIntakePdf,
} from "@/lib/secretary/intake/export";

type Props = {
  lastSaved: ClientIntake | null;
};

export function IntakeExportBar({ lastSaved }: Props) {
  const handleListExport = () => {
    const intakes = getAllIntakes();
    exportIntakeListExcel(intakes, `intake-list-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePendingExport = () => {
    exportPendingLeadsExcel(getAllIntakes());
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-border bg-surface-muted/40 p-3">
      <span className="w-full text-xs font-semibold uppercase tracking-wide text-ink-muted">Εξαγωγές</span>
      <button
        type="button"
        onClick={() => lastSaved && printIntakePdf(lastSaved)}
        disabled={!lastSaved}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted disabled:opacity-50"
      >
        <Printer className="h-3.5 w-3.5" />
        PDF intake (τελευταίο)
      </button>
      <button
        type="button"
        onClick={handleListExport}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Λίστα intake (Excel)
      </button>
      <button
        type="button"
        onClick={handlePendingExport}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted"
      >
        <Download className="h-3.5 w-3.5" />
        Εκκρεμή leads (Excel)
      </button>
    </div>
  );
}
