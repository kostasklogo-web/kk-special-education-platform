"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Download, Plus, Table2, GitBranch } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { MeetingStatus, SecretaryMeeting, TaskPriority } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { LOCATION_FILTER_OPTIONS, type LocationFilter } from "@/lib/secretary/schedule-catalog";
import { MEETING_TYPES, MEETING_PARTICIPANT_OPTIONS } from "@/lib/secretary/meetings/catalog";
import { computeMeetingDashboardMetrics, isOpenMeeting } from "@/lib/secretary/meetings/calculations";
import { MEETING_PRIORITY_LABELS, MEETING_STATUS_LABELS, MEETING_FOLLOWUP_LABELS } from "@/lib/secretary/meetings/labels";
import { getAllMeetings, MEETINGS_UPDATED_EVENT } from "@/lib/secretary/meetings/store";
import {
  canExportMeetings,
  canManageMeetings,
  canViewMeetings,
} from "@/lib/secretary/meetings/permissions";
import {
  exportDecisionsExcel,
  exportMeetingsExcel,
  printTodayMeetingsPdf,
  printMonthlySupervisionReportPdf,
} from "@/lib/secretary/meetings/export";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import { MeetingDashboardKpis, type MeetingQuickFilter } from "./MeetingDashboardKpis";
import { MeetingStatusBadge } from "./MeetingStatusBadge";
import { MeetingRiskBadges } from "./MeetingRiskBadges";
import { CreateMeetingModal } from "./CreateMeetingModal";
import { MeetingDetailModal } from "./MeetingDetailModal";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildMeetingReminderPayload } from "@/lib/secretary/meetings/reminder-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";
import {
  resolveMeetingsRoleView,
  meetingsForClinicalDirector,
  meetingsForSupervisor,
} from "@/lib/secretary/meetings/meeting-queries";
import { SECRETARY_DEMO_APPOINTMENTS } from "@/lib/demo/secretary-demo-data";
import { MeetingsRoleBanner } from "./MeetingsRoleBanner";
import { MeetingsGovernanceSection } from "./MeetingsGovernanceSection";
import { GdprPrivacyStrip } from "@/components/gdpr/GdprPrivacyStrip";
import { GdprExportBinding } from "@/components/gdpr/GdprExportBinding";

type ViewMode = "table" | "timeline";

type Props = { roleCodes: RoleCode[] };

