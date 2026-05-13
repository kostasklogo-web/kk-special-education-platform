import Link from "next/link";
import type { ParentListItem } from "@/lib/data/parents/types";

type ParentListTableProps = {
  items: ParentListItem[];
  canMutate: boolean;
};

export function ParentListTable({ items, canMutate }: ParentListTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">Δεν υπάρχουν εγγραφές γονέων</p>
        <p className="mt-2 text-sm text-ink-muted">
          Δεν βρέθηκαν γονείς με τα τρέχοντα φίλτρα. Προσθέστε νέα εγγραφή αν έχετε δικαίωμα.
        </p>
        {canMutate ? (
          <Link
            href="/parents/new"
            className="mt-6 inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
          >
            Προσθήκη γονέα
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
              <th className="px-4 py-3 font-semibold text-ink">Επώνυμο</th>
              <th className="px-4 py-3 font-semibold text-ink">Όνομα</th>
              <th className="hidden px-4 py-3 font-semibold text-ink md:table-cell">Τηλέφωνο</th>
              <th className="hidden px-4 py-3 font-semibold text-ink lg:table-cell">Email</th>
              <th className="px-4 py-3 font-semibold text-ink">Παιδιά</th>
              <th className="px-4 py-3 text-right font-semibold text-ink">Ενέργειες</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-surface-muted/40">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">{row.last_name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{row.first_name}</td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-ink-muted md:table-cell">
                  {row.phone ?? "—"}
                </td>
                <td className="hidden max-w-[14rem] truncate px-4 py-3 text-ink-muted lg:table-cell">
                  {row.email ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                  {row.linked_children_count}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/parents/${row.id}`}
                    className="font-medium text-clinical-700 hover:text-clinical-900"
                  >
                    Προβολή
                  </Link>
                  {canMutate ? (
                    <>
                      <span className="mx-2 text-ink-faint">|</span>
                      <Link
                        href={`/parents/${row.id}/edit`}
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
