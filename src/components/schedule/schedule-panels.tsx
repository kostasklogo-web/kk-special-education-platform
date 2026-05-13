import Link from "next/link";
import type { SessionListItem } from "@/lib/data/sessions/types";
import {
  addDaysAthensCalendar,
  athensStartOfDayUtcIso,
  formatAthensTimeEl,
  formatYmdAthensFromUtcMs,
  mondayOfAthensWeek,
} from "@/lib/schedule/athens-civil";
import { EmptyState } from "@/components/shell/EmptyState";
import { sessionKindLabelEl, sessionStatusLabelEl } from "@/lib/ui/session-labels";
import { scheduleDayColumnClass, sessionStatusStripeClass } from "@/lib/ui/session-visual";

function groupByAthensDay(items: SessionListItem[]): Map<string, SessionListItem[]> {
  const m = new Map<string, SessionListItem[]>();
  for (const it of items) {
    const key = formatYmdAthensFromUtcMs(new Date(it.starts_at).getTime());
    const arr = m.get(key) ?? [];
    arr.push(it);
    m.set(key, arr);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }
  return m;
}

function statusPillClass(status: string): string {
  if (status === "completed") return "bg-emerald-50 text-emerald-800 border-emerald-100";
  if (status === "scheduled") return "bg-clinical-50 text-clinical-900 border-clinical-100";
  if (status === "absence" || status === "no_show") return "bg-red-50 text-red-800 border-red-100";
  if (status === "cancelled") return "bg-slate-100 text-slate-700 border-slate-200";
  if (status === "to_reschedule") return "bg-amber-50 text-amber-900 border-amber-100";
  return "bg-surface-muted text-ink-muted border-border";
}

