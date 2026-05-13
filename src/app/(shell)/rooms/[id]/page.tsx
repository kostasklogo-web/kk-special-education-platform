import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canAccessRoomsModule, canWriteRooms } from "@/lib/auth/rooms-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { listSessionsForRoomInRange, getRoomById } from "@/lib/data/rooms/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { roomStatusLabelEl, roomTypeLabelEl } from "@/lib/ui/room-labels";
import { sessionStatusLabelEl } from "@/lib/ui/session-labels";
import {
  addDaysAthensCalendar,
  athensEndOfDayUtcIso,
  athensStartOfDayUtcIso,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";

type RoomDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailBlock({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className={`text-sm text-ink sm:col-span-2 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</dd>
    </div>
  );
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessRoomsModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const { room, error } = await getRoomById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Προβολή αίθουσας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!room) {
    notFound();
  }

  const canWrite = canWriteRooms(ctx.roleCodes);

  const anchor = todayAthensYmd();
  const fromYmd = addDaysAthensCalendar(anchor, -7);
  const toYmd = addDaysAthensCalendar(anchor, 56);
  const fromIso = athensStartOfDayUtcIso(fromYmd);
  const toIso = athensEndOfDayUtcIso(toYmd);

  const sessionsRes = await listSessionsForRoomInRange({
    organizationId: room.organization_id,
    roomId: room.id,
    fromIso,
    toIso,
  });

  return (
    <div>
      <PageHeader
        title="Προβολή αίθουσας"
        description={room.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/rooms"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
            {canWrite ? (
              <Link
                href={`/rooms/${room.id}/edit`}
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία
              </Link>
            ) : null}
          </div>
        }
      />

      <dl className="mx-auto mb-8 max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailBlock label="Κέντρο / Τοποθεσία" value={room.center_name ?? "—"} />
        <DetailBlock label="Όνομα αίθουσας" value={room.name} />
        <DetailBlock label="Κωδικός αίθουσας" value={room.room_code.trim() ? room.room_code : "—"} />
        <DetailBlock label="Χωρητικότητα" value={room.capacity !== null ? String(room.capacity) : "—"} />
        <DetailBlock label="Τύπος αίθουσας" value={roomTypeLabelEl(room.room_type)} />
        <DetailBlock label="Κατάσταση" value={roomStatusLabelEl(room.status)} />
        <DetailBlock
          label="Περιγραφή / Παρατηρήσεις"
          value={room.description.trim() ? room.description : "—"}
          multiline
        />
      </dl>

      <section className="mx-auto mb-8 max-w-3xl rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <h2 className="text-base font-semibold text-ink">Προγραμματισμένες συνεδρίες σε αυτή την αίθουσα</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Εμφάνιση συνεδριών από 7 ημέρες πριν έως 56 ημέρες μετά (τοπική ώρα Αθήνας).
        </p>
        {sessionsRes.error ? (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {sessionsRes.error}
          </p>
        ) : sessionsRes.items.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Δεν βρέθηκαν συνεδρίες στο εύρος.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {sessionsRes.items.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                <div>
                  <Link href={`/schedule/${s.id}`} className="font-medium text-clinical-700 hover:underline">
                    {new Intl.DateTimeFormat("el-GR", {
                      timeZone: "Europe/Athens",
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(s.starts_at))}
                  </Link>
                  <span className="text-ink-muted"> · {s.child_name}</span>
                  <span className="text-ink-muted"> · {s.discipline_name_el ?? s.discipline_code}</span>
                </div>
                <span className="text-xs text-ink-muted">{sessionStatusLabelEl(s.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-3xl rounded-xl border border-dashed border-border bg-surface-muted/20 p-6">
        <h2 className="text-base font-semibold text-ink">Διαθεσιμότητα</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Προβολή διαθεσιμότητας ανά ώρα και σύγκρουση με άλλες συνεδρίες θα προστεθεί σε επόμενη έκδοση (MVP:
          χρησιμοποιήστε το πρόγραμμα και τις παρουσίες).
        </p>
      </section>
    </div>
  );
}
