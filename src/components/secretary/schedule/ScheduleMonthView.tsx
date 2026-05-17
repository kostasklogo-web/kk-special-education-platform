"use client";

import type { AppointmentInsight } from "@/lib/secretary/appointment-insights";
import type { SecretaryAppointment } from "@/lib/secretary/types";
import {
  appointmentYmdAthens,
  formatMonthTitleEl,
  isTodayAthens,
  monthCalendarCells,
  sortAppointmentsByStart,
} from "@/lib/secretary/schedule-utils";
import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";

const WEEKDAYS = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"] as const;

type Props = {
  anchorYmd: string;
  appointments: SecretaryAppointment[];
  insights: Map<string, AppointmentInsight>;
  onSelectDay: (ymd: string) => void;
  onSelect: (a: SecretaryAppointment) => void;
};

export function ScheduleMonthView({ anchorYmd, appointments, insights, onSelectDay, onSelect }: Props) {
  const cells = monthCalendarCells(anchorYmd);

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-semibold text-ink">{formatMonthTitleEl(anchorYmd)}</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-border bg-surface-muted/50 text-center text-[10px] font-bold uppercase text-ink-muted">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map(({ ymd, inMonth }) => {
              const dayAppts = appointments
                .filter((a) => appointmentYmdAthens(a) === ymd)
                .sort(sortAppointmentsByStart);
              const today = isTodayAthens(ymd);
              const hasRed = dayAppts.some((a) => insights.get(a.id)?.hasConflict);
              const hasYellow = dayAppts.some((a) => insights.get(a.id)?.hasWarning);

              return (
                <div
                  key={ymd}
                  className={`min-h-[88px] border-b border-r border-border/60 p-1 ${
                    inMonth ? "bg-white" : "bg-surface-muted/30"
                  } ${today ? "ring-1 ring-inset ring-clinical-400" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectDay(ymd)}
                    className={`mb-1 flex w-full items-center justify-between rounded px-1 text-left text-[11px] font-bold ${
                      inMonth ? "text-ink" : "text-ink-faint"
                    } ${today ? "text-clinical-800" : ""}`}
                  >
                    <span>{Number(ymd.slice(-2))}</span>
                    <span className="flex gap-0.5">
                      {hasRed ? <span className="h-2 w-2 rounded-full bg-red-500" title="Σύγκρουση" /> : null}
                      {hasYellow ? <span className="h-2 w-2 rounded-full bg-amber-400" title="Προειδοποίηση" /> : null}
                      {dayAppts.length > 0 ? (
                        <span className="rounded bg-clinical-100 px-1 text-[9px] text-clinical-800">{dayAppts.length}</span>
                      ) : null}
                    </span>
                  </button>
                  <ul className="space-y-0.5">
                    {dayAppts.slice(0, 3).map((a) => {
                      const insight = insights.get(a.id);
                      const dot =
                        insight?.hasConflict ? "bg-red-500" : insight?.hasWarning ? "bg-amber-400" : "bg-clinical-400";
                      return (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(a)}
                            className="flex w-full items-center gap-1 rounded px-0.5 text-left text-[10px] leading-tight hover:bg-clinical-50"
                          >
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                            <span className="truncate font-medium tabular-nums text-ink-muted">
                              {formatAthensTimeEl(a.startsAt)}
                            </span>
                            <span className="truncate text-ink">{a.childLabel ?? a.appointmentTypeLabel}</span>
                          </button>
                        </li>
                      );
                    })}
                    {dayAppts.length > 3 ? (
                      <li className="px-1 text-[9px] text-ink-faint">+{dayAppts.length - 3} ακόμα</li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
