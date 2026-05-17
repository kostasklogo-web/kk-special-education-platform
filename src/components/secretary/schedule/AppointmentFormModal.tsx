"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import type {
  AppointmentReminderStatus,
  SecretaryAppointment,
  SecretaryAppointmentStatus,
} from "@/lib/secretary/types";
import type { AppointmentLocationCode } from "@/lib/secretary/types";
import {
  SECRETARY_DEMO_CHILDREN,
  SECRETARY_DEMO_ROOMS,
  SECRETARY_DEMO_THERAPISTS,
  SECRETARY_SCHEDULE_APPOINTMENT_TYPES,
  parentLabelForChild,
  type ScheduleRoomOption,
  type SecretaryScheduleTypeCode,
} from "@/lib/secretary/schedule-catalog";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildAppointmentReminderPayload } from "@/components/secretary/reminders/communication-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { conflictsForDraft } from "@/lib/secretary/conflicts";
import { APPOINTMENT_STATUS_LABELS, LOCATION_LABELS, REMINDER_STATUS_LABELS } from "@/lib/secretary/labels";
import { athensCivilToUtcIso, addMinutesToIso, athensHourMinute } from "@/lib/secretary/schedule-utils";
import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";
import type { IntakeSchedulePrefill } from "@/lib/secretary/intake/schedule-prefill";
import { AppointmentPaymentWarning } from "./AppointmentPaymentWarning";
import { AppointmentDiagnosisWarning } from "./AppointmentDiagnosisWarning";
import { ChildDiagnosisBadge } from "@/components/secretary/diagnoses/ChildDiagnosisBadge";
import { AppointmentTaskWarning } from "./AppointmentTaskWarning";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { CreateMeetingButton } from "@/components/secretary/meetings/CreateMeetingButton";
import { prefillMeetingFromAppointment } from "@/lib/secretary/meetings/meeting-prefill";

const field =
  "mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-3 text-base text-ink focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

type FormState = {
  dateYmd: string;
  startTime: string;
  durationMin: number;
  typeCode: string;
  locationCode: AppointmentLocationCode;
  roomId: string;
  staffId: string;
  childId: string;
  status: SecretaryAppointmentStatus;
  reminderStatus: AppointmentReminderStatus;
  notes: string;
};

function defaultForm(
  dateYmd: string,
  existing?: SecretaryAppointment | null,
  presetType?: SecretaryScheduleTypeCode,
  intakePrefill?: IntakeSchedulePrefill | null
): FormState {
  if (existing) {
    const { hour, minute } = athensHourMinute(existing.startsAt);
    return {
      dateYmd: dateYmd,
      startTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      durationMin: Math.round((Date.parse(existing.endsAt) - Date.parse(existing.startsAt)) / 60000),
      typeCode: existing.appointmentTypeCode,
      locationCode: existing.locationCode,
      roomId: existing.roomId ?? "",
      staffId: existing.staffIds[0] ?? "",
      childId: existing.childId ?? "",
      status: existing.status,
      reminderStatus: existing.reminderStatus,
      notes: existing.notes,
    };
  }
  const type = intakePrefill?.typeCode ?? presetType ?? "parent_info";
  const t = SECRETARY_SCHEDULE_APPOINTMENT_TYPES.find((x) => x.code === type);
  return {
    dateYmd,
    startTime: "15:00",
    durationMin: t?.defaultDurationMin ?? 45,
    typeCode: type,
    locationCode: "nikaia",
    roomId: "",
    staffId: "",
    childId: intakePrefill?.childId ?? "",
    status: "scheduled",
    reminderStatus: "pending",
    notes: "",
  };
}

function formToAppointment(
  form: FormState,
  id: string,
  organizationId: string,
  existing?: SecretaryAppointment | null,
  intakePrefill?: IntakeSchedulePrefill | null
): SecretaryAppointment {
  const type = SECRETARY_SCHEDULE_APPOINTMENT_TYPES.find((t) => t.code === form.typeCode);
  const [hh, mm] = form.startTime.split(":").map(Number);
  const startsAt = athensCivilToUtcIso(form.dateYmd, hh, mm);
  const endsAt = addMinutesToIso(startsAt, form.durationMin);
  const child = SECRETARY_DEMO_CHILDREN.find((c) => c.id === form.childId);
  const room = SECRETARY_DEMO_ROOMS.find((r) => r.id === form.roomId);
  const staff = SECRETARY_DEMO_THERAPISTS.find((s) => s.id === form.staffId);

  const childLabel =
    intakePrefill && form.childId === intakePrefill.childId
      ? intakePrefill.childLabel
      : (child?.label ?? null);
  const parentLabel =
    intakePrefill && form.childId === intakePrefill.childId
      ? intakePrefill.parentLabel
      : parentLabelForChild(form.childId || null);

  return {
    id,
    organizationId: existing?.organizationId ?? organizationId,
    childId: form.childId || null,
    childLabel,
    parentId: existing?.parentId ?? null,
    parentLabel,
    appointmentTypeCode: form.typeCode,
    appointmentTypeLabel: type?.nameEl ?? form.typeCode,
    locationCode: form.locationCode,
    startsAt,
    endsAt,
    status: form.status,
    priority: existing?.priority ?? "normal",
    roomId: form.roomId || null,
    roomLabel: room?.label ?? null,
    staffIds: form.staffId ? [form.staffId] : [],
    staffLabels: staff ? [staff.label] : [],
    notes: form.notes,
    reminderAt: existing?.reminderAt ?? null,
    reminderStatus: form.reminderStatus,
    sessionId: existing?.sessionId ?? null,
  };
}

