"use client";

import type { AppointmentInsight } from "@/lib/secretary/appointment-insights";
import type { SecretaryAppointment } from "@/lib/secretary/types";
import {
  SCHEDULE_SLOT_MINUTES,
  SCHEDULE_WINDOW_MINUTES,
  appointmentDurationMinutes,
  minutesFromWindowStart,
  sortAppointmentsByStart,
  timeSlotLabels,
} from "@/lib/secretary/schedule-utils";
import { AppointmentCard } from "./AppointmentCard";

type Props = {
  appointments: SecretaryAppointment[];
  insights: Map<string, AppointmentInsight>;
  onSelect: (a: SecretaryAppointment) => void;
};

export function ScheduleDayView({ appointments, insights, onSelect }: Props) {
  const sorted = [...appointments].sort(sortAppointmentsByStart);
  const slots = timeSlotLabels();
  const rowH = 28;
  const totalH = (SCHEDULE_WINDOW_MINUTES / SCHEDULE_SLOT_MINUTES) * rowH;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <div className="flex min-w-[280px]" style={{ minHeight: totalH + 32 }}>
          <div className="w-14 shrink-0 border-r border-border bg-surface-muted/50 pt-8">
            {slots.map((label) => (
              <div
                key={label}
                className="border-b border-border/50 pr-1 text-right text-[10px] font-medium text-ink-muted"
                style={{ height: rowH }}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="relative flex-1">
            {slots.map((label) => (
              <div
                key={label}
                className="absolute left-0 right-0 border-b border-dashed border-border/40"
                style={{ top: 32 + slots.indexOf(label) * rowH, height: rowH }}
              />
            ))}
            {sorted.map((a) => {
              const topMin = minutesFromWindowStart(a.startsAt);
              const dur = appointmentDurationMinutes(a);
              const top = 32 + (topMin / SCHEDULE_SLOT_MINUTES) * rowH;
              const h = Math.max(rowH, (dur / SCHEDULE_SLOT_MINUTES) * rowH);
              const insight = insights.get(a.id)!;
              return (
                <div
                  key={a.id}
                  className="absolute left-1 right-1 z-10"
                  style={{ top, height: h }}
                >
                  <AppointmentCard
                    appointment={a}
                    insight={insight}
                    onClick={() => onSelect(a)}
                    compact={h < rowH * 1.5}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
        <h3 className="text-sm font-semibold text-ink">Λίστα ημέρας ({sorted.length})</h3>
        {sorted.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-ink-muted">
            Δεν υπάρχουν ραντεβού με τα τρέχοντα φίλτρα.
          </p>
        ) : (
          sorted.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              insight={insights.get(a.id)!}
              onClick={() => onSelect(a)}
            />
          ))
        )}
      </aside>
    </div>
  );
}


