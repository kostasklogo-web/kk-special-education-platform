"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, GitBranch, Plus, Table2, List } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { ReportRequest, ReportRequestPriority, ReportRequestStatus } from "@/lib/secretary/types";
import { todayAthensYmd, addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import { LOCATION_FILTER_OPTIONS, type LocationFilter } from "@/lib/secretary/schedule-catalog";
import { computeReportDashboardMetrics, isOpenReport } from "@/lib/secretary/reports/calculations";
import { REPORT_TYPES, REPORT_THERAPIST_OPTIONS, REPORT_SUPERVISOR_OPTIONS } from "@/lib/secretary/reports/catalog";
import { REPORT_PRIORITY_LABELS, REPORT_STATUS_LABELS } from "@/lib/secretary/reports/labels";
import { getAllReports, REPORTS_UPDATED_EVENT } from "@/lib/secretary/reports/store";
import {
  canExportReports,
  canManageReports,
  canViewReports,
} from "@/lib/secretary/reports/permissions";
import {
  exportOpenReportsExcel,
  exportOverdueReportsExcel,
  exportReportStatusListExcel,
} from "@/lib/secretary/reports/export";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ReportPrivacyBanner } from "./ReportPrivacyBanner";
import { GdprPrivacyStrip } from "@/components/gdpr/GdprPrivacyStrip";
import { GdprExportBinding } from "@/components/gdpr/GdprExportBinding";
import { ReportDashboardKpis, type ReportQuickFilter } from "./ReportDashboardKpis";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { CreateReportModal } from "./CreateReportModal";
import { ReportDetailModal } from "./ReportDetailModal";
import { ReportsKanban } from "./ReportsKanban";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { ChildDiagnosisBadge } from "@/components/secretary/diagnoses/ChildDiagnosisBadge";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";
import { ReportsRoleBanner } from "./ReportsRoleBanner";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildReportReminderPayload } from "@/components/secretary/reminders/communication-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import {
  resolveReportsRoleView,
  reportsForTherapist,
  reportsForSupervisor,
  reportsForClinicalDirector,
} from "@/lib/secretary/reports/report-queries";
type ViewMode = "table" | "kanban" | "timeline";

type Props = { roleCodes: RoleCode[] };

