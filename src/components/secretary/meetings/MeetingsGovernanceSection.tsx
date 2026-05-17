"use client";

import { useMemo, useState } from "react";
import type { SecretaryMeeting } from "@/lib/secretary/types";
import { getAllTasks, TASKS_UPDATED_EVENT } from "@/lib/secretary/tasks/store";
import {
  buildDecisionRegister,
  buildFollowUpTracker,
  meetingsWithMissingMinutes,
  monthlySupervisionMeetings,
  supervisionHistoryForChild,
  supervisionHistoryForTherapist,
  unresolvedManagementDecisions,
} from "@/lib/secretary/meetings/meeting-governance";
import { MEETING_DECISION_STATUS_LABELS } from "@/lib/secretary/meetings/labels";
import { MeetingStatusBadge } from "./MeetingStatusBadge";
import {
  printMonthlySupervisionReportPdf,
  printSupervisionHistoryPdf,
  printUnresolvedDecisionsReportPdf,
} from "@/lib/secretary/meetings/export";
import { MEETING_PARTICIPANT_OPTIONS } from "@/lib/secretary/meetings/catalog";
import { useEffect } from "react";

export type GovernanceTab =
  | "timeline"
  | "decisions"
  | "followups"
  | "minutes"
  | "supervision"
  | "reports";

type Props = {
  meetings: SecretaryMeeting[];
  todayYmd: string;
  onSelectMeeting: (m: SecretaryMeeting) => void;
};

const TABS: { id: GovernanceTab; label: string }[] = [
  { id: "timeline", label: "Χρονολόγιο" },
  { id: "decisions", label: "Μητρώο αποφάσεων" },
  { id: "followups", label: "Follow-up" },
  { id: "minutes", label: "Εκκρεμή πρακτικά" },
  { id: "supervision", label: "Ιστορικό εποπτείας" },
  { id: "reports", label: "Αναφορές" },
];

const WORKFLOW_STEPS = [
  { key: "scheduled", label: "Προγραμματισμός" },
  { key: "confirmed", label: "Επιβεβαίωση" },
  { key: "completed", label: "Ολοκλήρωση" },
  { key: "minutes", label: "Πρακτικά" },
  { key: "followup", label: "Follow-up" },
  { key: "closed", label: "Κλείσιμο" },
] as const;

