"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileText, Plus, MoreHorizontal } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { CommunicationLog, SecretaryTask, TaskPriority, TaskStatus } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { LOCATION_FILTER_OPTIONS, type LocationFilter } from "@/lib/secretary/schedule-catalog";
import { SECRETARY_TASK_TYPES } from "@/lib/secretary/tasks/catalog";
import { computeTaskDashboardMetrics, isActiveStatus, linkedItemLabel, taskCategory } from "@/lib/secretary/tasks/calculations";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/secretary/tasks/labels";
import { getAllTasks, TASKS_UPDATED_EVENT, upsertTask } from "@/lib/secretary/tasks/store";
import { syncCommunicationOnTaskComplete } from "@/lib/secretary/communications/store";
import { useSecretaryTasks } from "@/components/secretary/tasks/TasksChargeProvider";
import {
  exportOverdueTasksExcel,
  exportTaskListExcel,
  printChildTaskHistoryPdf,
  printWeeklyTaskReportPdf,
} from "@/lib/secretary/tasks/export";
import { canExportTaskReports, canManageTasks } from "@/lib/secretary/tasks/permissions";
import { formatDateEl } from "@/lib/ui/child-labels";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import { buildTaskCommunicationPayload } from "@/components/secretary/reminders/communication-builders";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { TaskDashboardKpis } from "./TaskDashboardKpis";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { CreateTaskModal, type TaskDraftPrefill } from "./CreateTaskModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { CompleteCommunicationModal } from "./CompleteCommunicationModal";
import { taskTypeRequiresCommLog } from "@/lib/secretary/tasks/catalog";
import { ChildDiagnosisBadge } from "@/components/secretary/diagnoses/ChildDiagnosisBadge";
import { TaskDiagnosisBadge } from "@/components/secretary/diagnoses/TaskDiagnosisBadge";
import { TaskReportBadge } from "@/components/secretary/reports/TaskReportBadge";

type QuickFilter =
  | "open"
  | "due_today"
  | "overdue"
  | "urgent"
  | "waiting_response"
  | "completed_week"
  | "report"
  | "payment"
  | "diagnosis"
  | "school_doctor"
  | null;

type Props = { roleCodes: RoleCode[] };

