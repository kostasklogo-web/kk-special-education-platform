import Link from "next/link";
import type { StaffListItem } from "@/lib/data/staff/types";
import { roleLabelEl } from "@/lib/auth/roles";
import { employmentStatusLabelEl } from "@/lib/ui/staff-labels";
import { EmptyState } from "@/components/shell/EmptyState";

export function StaffTable({
  items,
  canEdit,
}: {
  items: StaffListItem[];
  canEdit: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν εγγραφές"
        description="Δεν βρέθηκαν μέλη προσωπικού με τα τρέχοντα φίλτρα."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Ονοματεπώνυμο</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Ρόλος</th>
            <th className="px-4 py-3">Κέντρο</th>
            <th className="px-4 py-3">Ειδικότητα</th>
            <th className="px-4 py-3">Κατάσταση</th>
            {canEdit ? <th className="px-4 py-3">Ενέργειες</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((row) => {
            const fullName = `${row.first_name} ${row.last_name}`.trim() || "—";
            return (
              <tr key={row.id} className="hover:bg-surface-muted/40">
                <td className="px-4 py-2">
                  <Link href={`/staff/${row.id}`} className="font-medium text-clinical-700 hover:underline">
                    {fullName}
                  </Link>
                </td>
                <td className="px-4 py-2 text-ink-muted">{row.work_email.trim() ? row.work_email : "—"}</td>
                <td className="px-4 py-2 text-ink-muted">{row.role_code ? roleLabelEl(row.role_code) : "—"}</td>
                <td className="px-4 py-2 text-ink-muted">{row.center_name ?? "—"}</td>
                <td className="px-4 py-2 text-ink-muted">{row.discipline_name_el ?? row.discipline_code ?? "—"}</td>
                <td className="px-4 py-2 text-ink-muted">{employmentStatusLabelEl(row.employment_status)}</td>
                {canEdit ? (
                  <td className="px-4 py-2">
                    <Link
                      href={`/staff/${row.id}/edit`}
                      className="text-xs font-medium text-clinical-700 hover:underline"
                    >
                      Επεξεργασία
                    </Link>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