export function MeetingsGovernanceSection({ meetings, todayYmd, onSelectMeeting }: Props) {
  const [tab, setTab] = useState<GovernanceTab>("timeline");
  const [tasks, setTasks] = useState(() => getAllTasks(todayYmd));
  const [therapistQ, setTherapistQ] = useState("");
  const [childQ, setChildQ] = useState("");

  useEffect(() => {
    const refresh = () => setTasks(getAllTasks(todayYmd));
    refresh();
    window.addEventListener(TASKS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(TASKS_UPDATED_EVENT, refresh);
  }, [todayYmd]);

  const decisions = useMemo(() => buildDecisionRegister(meetings, todayYmd), [meetings, todayYmd]);
  const followups = useMemo(() => buildFollowUpTracker(meetings, tasks, todayYmd), [meetings, tasks, todayYmd]);
  const missingMinutes = useMemo(() => meetingsWithMissingMinutes(meetings), [meetings]);
  const unresolvedMgmt = useMemo(() => unresolvedManagementDecisions(meetings, todayYmd), [meetings, todayYmd]);

  const therapistHistory = useMemo(
    () => (therapistQ.trim() ? supervisionHistoryForTherapist(meetings, therapistQ.trim()) : []),
    [meetings, therapistQ]
  );

  const childHistory = useMemo(() => {
    if (!childQ.trim()) return [];
    const m = meetings.find((x) => (x.childLabel ?? "").toLowerCase().includes(childQ.toLowerCase()));
    return m?.childId ? supervisionHistoryForChild(meetings, m.childId) : [];
  }, [meetings, childQ]);

  const timelineMeetings = useMemo(
    () =>
      [...meetings]
        .filter((m) => !m.archived)
        .sort((a, b) => `${b.meetingDate}${b.startTime}`.localeCompare(`${a.meetingDate}${a.startTime}`))
        .slice(0, 40),
    [meetings]
  );

  return (
    <section className="rounded-xl border border-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === t.id ? "bg-clinical-600 text-white" : "bg-white text-ink hover:bg-surface-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "timeline" ? (
          <ul className="space-y-3">
            {timelineMeetings.map((m) => (
              <li key={m.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button type="button" className="text-left" onClick={() => onSelectMeeting(m)}>
                    <p className="font-semibold text-ink">{m.title}</p>
                    <p className="text-xs text-ink-muted">
                      {m.meetingDate} {m.startTime} · {m.meetingTypeLabel}
                    </p>
                  </button>
                  <div className="flex flex-wrap gap-1">
                    <MeetingStatusBadge status={m.status} />
                    {m.clinicalRiskFlag ? (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-900">
                        Κλιν. κίνδυνος
                      </span>
                    ) : null}
                    {m.hrRiskFlag ? (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-900">
                        HR κίνδυνος
                      </span>
                    ) : null}
                  </div>
                </div>
                <ol className="mt-3 flex flex-wrap gap-1">
                  {WORKFLOW_STEPS.map((step, i) => {
                    const done =
                      step.key === "scheduled" ||
                      (step.key === "confirmed" && ["confirmed", "completed", "needs_minutes", "needs_followup", "pending_decision", "closed"].includes(m.status)) ||
                      (step.key === "completed" && !["scheduled", "confirmed", "cancelled", "postponed"].includes(m.status)) ||
                      (step.key === "minutes" && !m.minutesMissing) ||
                      (step.key === "followup" && m.followUpStatus === "complete") ||
                      (step.key === "closed" && m.isClosed);
                    return (
                      <li
                        key={step.key}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          done ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {i + 1}. {step.label}
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "decisions" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] uppercase text-ink-muted">
                <tr>
                  <th className="px-2 py-2">Ημ/νία</th>
                  <th className="px-2 py-2">Συνάντηση</th>
                  <th className="px-2 py-2">Απόφαση</th>
                  <th className="px-2 py-2">Υπεύθυνος</th>
                  <th className="px-2 py-2">Προθεσμία</th>
                  <th className="px-2 py-2">Κατάσταση</th>
                </tr>
              </thead>
              <tbody>
                {decisions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-6 text-center text-ink-muted">
                      Δεν υπάρχουν αποφάσεις.
                    </td>
                  </tr>
                ) : (
                  decisions.map((d) => (
                    <tr key={d.id} className={`border-t ${d.isOverdue ? "bg-red-50/50" : ""}`}>
                      <td className="px-2 py-2 tabular-nums">{d.meetingDate}</td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          className="font-medium text-clinical-700 hover:underline"
                          onClick={() => {
                            const m = meetings.find((x) => x.id === d.meetingId);
                            if (m) onSelectMeeting(m);
                          }}
                        >
                          {d.meetingTitle}
                        </button>
                      </td>
                      <td className="max-w-[200px] px-2 py-2">{d.text}</td>
                      <td className="px-2 py-2">{d.responsiblePersonLabel || "—"}</td>
                      <td className="px-2 py-2 tabular-nums">{d.dueDate ?? "—"}</td>
                      <td className="px-2 py-2">{MEETING_DECISION_STATUS_LABELS[d.status]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "followups" ? (
          <ul className="space-y-2">
            {followups.length === 0 ? (
              <p className="text-sm text-ink-muted">Δεν υπάρχουν εκκρεμείς ενέργειες follow-up.</p>
            ) : (
              followups.map((f) => (
                <li
                  key={f.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                    f.isOverdue ? "border-red-200 bg-red-50/40" : ""
                  }`}
                >
                  <FollowUpRow f={f} meetings={meetings} onSelectMeeting={onSelectMeeting} />
                  <span className={`text-xs font-semibold ${f.linkedTaskId ? "text-emerald-700" : "text-amber-800"}`}>
                    {f.linkedTaskId ? "Εργασία ✓" : "Χωρίς εργασία"}
                  </span>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {tab === "minutes" ? (
          <ul className="space-y-2">
            {missingMinutes.length === 0 ? (
              <p className="text-sm text-emerald-800">Όλες οι ολοκληρωμένες συναντήσεις έχουν πρακτικά.</p>
            ) : (
              missingMinutes.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-ink-muted">
                      {m.meetingDate} · {m.meetingTypeLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-clinical-700"
                    onClick={() => onSelectMeeting(m)}
                  >
                    Καταχώρηση πρακτικών →
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {tab === "supervision" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-xs font-semibold text-ink-muted">Θεραπευτής / στέλεχος</span>
                <select
                  className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                  value={therapistQ}
                  onChange={(e) => setTherapistQ(e.target.value)}
                >
                  <option value="">— Επιλογή —</option>
                  {MEETING_PARTICIPANT_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold text-ink-muted">Παιδί (όνομα)</span>
                <input
                  className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                  value={childQ}
                  onChange={(e) => setChildQ(e.target.value)}
                  placeholder="Αναζήτηση…"
                />
              </label>
            </div>
            {therapistQ ? (
              <SupervisionList
                title={`Εποπτεία — ${therapistQ}`}
                entries={therapistHistory}
                onSelect={onSelectMeeting}
                onExport={() =>
                  printSupervisionHistoryPdf(
                    therapistQ,
                    therapistHistory.map((e) => e.meeting)
                  )
                }
              />
            ) : null}
            {childQ.trim() ? (
              <SupervisionList
                title={`Εποπτεία παιδιού — ${childQ}`}
                entries={childHistory}
                onSelect={onSelectMeeting}
                onExport={() =>
                  printChildHistory(childHistory, childQ)
                }
              />
            ) : null}
          </div>
        ) : null}

        {tab === "reports" ? (
          <ReportsPanel todayYmd={todayYmd} meetings={meetings} unresolvedMgmt={unresolvedMgmt} />
        ) : null}
      </div>
    </section>
  );
}

function FollowUpRow({
  f,
  meetings,
  onSelectMeeting,
}: {
  f: import("@/lib/secretary/meetings/meeting-governance").FollowUpTrackerRow;
  meetings: SecretaryMeeting[];
  onSelectMeeting: (m: SecretaryMeeting) => void;
}) {
  return (
    <div>
      <button
        type="button"
        className="font-medium text-clinical-700 hover:underline"
        onClick={() => {
          const m = meetings.find((x) => x.id === f.meetingId);
          if (m) onSelectMeeting(m);
        }}
      >
        {f.title}
      </button>
      <p className="text-xs text-ink-muted">
        {f.meetingTitle} · {f.assignee} · {f.dueDate ?? "—"}
      </p>
    </div>
  );
}

function SupervisionList({
  title,
  entries,
  onSelect,
  onExport,
}: {
  title: string;
  entries: import("@/lib/secretary/meetings/meeting-governance").SupervisionHistoryEntry[];
  onSelect: (m: SecretaryMeeting) => void;
  onExport: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <button type="button" className="text-xs font-semibold text-clinical-700" onClick={onExport}>
          PDF
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-ink-muted">Δεν βρέθηκαν εγγραφές.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {entries.map(({ meeting, hasMinutes, openDecisions }) => (
            <li key={meeting.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <button type="button" className="text-left" onClick={() => onSelect(meeting)}>
                <p className="font-medium">{meeting.title}</p>
                <p className="text-xs text-ink-muted">
                  {meeting.meetingDate} · Πρακτικά: {hasMinutes ? "Ναι" : "Όχι"} · Αποφάσεις: {openDecisions}
                </p>
              </button>
              <MeetingStatusBadge status={meeting.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function printChildHistory(
  entries: import("@/lib/secretary/meetings/meeting-governance").SupervisionHistoryEntry[],
  label: string
) {
  printSupervisionHistoryPdf(
    label,
    entries.map((e) => e.meeting)
  );
}

function ReportsPanel({
  todayYmd,
  meetings,
  unresolvedMgmt,
}: {
  todayYmd: string;
  meetings: SecretaryMeeting[];
  unresolvedMgmt: ReturnType<typeof unresolvedManagementDecisions>;
}) {
  const month = todayYmd.slice(0, 7);
  const monthly = monthlySupervisionMeetings(meetings, month);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        className="rounded-lg border p-4 text-left hover:bg-surface-muted/40"
        onClick={() => printMonthlySupervisionReportPdf(month, monthly)}
      >
        <p className="font-bold text-ink">Μηνιαία έκθεση εποπτείας</p>
        <p className="mt-1 text-xs text-ink-muted">
          {month} · {monthly.length} συναντήσεις
        </p>
      </button>
      <button
        type="button"
        className="rounded-lg border p-4 text-left hover:bg-surface-muted/40"
        onClick={() =>
          printUnresolvedDecisionsReportPdf(
            unresolvedMgmt.map((d) => ({
              meetingTitle: d.meetingTitle,
              meetingDate: d.meetingDate,
              text: d.text,
              responsiblePersonLabel: d.responsiblePersonLabel,
              dueDate: d.dueDate,
              status: d.status,
            }))
          )
        }
      >
        <p className="font-bold text-ink">Εκκρεμείς διοικητικές αποφάσεις</p>
        <p className="mt-1 text-xs text-ink-muted">{unresolvedMgmt.length} ανοιχτές αποφάσεις</p>
      </button>
    </div>
  );
}