export function TasksWorkspace({ roleCodes }: Props) {
  const searchParams = useSearchParams();
  const today = todayAthensYmd();
  const tasks = useSecretaryTasks();
  const payments = usePaymentCharges();
  const { consents, openReminder, appendCommunicationLog } = useReminders();

  const canMutate = canManageTasks(roleCodes);
  const canExport = canExportTaskReports(roleCodes);

  const [, setTick] = useState(0);
  const [location, setLocation] = useState<LocationFilter>("omilos");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [childQ, setChildQ] = useState(
    () => searchParams.get("child") ?? searchParams.get("childId") ?? ""
  );
  const [parentQ, setParentQ] = useState("");
  const [dueFrom, setDueFrom] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(() => searchParams.get("filter") === "overdue");
  const [dueTodayOnly, setDueTodayOnly] = useState(() => searchParams.get("filter") === "due_today");
  const [waitingOnly, setWaitingOnly] = useState(() => searchParams.get("filter") === "waiting_response");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [linkedDiagnosisFilter, setLinkedDiagnosisFilter] = useState<string | null>(null);
  const [linkedReportFilter, setLinkedReportFilter] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(() => searchParams.get("action") === "create");
  const [createPrefill, setCreatePrefill] = useState<TaskDraftPrefill | undefined>();
  const [selected, setSelected] = useState<SecretaryTask | null>(null);
  const [commComplete, setCommComplete] = useState<SecretaryTask | null>(null);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(TASKS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(TASKS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "payment" || f === "diagnosis" || f === "report") {
      setQuickFilter(f);
    } else if (f === "due_today") {
      setDueTodayOnly(true);
    } else if (f === "overdue") {
      setOverdueOnly(true);
    } else if (f === "waiting_response") {
      setWaitingOnly(true);
    }
    const taskId = searchParams.get("task");
    if (taskId) {
      const t = tasks.find((x) => x.id === taskId) ?? getAllTasks(today).find((x) => x.id === taskId);
      if (t) setSelected(t);
    }
    const childIdParam = searchParams.get("childId");
    if (childIdParam) setChildQ(childIdParam);

    const diagnosisId = searchParams.get("diagnosis");
    if (diagnosisId) setLinkedDiagnosisFilter(diagnosisId);
    const reportId = searchParams.get("report");
    if (reportId) setLinkedReportFilter(reportId);

    const paymentId = searchParams.get("payment");
    if (paymentId && searchParams.get("action") === "create") {
      const pay = payments.find((p) => p.id === paymentId);
      if (pay) {
        setCreatePrefill({
          taskTypeCode: "payment_followup",
          title: `Follow-up πληρωμής — ${pay.childLabel}`,
          childId: pay.childId,
          childLabel: pay.childLabel,
          parentLabel: pay.parentLabel,
          locationCode: pay.locationCode,
          linkedPaymentId: pay.id,
          priority: "high",
        });
        setCreateOpen(true);
      }
    }
  }, [searchParams, payments, today, tasks]);

  const metrics = useMemo(() => computeTaskDashboardMetrics(tasks, today), [tasks, today]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (location !== "omilos" && t.locationCode !== location) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.taskTypeCode !== typeFilter) return false;
      if (assigneeFilter !== "all" && t.assignedToLabel !== assigneeFilter) return false;
      if (linkedDiagnosisFilter && t.linkedDiagnosisId !== linkedDiagnosisFilter) return false;
      if (childQ && !(t.childLabel ?? "").toLowerCase().includes(childQ.toLowerCase())) return false;
      if (parentQ && !(t.parentLabel ?? "").toLowerCase().includes(parentQ.toLowerCase())) return false;
      if (dueFrom && t.dueDate && t.dueDate < dueFrom) return false;
      if (overdueOnly && t.status !== "overdue") return false;
      if (dueTodayOnly && t.dueDate !== today) return false;
      if (waitingOnly && t.status !== "waiting_response") return false;

      if (quickFilter === "open") return isActiveStatus(t.status) && t.status !== "overdue";
      if (quickFilter === "due_today") return isActiveStatus(t.status) && t.dueDate === today;
      if (quickFilter === "overdue") return t.status === "overdue";
      if (quickFilter === "urgent") return isActiveStatus(t.status) && t.priority === "urgent";
      if (quickFilter === "waiting_response") return t.status === "waiting_response";
      if (quickFilter === "completed_week") return t.status === "completed";
      if (quickFilter === "report") return isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "report";
      if (quickFilter === "payment") return isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "payment";
      if (quickFilter === "diagnosis") return isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "diagnosis";
      if (quickFilter === "school_doctor")
        return (
          isActiveStatus(t.status) &&
          ["call_school", "call_doctor", "call_teacher", "call_parallel"].includes(t.taskTypeCode)
        );
      return true;
    });
  }, [
    tasks,
    location,
    priorityFilter,
    statusFilter,
    typeFilter,
    assigneeFilter,
    childQ,
    parentQ,
    dueFrom,
    overdueOnly,
    dueTodayOnly,
    waitingOnly,
    quickFilter,
    linkedDiagnosisFilter,
    linkedReportFilter,
    today,
  ]);

  const assignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignedToLabel).filter(Boolean))] as string[],
    [tasks]
  );

  const patchTask = (task: SecretaryTask) => {
    upsertTask(task, today);
    refresh();
    setSelected((s) => (s?.id === task.id ? task : s));
  };

  const setStatus = (task: SecretaryTask, status: TaskStatus) => {
    patchTask({
      ...task,
      status,
      completionDate: status === "completed" ? today : task.completionDate,
      updatedAt: new Date().toISOString(),
    });
    if (status === "completed") {
      syncCommunicationOnTaskComplete(task.id, task.outcome, today);
      setSelected(null);
    }
  };

  const finishWithComm = (outcome: string) => {
    if (!commComplete) return;
    patchTask({
      ...commComplete,
      status: "completed",
      completionDate: today,
      outcome,
      updatedAt: new Date().toISOString(),
    });
    syncCommunicationOnTaskComplete(commComplete.id, outcome, today);
    setCommComplete(null);
    setSelected(null);
  };

  const sendReminder = (task: SecretaryTask) => {
    if (!task.childId) return;
    openReminder(buildTaskCommunicationPayload(task, consents));
  };

  const copyReminder = async (task: SecretaryTask) => {
    const msg =
      task.reminderMessage ??
      `Υπενθύμιση: ${task.title} — ${task.childLabel ?? ""} — προθεσμία ${task.dueDate ?? today}`;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      /* ignore */
    }
    patchTask({
      ...task,
      reminderStatus: "scheduled",
      reminderMessage: msg,
      updatedAt: new Date().toISOString(),
    });
  };

  const markReminderSent = (task: SecretaryTask) => {
    patchTask({
      ...task,
      reminderStatus: "sent",
      updatedAt: new Date().toISOString(),
    });
  };

  const addFollowUp = (task: SecretaryTask) => {
    const date = window.prompt("Ημερομηνία follow-up (YYYY-MM-DD):", task.followUpDate ?? today);
    if (!date) return;
    patchTask({ ...task, followUpDate: date, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">Κέντρο ελέγχου καθημερινών εργασιών γραμματείας</p>
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
            Νέα εργασία
          </button>
        ) : null}
      </div>

      <TaskDashboardKpis metrics={metrics} activeFilter={quickFilter} onFilter={setQuickFilter} />

      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface-muted/30 p-3">
        <span className="w-full text-xs font-semibold uppercase text-ink-muted">Φίλτρα</span>
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
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλες οι προτεραιότητες</option>
          {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {TASK_PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλες οι καταστάσεις</option>
          {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {TASK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="max-w-[220px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλοι οι τύποι</option>
          {SECRETARY_TASK_TYPES.map((t) => (
            <option key={t.code} value={t.code}>
              {t.labelEl}
            </option>
          ))}
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
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
          type="date"
          value={dueFrom}
          onChange={(e) => setDueFrom(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          aria-label="Προθεσμία από"
        />
        <input
          placeholder="Παιδί"
          value={childQ}
          onChange={(e) => setChildQ(e.target.value)}
          className="min-w-[100px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Γονέας"
          value={parentQ}
          onChange={(e) => setParentQ(e.target.value)}
          className="min-w-[100px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />
          Εκπρόθεσμες
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={dueTodayOnly} onChange={(e) => setDueTodayOnly(e.target.checked)} />
          Σήμερα
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
            onClick={() => exportTaskListExcel(filtered, `ergasies-${today}.csv`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Λίστα (Excel)
          </button>
          <button
            type="button"
            onClick={() => exportOverdueTasksExcel(tasks)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Εκπρόθεσμες (Excel)
          </button>
          <button
            type="button"
            onClick={() => printWeeklyTaskReportPdf(filtered, `Εβδομάδα ${today}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
          >
            <FileText className="h-3.5 w-3.5" />
            Εβδομαδιαία (PDF)
          </button>
          {childQ ? (
            <button
              type="button"
              onClick={() =>
                printChildTaskHistoryPdf(
                  childQ,
                  tasks.filter((t) => (t.childLabel ?? "").toLowerCase().includes(childQ.toLowerCase()))
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
            >
              <FileText className="h-3.5 w-3.5" />
              Ιστορικό παιδιού (PDF)
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="min-w-[1200px] w-full text-left text-sm">
          <thead className="bg-surface-muted/50 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2">Προτεραιότητα</th>
              <th className="px-3 py-2">Προθεσμία</th>
              <th className="px-3 py-2">Παιδί</th>
              <th className="px-3 py-2">Γονέας</th>
              <th className="px-3 py-2">Τύπος</th>
              <th className="px-3 py-2">Υπεύθυνος</th>
              <th className="px-3 py-2">Ζητήθηκε</th>
              <th className="px-3 py-2">Κατάσταση</th>
              <th className="px-3 py-2">Σύνδεση</th>
              <th className="px-3 py-2">Σημ.</th>
              <th className="px-3 py-2">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-ink-muted">
                  Δεν βρέθηκαν εργασίες.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-t border-border/60 hover:bg-surface-muted/20">
                  <td className="px-3 py-2">
                    <TaskPriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                    {t.dueDate ? formatDateEl(t.dueDate) : "—"}
                    {t.dueTime ? ` ${t.dueTime}` : ""}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-medium">{t.childLabel ?? "—"}</span>
                      {t.childId ? <ChildDiagnosisBadge childId={t.childId} compact /> : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-ink-muted">{t.parentLabel ?? "—"}</td>
                  <td className="max-w-[160px] px-3 py-2" title={t.taskTypeLabel}>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="truncate">{t.taskTypeLabel}</span>
                      <TaskDiagnosisBadge task={t} />
                      <TaskReportBadge task={t} />
                    </div>
                  </td>
                  <td className="px-3 py-2">{t.assignedToLabel ?? "—"}</td>
                  <td className="px-3 py-2 text-ink-muted">{t.requestedByLabel ?? "—"}</td>
                  <td className="px-3 py-2">
                    <TaskStatusBadge status={t.status} />
                  </td>
                  <td className="px-3 py-2">{linkedItemLabel(t)}</td>
                  <td className="max-w-[100px] truncate px-3 py-2 text-ink-muted" title={t.notes}>
                    {t.notes || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setSelected(t)}
                        className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-surface-muted"
                      >
                        Άνοιγμα
                      </button>
                      {canMutate && t.status !== "completed" ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              taskTypeRequiresCommLog(t.taskTypeCode) && t.status !== "completed"
                                ? setCommComplete(t)
                                : setStatus(t, "completed")
                            }
                            className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900"
                          >
                            Ολοκλ.
                          </button>
                          <button
                            type="button"
                            onClick={() => sendReminder(t)}
                            className="rounded border border-border p-1"
                            title="Υπενθύμιση"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : null}
                      {t.childId ? (
                        <CreateReminderButton
                          payload={buildTaskCommunicationPayload(t, consents)}
                          size="sm"
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

      {createOpen ? (
        <CreateTaskModal
          prefill={createPrefill}
          onClose={() => setCreateOpen(false)}
          onCreated={() => refresh()}
        />
      ) : null}

      {selected ? (
        <TaskDetailModal
          task={selected}
          consents={consents}
          canMutate={canMutate}
          onClose={() => setSelected(null)}
          onSave={patchTask}
          onStatusChange={setStatus}
          onCompleteWithComm={setCommComplete}
          onFollowUp={addFollowUp}
          onCopyReminder={copyReminder}
          onMarkReminderSent={markReminderSent}
        />
      ) : null}

      {commComplete ? (
        <CompleteCommunicationModal
          task={commComplete}
          onClose={() => setCommComplete(null)}
          onSubmit={finishWithComm}
        />
      ) : null}
    </div>
  );
}
