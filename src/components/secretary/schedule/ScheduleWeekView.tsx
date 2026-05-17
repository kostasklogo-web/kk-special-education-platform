"use client";

import type { AppointmentInsight } from "@/lib/secretary/appointment-insights";
import type { SecretaryAppointment } from "@/lib/secretary/types";
import {
  appointmentYmdAthens,
  formatWeekdayHeaderEl,
  isTodayAthens,
  sortAppointmentsByStart,
  weekDayYmds,
} from "@/lib/secretary/schedule-utils";
import { AppointmentCard } from "./AppointmentCard";

type Props = {
  anchorYmd: string;
  appointments: SecretaryAppointment[];
  insights: Map<string, AppointmentInsight>;
  onSelect: (a: SecretaryAppointment) => void;
};

export function ScheduleWeekView({ anchorYmd, appointments, insights, onSelect }: Props) {
  const days = weekDayYmds(anchorYmd);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((ymd) => {
        const dayAppts = appointments
          .filter((a) => appointmentYmdAthens(a) === ymd)
          .sort(sortAppointmentsByStart);
        const today = isTodayAthens(ymd);
        return (
          <section
            key={ymd}
            className={`flex min-h-[120px] flex-col rounded-xl border bg-white p-2 ${
              today ? "border-clinical-500 ring-2 ring-clinical-200" : "border-border"
            }`}
          >
            <header
              className={`mb-2 border-b border-border/60 pb-2 text-center text-xs font-bold uppercase ${
                today ? "text-clinical-800" : "text-ink-muted"
              }`}
            >
              {formatWeekdayHeaderEl(ymd)}
              <span className="ml-1 text-[10px] font-normal">({dayAppts.length})</span>
            </header>
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
              {dayAppts.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-ink-faint">—</p>
              ) : (
                dayAppts.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    insight={insights.get(a.id)!}
                    onClick={() => onSelect(a)}
                    compact
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

