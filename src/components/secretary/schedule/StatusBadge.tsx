import type { SecretaryAppointmentStatus } from "@/lib/secretary/types";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/secretary/labels";

const STYLES: Record<SecretaryAppointmentStatus, string> = {
  scheduled: "bg-slate-100 text-slate-800 border-slate-200",
  confirmed: "bg-emerald-50 text-emerald-900 border-emerald-200",
  completed: "bg-zinc-100 text-zinc-600 border-zinc-200",
  cancelled: "bg-zinc-50 text-zinc-400 border-zinc-200 line-through",
  no_show: "bg-amber-50 text-amber-950 border-amber-200",
  rescheduled: "bg-blue-50 text-blue-900 border-blue-200",
  pending_followup: "bg-violet-50 text-violet-900 border-violet-200",
};

export function StatusBadge({ status }: { status: SecretaryAppointmentStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${STYLES[status]}`}
    >
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}


