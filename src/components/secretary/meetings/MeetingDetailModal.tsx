"use client";

import { useMemo, useState } from "react";
import type { RoleCode } from "@/lib/auth/roles";
import type { MeetingMinutes, SecretaryMeeting } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import { MeetingStatusBadge } from "./MeetingStatusBadge";
import { MEETING_PRIORITY_LABELS, MEETING_FOLLOWUP_LABELS, MEETING_DECISION_STATUS_LABELS } from "@/lib/secretary/meetings/labels";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { applyMeetingWorkflowAction, canApplyMeetingAction } from "@/lib/secretary/meetings/workflow";
import { upsertMeeting } from "@/lib/secretary/meetings/store";
import { emptyMinutes } from "@/lib/secretary/meetings/calculations";
import {
  canAddSupervisionMinutes,
  canManageMeetings,
  canViewClinicalMinutes,
  canViewManagementNotes,
} from "@/lib/secretary/meetings/permissions";
import { meetingCloseReadiness } from "@/lib/secretary/meetings/meeting-governance";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildMeetingReminderPayload } from "@/lib/secretary/meetings/reminder-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { exportMeetingSummaryPdf } from "@/lib/secretary/meetings/export-detail";
import {
  autoLogMeetingCancelled,
  autoLogMeetingRescheduled,
} from "@/lib/secretary/meetings/meeting-auto-log";
import { CreateDecisionModal } from "./CreateDecisionModal";

type Props = {
  meeting: SecretaryMeeting;
  roleCodes: RoleCode[];
  todayYmd: string;
  onClose: () => void;
  onUpdated: () => void;
};

