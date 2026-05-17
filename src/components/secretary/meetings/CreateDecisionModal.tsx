"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SecretaryMeeting } from "@/lib/secretary/types";
import { MEETING_PARTICIPANT_OPTIONS } from "@/lib/secretary/meetings/catalog";
import { addMeetingDecision } from "@/lib/secretary/meetings/meeting-governance";
import { upsertMeeting } from "@/lib/secretary/meetings/store";

type Props = {
  meeting: SecretaryMeeting;
  todayYmd: string;
  onClose: () => void;
  onSaved: (m: SecretaryMeeting) => void;
};

export function CreateDecisionModal({ meeting, todayYmd, onClose, onSaved }: Props) {
  const [text, setText] = useState("");
  const [responsible, setResponsible] = useState(meeting.organizerLabel);
  const [dueDate, setDueDate] = useState(todayYmd);

  const participants = [...new Set([...meeting.participants, ...MEETING_PARTICIPANT_OPTIONS])];

  const save = () => {
    if (!text.trim() || !responsible.trim()) return;
    const next = addMeetingDecision(
      meeting,
      { text, responsiblePersonLabel: responsible, dueDate: dueDate || todayYmd },
      todayYmd
    );
    onSaved(upsertMeeting(next, todayYmd));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Νέα απόφαση</h2>
          <button type="button" onClick={onClose} aria-label="Κλείσιμο">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-xs text-ink-muted">{meeting.title}</p>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Κείμενο απόφασης</span>
            <textarea
              className="mt-1 w-full rounded-lg border px-2 py-2"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Υπεύθυνος</span>
            <select
              className="mt-1 w-full rounded-lg border px-2 py-2"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
            >
              {participants.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-muted">Προθεσμία</span>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border px-2 py-2"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          <p className="rounded-lg bg-clinical-50 px-2 py-1.5 text-xs text-clinical-900">
            Με υπεύθυνο και προθεσμία δημιουργείται αυτόματα συνδεδεμένη εργασία.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={onClose}>
            Ακύρωση
          </button>
          <button
            type="button"
            className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            onClick={save}
            disabled={!text.trim()}
          >
            Αποθήκευση απόφασης
          </button>
        </div>
      </div>
    </div>
  );
}
