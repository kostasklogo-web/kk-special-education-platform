"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Download, FileText, X } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { REMINDER_TYPES } from "@/lib/secretary/reminders/catalog";
import { REMINDER_CHANNEL_LABELS } from "@/lib/secretary/reminders/config";
import { REMINDER_PRIORITY_LABELS, REMINDER_CHANNEL_LABELS_EXT } from "@/lib/secretary/reminders/labels";
import {
  buildUnifiedRows,
  computeReminderMetrics,
} from "@/lib/secretary/reminders/calculations";
import {
  canExportReminders,
  canManageReminders,
  canViewReminders,
} from "@/lib/secretary/reminders/permissions";
import {
  exportOverdueRemindersExcel,
  exportTodayRemindersExcel,
  printMonthlyReminderReportPdf,
} from "@/lib/secretary/reminders/export";
import { channelAllowed, consentWarning } from "@/lib/secretary/reminders/consent";
import type { ReminderChannel, ReminderStatus } from "@/lib/secretary/reminders/types";
import { REMINDERS_UPDATED_EVENT } from "@/lib/secretary/reminders/store";
import { useReminders } from "./ReminderProvider";
import { ReminderDashboardKpis, type ReminderQuickFilter } from "./ReminderDashboardKpis";
import { ReminderStatusBadge } from "./ReminderStatusBadge";
import { ReminderTemplatesPanel } from "./ReminderTemplatesPanel";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";

type Props = { roleCodes: RoleCode[] };

const STATUS_OPTIONS: { value: ReminderStatus | "all"; label: string }[] = [
  { value: "all", label: "Όλες" },
  { value: "pending", label: "Εκκρεμεί" },
  { value: "scheduled", label: "Προγραμματισμένη" },
  { value: "copied", label: "Αντιγράφηκε" },
  { value: "sent", label: "Στάλθηκε" },
  { value: "completed", label: "Ολοκληρώθηκε" },
  { value: "failed", label: "Απέτυχε" },
  { value: "cancelled", label: "Ακυρώθηκε" },
];

