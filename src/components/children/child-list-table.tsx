import Link from "next/link";
import { UsersRound } from "lucide-react";
import type { ChildListItem } from "@/lib/data/children/types";
import { CHILD_STATUS_LABELS, formatApproximateAgeYearsEl, formatDateEl } from "@/lib/ui/child-labels";

type ChildListTableProps = {
  items: ChildListItem[];
  canMutate: boolean;
};

export function ChildListTable({ items, canMutate }: ChildListTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/90 bg-gradient-to-b from-surface-muted/30 to-surface-card px-6 py-16 text-center shadow-shell">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-clinical-100 bg-white shadow-sm">
          <UsersRound className="h-6 w-6 text-clinical-700/70" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-ink">Δεν βρέθηκαν εγγραφές</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          Δεν υπάρχουν ωφελούμενοι με τα τρέχοντα κριτήρια αναζήτησης. Δοκιμάστε άλλο όνομα ή επώνυμο, ή προσθέστε νέο φάκελο
          εφόσον έχετε δικαίωμα.
        </p>
        {canMutate ? (
          <Link
            href="/children/new"
            className="mt-8 inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-700"
          >
            Νέος φάκελος παιδιού
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card shadow-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-surface-muted/90">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Επώνυμο
              </th>
              <th scope="col" className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Όνομα
              </th>
              <th scope="col" className="hidden px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-muted sm:table-cell">
                Ημ. γέννησης
              </th>
              <th scope="col" className="hidden px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-muted md:table-cell">
                Ηλικία
              </th>
              <th scope="col" className="hidden px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-muted md:table-cell">
                Κέντρο
              </th>
              <th scope="col" className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Κατάσταση
              </th>
              <th scope="col" className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Ενέργειες
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-surface-muted/40">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                  <Link href={`/children/${row.id}`} className="text-clinical-800 hover:underline">
                    {row.last_name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                  <Link href={`/children/${row.id}`} className="hover:text-ink hover:underline">
                    {row.first_name}
                  </Link>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-ink-muted sm:table-cell">
                  {formatDateEl(row.date_of_birth)}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-ink-muted md:table-cell">
                  {formatApproximateAgeYearsEl(row.date_of_birth)}
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