export function MeetingsWorkspace({ roleCodes }: Props) {
  const searchParams = useSearchParams();
  const today = todayAthensYmd();
  const { consents } = useReminders();

  const canView = canViewMeetings(roleCodes);
  const canMutate = canManageMeetings(roleCodes);
  const canExport = canExportMeetings(roleCodes);

  const [meetings, setMeetings] = useState<SecretaryMeeting[]>(() => getAllMeetings(today));
  const [view, setView] = useState<ViewMode>("table");
  const [location, setLocation] = useState<LocationFilter>("omilos");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [childQ, setChildQ] = useState(() => searchParams.get("child") ?? "");
  const [staffQ, setStaffQ] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickFilter, setQuickFilter] = useState<MeetingQuickFilter>(null);
  const roleView = resolveMeetingsRoleView(roleCodes, searchParams.get("view"));

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<SecretaryMeeting | null>(null);

  const refresh = useCallback(() => setMeetings(getAllMeetings(today)), [today]);

  useEffect(() => {
    refresh();
    const onUp = () => refresh();
    window.addEventListener(MEETINGS_UPDATED_EVENT, onUp);
    return () => window.removeEventListener(MEETINGS_UPDATED_EVENT, onUp);
  }, [refresh]);

  useEffect(() => {
    const id = searchParams.get("meeting");
    if (id) {
      const m = meetings.find((x) => x.id === id);
      if (m) setSelected(m);
    }
    const child = searchParams.get("child");
    if (child) setChildQ(child);
    const staff = searchParams.get("staff");
    if (staff) setStaffQ(staff);
    const quick = searchParams.get("quick");
    if (quick) setQuickFilter(quick as MeetingQuickFilter);
  }, [searchParams, meetings]);

  const metrics = useMemo(() => computeMeetingDashboardMetrics(meetings, today), [meetings, today]);

  const roleScoped = useMemo(() => {
    if (roleView === "supervisor") return meetingsForSupervisor(meetings);
    if (roleView === "clinical_director") return meetingsForClinicalDirector(meetings);
    return meetings;
  }, [meetings, roleView]);

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return roleScoped.filter((m) => {
      if (m.archived) return false;
      if (location !== "omilos" && m.locationCode !== location) return false;
      if (typeFilter !== "all" && m.meetingTypeCode !== typeFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (priorityFilter !== "all" && m.priority !== priorityFilter) return false;
      if (participantFilter !== "all" && !m.participants.includes(participantFilter)) return false;
      if (childQ && !(m.childLabel ?? "").toLowerCase().includes(childQ.toLowerCase())) return false;
      if (staffQ && !(m.staffMemberLabel ?? "").toLowerCase().includes(staffQ.toLowerCase())) return false;
      if (dateFrom && m.meetingDate < dateFrom) return false;
      if (dateTo && m.meetingDate > dateTo) return false;

      if (quickFilter === "today") return m.isToday;
      if (quickFilter === "supervision")
        return ["individual_supervision", "group_supervision", "case_supervision"].includes(m.meetingTypeCode);
      if (quickFilter === "emergency") return m.isEmergency;
      if (quickFilter === "minutes") return m.minutesMissing || m.status === "needs_minutes";
      if (quickFilter === "followup") return m.followUpStatus === "pending" || m.followUpStatus === "overdue";
      if (quickFilter === "completed_week") return m.status === "completed";
      if (quickFilter === "overdue") return m.followUpStatus === "overdue";
      if (quickFilter === "clinical") return m.isClinical;
      if (quickFilter === "admin") return !m.isClinical;
      if (quickFilter === "clinical_risk") return m.clinicalRiskFlag;
      if (quickFilter === "hr_risk") return m.hrRiskFlag;
      if (quickFilter === "open_decisions")
        return m.decisions.some((d) => !["completed", "cancelled"].includes(d.status));

      if (q) {
        const hay = `${m.title} ${m.meetingTypeLabel} ${m.agenda} ${m.participants.join(" ")} ${m.childLabel ?? ""} ${m.decisions.map((d) => d.text).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    roleScoped,
    location,
    typeFilter,
    statusFilter,
    priorityFilter,
    participantFilter,
    childQ,
    staffQ,
    dateFrom,
    dateTo,
    quickFilter,
    searchQ,
  ]);

  const timelineByDate = useMemo(() => {
    const map = new Map<string, SecretaryMeeting[]>();
    for (const m of filtered) {
      const list = map.get(m.meetingDate) ?? [];
      list.push(m);
      map.set(m.meetingDate, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  if (!canView) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Δεν έχετε δικαίωμα προβολής συναντήσεων.
      </p>
    );
  }

  return (
    <GdprExportBinding module="meetings">
      {(requestExport) => (
    <div className="space-y-4">
      <GdprPrivacyStrip />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">Εποπτείες, εσωτερικές & διοικητικές συναντήσεις</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/secretary/schedule?action=new&type=internal_meeting" className="text-xs font-semibold text-clinical-700 hover:underline">
            Από πρόγραμμα →
          </Link>
          {canMutate ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-clinical-600 px-4 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Νέα συνάντηση
            </button>
          ) : null}
        </div>
      </div>

      <MeetingsRoleBanner view={roleView} />
      <MeetingDashboardKpis metrics={metrics} activeFilter={quickFilter} onFilter={setQuickFilter} />

      <MeetingsGovernanceSection
        meetings={roleScoped}
        todayYmd={today}
        onSelectMeeting={(m) => setSelected(m)}
      />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setView("table")} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${view === "table" ? "border-clinical-600 bg-clinical-50" : ""}`}>
          <Table2 className="mr-1 inline h-3.5 w-3.5" />
          Πίνακας
        </button>
        <button type="button" onClick={() => setView("timeline")} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${view === "timeline" ? "border-clinical-600 bg-clinical-50" : ""}`}>
          <GitBranch className="mr-1 inline h-3.5 w-3.5" />
          Χρονολόγιο
        </button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border bg-surface-muted/30 p-3">
        <input
          placeholder="Αναζήτηση…"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          className="min-w-[180px] flex-1 rounded-lg border bg-white px-3 py-2 text-sm"
        />
        {LOCATION_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocation(opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${location === opt.value ? "border-clinical-600 bg-clinical-600 text-white" : "bg-white"}`}
          >
            {opt.label}
          </button>
        ))}
        <select className="rounded-lg border bg-white px-2 py-2 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Όλοι οι τύποι</option>
          {MEETING_TYPES.map((t) => (
            <option key={t.code} value={t.code}>
              {t.labelEl}
            </option>
          ))}
        </select>
        <select className="rounded-lg border bg-white px-2 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MeetingStatus | "all")}>
          <option value="all">Όλες οι καταστάσεις</option>
          {(Object.keys(MEETING_STATUS_LABELS) as MeetingStatus[]).map((s) => (
            <option key={s} value={s}>
              {MEETING_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select className="rounded-lg border bg-white px-2 py-2 text-sm" value={participantFilter} onChange={(e) => setParticipantFilter(e.target.value)}>
          <option value="all">Συμμετέχων</option>
          {MEETING_PARTICIPANT_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input type="date" className="rounded-lg border bg-white px-2 py-2 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="rounded-lg border bg-white px-2 py-2 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {canExport ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold" onClick={() => requestExport("Excel λίστα συναντήσεων", () => exportMeetingsExcel(filtered, `meetings-${today}.csv`))}>
            <Download className="h-3.5 w-3.5" />
            Excel λίστα
          </button>
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold" onClick={() => requestExport("PDF συναντήσεων σήμερα", () => printTodayMeetingsPdf(filtered.filter((m) => m.isToday), today))}>
            PDF σήμερα
          </button>
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold" onClick={() => requestExport("Excel αποφάσεων", () => exportDecisionsExcel(filtered))}>
            Excel αποφάσεις
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            onClick={() =>
              requestExport("PDF μηνιαίας εποπτείας", () =>
                printMonthlySupervisionReportPdf(today.slice(0, 7), filtered.filter((m) => m.isClinical))
              )
            }
          >
            PDF μηνιαία εποπτεία
          </button>
        </div>
      ) : null}

      {view === "timeline" ? (
        <div className="space-y-4">
          {timelineByDate.map(([date, items]) => (
            <section key={date} className="rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-bold text-ink">{date}</h3>
              <ul className="space-y-2">
                {items.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => setSelected(m)} className="w-full rounded-lg border p-3 text-left hover:bg-surface-muted/40">
                      <div className="flex flex-wrap items-center gap-2">
                        <MeetingStatusBadge status={m.status} />
                        <AlertBadge level={m.alertLevel} />
                        <span className="text-xs text-ink-muted">{m.startTime}</span>
                      </div>
                      <p className="font-medium">{m.title}</p>
                      <p className="text-xs text-ink-muted">{m.meetingTypeLabel}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-surface-muted/50 text-[11px] uppercase text-ink-muted">
              <tr>
                <th className="px-3 py-2">Ημ/νία</th>
                <th className="px-3 py-2">Τύπος</th>
                <th className="px-3 py-2">Τίτλος</th>
                <th className="px-3 py-2">Τοποθ.</th>
                <th className="px-3 py-2">Συμμετέχοντες</th>
                <th className="px-3 py-2">Σχετικό</th>
                <th className="px-3 py-2">Προτερ.</th>
                <th className="px-3 py-2">Κατάσταση</th>
                <th className="px-3 py-2">Follow-up</th>
                <th className="px-3 py-2">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-ink-muted">
                    Δεν βρέθηκαν συναντήσεις.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className={`border-t hover:bg-surface-muted/20 ${m.isEmergency ? "bg-red-50/30" : ""}`}>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {m.meetingDate}
                      <br />
                      <span className="text-xs text-ink-muted">{m.startTime}</span>
                    </td>
                    <td className="max-w-[120px] truncate px-3 py-2" title={m.meetingTypeLabel}>
                      {m.meetingTypeLabel}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {m.title}
                      <MeetingRiskBadges meeting={m} />
                    </td>
                    <td className="px-3 py-2 text-xs">{LOCATION_LABELS[m.locationCode]}</td>
                    <td className="max-w-[140px] truncate px-3 py-2 text-xs" title={m.participants.join(", ")}>
                      {m.participants.join(", ")}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {m.childLabel ?? m.staffMemberLabel ?? "—"}
                      <EntityLinkedTasksBadge link={{ kind: "meeting", meetingId: m.id }} />
                    </td>
                    <td className="px-3 py-2 text-xs">{MEETING_PRIORITY_LABELS[m.priority]}</td>
                    <td className="px-3 py-2">
                      <MeetingStatusBadge status={m.status} />
                    </td>
                    <td className="px-3 py-2 text-xs">{MEETING_FOLLOWUP_LABELS[m.followUpStatus]}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" className="text-xs font-semibold text-clinical-700" onClick={() => setSelected(m)}>
                          Λεπτομέρειες
                        </button>
                        {canMutate && isOpenMeeting(m) ? (
                          <CreateReminderButton size="sm" variant="ghost" payload={buildMeetingReminderPayload(m, consents)} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {createOpen ? (
        <CreateMeetingModal
          todayYmd={today}
          appointments={SECRETARY_DEMO_APPOINTMENTS}
          onClose={() => setCreateOpen(false)}
          onCreated={refresh}
          prefill={
            childQ
              ? {
                  childLabel: childQ,
                  title: `Συνάντηση — ${childQ}`,
                }
              : undefined
          }
        />
      ) : null}

      {selected ? (
        <MeetingDetailModal
          meeting={selected}
          roleCodes={roleCodes}
          todayYmd={today}
          onClose={() => setSelected(null)}
          onUpdated={refresh}
        />
      ) : null}
    </div>
      )}
    </GdprExportBinding>
  );
}
