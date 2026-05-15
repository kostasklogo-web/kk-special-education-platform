"use client";

import { memo, useMemo, type ReactNode } from "react";
import { AlertTriangle, CalendarPlus, CheckCircle2, Sparkles } from "lucide-react";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import {
  CONTROL_CENTER_DEMO_CHILDREN,
  CONTROL_CENTER_DEMO_DISCIPLINES,
  CONTROL_CENTER_DEMO_ROOMS,
  CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE,
  CONTROL_CENTER_DEMO_THERAPISTS,
} from "@/lib/demo/schedule-control-center-data";
import { evaluateDraftAppointment } from "./prototype-draft-conflict";

const INPUT_CLS = "mt-0.5 w-full rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink";

export type AppointmentDraftState = {
  therapistUserId: string;
  disciplineCode: string;
  childLabel: string;
  roomId: string;
  dateYmd: string;
  startHm: string;
  durationMin: 45 | 90;
};

type Props = {
  draft: AppointmentDraftState;
  onChange: (patch: Partial<AppointmentDraftState>) => void;
  blocks: ControlBoardBlock[];
  highlightMode: "45" | "90" | "suggest" | null;
  onScrollToAvailability: () => void;
  /** Sidebar: no outer chrome (section title lives in parent). */
  embedded?: boolean;
};

export const AppointmentCreationPanel = memo(function AppointmentCreationPanel({
  draft,
  onChange,
  blocks,
  highlightMode,
  onScrollToAvailability,
  embedded = false,
}: Props) {
  const conflict = useMemo(
    () =>
      evaluateDraftAppointment(
        {
          dateYmd: draft.dateYmd,
          therapistUserId: draft.therapistUserId,
          roomId: draft.roomId,
          startHm: draft.startHm,
          durationMin: draft.durationMin,
          childLabel: draft.childLabel,
        },
        blocks
      ),
    [draft, blocks]
  );

  const canSavePrototype = conflict.ok && draft.therapistUserId && draft.roomId && draft.childLabel && draft.startHm;

  const form = (
    <>
      {!embedded && highlightMode ? (
        <p className="mb-2 rounded-md bg-clinical-50 px-2 py-1 text-[10px] font-semibold text-clinical-800 ring-1 ring-clinical-200">
          {highlightMode === "45" && "Λειτουργία: νέα 45λεπτη συνεδρία σε διαθέσιμο κενό 45′."}
          {highlightMode === "90" && "Λειτουργία: νέα 90λεπτη ομάδα (2×45′)."}
          {highlightMode === "suggest" && "Λειτουργία: πρόταση διαθέσιμης ώρας."}
        </p>
      ) : null}
      <div className={embedded ? "space-y-1.5" : "space-y-2 p-3"}>
        <Field label="Θεραπευτής">
          <select
            className={INPUT_CLS}
            value={draft.therapistUserId}
            onChange={(e) => {
              const tid = e.target.value;
              const code = CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[tid] ?? draft.disciplineCode;
              onChange({ therapistUserId: tid, disciplineCode: code });
            }}
          >
            <option value="">— Επιλογή —</option>
            {CONTROL_CENTER_DEMO_THERAPISTS.map((t) => (
              <option key={t.user_id} value={t.user_id}>
                {t.display_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ειδικότητα">
          <select
            className={INPUT_CLS}
            value={draft.disciplineCode}
            onChange={(e) => onChange({ disciplineCode: e.target.value })}
          >
            <option value="">—</option>
            {CONTROL_CENTER_DEMO_DISCIPLINES.filter((d) => d.code !== "brk").map((d) => (
              <option key={d.code} value={d.code}>
                {d.name_el}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Παιδί / ομάδα">
          <select
            className={INPUT_CLS}
            value={draft.childLabel}
            onChange={(e) => {
              const label = e.target.value;
              const child = CONTROL_CENTER_DEMO_CHILDREN.find((c) => c.label === label);
              onChange({
                childLabel: label,
                durationMin: child?.kind === "group" ? 90 : draft.durationMin === 90 ? 45 : draft.durationMin,
              });
            }}
          >
            <option value="">— Επιλογή —</option>
            {CONTROL_CENTER_DEMO_CHILDREN.map((c) => (
              <option key={c.id} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Αίθουσα">
          <select className={INPUT_CLS} value={draft.roomId} onChange={(e) => onChange({ roomId: e.target.value })}>
            <option value="">— Επιλογή —</option>
            {CONTROL_CENTER_DEMO_ROOMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.short_label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ημέρα">
          <input className={`${INPUT_CLS} tabular-nums`} type="date" value={draft.dateYmd} readOnly title="Από την επιλεγμένη προβολή ημέρας" />
        </Field>

        <Field label="Ώρα έναρξης">
          <input
            className={`${INPUT_CLS} tabular-nums`}
            type="time"
            value={draft.startHm}
            onChange={(e) => onChange({ startHm: e.target.value })}
            step={draft.durationMin === 90 ? 900 : 2700}
          />
        </Field>

        <Field label="Διάρκεια">
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-white px-2 py-2 text-xs font-semibold has-[:checked]:border-clinical-600 has-[:checked]:bg-clinical-50">
              <input
                type="radio"
                name="draft-duration"
                checked={draft.durationMin === 45}
                onChange={() => onChange({ durationMin: 45 })}
                className="sr-only"
              />
              45′
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border bg-white px-2 py-2 text-xs font-semibold has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
              <input
                type="radio"
                name="draft-duration"
                checked={draft.durationMin === 90}
                onChange={() => onChange({ durationMin: 90 })}
                className="sr-only"
              />
              90′ ομάδα
            </label>
          </div>
        </Field>

        <div className="rounded-lg border border-border bg-surface-muted/40 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">Έλεγχος σύγκρουσης</p>
          {conflict.ok ? (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Δεν εντοπίστηκε σύγκρουση — κατάλληλο για κράτηση (πρωτότυπο).
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-xs text-amber-950">
              {conflict.messages.map((msg) => (
                <li key={msg} className="flex gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          disabled
          className="w-full rounded-lg border-2 border-dashed border-clinical-400 bg-white px-3 py-2.5 text-sm font-semibold text-clinical-900 opacity-80"
          title="Πρωτότυπο — χωρίς αποθήκευση στη βάση"
        >
          {canSavePrototype ? "Κράτηση (σύντομα)" : "Συμπληρώστε τα πεδία"}
        </button>

        <button
          type="button"
          onClick={onScrollToAvailability}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-clinical-500 bg-clinical-600 px-3 py-2 text-xs font-semibold text-white hover:bg-clinical-700"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Προτάσεις διαθέσιμων ωρών
        </button>
      </div>
    </>
  );

  if (embedded) {
    return <div aria-label="Δημιουργία ραντεβού">{form}</div>;
  }

  return (
    <aside
      className="w-full rounded-lg border border-clinical-300/60 bg-gradient-to-b from-clinical-50/70 to-white shadow-sm"
      aria-label="Δημιουργία ραντεβού"
    >
      <div className="border-b border-clinical-200/80 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-bold text-clinical-950">
          <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden />
          Δημιουργία ραντεβού
        </p>
        <p className="mt-1 text-[11px] leading-snug text-clinical-900/85">Πρωτότυπο — χωρίς αποθήκευση.</p>
      </div>
      {form}
    </aside>
  );
});

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-ink-muted">
      {label}
      {children}
    </label>
  );
}
