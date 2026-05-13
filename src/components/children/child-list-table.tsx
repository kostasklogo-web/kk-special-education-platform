import Link from "next/link";
import type { ChildListItem } from "@/lib/data/children/types";
import { CHILD_STATUS_LABELS, formatDateEl } from "@/lib/ui/child-labels";

type ChildListTableProps = {
  items: ChildListItem[];
  canMutate: boolean;
};

export function ChildListTable({ items, canMutate }: ChildListTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">Δεν υπάρχουν εγγραφές παιδιών</p>
        <p className="mt-2 text-sm text-ink-muted">
          Δεν βρέθηκαν παιδιά με τα τρέχοντα φίλτρα. Προσθέστε νέα εγγραφή αν έχετε δικαίωμα.
        </p>
        {canMutate ? (
          <Link
            href="/children/new"
            className="mt-6 inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
          >
            Προσθήκη παιδιού
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-surface-muted/80">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Επώνυμο
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Όνομα
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold text-ink sm:table-cell">
                Ημ. γέννησης
              </th>
              <th scope="col" className="hidden px-4 py-3 font-semibold text-ink md:table-cell">
                Κέντρο
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Κατάσταση
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">
                Ενέργειες
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-surface-muted/40">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">{row.last_name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{row.first_name}</td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-ink-muted sm:table-cell">
                  {formatDateEl(row.date_of_birth)}
                </td>
                <td className="hidden max-w-[12rem] truncate px-4 py-3 text-ink-muted md:table-cell">
                  {row.center?.name ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted">
                    {CHILD_STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/children/${row.id}`}
                    className="font-medium text-clinical-700 hover:text-clinical-900"
                  >
                    Προβολή
                  </Link>
                  {canMutate ? (
                    <>
                      <span className="mx-2 text-ink-faint" aria-hidden>
                        |
                      </span>
                      <Link
                        href={`/children/${row.id}/edit`}
                        className="font-medium text-clinical-700 hover:text-clinical-900"
                      >
                        Επεξεργασία
                      </Link>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