function SessionCard({ s }: { s: SessionListItem }) {
  return (
    <div
      className={[
        "overflow-hidden rounded-xl border border-border bg-white shadow-sm transition hover:border-clinical-300 hover:shadow-md",
        sessionStatusStripeClass(s.status),
      ].join(" ")}
    >
      <Link href={`/schedule/${s.id}`} className="block p-3 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-semibold text-ink">
            {formatAthensTimeEl(s.starts_at)} — {formatAthensTimeEl(s.ends_at)}
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusPillClass(s.status)}`}>
            {sessionStatusLabelEl(s.status)}
          </span>
        </div>
        <div className="mt-2 text-sm font-medium text-ink">{s.child_name}</div>
        <div className="mt-0.5 text-xs text-ink-muted">
          {s.therapist_name ?? "—"} · {sessionKindLabelEl(s.session_kind)}
        </div>
        <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-ink-faint">
          <span>{s.room_name ?? "Χωρίς αίθουσα"}</span>
          <span aria-hidden>·</span>
          <span>{s.discipline_name_el ?? s.discipline_code}</span>
        </div>
      </Link>
      <div className="flex flex-wrap gap-3 border-t border-border bg-surface-muted/30 px-3 py-1.5">
        <Link href={`/children/${s.child_id}`} className="text-xs font-medium text-clinical-700 hover:underline">
          Φάκελος παιδιού
        </Link>
        <Link href={`/attendance/${s.id}/edit`} className="text-xs font-medium text-clinical-700 hover:underline">
          Παρουσία
        </Link>
        <Link href={`/schedule/${s.id}`} className="text-xs text-ink-muted hover:underline">
          Λεπτομέρειες συνεδρίας
        </Link>
      </div>
    </div>
  );
}

export function ScheduleWeekPanel({ items, anchorYmd }: { items: SessionListItem[]; anchorYmd: string }) {
  const mon = mondayOfAthensWeek(anchorYmd);
  const byDay = groupByAthensDay(items);
  const columns = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const ymd = addDaysAthensCalendar(mon, i);
    const title = new Intl.DateTimeFormat("el-GR", {
      timeZone: "Europe/Athens",
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(new Date(athensStartOfDayUtcIso(ymd)));
    return { ymd, title, items: byDay.get(ymd) ?? [] };
  });

  if (items.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν συνεδρίες"
        description="Δεν βρέθηκαν συνεδρίες για αυτή την εβδομάδα με τα τρέχοντα φίλτρα. Δοκιμάστε άλλη εβδομάδα ή αλλάξτε τα φίλτρα."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <ScheduleSummaryCard label="Συνεδρίες εβδομάδας" value={items.length} helper="Σύνολο με τα τρέχοντα φίλτρα" />
        <ScheduleSummaryCard
          label="Ολοκληρωμένες"
          value={items.filter((item) => item.status === "completed").length}
          helper="Βάση για σημειώσεις και παρουσίες"
        />
        <ScheduleSummaryCard
          label="Προς αναπλήρωση"
          value={items.filter((item) => item.status === "to_reschedule" || item.status === "absence").length}
          helper="Χρειάζονται επιχειρησιακή παρακολούθηση"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
      {columns.map((col, idx) => (
        <div
          key={col.ymd}
          className={[
            "min-h-[128px] rounded-xl border border-border/80 p-2 shadow-sm",
            scheduleDayColumnClass(idx),
          ].join(" ")}
        >
          <div className="mb-2 rounded-lg border border-border/60 bg-white/90 px-1.5 py-2 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase leading-tight tracking-wide text-clinical-900">{col.title}</p>
            <p className="mt-0.5 text-[10px] font-medium text-ink-muted">
              {col.items.length === 0 ? "Κενό" : `${col.items.length} συνεδρίες`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {col.items.length === 0 ? (
              <p className="px-1 text-center text-xs text-ink-faint">—</p>
            ) : (
              col.items.map((s) => <SessionCard key={s.id} s={s} />)
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

export function ScheduleDayPanel({ items, dayYmd }: { items: SessionListItem[]; dayYmd: string }) {
  const dayItems = items
    .filter((s) => formatYmdAthensFromUtcMs(new Date(s.starts_at).getTime()) === dayYmd)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  if (dayItems.length === 0) {
    return (
      <EmptyState
        title="Καμία συνεδρία αυτή την ημέρα"
        description="Δεν υπάρχουν προγραμματισμένες συνεδρίες για την επιλεγμένη ημερομηνία με τα τρέχοντα φίλτρα."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <ScheduleSummaryCard label="Συνεδρίες ημέρας" value={dayItems.length} helper="Σημερινή επιχειρησιακή ροή" />
        <ScheduleSummaryCard
          label="Θεραπευτές"
          value={new Set(dayItems.map((item) => item.therapist_user_id)).size}
          helper="Ενεργοί στη συγκεκριμένη ημέρα"
        />
        <ScheduleSummaryCard
          label="Αίθουσες"
          value={new Set(dayItems.map((item) => item.room_id).filter(Boolean)).size}
          helper="Χώροι με χρήση"
        />
      </div>
      <div className="flex max-w-3xl flex-col gap-2">
      {dayItems.map((s) => (
        <SessionCard key={s.id} s={s} />
      ))}
      </div>
    </div>
  );
}

export function ScheduleListPanel({ items }: { items: SessionListItem[] }) {
  const sorted = [...items].sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="Κενή λίστα"
        description="Δεν βρέθηκαν συνεδρίες στο επιλεγμένο διάστημα. Αλλάξτε εβδομάδα ή φίλτρα."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Ημερομηνία</th>
            <th className="px-4 py-3">Ώρα</th>
            <th className="px-4 py-3">Παιδί</th>
            <th className="px-4 py-3">Θεραπευτής</th>
            <th className="px-4 py-3">Κέντρο</th>
            <th className="px-4 py-3">Αίθουσα</th>
            <th className="px-4 py-3">Ειδικότητα</th>
            <th className="px-4 py-3">Τύπος</th>
            <th className="px-4 py-3">Κατάσταση</th>
            <th className="sticky right-0 z-20 bg-surface-muted/95 px-4 py-3 text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">Ενέργειες</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((s) => (
            <tr key={s.id} className="hover:bg-surface-muted/40">
              <td
                className={[
                  "whitespace-nowrap px-4 py-2 pl-3 text-ink",
                  sessionStatusStripeClass(s.status),
                ].join(" ")}
              >
                {new Intl.DateTimeFormat("el-GR", {
                  timeZone: "Europe/Athens",
                  dateStyle: "medium",
                }).format(new Date(s.starts_at))}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-ink-muted">
                {formatAthensTimeEl(s.starts_at)} — {formatAthensTimeEl(s.ends_at)}
              </td>
              <td className="px-4 py-2">
                <Link href={`/children/${s.child_id}`} className="font-medium text-clinical-700 hover:underline">
                  {s.child_name}
                </Link>
              </td>
              <td className="px-4 py-2 text-ink-muted">{s.therapist_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{s.center_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{s.room_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{s.discipline_name_el ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{sessionKindLabelEl(s.session_kind)}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusPillClass(s.status)}`}>
                  {sessionStatusLabelEl(s.status)}
                </span>
              </td>
              <td className="sticky right-0 z-10 whitespace-nowrap bg-surface-card px-4 py-2 text-right text-xs shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                <Link href={`/schedule/${s.id}`} className="font-medium text-clinical-700 hover:underline">
                  Συνεδρία
                </Link>
                <span className="text-ink-faint"> · </span>
                <Link href={`/attendance/${s.id}/edit`} className="text-clinical-700 hover:underline">
                  Παρουσία
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleSummaryCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{helper}</p>
    </div>
  );
}