export function MeetingDetailModal({ meeting: initial, roleCodes, todayYmd, onClose, onUpdated }: Props) {
  const { consents } = useReminders();
  const [m, setM] = useState(initial);
  const [minutesOpen, setMinutesOpen] = useState(false);
  const [minutes, setMinutes] = useState<MeetingMinutes>(m.minutes ?? emptyMinutes());
  const [decisionOpen, setDecisionOpen] = useState(false);

  const canMutate = canManageMeetings(roleCodes);
  const canMinutes = canAddSupervisionMinutes(roleCodes) || canViewClinicalMinutes(roleCodes, m);
  const showMgmt = canViewManagementNotes(roleCodes);

  const closeReadiness = useMemo(() => meetingCloseReadiness(m, todayYmd), [m, todayYmd]);
  const canClose = canApplyMeetingAction(m, "close", todayYmd);

  const refresh = (next: SecretaryMeeting) => {
    setM(next);
    onUpdated();
  };

  const persist = (next: SecretaryMeeting) => refresh(upsertMeeting(next, todayYmd));

  const run = (action: Parameters<typeof applyMeetingWorkflowAction>[1]) => {
    if (!canApplyMeetingAction(m, action, todayYmd)) return;
    const prevDate = m.meetingDate;
    const next = applyMeetingWorkflowAction(m, action, todayYmd, {
      minutes: action === "save_minutes" ? minutes : undefined,
    });
    const saved = upsertMeeting(next, todayYmd);
    if (action === "cancel") autoLogMeetingCancelled(saved, todayYmd);
    if (action === "postpone" && prevDate !== saved.meetingDate) {
      autoLogMeetingRescheduled(saved, prevDate, todayYmd);
    }
    refresh(saved);
    if (action === "save_minutes") setMinutesOpen(false);
  };

  const toggleRisk = (field: "clinicalRiskFlag" | "hrRiskFlag") => {
    persist({ ...m, [field]: !m[field] });
  };

  const reminderPayload = buildMeetingReminderPayload(m, consents);

  return (
    <>
      <SecretaryEntityDetailModal
        open
        title={m.title}
        subtitle={m.meetingTypeLabel}
        onClose={onClose}
        footer={
          canMutate ? (
            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
              <CreateReminderButton payload={reminderPayload} className="w-full" variant="primary" />
              <div className="grid grid-cols-2 gap-2">
                {canApplyMeetingAction(m, "confirm", todayYmd) ? (
                  <button type="button" className="rounded-lg border px-2 py-2 text-xs font-semibold" onClick={() => run("confirm")}>
                    Επιβεβαίωση
                  </button>
                ) : null}
                {canApplyMeetingAction(m, "complete", todayYmd) ? (
                  <button type="button" className="rounded-lg bg-emerald-600 px-2 py-2 text-xs font-bold text-white" onClick={() => run("complete")}>
                    Ολοκλήρωση
                  </button>
                ) : null}
                {canApplyMeetingAction(m, "cancel", todayYmd) ? (
                  <button type="button" className="rounded-lg border border-red-200 px-2 py-2 text-xs font-semibold text-red-800" onClick={() => run("cancel")}>
                    Ακύρωση
                  </button>
                ) : null}
              </div>
              {!m.isClosed ? (
                <div className="border-t border-border pt-2">
                  <button
                    type="button"
                    disabled={!canClose}
                    title={closeReadiness.blockers.join("\n")}
                    className="w-full rounded-lg border-2 border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => run("close")}
                  >
                    Κλείσιμο συνάντησης
                  </button>
                  {!canClose && closeReadiness.blockers.length > 0 ? (
                    <ul className="mt-1 list-inside list-disc text-[11px] text-amber-900">
                      {closeReadiness.blockers.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <p className="text-center text-xs font-semibold text-emerald-800">Η συνάντηση είναι κλειστή.</p>
              )}
            </div>
          ) : null
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <MeetingStatusBadge status={m.status} />
          <AlertBadge level={m.alertLevel} />
          <span className="text-xs text-ink-muted">{MEETING_PRIORITY_LABELS[m.priority]}</span>
          {m.clinicalRiskFlag ? (
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-900">Κλιν. κίνδυνος</span>
          ) : null}
          {m.hrRiskFlag ? (
            <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-900">HR κίνδυνος</span>
          ) : null}
          <EntityLinkedTasksBadge link={{ kind: "meeting", meetingId: m.id }} />
        </div>

        {m.minutesMissing ? (
          <p className="mb-3 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-950">
            Προειδοποίηση: εκκρεμούν πρακτικά συνάντησης.
          </p>
        ) : null}

        <dl className="space-y-2 text-sm">
          <Row label="Ημερομηνία" value={`${formatDateEl(m.meetingDate)} ${m.startTime}–${m.endTime}`} />
          <Row label="Τοποθεσία" value={LOCATION_LABELS[m.locationCode]} />
          <Row label="Οργανωτής" value={m.organizerLabel} />
          <Row label="Συμμετέχοντες" value={m.participants.join(", ") || "—"} />
          {m.childLabel ? <Row label="Παιδί" value={m.childLabel} /> : null}
          {m.staffMemberLabel ? <Row label="Στελέχος" value={m.staffMemberLabel} /> : null}
          <Row label="Follow-up" value={MEETING_FOLLOWUP_LABELS[m.followUpStatus]} />
          <Row label="Ατζέντα" value={m.agenda || "—"} />
        </dl>

        {canMutate ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-1 text-xs">
              <input type="checkbox" checked={m.clinicalRiskFlag} onChange={() => toggleRisk("clinicalRiskFlag")} />
              Κλινικός κίνδυνος
            </label>
            <label className="inline-flex items-center gap-1 text-xs">
              <input type="checkbox" checked={m.hrRiskFlag} onChange={() => toggleRisk("hrRiskFlag")} />
              HR κίνδυνος
            </label>
          </div>
        ) : null}

        {minutesOpen && canMinutes ? (
          <section className="mt-4 space-y-2 rounded-lg border p-3">
            <h3 className="text-sm font-bold">Πρακτικά</h3>
            <textarea className="w-full rounded border px-2 py-1 text-sm" rows={2} placeholder="Σύνοψη *" value={minutes.summary} onChange={(e) => setMinutes({ ...minutes, summary: e.target.value })} />
            <textarea className="w-full rounded border px-2 py-1 text-sm" rows={2} placeholder="Θέματα" value={minutes.mainIssues} onChange={(e) => setMinutes({ ...minutes, mainIssues: e.target.value })} />
            <textarea className="w-full rounded border px-2 py-1 text-sm" rows={2} placeholder="Follow-up ενέργειες" value={minutes.followUpActions} onChange={(e) => setMinutes({ ...minutes, followUpActions: e.target.value })} />
            <textarea className="w-full rounded border px-2 py-1 text-sm" rows={2} placeholder="Κίνδυνοι" value={minutes.risks} onChange={(e) => setMinutes({ ...minutes, risks: e.target.value })} />
            {m.isClinical ? (
              <textarea className="w-full rounded border px-2 py-1 text-sm" rows={2} placeholder="Feedback επόπτη" value={minutes.supervisorFeedback} onChange={(e) => setMinutes({ ...minutes, supervisorFeedback: e.target.value })} />
            ) : null}
            {showMgmt ? (
              <textarea className="w-full rounded border px-2 py-1 text-sm" rows={2} placeholder="Σημειώσεις διοίκησης" value={minutes.managementNotes} onChange={(e) => setMinutes({ ...minutes, managementNotes: e.target.value })} />
            ) : null}
            <button type="button" className="rounded-lg bg-clinical-600 px-3 py-1.5 text-xs font-bold text-white" onClick={() => run("save_minutes")}>
              Αποθήκευση πρακτικών
            </button>
          </section>
        ) : (
          <button type="button" className="mt-3 text-xs font-semibold text-clinical-700" onClick={() => setMinutesOpen(true)}>
            {m.minutesMissing ? "Προσθήκη πρακτικών (εκκρεμεί)" : "Προβολή / επεξεργασία πρακτικών"}
          </button>
        )}

        <section className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">Αποφάσεις</h3>
            {canMutate ? (
              <button
                type="button"
                className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-bold text-white hover:bg-violet-700"
                onClick={() => setDecisionOpen(true)}
              >
                + Δημιουργία απόφασης
              </button>
            ) : null}
          </div>
          <ul className="space-y-2 text-sm">
            {m.decisions.length === 0 ? (
              <li className="text-xs text-ink-muted">Δεν έχουν καταχωρηθεί αποφάσεις.</li>
            ) : (
              m.decisions.map((d) => (
                <li key={d.id} className="rounded-lg border px-3 py-2">
                  <p className="font-medium">{d.text}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {d.responsiblePersonLabel || "—"} · {d.dueDate ? formatDateEl(d.dueDate) : "χωρίς προθεσμία"} ·{" "}
                    {MEETING_DECISION_STATUS_LABELS[d.status]}
                  </p>
                  {d.linkedTaskId ? (
                    <p className="mt-0.5 text-[10px] font-semibold text-emerald-700">Συνδεδεμένη εργασία ✓</p>
                  ) : d.responsiblePersonLabel && d.dueDate ? (
                    <p className="mt-0.5 text-[10px] font-semibold text-amber-800">Χωρίς συνδεδεμένη εργασία</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="mt-4 flex flex-wrap gap-2">
          {m.childId ? (
            <NewCommunicationLink params={{ childId: m.childId, childLabel: m.childLabel ?? "" }} size="sm" />
          ) : null}
          <button type="button" className="text-xs font-semibold text-clinical-700" onClick={() => exportMeetingSummaryPdf(m)}>
            Εξαγωγή PDF
          </button>
        </div>
      </SecretaryEntityDetailModal>

      {decisionOpen ? (
        <CreateDecisionModal
          meeting={m}
          todayYmd={todayYmd}
          onClose={() => setDecisionOpen(false)}
          onSaved={(next) => {
            setM(next);
            onUpdated();
          }}
        />
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-ink-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function motionActionRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

function motionCloseBlock({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-border pt-2">{children}</div>;
}

function motionFooter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function motionRiskFlags({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
}

