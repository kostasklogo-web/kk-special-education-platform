import Link from "next/link";
import type { ProgressReportListItem } from "@/lib/data/progress-reports/types";
import { formatDateEl } from "@/lib/ui/child-labels";
import { progressReportStatusLabelEl } from "@/lib/ui/progress-report-labels";
import { EmptyState } from "@/components/shell/EmptyState";

function periodLabel(row: ProgressReportListItem): string {
  const a = row.period_start ? formatDateEl(row.period_start) : "—";
  const b = row.period_end ? formatDateEl(row.period_end) : "—";
  if (a === "—" && b === "—") return "—";
  return `${a} → ${b}`;
}

export function ProgressReportsTable({ items }: { items: ProgressReportListItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Δεν βρέθηκαν αναφορές"
        description="Δεν υπάρχουν αναφορές προόδου με τα επιλεγμένα κριτήρια. Αλλάξτε φίλτρο ή δημιουργήστε νέα εγγραφή από το προφίλ παιδιού όταν ενεργοποιηθεί η καταχώρηση."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-left text-sm">
        <thead className="bg-surface-muted/50 text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Τίτλος</th>
            <th className="px-4 py-3">Παιδί</th>
            <th className="hidden px-4 py-3 lg:table-cell">Περίοδος</th>
            <th className="px-4 py-3">Κατάσταση</th>
            <th className="hidden px-4 py-3 sm:table-cell">Ενημέρωση</th>
            <th className="px-4 py-3 text-right">Ενέργειες</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/40">
              <td className="max-w-[14rem] px-4 py-2">
                <Link href={`/reports/${row.id}`} className="font-medium text-clinical-700 hover:underline">
                  {row.title}
                </Link>
                <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted lg:hidden">{periodLabel(row)}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <Link href={`/children/${row.child_id}`} className="text-ink-muted hover:text-clinical-800 hover:underline">
                  {row.child_name}
                </Link>
              </td>
              <td className="hidden whitespace-nowrap px-4 py-2 text-ink-muted lg:table-cell">{periodLabel(row)}</td>
              <td className="px-4 py-2">
                <span className="inline-flex rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink">
                  {progressReportStatusLabelEl(row.status)}
                </span>
              </td>
              <td className="hidden whitespace-nowrap px-4 py-2 text-ink-muted sm:table-cell">
                {formatDateEl(row.updated_at.slice(0, 10))}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-right">
                <Link href={`/reports/${row.id}`} className="text-xs font-medium text-clinical-700 hover:underline">
                  Προβολή
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
