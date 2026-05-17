"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { SecretaryMeeting } from "@/lib/secretary/types";
import {
  MEETING_TYPES,
  MEETING_PARTICIPANT_OPTIONS,
  MEETING_DEPARTMENT_OPTIONS,
  meetingTypeDef,
} from "@/lib/secretary/meetings/catalog";
import { defaultTitleForType } from "@/lib/secretary/meetings/calculations";
import { detectMeetingConflicts } from "@/lib/secretary/meetings/conflicts";
import { createMeetingDraft, upsertMeeting } from "@/lib/secretary/meetings/store";
import { autoLogMeetingScheduled } from "@/lib/secretary/meetings/meeting-auto-log";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import { useMeetings } from "./MeetingsChargeProvider";
import type { SecretaryAppointment } from "@/lib/secretary/types";

type Props = {
  onClose: () => void;
  onCreated: () => void;
  todayYmd: string;
  appointments: SecretaryAppointment[];
  prefill?: Partial<SecretaryMeeting>;
};

export function CreateMeetingModal({ onClose, onCreated, todayYmd, appointments, prefill }: Props) {
  const meetings = useMeetings();
  const [typeCode, setTypeCode] = useState(prefill?.meetingTypeCode ?? "individual_supervision");
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [location, setLocation] = useState(prefill?.locationCode ?? "nikaia");
  const [date, setDate] = useState(prefill?.meetingDate ?? todayYmd);
  const [startTime, setStartTime] = useState(prefill?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(prefill?.endTime ?? "11:00");
  const [organizer, setOrganizer] = useState(prefill?.organizerLabel ?? "Γραμματεία");
  const [participants, setParticipants] = useState<string[]>(prefill?.participants ?? ["Επόπτης Λογ."]);
  const [childLabel, setChildLabel] = useState(prefill?.childLabel ?? "");
  const [childId, setChildId] = useState(prefill?.childId ?? "");
  const [staff, setStaff] = useState(prefill?.staffMemberLabel ?? "");
  const [department, setDepartment] = useState(prefill?.departmentSpecialty ?? "");
  const [priority, setPriority] = useState(prefill?.priority ?? "normal");
  const [agenda, setAgenda] = useState(prefill?.agenda ?? "");
  const [followUp, setFollowUp] = useState(prefill?.followUpRequired ?? false);

  const def = meetingTypeDef(typeCode);
  const displayTitle = title.trim() || defaultTitleForType(typeCode, childLabel || null);

  const draft = useMemo(
    () =>
      createMeetingDraft(
        {
          title: displayTitle,
          meetingTypeCode: typeCode,
          locationCode: location,
          meetingDate: date,
          startTime,
          endTime,
          startsAt: `${date}T${startTime}:00.000Z`,
          endsAt: `${date}T${endTime}:00.000Z`,
          organizerLabel: organizer,
          participants,
          requiredParticipants: participants,
          childId: childId || null,
          childLabel: childLabel || null,
          staffMemberLabel: staff || null,
          departmentSpecialty: department || null,
          priority,
          agenda,
          followUpRequired: followUp,
          isClinical: def?.clinical ?? false,
          isEmergency: def?.emergency ?? false,
        },
        todayYmd
      ),
    [
      displayTitle,
      typeCode,
      location,
      date,
      startTime,
      endTime,
      organizer,
      participants,
      childId,
      childLabel,
      staff,
      department,
      priority,
      agenda,
      followUp,
      def,
      todayYmd,
      prefill,
    ]
  );

  const conflicts = useMemo(
    () => detectMeetingConflicts(draft, meetings, appointments),
    [draft, meetings, appointments]
  );

  const toggleParticipant = (p: string) => {
    setParticipants((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const save = () => {
    upsertMeeting(draft, todayYmd);
    autoLogMeetingScheduled(draft, todayYmd);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Νέα συνάντηση</h2>
          <button type="button" onClick={onClose} aria-label="Κλείσιμο">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Τύπος</span>
            <select
              className="mt-1 w-full rounded-lg border px-2 py-2"
              value={typeCode}
              onChange={(e) => setTypeCode(e.target.value as SecretaryMeeting["meetingTypeCode"])}
            >
              {MEETING_TYPES.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.labelEl}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Τίτλος</span>
            <input className="mt-1 w-full rounded-lg border px-2 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={displayTitle} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted">Ημερομηνία</span>
              <input type="date" className="mt-1 w-full rounded-lg border px-2 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted">Τοποθεσία</span>
              <select className="mt-1 w-full rounded-lg border px-2 py-2" value={location} onChange={(e) => setLocation(e.target.value as SecretaryMeeting["locationCode"])}>
                {Object.entries(LOCATION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted">Έναρξη</span>
              <input type="time" className="mt-1 w-full rounded-lg border px-2 py-2" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted">Λήξη</span>
              <input type="time" className="mt-1 w-full rounded-lg border px-2 py-2" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Συμμετέχοντες</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {MEETING_PARTICIPANT_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleParticipant(p)}
                  className={`rounded-full border px-2 py-0.5 text-xs ${participants.includes(p) ? "border-clinical-600 bg-clinical-50" : "border-border"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </label>
          <input className="w-full rounded-lg border px-2 py-2" placeholder="Παιδί (όνομα)" value={childLabel} onChange={(e) => setChildLabel(e.target.value)} />
          <input className="w-full rounded-lg border px-2 py-2" placeholder="Θεραπευτής / στελέχος" value={staff} onChange={(e) => setStaff(e.target.value)} />
          <select className="w-full rounded-lg border px-2 py-2" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">Τμήμα / ειδικότητα</option>
            {MEETING_DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <textarea className="w-full rounded-lg border px-2 py-2" rows={3} placeholder="Ατζέντα" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} />
            Απαιτείται follow-up
          </label>
          {conflicts.length > 0 ? (
            <ul className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950">
              {conflicts.map((c, i) => (
                <li key={i}>{c.message}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold" onClick={onClose}>
            Ακύρωση
          </button>
          <button type="button" className="flex-1 rounded-lg bg-clinical-600 px-3 py-2 text-sm font-bold text-white" onClick={save}>
            Αποθήκευση
          </button>
        </div>
      </div>
    </div>
  );
}