export function ReportsWorkspace({ roleCodes }: Props) {
  const searchParams = useSearchParams();
  const today = todayAthensYmd();
  const weekEnd = addDaysAthensCalendar(today, 7);

  const canView = canViewReports(roleCodes);
  const canMutate = canManageReports(roleCodes);
  const canExport = canExportReports(roleCodes);
  const { consents } = useReminders();

  const [reports, setReports] = useState<ReportRequest[]>(() => getAllReports(today));
  const [view, setView] = useState<ViewMode>("table");
  const [location, setLocation] = useState<LocationFilter>("omilos");
  const [childQ, setChildQ] = useState(() => searchParams.get("child") ?? "");
  const [typeFilter, setTypeFilter] = useState("all");
  const [therapistFilter, setTherapistFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ReportRequestStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ReportRequestPriority | "all">("all");
  const [searchQ, setSearchQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickFilter, setQuickFilter] = useState<ReportQuickFilter>(null);
  const roleView = resolveReportsRoleView(roleCodes, searchParams.get("view"));
  const [therapistPortalLabel, setTherapistPortalLabel] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<ReportRequest | null>(null);

  const refresh = useCallback(() => setReports(getAllReports(today)), [today]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(REPORTS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(REPORTS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  useEffect(() => {
    const id = searchParams.get("report");
    if (id) {
      const r = reports.find((x) => x.id === id);
      if (r) setSelected(r);
    }
    const child = searchParams.get("child");
    if (child) setChildQ(child);
    const quick = searchParams.get("quick");
    if (quick) setQuickFilter(quick as ReportQuickFilter);
  }, [searchParams, reports]);

  const metrics = useMemo(() => computeReportDashboardMetrics(reports, today), [reports, today]);

  const roleScoped = useMemo(() => {
    if (roleView === "therapist") return reportsForTherapist(reports, therapistPortalLabel || null);
    if (roleView === "supervisor") return reportsForSupervisor(reports);
    if (roleView === "clinical_director") return reportsForClinicalDirector(reports);
    return reports;
  }, [reports, roleView, therapistPortalLabel]);

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return roleScoped.filter((r) => {
      if (r.archived && quickFilter !== "delivered_month") return false;
      if (location !== "omilos" && r.locationCode !== location) return false;
      if (childQ && !r.childLabel.toLowerCase().includes(childQ.toLowerCase())) return false;
      if (typeFilter !== "all" && r.reportTypeCode !== typeFilter) return false;
      if (therapistFilter !== "all" && r.assignedTherapistLabel !== therapistFilter) return false;
      if (supervisorFilter !== "all" && r.assignedSupervisorLabel !== supervisorFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (dateFrom && r.requestDate < dateFrom) return false;
      if (dateTo && r.requestDate > dateTo) return false;

      if (quickFilter === "open") return isOpenReport(r);
      if (quickFilter === "due_week")
        return isOpenReport(r) && r.dueDate && r.dueDate >= today && r.dueDate <= weekEnd;
      if (quickFilter === "overdue") return r.isOverdue && isOpenReport(r);
      if (quickFilter === "awaiting_therapist")
        return ["assigned_therapist", "draft_in_progress", "corrections_requested"].includes(r.status);
      if (quickFilter === "awaiting_supervisor")
        return ["draft_completed", "supervisor_review"].includes(r.status);
      if (quickFilter === "awaiting_cd") return r.status === "clinical_director_review";
      if (quickFilter === "ready") return ["approved", "ready_for_delivery"].includes(r.status);
      if (quickFilter === "delivered_month") return r.status === "delivered";
      if (quickFilter === "urgent") return r.priority === "urgent" || r.isUrgentOverdue;

      if (q) {
        const hay = [
          r.childLabel,
          r.parentLabel,
          r.reportTypeLabel,
          r.assignedTherapistLabel,
          r.assignedSupervisorLabel,
          r.purpose,
          r.notes,
          r.requestedBy,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    roleScoped,
    location,
    childQ,
    typeFilter,
    therapistFilter,
    supervisorFilter,
    statusFilter,
    priorityFilter,
    searchQ,
    dateFrom,
    dateTo,
    quickFilter,
    today,
    weekEnd,
  ]);

  const timelineByChild = useMemo(() => {
    const m = new Map<string, ReportRequest[]>();
    for (const r of filtered) {
      const list = m.get(r.childLabel) ?? [];
      list.push(r);
      m.set(r.childLabel, list);
    }
    return [...m.entries()];
  }, [filtered]);

  if (!canView) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-ink-muted">
        Δεν έχετε πρόσβαση σε αιτήματα αναφορών.
      </p>
    );
  }

  return (
    <GdprExportBinding module="reports">
      {(requestExport) => (
    <div className="space-y-4">
      <GdprPrivacyStrip />
      <ReportPrivacyBanner />

      {roleView !== "secretary" ? (
        <ReportsRoleBanner
          view={roleView}
          therapistLabel={therapistPortalLabel}
          onTherapistLabelChange={setTherapistPortalLabel}
        />
      ) : null}

      <ReportDashboardKpis
        metrics={metrics}
        activeFilter={quickFilter}
        onFilter={setQuickFilter}
      />

      <div className="flex flex-wrap items-center gap-2">
        {canMutate ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-clinical-600 px-4 py-2 text-sm font-bold text-white hover:bg-clinical-700"
          >
            <Plus className="h-4 w-4" />
            Νέο αίτημα
          </button>
        ) : null}
        {canExport ? (
          <>
            <button
              type="button"
              onClick={() => requestExport("Excel ανοιχτών αναφορών", () => exportOpenReportsExcel(reports))}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
            >
              <Download className="h-3.5 w-3.5" />
              Ανοιχτά (Excel)
            </button>
            <button
              type="button"
              onClick={() => requestExport("Excel εκπρόθεσμων αναφορών", () => exportOverdueReportsExcel(reports))}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
            >
              <Download className="h-3.5 w-3.5" />
              Εκπρόθεσμα
            </button>
            <button
              type="button"
              onClick={() => requestExport("Excel λίστας κατάστασης αναφορών", () => exportReportStatusListExcel(reports))}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
            >
              <Download className="h-3.5 w-3.5" />
              Λίστα κατάστασης
            </button>
          </>
        ) : null}
        <div className="ml-auto flex gap-1" role="group" aria-label="Προβολή">
          {(
            [
              ["table", Table2, "Πίνακας"],
              ["kanban", GitBranch, "Kanban"],
              ["timeline", List, "Χρονολόγιο"],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                view === mode ? "border-clinical-600 bg-clinical-50 text-clinical-900" : "border-border"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-border bg-surface-card p-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <input
          className="rounded-lg border border-border px-3 py-2 text-sm lg:col-span-2"
          placeholder="Αναζήτηση (παιδί, γονέας, τύπος, σκοπός…)"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
        <select
          className="rounded-lg border border-border px-2 py-2 text-sm"
          value={location}
          onChange={(e) => setLocation(e.target.value as LocationFilter)}
        >
          {LOCATION_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-border px-2 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Όλοι οι τύποι</option>
          {REPORT_TYPES.map((t) => (
            <option key={t.code} value={t.code}>
              {t.labelEl}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-border px-2 py-2 text-sm"
          value={therapistFilter}
          onChange={(e) => setTherapistFilter(e.target.value)}
        >
          <option value="all">Όλοι οι θεραπευτές</option>
          {REPORT_THERAPIST_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-border px-2 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportRequestStatus | "all")}
        >
          <option value="all">Όλες οι καταστάσεις</option>
          {(Object.keys(REPORT_STATUS_LABELS) as ReportRequestStatus[]).map((s) => (
            <option key={s} value={s}>
              {REPORT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {view === "kanban" ? (
        <ReportsKanban reports={filtered} onSelect={setSelected} />
      ) : view === "timeline" ? (
        <div className="space-y-4">
          {timelineByChild.map(([label, items]) => (
            <section key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-bold text-ink">{label}</h3>
              <ol className="relative border-l-2 border-clinical-200 pl-6">
                {items.map((r) => (
                  <li key={r.id} className="mb-4 last:mb-0">
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-clinical-600" />
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="w-full rounded-lg border border-border/80 p-3 text-left hover:bg-surface-muted/40"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <ReportStatusBadge status={r.status} overdue={r.isOverdue} />
                        <AlertBadge level={r.alertLevel} />
                      </div>
                      <p className="mt-1 font-medium">{r.reportTypeLabel}</p>
                      <p className="text-xs text-ink-muted">
                        {formatDateEl(r.requestDate)}
                        {r.dueDate ? ` · προθεσμία ${formatDateEl(r.dueDate)}` : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-surface-muted/50 text-xs font-semibold uppercase text-ink-muted">
              <tr>
                <th className="px-3 py-2">Παιδί</th>
                <th className="px-3 py-2">Τύπος</th>
                <th className="px-3 py-2">Αιτήθηκε</th>
                <th className="px-3 py-2">Θεραπευτής</th>
                <th className="px-3 py-2">Επόπτης</th>
                <th className="px-3 py-2">Αίτηση</th>
                <th className="px-3 py-2">Προθεσμία</th>
                <th className="px-3 py-2">Ημέρες</th>
                <th className="px-3 py-2">Προτερ.</th>
                <th className="px-3 py-2">Κατάσταση</th>
                <th className="px-3 py-2">Παράδοση</th>
                <th className="px-3 py-2">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-ink-muted">
                    Δεν βρέθηκαν αιτήματα αναφορών.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-surface-muted/20">
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-medium">{r.childLabel}</span>
                        <ChildDiagnosisBadge childId={r.childId} compact />
                        <EntityLinkedTasksBadge link={{ kind: "report", reportId: r.id }} />
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.reportTypeLabel}</td>
                    <td className="px-3 py-2 text-ink-muted">{r.requestedBy}</td>
                    <td className="px-3 py-2">{r.assignedTherapistLabel ?? "—"}</td>
                    <td className="px-3 py-2">{r.assignedSupervisorLabel ?? "—"}</td>
                    <td className="px-3 py-2 tabular-nums">{formatDateEl(r.requestDate)}</td>
                    <td className="px-3 py-2 tabular-nums">{r.dueDate ? formatDateEl(r.dueDate) : "—"}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {r.daysUntilDue !== null ? (
                        <span className={r.isOverdue ? "font-bold text-red-700" : ""}>{r.daysUntilDue}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2">{REPORT_PRIORITY_LABELS[r.priority]}</td>
                    <td className="px-3 py-2">
                      <ReportStatusBadge status={r.status} overdue={r.isOverdue} />
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.deliveryStatus === "delivered" ? "Παραδόθηκε" : r.deliveryStatus === "pending" ? "Εκκρεμεί" : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-surface-muted"
                        >
                          Λεπτομέρειες
                        </button>
                        {isOpenReport(r) && r.childId ? (
                          <CreateReminderButton
                            size="sm"
                            variant="ghost"
                            payload={buildReportReminderPayload(r, consents)}
                          />
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
        <CreateReportModal onClose={() => setCreateOpen(false)} onCreated={refresh} />
      ) : null}

      {selected ? (
        <ReportDetailModal
          report={selected}
          roleCodes={roleCodes}
          onClose={() => setSelected(null)}
          onUpdated={refresh}
        />
      ) : null}
    </div>
      )}
    </GdprExportBinding>
  );
}
