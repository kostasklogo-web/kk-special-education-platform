import Link from "next/link";
import type { RoomListItem } from "@/lib/data/rooms/types";
import { roomStatusLabelEl, roomTypeLabelEl } from "@/lib/ui/room-labels";
import { EmptyState } from "@/components/shell/EmptyState";

export function RoomsTable({
  items,
  canEdit,
}: {
  items: RoomListItem[];
  canEdit: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν αίθουσες"
        description="Δεν βρέθηκαν αίθουσες με τα τρέχοντα φίλτρα."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Όνομα</th>
            <th className="px-4 py-3">Κέντρο</th>
            <th className="px-4 py-3">Κωδικός</th>
            <th className="px-4 py-3">Χωρητικότητα</th>
            <th className="px-4 py-3">Τύπος</th>
            <th className="px-4 py-3">Κατάσταση</th>
            {canEdit ? <th className="px-4 py-3">Ενέργειες</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-surface-muted/40">
              <td className="px-4 py-2">
                <Link href={`/rooms/${row.id}`} className="font-medium text-clinical-700 hover:underline">
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-ink-muted">{row.center_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{row.room_code.trim() ? row.room_code : "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{row.capacity !== null ? row.capacity : "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{roomTypeLabelEl(row.room_type)}</td>
              <td className="px-4 py-2 text-ink-muted">{roomStatusLabelEl(row.status)}</td>
              {canEdit ? (
                <td className="px-4 py-2">
                  <Link
                    href={`/rooms/${row.id}/edit`}
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
