import type { CenterSummary } from "@/lib/data/children/types";
import type { RoomsPageSearch } from "@/lib/rooms/search-params";
import { buildRoomsHref } from "@/lib/rooms/search-params";
import { ROOM_STATUS_LABELS_EL, ROOM_TYPE_LABELS_EL } from "@/lib/ui/room-labels";
import type { RoomStatus, RoomType } from "@/lib/data/rooms/types";

type RoomsFiltersFormProps = {
  search: RoomsPageSearch;
  centers: CenterSummary[];
};

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS_EL) as RoomType[];
const ROOM_STATUSES = Object.keys(ROOM_STATUS_LABELS_EL) as RoomStatus[];

export function RoomsFiltersForm({ search, centers }: RoomsFiltersFormProps) {
  const f = search.filters;

  return (
    <form method="get" action="/rooms" className="mb-6 rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="filter_center" className="mb-1 block text-xs font-medium text-ink-muted">
            Κέντρο
          </label>
          <select
            id="filter_center"
            name="center"
            defaultValue={f.centerId ?? ""}
            className="min-w-[12rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">Όλα</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter_type" className="mb-1 block text-xs font-medium text-ink-muted">
            Τύπος
          </label>
          <select
            id="filter_type"
            name="type"
            defaultValue={f.roomType ?? ""}
            className="min-w-[12rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">Όλοι</option>
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {ROOM_TYPE_LABELS_EL[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter_status" className="mb-1 block text-xs font-medium text-ink-muted">
            Κατάσταση
          </label>
          <select
            id="filter_status"
            name="status"
            defaultValue={f.status ?? ""}
            className="min-w-[10rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">Όλες</option>
            {ROOM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ROOM_STATUS_LABELS_EL[s]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
        >
          Εφαρμογή
        </button>
        <a
          href={buildRoomsHref()}
          className="text-sm font-medium text-clinical-700 hover:underline"
        >
          Καθαρισμός
        </a>
      </div>
    </form>
  );
}
