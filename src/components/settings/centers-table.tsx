import Link from "next/link";
import type { CenterListItem } from "@/lib/data/centers/types";
import { centerStatusLabelEl } from "@/lib/ui/center-labels";
import { EmptyState } from "@/components/shell/EmptyState";

export function CentersTable({
  items,
  canEdit,
}: {
  items: CenterListItem[];
  canEdit: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState title="Δεν υπάρχουν κέντρα" description="Δεν βρέθηκαν καταχωρημένα κέντρα για τον οργανισμό." />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Όνομα</th>
            <th className="px-4 py-3">Πόλη</th>
            <th className="px-4 py-3">Τηλέφωνο</th>
            <th className="px-4 py-3">Κατάσταση</th>
            {canEdit ? <th className="px-4 py-3">Ενέργειες</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/40">
              <td className="px-4 py-2">
                <Link
                  href={`/settings/centers/${row.id}`}
                  className="font-medium text-clinical-700 hover:underline"
                >
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-ink-muted">{row.city.trim() ? row.city : "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{row.phone?.trim() ? row.phone : "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{centerStatusLabelEl(row.is_active)}</td>
              {canEdit ? (
                <td className="px-4 py-2">
                  <Link
                    href={`/settings/centers/${row.id}/edit`}
                    className="text-xs font-medium text-clinical-700 hover:underline"
                  >
                    Επεξεργασία
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
