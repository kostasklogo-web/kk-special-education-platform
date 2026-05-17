"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LOCATION_FILTER_OPTIONS,
  type LocationFilter,
} from "@/lib/secretary/schedule-catalog";
import type { ScheduleFilterState, ScheduleViewMode } from "@/lib/secretary/schedule-utils";
import { formatMonthTitleEl, shiftAnchorYmd } from "@/lib/secretary/schedule-utils";
import { formatAthensLongDateFromYmd, getSafeAthensYmd, todayAthensYmd } from "@/lib/schedule/athens-civil";
import type { ScheduleSelectOption } from "@/lib/secretary/schedule-catalog";

const selectCls =
  "min-h-[44px] w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-ink focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

type Props = {
  filters: ScheduleFilterState;
  onChange: (patch: Partial<ScheduleFilterState>) => void;
  therapists: ScheduleSelectOption[];
  rooms: ScheduleSelectOption[];
  children: ScheduleSelectOption[];
  appointmentTypes: { code: string; nameEl: string }[];
};

function dateHeading(filters: ScheduleFilterState): string {
  const ymd = getSafeAthensYmd(filters.dateYmd);
  if (filters.view === "month") return formatMonthTitleEl(ymd);
  return formatAthensLongDateFromYmd(ymd);
}

export function ScheduleFilterBar({
  filters,
  onChange,
  therapists,
  rooms,
  children,
  appointmentTypes,
}: Props) {
  const anchorYmd = getSafeAthensYmd(filters.dateYmd);

  const shift = (delta: number) => {
    onChange({ dateYmd: shiftAnchorYmd(anchorYmd, filters.view, delta) });
  };

  return (
    <div className="sticky top-0 z-20 space-y-3 rounded-xl border border-border bg-surface-card/95 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border bg-surface-muted p-0.5" role="group" aria-label="Προβολή">
          {(["day", "week", "month"] as ScheduleViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ view: v })}
              className={`min-h-[44px] flex-1 rounded-md px-3 text-sm font-semibold sm:flex-none sm:px-4 ${
                filters.view === v ? "bg-white text-clinical-800 shadow-sm" : "text-ink-muted"
              }`}
            >
              {v === "day" ? "Ημέρα" : v === "week" ? "Εβδομάδα" : "Μήνας"}
            </button>
          ))}
        </div>

        <div className="flex min-h-[44px] flex-1 items-center gap-1 rounded-lg border border-border bg-white px-1 sm:flex-none">
          <button
            type="button"
            aria-label="Προηγούμενο"
            onClick={() => shift(-1)}
            className="rounded-md p-2 hover:bg-surface-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ dateYmd: todayAthensYmd() })}
            className="flex-1 px-2 text-center text-sm font-semibold text-ink sm:min-w-[200px]"
          >
            {dateHeading(filters)}
          </button>
          <button
            type="button"
            aria-label="Επόμενο"
            onClick={() => shift(1)}
            className="rounded-md p-2 hover:bg-surface-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1" role="group" aria-label="Τοποθεσία">
        {LOCATION_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ location: opt.value as LocationFilter })}
            className={`min-h-[44px] flex-1 rounded-lg border px-3 text-sm font-bold sm:flex-none sm:px-5 ${
              filters.location === opt.value
                ? "border-clinical-600 bg-clinical-600 text-white"
                : "border-border bg-white text-ink hover:bg-surface-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-[11px] font-semibold uppercase text-ink-muted">
          Θεραπευτής
          <select
            className={`${selectCls} mt-1`}
            value={filters.therapistId}
            onChange={(e) => onChange({ therapistId: e.target.value })}
          >
            <option value="">Όλοι</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-semibold uppercase text-ink-muted">
          Αίθουσα
          <select className={`${selectCls} mt-1`} value={filters.roomId} onChange={(e) => onChange({ roomId: e.target.value })}>
            <option value="">Όλες</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-semibold uppercase text-ink-muted">
          Παιδί
          <select className={`${selectCls} mt-1`} value={filters.childId} onChange={(e) => onChange({ childId: e.target.value })}>
            <option value="">Όλα</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-semibold uppercase text-ink-muted">
          Τύπος ραντεβού
          <select className={`${selectCls} mt-1`} value={filters.typeCode} onChange={(e) => onChange({ typeCode: e.target.value })}>
            <option value="">Όλοι</option>
            {appointmentTypes.map((t) => (
              <option key={t.code} value={t.code}>
                {t.nameEl}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
