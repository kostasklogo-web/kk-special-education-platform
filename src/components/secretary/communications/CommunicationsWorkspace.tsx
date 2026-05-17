"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileText, Plus, Table2, GitBranch } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type {
  CommunicationLog,
  CommunicationReasonCode,
  CommunicationStatus,
  TaskPriority,
} from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { LOCATION_FILTER_OPTIONS, type LocationFilter } from "@/lib/secretary/schedule-catalog";
import {
  COMMUNICATION_REASONS,
  COMMUNICATION_TYPES,
  CONTACT_ROLE_OPTIONS,
  isDoctorCommunication,
  isParentCommunication,
  isSchoolCommunication,
} from "@/lib/secretary/communications/catalog";
import {
  computeCommunicationDashboardMetrics,
  isOpenFollowUp,
} from "@/lib/secretary/communications/calculations";
import {
  COMMUNICATION_PRIORITY_LABELS,
  COMMUNICATION_STATUS_LABELS,
} from "@/lib/secretary/communications/labels";
import { upsertCommunication } from "@/lib/secretary/communications/store";
import {
  exportCommunicationLogExcel,
  printChildCommunicationHistoryPdf,
  printRoleCommunicationHistoryPdf,
  printWeeklyCommunicationReportPdf,
} from "@/lib/secretary/communications/export";
import {
  canExportCommunicationReports,
  canManageCommunications,
} from "@/lib/secretary/communications/permissions";
import { formatDateEl } from "@/lib/ui/child-labels";
import { useCommunicationsLog } from "./CommunicationsLogProvider";
import { CommunicationPrivacyBanner } from "./CommunicationPrivacyBanner";
import { CommunicationDashboardKpis } from "./CommunicationDashboardKpis";
import { CommunicationStatusBadge } from "./CommunicationStatusBadge";
import { CommunicationDiagnosisBadge } from "@/components/secretary/diagnoses/CommunicationDiagnosisBadge";
import { CommunicationReportBadge } from "@/components/secretary/reports/CommunicationReportBadge";
import { CommunicationReminderBadge } from "@/components/secretary/reminders/CommunicationReminderBadge";
import { CommunicationPriorityBadge } from "./CommunicationPriorityBadge";
import { CreateCommunicationModal, type CommunicationDraftPrefill } from "./CreateCommunicationModal";
import { CommunicationDetailModal } from "./CommunicationDetailModal";
import { CommunicationTimeline } from "./CommunicationTimeline";

type QuickFilter =
  | "today"
  | "open_followups"
  | "waiting_response"
  | "parent"
  | "school"
  | "doctor"
  | "urgent"
  | "overdue"
  | "completed_week"
  | null;

type Props = { roleCodes: RoleCode[] };