export function RemindersWorkspace({ roleCodes }: Props) {
  const today = todayAthensYmd();
  const searchParams = useSearchParams();
  const canView = canViewReminders(roleCodes);
  const canMutate = canManageReminders(roleCodes);
  const canExport = canExportReminders(roleCodes);

  const {
    queue,
    enrichedReminders,
    openReminder,
    copyMessage,
    markSent,
    markCompleted,
    cancelReminder,
    bulkMarkSent,
    bulkCancel,
    getConsentForChild,
    createReminderFromPayload,
  } = useReminders();

  const [quickFilter, setQuickFilter] = useState<ReminderQuickFilter>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [childQ, setChildQ] = useState(() => searchParams.get("child") ?? "");
  const [parentQ, setParentQ] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewBody, setPreviewBody] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [, bump] = useState(0);

  useEffect(() => {
    const onUp = () => bump((n) => n + 1);
    window.addEventListener(REMINDERS_UPDATED_EVENT, onUp);
    return () => window.removeEventListener(REMINDERS_UPDATED_EVENT, onUp);
  }, []);

  useEffect(() => {
    const q = searchParams.get("quick") as ReminderQuickFilter | null;
    if (q) setQuickFilter(q);
    const child = searchParams.get("child");
    if (child) setChildQ(child);
    const tab = searchParams.get("tab");
    if (tab === "failed") setQuickFilter("failed");
    if (tab === "appointments") setQuickFilter("appointment");
    if (tab === "payments") setQuickFilter("payment");
    if (tab === "overdue") setQuickFilter("payment_overdue");
    if (tab === "diagnosis") setQuickFilter("diagnosis");
    if (tab === "reports") setQuickFilter("report");
  }, [searchParams]);

  const metrics = useMemo(
    () => computeReminderMetrics(queue, enrichedReminders, today),
    [queue, enrichedReminders, today]
  );

  const rows = useMemo(
    () => buildUnifiedRows(queue, enrichedReminders, today),
    [queue, enrichedReminders, today]
  );

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return rows.filter((row) => {
      if (childQ && !row.childLabel.toLowerCase().includes(childQ.toLowerCase())) return false;
      if (parentQ && !row.parentLabel.toLowerCase().includes(parentQ.toLowerCase())) return false;
      if (typeFilter !== "all" && !row.reminderTypeLabel.toLowerCase().includes(typeFilter)) return false;
      if (channelFilter !== "all" && row.channel !== channelFilter) return false;
      if (statusFilter !== "all" && row.record?.status !== statusFilter && row.source === "record")
        return false;
      if (priorityFilter !== "all" && row.priority !== REMINDER_PRIORITY_LABELS[priorityFilter as keyof typeof REMINDER_PRIORITY_LABELS])
        return false;
      if (moduleFilter !== "all" && row.queueItem?.entityType !== moduleFilter && row.record?.entityType !== moduleFilter)
        return false;
      if (dateFrom && row.dueDate && row.dueDate < dateFrom) return false;
      if (dateTo && row.dueDate && row.dueDate > dateTo) return false;

      if (quickFilter === "due_today") return row.dueDate === today || row.source === "queue";
      if (quickFilter === "appointment") return row.queueItem?.entityType === "appointment";
      if (quickFilter === "payment") return row.queueItem?.entityType === "payment" && !row.queueItem.templateCode.includes("overdue");
      if (quickFilter === "payment_overdue") return row.queueItem?.templateCode.includes("overdue") || row.isOverdue;
      if (quickFilter === "diagnosis") return row.queueItem?.entityType === "diagnosis";
      if (quickFilter === "report") return row.queueItem?.entityType === "report";
      if (quickFilter === "evaluation")
        return ["evaluation_reminder", "history_taking_reminder", "parent_info_reminder"].includes(
          row.queueItem?.templateCode ?? ""
        );
      if (quickFilter === "task") return row.queueItem?.entityType === "task";
      if (quickFilter === "failed") return row.record?.status === "failed" || row.isOverdue;
      if (quickFilter === "completed_week")
        return row.record && ["sent", "copied", "completed"].includes(row.record.status);

      if (q) {
        const hay = `${row.childLabel} ${row.parentLabel} ${row.reminderTypeLabel} ${row.relatedLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    rows,
    childQ,
    parentQ,
    typeFilter,
    channelFilter,
    statusFilter,
    priorityFilter,
    moduleFilter,
    dateFrom,
    dateTo,
    quickFilter,
    searchQ,
    today,
  ]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpen = useCallback(
    (row: (typeof rows)[0]) => {
      if (row.payload) {
        openReminder(row.payload);
        return;
      }
      if (row.record) {
        openReminder({
          templateCode: row.record.templateCode,
          entityType: row.record.entityType,
          entityId: row.record.entityId,
          childId: row.record.childId,
          childLabel: row.record.childLabel,
          recipientName: row.record.recipientName,
          recipientPhone: row.record.recipientPhone,
          recipientEmail: row.record.recipientEmail,
          context: {
            parent_name: row.record.recipientName,
            child_name: row.record.childLabel ?? "—",
            center_name: "Κέντρο",
            center_phone: "",
            center_email: "",
          },
          suggestedChannel: row.record.channel,
        });
      }
    },
    [openReminder]
  );

  const handleQueueSend = (row: (typeof rows)[0]) => {
    if (!row.payload || !canMutate) return;
    createReminderFromPayload(row.payload, row.payload.suggestedChannel ?? "sms", "pending");
    openReminder(row.payload);
  };

  const handleCopyRow = async (row: (typeof rows)[0]) => {
    if (!row.record || !canMutate) return;
    const consent = getConsentForChild(row.record.childId);
    if (!channelAllowed(consent, row.record.channel)) return;
    await copyMessage(row.record.id, row.record.messageBody, row.record.channel);
  };

  if (!canView) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Δεν έχετε δικαίωμα προβολής υπενθυμίσεων.
      </p>
    );
  }

  const selectedRecordIds = [...selected].filter((id) => enrichedReminders.some((r) => r.id === id));

  return (
    <div className="space-y-4">
      <ReminderDashboardKpis metrics={metrics} activeFilter={quickFilter} onFilter={setQuickFilter} />

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Αναζήτηση παιδιού, γονέα, τύπου…"
          className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Παιδί"
          className="w-32 rounded-lg border px-2 py-2 text-sm"
          value={childQ}
          onChange={(e) => setChildQ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Γονέας"
          className="w-32 rounded-lg border px-2 py-2 text-sm"
          value={parentQ}
          onChange={(e) => setParentQ(e.target.value)}
        />
        <select
          className="rounded-lg border px-2 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Όλοι οι τύποι</option>
          {REMINDER_TYPES.map((t) => (
            <option key={t.code} value={t.labelEl}>
              {t.labelEl}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border px-2 py-2 text-sm"
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
        >
          <option value="all">Όλα τα κανάλια</option>
          {(["sms", "email", "whatsapp", "viber", "phone_call"] as ReminderChannel[]).map((c) => (
            <option key={c} value={c}>
              {REMINDER_CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border px-2 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReminderStatus | "all")}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border px-2 py-2 text-sm"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="all">Όλα τα modules</option>
          <option value="appointment">Ραντεβού</option>
          <option value="payment">Πληρωμές</option>
          <option value="diagnosis">Γνωματεύσεις</option>
          <option value="report">Αναφορές</option>
          <option value="task">Εργασίες</option>
        </select>
        <input type="date" className="rounded-lg border px-2 py-2 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="rounded-lg border px-2 py-2 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canMutate ? (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-clinical-700 px-3 py-1.5 text-xs font-semibold text-white"
              disabled={selectedRecordIds.length === 0}
              onClick={() => bulkMarkSent(selectedRecordIds, "sms")}
            >
              <Check className="h-3.5 w-3.5" />
              Μαζική «στάλθηκε»
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-ink-muted"
              disabled={selectedRecordIds.length === 0}
              onClick={() => bulkCancel(selectedRecordIds)}
            >
              Ακύρωση επιλεγμένων
            </button>
          </>
        ) : null}
        {canExport ? (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              onClick={() => exportTodayRemindersExcel(enrichedReminders, today)}
            >
              <Download className="h-3.5 w-3.5" />
              Excel σήμερα
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              onClick={() => exportOverdueRemindersExcel(enrichedReminders)}
            >
              Excel εκπρόθεσμα
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              onClick={() => printMonthlyReminderReportPdf(enrichedReminders, today.slice(0, 7))}
            >
              <FileText className="h-3.5 w-3.5" />
              PDF μήνας
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="ml-auto text-xs font-semibold text-clinical-700"
          onClick={() => setShowTemplates((v) => !v)}
        >
          {showTemplates ? "Απόκρυψη προτύπων" : "Πρότυπα μηνυμάτων"}
        </button>
      </div>

      {showTemplates ? <ReminderTemplatesPanel roleCodes={roleCodes} /> : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-surface-muted text-[11px] uppercase text-ink-muted">
            <tr>
              {canMutate ? <th className="w-8 px-2 py-2" /> : null}
              <th className="px-3 py-2">Προθεσμία</th>
              <th className="px-3 py-2">Παιδί</th>
              <th className="px-3 py-2">Γονέας</th>
              <th className="px-3 py-2">Τύπος</th>
              <th className="px-3 py-2">Κανάλι</th>
              <th className="px-3 py-2">Κατάσταση</th>
              <th className="px-3 py-2">Προτεραιότητα</th>
              <th className="px-3 py-2">Σχετικό</th>
              <th className="px-3 py-2">Ενέργειες</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-ink-muted">
                  Δεν βρέθηκαν υπενθυμίσεις με τα τρέχοντα φίλτρα.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const record = row.record;
                const consent = record ? getConsentForChild(record.childId) : null;
                const warn = record ? consentWarning(consent, record.channel) : null;
                const channelLabel =
                  REMINDER_CHANNEL_LABELS_EXT[row.channel as ReminderChannel] ??
                  REMINDER_CHANNEL_LABELS[row.channel as ReminderChannel] ??
                  row.channel;

                return (
                  <tr
                    key={row.rowId}
                    className={row.isOverdue ? "bg-red-50/50" : row.isUrgent ? "bg-amber-50/40" : undefined}
                  >
                    {canMutate ? (
                      <td className="px-2 py-2">
                        {record ? (
                          <input
                            type="checkbox"
                            checked={selected.has(record.id)}
                            onChange={() => toggleSelect(record.id)}
                          />
                        ) : null}
                      </td>
                    ) : null}
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      {row.dueDate ?? "—"}
                      {row.dueTime ? ` ${row.dueTime}` : ""}
                    </td>
                    <td className="px-3 py-2 font-medium">{row.childLabel}</td>
                    <td className="px-3 py-2">{row.parentLabel}</td>
                    <td className="px-3 py-2 text-xs">{row.reminderTypeLabel}</td>
                    <td className="px-3 py-2 text-xs">{channelLabel}</td>
                    <td className="px-3 py-2">
                      <ReminderStatusBadge
                        status={record?.status ?? "pending"}
                        overdue={row.isOverdue}
                      />
                    </td>
                    <td className="px-3 py-2 text-xs">{row.priority}</td>
                    <td className="max-w-[140px] truncate px-3 py-2 text-xs text-ink-muted" title={row.relatedLabel}>
                      {row.relatedLabel}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {row.source === "queue" ? (
                          <button
                            type="button"
                            className="rounded bg-clinical-700 px-2 py-0.5 text-[11px] font-semibold text-white"
                            onClick={() => handleQueueSend(row)}
                          >
                            Αποστολή
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-clinical-700"
                              onClick={() => handleOpen(row)}
                            >
                              Προβολή
                            </button>
                            {record && canMutate ? (
                              <>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-ink"
                                  title={warn ?? undefined}
                                  disabled={!!warn && record.channel !== "phone_call"}
                                  onClick={() => handleCopyRow(row)}
                                >
                                  <Copy className="h-3 w-3" />
                                  Αντιγραφή
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] font-semibold text-emerald-800"
                                  onClick={() => markSent(record.id, record.channel, record.messageBody)}
                                >
                                  Στάλθηκε
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] font-semibold text-ink-muted"
                                  onClick={() => markCompleted(record.id)}
                                >
                                  Ολοκλ.
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] text-ink-muted"
                                  onClick={() => setPreviewBody(record.messageBody)}
                                >
                                  Κείμενο
                                </button>
                                {record.childId ? (
                                  <NewCommunicationLink
                                    params={{
                                      childId: record.childId,
                                      childLabel: record.childLabel ?? row.childLabel,
                                    }}
                                    size="sm"
                                  />
                                ) : null}
                                <button
                                  type="button"
                                  className="text-[11px] text-red-700"
                                  onClick={() => cancelReminder(record.id)}
                                >
                                  Ακύρωση
                                </button>
                              </>
                            ) : null}
                          </>
                        )}
                      </div>
                      {warn ? <p className="mt-0.5 text-[10px] text-amber-800">{warn}</p> : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {previewBody ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-ink">Προεπισκόπηση μηνύματος</h3>
              <button type="button" onClick={() => setPreviewBody(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-ink">{previewBody}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
