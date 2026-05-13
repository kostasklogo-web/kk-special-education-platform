import Link from "next/link";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import { sessionNoteStatusLabelEl } from "@/lib/ui/session-note-labels";
import { EmptyState } from "@/components/shell/EmptyState";

export function SessionNotesTable({
  items,
  canEditRow,
}: {
  items: SessionNoteListItem[];
  canEditRow: (row: SessionNoteListItem) => boolean;
}) {
  const anyEdit = items.some((row) => canEditRow(row));
  if (items.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν σημειώσεις"
        description="Δεν βρέθηκαν σημειώσεις για τις ολοκληρωμένες συνεδρίες της επιλεγμένης εβδομάδας και τα φίλτρα σας."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Ημερομηνία συνεδρίας</th>
            <th className="px-4 py-3">Παιδί</th>
            <th className="px-4 py-3">Θεραπευτής</th>
            <th className="px-4 py-3">Ειδικότητα</th>
            <th className="px-4 py-3">Συγγραφέας</th>
            <th className="px-4 py-3">Κατάσταση</th>
            {anyEdit ? <th className="px-4 py-3">Ενέργειες</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/40">
              <td className="whitespace-nowrap px-4 py-2 text-ink">
                {new Intl.DateTimeFormat("el-GR", {
                  timeZone: "Europe/Athens",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(row.session_starts_at))}
              </td>
              <td className="px-4 py-2">
                <div className="flex flex-col gap-0.5">
                  <Link href={`/session-notes/${row.id}`} className="text-xs font-medium text-ink-muted hover:text-clinical-800 hover:underline">
                    Σημείωση
                  </Link>
                  <Link href={`/children/${row.child_id}`} className="font-medium text-clinical-700 hover:underline">
                    {row.child_name}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-2 text-ink-muted">{row.therapist_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{row.discipline_name_el ?? row.discipline_code}</td>
              <td className="px-4 py-2 text-ink-muted">{row.author_display_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{sessionNoteStatusLabelEl(row.status)}</td>
              {anyEdit ? (
                <td className="px-4 py-2">
                  {canEditRow(row) ? (
                    <Link
                      href={`/session-notes/${row.id}/edit`}
                      className="text-xs font-medium text-clinical-700 hover:underline"
                    >
                      Επεξεργασία
                    </Link>
                  ) : (
                    <span className="text-xs text-ink-faint">—</span>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