export function CommunicationsWorkspace({ roleCodes }: Props) {
  const searchParams = useSearchParams();
  const today = todayAthensYmd();
  const logs = useCommunicationsLog();

  const canMutate = canManageCommunications(roleCodes);
  const canExport = canExportCommunicationReports(roleCodes);

  const [view, setView] = useState<"table" | "timeline">("table");
  const [location, setLocation] = useState<LocationFilter>("omilos");
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<CommunicationReasonCode | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [responsibleFilter, setResponsibleFilter] = useState<string>("all");
  const [childQ, setChildQ] = useState(() => searchParams.get("child") ?? searchParams.get("childId") ?? "");
  const [parentQ, setParentQ] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [followUpToday, setFollowUpToday] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [waitingOnly, setWaitingOnly] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);

  const [createOpen, setCreateOpen] = useState(() => searchParams.get("action") === "create");
  const [createPrefill, setCreatePrefill] = useState<CommunicationDraftPrefill | undefined>();
  const [selected, setSelected] = useState<CommunicationLog | null>(null);

  useEffect(() => {
    const id = searchParams.get("comm");
    if (id) {
      const c = logs.find((x) => x.id === id);
      if (c) setSelected(c);
    }
    if (searchParams.get("action") === "create") {
      setCreateOpen(true);
      setCreatePrefill({
        childId: searchParams.get("childId"),
        childLabel: searchParams.get("child") ?? null,
        linkedAppointmentId: searchParams.get("appointment"),
        linkedPaymentId: searchParams.get("payment"),
        linkedDiagnosisId: searchParams.get("diagnosis"),
        linkedReportId: searchParams.get("report"),
        linkedTaskId: searchParams.get("task"),
      });
    }
    const child = searchParams.get("child") ?? searchParams.get("childId");
    if (child) {
      setChildQ(child);
      setView("timeline");
    }
  }, [searchParams, logs]);

  const metrics = useMemo(() => computeCommunicationDashboardMetrics(logs, today), [logs, today]);

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    return logs.filter((c) => {
      if (location !== "omilos" && c.locationCode !== location) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (typeFilter !== "all" && c.communicationTypeCode !== typeFilter) return false;
      if (reasonFilter !== "all" && c.reasonCode !== reasonFilter) return false;
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (roleFilter !== "all" && c.contactRole !== roleFilter) return false;
      if (responsibleFilter !== "all" && c.responsiblePersonLabel !== responsibleFilter) return false;
      if (childQ && c.childId !== childQ && !(c.childLabel ?? "").toLowerCase().includes(childQ.toLowerCase())) {
        return false;
      }
      if (parentQ && !(c.parentLabel ?? "").toLowerCase().includes(parentQ.toLowerCase())) return false;
      if (dateFrom && c.communicationDate < dateFrom) return false;
      if (dateTo && c.communicationDate > dateTo) return false;
      if (followUpToday && c.followUpDate !== today) return false;
      if (overdueOnly && c.status !== "overdue_followup") return false;
      if (waitingOnly && c.status !== "waiting_response") return false;

      if (quickFilter === "today") return c.communicationDate === today;
      if (quickFilter === "open_followups") return isOpenFollowUp(c, today);
      if (quickFilter === "waiting_response") return c.status === "waiting_response";
      if (quickFilter === "parent") return isParentCommunication(c.communicationTypeCode);
      if (quickFilter === "school") return isSchoolCommunication(c.communicationTypeCode);
      if (quickFilter === "doctor") return isDoctorCommunication(c.communicationTypeCode);
      if (quickFilter === "urgent")
        return c.priority === "urgent" && c.status !== "completed" && c.status !== "cancelled";
      if (quickFilter === "overdue") return c.status === "overdue_followup";
      if (quickFilter === "completed_week") return c.status === "completed";

      if (q) {
        const hay = [
          c.childLabel,
          c.parentLabel,
          c.contactPerson,
          c.contactPhone,
          c.summary,
          c.reason,
          c.communicationTypeLabel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    logs,
    location,
    statusFilter,
    typeFilter,
    reasonFilter,
    priorityFilter,
    roleFilter,
    responsibleFilter,
    childQ,
    parentQ,
    searchQ,
    dateFrom,
    dateTo,
    followUpToday,
    overdueOnly,
    waitingOnly,
    quickFilter,
    today,
  ]);

  const assignees = useMemo(
    () => [...new Set(logs.map((c) => c.responsiblePersonLabel).filter(Boolean))] as string[],
    [logs]
  );

  const patchLog = useCallback(
    (log: CommunicationLog) => {
      upsertCommunication(log, today);
      setSelected((s) => (s?.id === log.id ? log : s));
    },
    [today]
  );

  const setStatus = (log: CommunicationLog, status: CommunicationStatus) => {
    patchLog({
      ...log,
      status,
      nextActionRequired: status === "needs_followup" || status === "waiting_response",
    });
    if (status === "completed") setSelected(null);
  };

  const copyMessage = async (log: CommunicationLog) => {
    const text = [log.summary, log.outcome, log.nextAction].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <CommunicationPrivacyBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">Επίσημο ημερολόγιο επικοινωνιών οργανισμού</p>
        {canMutate ? (
          <button
            type="button"
            onClick={() => {
              setCreatePrefill(undefined);
              setCreateOpen(true);
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-clinical-600 px-4 text-sm font-bold text-white shadow hover:bg-clinical-700"
          >
            <Plus className="h-4 w-4" />
            Νέα επικοινωνία
          </button>
        ) : null}
      </div>

      <CommunicationDashboardKpis metrics={metrics} activeFilter={quickFilter} onFilter={setQuickFilter} />

      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface-muted/30 p-3">
        <span className="w-full text-xs font-semibold uppercase text-ink-muted">Φίλτρα & αναζήτηση</span>
        <input
          placeholder="Αναζήτηση (παιδί, γονέας, τηλέφωνο, περίληψη…)"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          className="min-w-[200px] flex-[2] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Τοποθεσία">
          {LOCATION_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLocation(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                location === opt.value
                  ? "border-clinical-600 bg-clinical-600 text-white"
                  : "border-border bg-white text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CommunicationStatus | "all")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλες οι καταστάσεις</option>
          {(Object.keys(COMMUNICATION_STATUS_LABELS) as CommunicationStatus[]).map((s) => (
            <option key={s} value={s}>
              {COMMUNICATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="max-w-[200px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλοι οι τύποι</option>
          {COMMUNICATION_TYPES.map((t) => (
            <option key={t.code} value={t.code}>
              {t.labelEl}
            </option>
          ))}
        </select>
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value as CommunicationReasonCode | "all")}
          className="max-w-[180px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλοι οι λόγοι</option>
          {COMMUNICATION_REASONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.labelEl}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλες οι προτεραιότητες</option>
          {(Object.keys(COMMUNICATION_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {COMMUNICATION_PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλοι οι ρόλοι</option>
          {CONTACT_ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={responsibleFilter}
          onChange={(e) => setResponsibleFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλοι οι υπεύθυνοι</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          placeholder="Παιδί"
          value={childQ}
          onChange={(e) => setChildQ(e.target.value)}
          className="min-w-[100px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Γονέας"
          value={parentQ}
          onChange={(e) => setParentQ(e.target.value)}
          className="min-w-[100px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm" aria-label="Από" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm" aria-label="Έως" />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={followUpToday} onChange={(e) => setFollowUpToday(e.target.checked)} />
          Follow-up σήμερα
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />
          Εκπρόθεσμα
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={waitingOnly} onChange={(e) => setWaitingOnly(e.target.checked)} />
          Αναμονή απάντησης
        </label>
      </div>

      {canExport ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportCommunicationLogExcel(filtered, `epikoinonies-${today}.csv`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Λίστα (Excel)
          </button>
          {childQ ? (
            <button
              type="button"
              onClick={() =>
                printChildCommunicationHistoryPdf(
                  childQ,
                  filtered.filter((c) => (c.childLabel ?? "").toLowerCase().includes(childQ.toLowerCase()) || c.childId === childQ)
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold"
            >
              <FileText className="h-3.5 w-3.5" />
              Ιστορικό παιδιού (PDF)
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => printRoleCommunicationHistoryPdf("Επικοινωνίες σχολείων", filtered.filter((c) => isSchoolCommunication(c.communicationTypeCode)))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold"
          >
            <FileText className="h-3.5 w-3.5" />
            Σχολεία (PDF)
          </button>
          <button
            type="button"
            onClick={() => printRoleCommunicationHistoryPdf("Επικοινωνίες γιατρών", filtered.filter((c) => isDoctorCommunication(c.communicationTypeCode)))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold"
          >
            <FileText className="h-3.5 w-3.5" />
            Γιατροί (PDF)
          </button>
          <button
            type="button"
            onClick={() => printWeeklyCommunicationReportPdf(filtered, `Εβδομάδα ${today}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold"
          >
            <FileText className="h-3.5 w-3.5" />
            Εβδομαδιαία (PDF)
          </button>
        </div>
      ) : null}

      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setView("table")}
          className={`inline-flex items-center gap-1 border-b-2 px-3 py-2 text-sm font-semibold ${
            view === "table" ? "border-clinical-600 text-clinical-700" : "border-transparent text-ink-muted"
          }`}
        >
          <Table2 className="h-4 w-4" />
          Πίνακας
        </button>
        <button
          type="button"
          onClick={() => setView("timeline")}
          className={`inline-flex items-center gap-1 border-b-2 px-3 py-2 text-sm font-semibold ${
            view === "timeline" ? "border-clinical-600 text-clinical-700" : "border-transparent text-ink-muted"
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Χρονολόγιο
        </button>
      </div>

      {view === "timeline" ? (
        <CommunicationTimeline logs={filtered} onSelect={setSelected} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-[1200px] w-full text-left text-sm">
            <thead className="bg-surface-muted/50 text-xs font-semibold uppercase text-ink-muted">
              <tr>
                <th className="px-3 py-2">Ημ/νία</th>
                <th className="px-3 py-2">Παιδί</th>
                <th className="px-3 py-2">Επαφή</th>
                <th className="px-3 py-2">Ρόλος</th>
                <th className="px-3 py-2">Τύπος</th>
                <th className="px-3 py-2">Λόγος</th>
                <th className="px-3 py-2">Κατάσταση</th>
                <th className="px-3 py-2">Follow-up</th>
                <th className="px-3 py-2">Υπεύθυνος</th>
                <th className="px-3 py-2">Προτερ.</th>
                {canMutate ? <th className="px-3 py-2">Ενέργειες</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canMutate ? 11 : 10} className="px-4 py-10 text-center text-ink-muted">
                    Δεν βρέθηκαν καταχωρήσεις.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t border-border/60 hover:bg-surface-muted/20">
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {formatDateEl(c.communicationDate)}
                      {c.communicationTime ? ` ${c.communicationTime}` : ""}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-medium">{c.childLabel ?? "—"}</span>
                        <CommunicationDiagnosisBadge log={c} />
                        <CommunicationReportBadge log={c} />
                        <CommunicationReminderBadge log={c} />
                      </div>
                    </td>
                    <td className="px-3 py-2">{c.contactPerson}</td>
                    <td className="px-3 py-2 text-ink-muted">{c.contactRole}</td>
                    <td className="max-w-[140px] truncate px-3 py-2" title={c.communicationTypeLabel}>
                      {c.communicationTypeLabel}
                    </td>
                    <td className="max-w-[120px] truncate px-3 py-2" title={c.reason}>
                      {c.reason}
                    </td>
                    <td className="px-3 py-2">
                      <CommunicationStatusBadge status={c.status} />
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {c.followUpDate ? formatDateEl(c.followUpDate) : "—"}
                    </td>
                    <td className="px-3 py-2">{c.responsiblePersonLabel ?? "—"}</td>
                    <td className="px-3 py-2">
                      <CommunicationPriorityBadge priority={c.priority} />
                    </td>
                    {canMutate ? (
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setSelected(c)}
                          className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-surface-muted"
                        >
                          Άνοιγμα
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {createOpen ? (
        <CreateCommunicationModal
          prefill={createPrefill}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {}}
        />
      ) : null}

      {selected ? (
        <CommunicationDetailModal
          log={selected}
          canMutate={canMutate}
          onClose={() => setSelected(null)}
          onStatusChange={setStatus}
          onCopyMessage={copyMessage}
        />
      ) : null}
    </div>
  );
}
