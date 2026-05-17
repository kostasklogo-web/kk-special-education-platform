"use client";

import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";
import { LOCATION_LABELS, REMINDER_STATUS_LABELS } from "@/lib/secretary/labels";
import type { AppointmentInsight } from "@/lib/secretary/appointment-insights";
import type { SecretaryAppointment } from "@/lib/secretary/types";
import { AppointmentWarningBadges } from "./AppointmentWarningBadges";
import { StatusBadge } from "./StatusBadge";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { buildAppointmentReminderPayload } from "@/components/secretary/reminders/communication-builders";

type Props = {
  appointment: SecretaryAppointment;
  insight: AppointmentInsight;
  onClick?: () => void;
  compact?: boolean;
  showReminder?: boolean;
};

export function AppointmentCard({ appointment: a, insight, onClick, compact, showReminder = true }: Props) {
  const { consents } = useReminders();
  const border = insight.hasConflict
    ? "border-red-400 ring-1 ring-red-200"
    : insight.hasWarning
      ? "border-amber-400 ring-1 ring-amber-100"
      : "border-border";

  const reminderPayload = buildAppointmentReminderPayload(a, consents);
  const reminderLabel = REMINDER_STATUS_LABELS[a.reminderStatus];

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm ${border} ${compact ? "p-2" : "p-2.5"}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-md text-left focus:outline-none focus:ring-2 focus:ring-clinical-500"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold tabular-nums text-clinical-800">
            {formatAthensTimeEl(a.startsAt)}
            {!compact ? (
              <span className="font-normal text-ink-muted"> – {formatAthensTimeEl(a.endsAt)}</span>
            ) : null}
          </span>
          <StatusBadge status={a.status} />
        </div>
        <p className={`mt-1 font-semibold text-ink ${compact ? "text-sm" : "text-base"}`}>
          {a.childLabel ?? "— χωρίς παιδί —"}
        </p>
        {!compact && a.parentLabel ? (
          <p className="text-[11px] text-ink-muted">Γονέας: {a.parentLabel}</p>
        ) : null}
        <p className="text-xs text-ink-muted">{a.appointmentTypeLabel}</p>
        {!compact ? (
          <p className="mt-0.5 text-[11px] text-ink-faint">
            {LOCATION_LABELS[a.locationCode]}
            {a.roomLabel ? ` · ${a.roomLabel}` : ""}
            {a.staffLabels[0] ? ` · ${a.staffLabels[0]}` : ""}
            {a.reminderStatus !== "none" ? ` · Υπενθ.: ${reminderLabel}` : ""}
          </p>
        ) : null}
        <div className="mt-1.5">
          <AppointmentWarningBadges
            conflicts={insight.conflicts}
            childWarnings={insight.childWarnings}
            compact={compact}
          />
        </div>
      </button>
      {showReminder && !compact && a.childId ? (
        <CreateReminderButton payload={reminderPayload} className="mt-2 w-full" size="sm" />
      ) : null}
    </div>
  );
}

