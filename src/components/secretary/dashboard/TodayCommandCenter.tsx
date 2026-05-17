"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, PartyPopper, Sparkles } from "lucide-react";
import { formatAthensLongDateFromYmd } from "@/lib/schedule/athens-civil";
import type { ScheduleConflict } from "@/lib/secretary/types";
import type { DashboardActionRow } from "@/lib/secretary/dashboard/master-model";
import {
  BUCKET_ORDER,
  buildCommandCenterQueue,
  URGENCY_BUCKET_META,
  type UrgencyBucket,
} from "@/lib/secretary/dashboard/today-command-center";
import {
  clearCompletedToday,
  loadCompletedTodayIds,
  markAllCompletedToday,
  toggleCompletedToday,
} from "@/lib/secretary/dashboard/complete-today-store";
import { CommandCenterItemCard } from "./CommandCenterItem";

type Props = {
  todayYmd: string;
  actionRows: DashboardActionRow[];
  conflicts: ScheduleConflict[];
  searchQ: string;
};

export function TodayCommandCenter({ todayYmd, actionRows, conflicts, searchQ }: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() =>
    loadCompletedTodayIds(todayYmd)
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [collapsedBuckets, setCollapsedBuckets] = useState<Partial<Record<UrgencyBucket, boolean>>>(
    { waiting: true, this_week: true }
  );
  const [dayClosed, setDayClosed] = useState(false);

  const { grouped, all } = useMemo(
    () => buildCommandCenterQueue(actionRows, todayYmd, conflicts),
    [actionRows, todayYmd, conflicts]
  );

  const q = searchQ.trim().toLowerCase();

  const filterItem = useCallback(
    (id: string, searchText: string) => {
      if (q && !searchText.includes(q)) return false;
      return true;
    },
    [q]
  );

  const visibleAll = all.filter((item) => filterItem(item.id, item.searchText));
  const doneCount = visibleAll.filter((i) => completedIds.has(i.id)).length;
  const pendingCount = visibleAll.length - doneCount;
  const totalCount = visibleAll.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 100;

  const handleToggle = (id: string) => {
    setCompletedIds(toggleCompletedToday(todayYmd, id));
    setDayClosed(false);
  };

  const handleCompleteDay = () => {
    const pending = visibleAll.filter((i) => !completedIds.has(i.id)).map((i) => i.id);
    setCompletedIds(markAllCompletedToday(todayYmd, pending));
    setDayClosed(true);
  };

  const allDone = totalCount > 0 && pendingCount === 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-clinical-200 bg-gradient-to-b from-clinical-50/80 to-white shadow-md">
      <header className="border-b border-clinical-100 px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-clinical-700">
          Κέντρο ελέγχου ημέρας
        </p>
        <h2 className="mt-1 text-xl font-bold text-ink sm:text-2xl">Τι χρειάζεται να γίνει σήμερα</h2>
        <p className="mt-1 text-sm text-ink-muted">{formatAthensLongDateFromYmd(todayYmd)}</p>

        <div className="mt-4 rounded-xl bg-white/90 p-4 shadow-sm">
          <CompleteTodayProgress doneCount={doneCount} totalCount={totalCount} progressPct={progressPct} />
          <div className="mt-3 flex flex-wrap gap-2">
            {!allDone && totalCount > 0 ? (
              <button
                type="button"
                onClick={handleCompleteDay}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-clinical-600 px-4 text-sm font-bold text-white hover:bg-clinical-700"
              >
                <Sparkles className="h-4 w-4" />
                Ολοκλήρωση ημέρας
              </button>
            ) : null}
            {doneCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowCompleted((v) => !v)}
                className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border px-3 text-sm font-semibold hover:bg-surface-muted"
              >
                {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showCompleted ? "Απόκρυψη ολοκληρωμένων" : `Ολοκληρωμένα (${doneCount})`}
              </button>
            ) : null}
            {doneCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  clearCompletedToday(todayYmd);
                  setCompletedIds(new Set());
                  setDayClosed(false);
                }}
                className="text-sm font-medium text-ink-muted underline hover:text-ink"
              >
                Επαναφορά λίστας
              </button>
            ) : null}
          </div>
        </div>

        {allDone || dayClosed ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <PartyPopper className="h-5 w-5 shrink-0" />
            <span>
              <strong>Μπράβο!</strong> Ολοκληρώσατε όλα τα σημερινά θέματα.
            </span>
          </div>
        ) : null}
      </header>

      <div className="space-y-6 px-4 py-5 sm:px-6">
        {totalCount === 0 ? (
          <EmptyTodayState hasSearch={!!q} />
        ) : (
          BUCKET_ORDER.map((bucket) => {
            const items = grouped[bucket].filter((item) => {
              if (!filterItem(item.id, item.searchText)) return false;
              if (!showCompleted && completedIds.has(item.id)) return false;
              return true;
            });

            const meta = URGENCY_BUCKET_META[bucket];
            const isCollapsed = collapsedBuckets[bucket] ?? false;

            if (items.length === 0 && bucket !== "urgent_now" && bucket !== "today") {
              return null;
            }

            return (
              <div key={bucket}>
                <button
                  type="button"
                  className="mb-3 flex w-full items-center justify-between gap-2 text-left"
                  onClick={() =>
                    setCollapsedBuckets((prev) => ({ ...prev, [bucket]: !isCollapsed }))
                  }
                >
                  <div>
                    <h3 className="text-base font-bold text-ink">{meta.title}</h3>
                    <p className="text-xs text-ink-muted">{meta.description}</p>
                  </div>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold tabular-nums shadow-sm">
                      {items.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4 text-ink-muted" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-ink-muted" />
                    )}
                  </span>
                </button>

                {!isCollapsed ? (
                  items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border bg-white/50 px-3 py-4 text-center text-xs text-ink-muted">
                      {meta.emptyHint}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item.id}>
                          <CommandCenterItemCard
                            item={item}
                            completed={completedIds.has(item.id)}
                            onToggleComplete={() => handleToggle(item.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function CompleteTodayProgress({
  doneCount,
  totalCount,
  progressPct,
}: {
  doneCount: number;
  totalCount: number;
  progressPct: number;
}) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">Ολοκλήρωση σήμερα</span>
        <span className="tabular-nums text-ink-muted">
          {doneCount} / {totalCount}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-clinical-600 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </>
  );
}

function EmptyTodayState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-10 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
      <p className="mt-3 text-base font-bold text-ink">
        {hasSearch ? "Δεν βρέθηκαν θέματα" : "Η λίστα είναι καθαρή!"}
      </p>
      <p className="mt-2 text-sm text-ink-muted">
        {hasSearch
          ? "Δοκιμάστε άλλη αναζήτηση ή αφαιρέστε τα φίλτρα."
          : "Δεν υπάρχουν εκκρεμότητες. Ελέγξτε το πρόγραμμα ή προσθέστε νέο ραντεβού."}
      </p>
    </div>
  );
}

