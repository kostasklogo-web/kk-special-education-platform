import Link from "next/link";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";
import { therapyGoalPriorityLabelEl, therapyGoalStatusLabelEl } from "@/lib/ui/therapy-goal-labels";
import { EmptyState } from "@/components/shell/EmptyState";

export function TherapyGoalsTable({
  items,
  canEdit,
}: {
  items: TherapyGoalListItem[];
  canEdit: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν στόχοι"
        description="Δεν βρέθηκαν θεραπευτικοί στόχοι με τα τρέχοντα φίλτρα."
      />
    );
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-border bg-surface-card shadow-shell [-webkit-overflow-scrolling:touch]">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Τίτλος</th>
            <th className="px-4 py-3">Παιδί</th>
            <th className="hidden px-4 py-3 md:table-cell">Πλάνο</th>
            <th className="hidden px-4 py-3 lg:table-cell">Ειδικότητα</th>
            <th className="hidden px-4 py-3 xl:table-cell">Θεραπευτής</th>
            <th className="px-4 py-3">Κατάσταση</th>
            <th className="hidden px-4 py-3 sm:table-cell">Προτεραιότητα</th>
            {canEdit ? <th className="px-4 py-3 text-right">Ενέργειες</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/40">
              <td className="px-4 py-2">
                <Link href={`/therapy-goals/${row.id}`} className="font-medium text-clinical-700 hover:underline">
                  {row.title}
                </Link>
              </td>
              <td className="px-4 py-2 text-ink-muted">
                <Link href={`/children/${row.child_id}`} className="hover:text-clinical-800 hover:underline">
                  {row.child_name}
                </Link>
              </td>
              <td className="hidden px-4 py-2 text-ink-muted md:table-cell">{row.plan_title ?? "—"}</td>
              <td className="hidden px-4 py-2 text-ink-muted lg:table-cell">{row.discipline_name_el ?? row.discipline_code}</td>
              <td className="hidden px-4 py-2 text-ink-muted xl:table-cell">{row.therapist_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{therapyGoalStatusLabelEl(row.status)}</td>
              <td className="hidden px-4 py-2 text-ink-muted sm:table-cell">{therapyGoalPriorityLabelEl(row.priority)}</td>
              {canEdit ? (
                <td className="px-4 py-2">
                  <Link
                    href={`/therapy-goals/${row.id}/edit`}
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