type Props = {
  open: boolean;
  dateYmd: string;
  organizationId: string;
  existing: SecretaryAppointment | null;
  presetType?: SecretaryScheduleTypeCode;
  intakePrefill?: IntakeSchedulePrefill | null;
  allAppointments: SecretaryAppointment[];
  onClose: () => void;
  onSave: (a: SecretaryAppointment) => void;
  onDelete?: (id: string) => void;
};

export function AppointmentFormModal({
  open,
  dateYmd,
  organizationId,
  existing,
  presetType,
  intakePrefill,
  allAppointments,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { consents } = useReminders();
  const fromIntake = !!intakePrefill && !existing;
  const [form, setForm] = useState<FormState>(() =>
    defaultForm(dateYmd, existing, presetType, intakePrefill)
  );

  useEffect(() => {
    if (open) setForm(defaultForm(dateYmd, existing, presetType, intakePrefill));
  }, [open, dateYmd, existing, presetType, intakePrefill]);

  const draft = useMemo(
    () =>
      formToAppointment(
        form,
        existing?.id ?? `sa-new-${Date.now()}`,
        organizationId,
        existing,
        intakePrefill
      ),
    [form, existing, organizationId, intakePrefill]
  );

  const previewConflicts = useMemo(
    () => (open ? conflictsForDraft(draft, allAppointments) : []),
    [open, draft, allAppointments]
  );

  const endTimeLabel = useMemo(() => formatAthensTimeEl(draft.endsAt), [draft.endsAt]);

  const roomsForLocation = SECRETARY_DEMO_ROOMS.filter(
    (r: ScheduleRoomOption) =>
      form.locationCode === "online" || form.locationCode === "phone" || r.locationCode === form.locationCode
  );

  if (!open) return null;

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const onTypeChange = (code: string) => {
    const t = SECRETARY_SCHEDULE_APPOINTMENT_TYPES.find((x) => x.code === code);
    patch({ typeCode: code, durationMin: t?.defaultDurationMin ?? 45 });
  };

  const redConflicts = previewConflicts.filter((c) => c.alertLevel === "red");
  const yellowConflicts = previewConflicts.filter((c) => c.alertLevel === "yellow");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appt-modal-title"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="appt-modal-title" className="text-lg font-bold text-ink">
            {existing
              ? "Επεξεργασία ραντεβού"
              : fromIntake
                ? "Προγραμματισμός από νέο περιστατικό"
                : "Νέο ραντεβού"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-muted" aria-label="Κλείσιμο">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form
          className="flex-1 space-y-3 overflow-y-auto p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (redConflicts.length > 0) return;
            onSave(draft);
            onClose();
          }}
        >
          {redConflicts.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              {redConflicts.map((c) => (
                <li key={c.id}>⚠ {c.message}</li>
              ))}
            </ul>
          ) : null}
          {yellowConflicts.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              {yellowConflicts.map((c) => (
                <li key={c.id}>⚠ {c.message}</li>
              ))}
            </ul>
          ) : null}

          {form.childId ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <ChildDiagnosisBadge childId={form.childId} />
              </div>
              <AppointmentDiagnosisWarning childId={form.childId} />
            </>
          ) : null}
          {form.childId && !existing ? <AppointmentPaymentWarning childId={form.childId} /> : null}
          {existing ? (
            <>
              <AppointmentTaskWarning appointmentId={existing.id} childId={existing.childId} />
              <EntityLinkedTasksBadge link={{ kind: "appointment", appointmentId: existing.id }} />
              <NewCommunicationLink
                params={{
                  appointment: existing.id,
                  childId: existing.childId,
                  childLabel: existing.childLabel,
                }}
              />
            </>
          ) : null}

          {fromIntake && intakePrefill ? (
            <div className="rounded-lg border border-clinical-200 bg-clinical-50/80 p-3 text-sm">
              <p className="font-bold text-ink">{intakePrefill.childLabel}</p>
              <p className="text-ink-muted">
                Γονέας: <span className="font-semibold text-ink">{intakePrefill.parentLabel}</span>
                {intakePrefill.parentPhone ? (
                  <>
                    {" "}
                    · <span className="text-ink">{intakePrefill.parentPhone}</span>
                  </>
                ) : null}
              </p>
            </div>
          ) : null}

          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Τύπος ραντεβού *
            <select className={field} value={form.typeCode} onChange={(e) => onTypeChange(e.target.value)} required>
              {SECRETARY_SCHEDULE_APPOINTMENT_TYPES.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.nameEl}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Ημερομηνία *
              <input type="date" className={field} value={form.dateYmd} onChange={(e) => patch({ dateYmd: e.target.value })} required />
            </label>
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Ώρα έναρξης *
              <input type="time" className={field} value={form.startTime} onChange={(e) => patch({ startTime: e.target.value })} required />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Διάρκεια (λεπτά)
              <input
                type="number"
                min={15}
                step={15}
                className={field}
                value={form.durationMin}
                onChange={(e) => patch({ durationMin: Number(e.target.value) })}
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Ώρα λήξης
              <input type="text" className={`${field} bg-surface-muted/50`} value={endTimeLabel} readOnly tabIndex={-1} />
            </label>
          </div>

          {!fromIntake ? (
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Τοποθεσία
              <select
                className={field}
                value={form.locationCode}
                onChange={(e) => patch({ locationCode: e.target.value as AppointmentLocationCode, roomId: "" })}
              >
                {(Object.keys(LOCATION_LABELS) as AppointmentLocationCode[]).map((code) => (
                  <option key={code} value={code}>
                    {LOCATION_LABELS[code]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {!fromIntake ? (
            <>
              <label className="block text-xs font-semibold uppercase text-ink-muted">
                Παιδί
                <select
                  className={field}
                  value={form.childId}
                  onChange={(e) => patch({ childId: e.target.value })}
                >
                  <option value="">—</option>
                  {SECRETARY_DEMO_CHILDREN.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              {form.childId ? (
                <p className="rounded-lg bg-surface-muted/50 px-3 py-2 text-sm text-ink-muted">
                  Γονέας: <strong className="text-ink">{parentLabelForChild(form.childId) ?? "—"}</strong>
                </p>
              ) : null}
            </>
          ) : null}

          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Θεραπευτής / προσωπικό
            <select className={field} value={form.staffId} onChange={(e) => patch({ staffId: e.target.value })}>
              <option value="">—</option>
              {SECRETARY_DEMO_THERAPISTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Αίθουσα
            <select
              className={field}
              value={form.roomId}
              onChange={(e) => {
                const room = SECRETARY_DEMO_ROOMS.find((r) => r.id === e.target.value);
                patch({
                  roomId: e.target.value,
                  ...(fromIntake && room ? { locationCode: room.locationCode } : {}),
                });
              }}
            >
              <option value="">—</option>
              {(fromIntake ? SECRETARY_DEMO_ROOMS : roomsForLocation).map((r) => (
                <option key={r.id} value={r.id}>
                  {fromIntake ? `${r.label} (${LOCATION_LABELS[r.locationCode]})` : r.label}
                </option>
              ))}
            </select>
          </label>

          {!fromIntake ? (
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Κατάσταση
              <select
                className={field}
                value={form.status}
                onChange={(e) => patch({ status: e.target.value as SecretaryAppointmentStatus })}
              >
                {(Object.keys(APPOINTMENT_STATUS_LABELS) as SecretaryAppointmentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {APPOINTMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            {form.status === "no_show" ? (
              <p className="col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                Με αποθήκευση «Μη προσέλευση» δημιουργείται αυτόματα εργασία follow-up επικοινωνίας με τον γονέα.
              </p>
            ) : null}
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Υπενθύμιση
              <select
                className={field}
                value={form.reminderStatus}
                onChange={(e) => patch({ reminderStatus: e.target.value as AppointmentReminderStatus })}
              >
                {(Object.keys(REMINDER_STATUS_LABELS) as AppointmentReminderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {REMINDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          ) : null}

          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Σημειώσεις
            <textarea className={field} rows={2} value={form.notes} onChange={(e) => patch({ notes: e.target.value })} />
          </label>
        </form>

        <footer className="space-y-2 border-t border-border p-4">
          {existing && draft.childId ? (
            <CreateReminderButton
              payload={buildAppointmentReminderPayload(draft, consents)}
              className="w-full"
              size="sm"
            />
          ) : null}
          {draft.childId || draft.staffLabels.length > 0 ? (
            <CreateMeetingButton
              prefill={prefillMeetingFromAppointment(draft)}
              className="w-full"
              size="sm"
              label="Συνάντηση από ραντεβού"
            />
          ) : null}
          <div className="flex gap-2">
            {existing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Διαγραφή ραντεβού;")) {
                    onDelete(existing.id);
                    onClose();
                  }
                }}
                className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 text-sm font-semibold text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] flex-1 rounded-lg border border-border text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              Ακύρωση
            </button>
            <button
              type="button"
              disabled={redConflicts.length > 0}
              onClick={() => {
                onSave(draft);
                onClose();
              }}
              className="min-h-[48px] flex-[2] rounded-lg bg-clinical-600 text-sm font-bold text-white hover:bg-clinical-700 disabled:opacity-50"
            >
              Αποθήκευση
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
