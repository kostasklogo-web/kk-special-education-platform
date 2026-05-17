import type { AlertLevel, SecretaryTask, TaskStatus } from "@/lib/secretary/types";
import { taskTypeByCode, type TaskTypeCategory } from "./catalog";

export function daysBetweenYmd(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T12:00:00.000Z`) - Date.parse(`${from}T12:00:00.000Z`)) / 86400000
  );
}

export function isActiveStatus(status: TaskStatus): boolean {
  return !["completed", "cancelled"].includes(status);
}

export function computeTaskStatus(
  task: Pick<SecretaryTask, "status" | "dueDate" | "completionDate">,
  todayYmd: string
): TaskStatus {
  if (task.status === "completed" || task.status === "cancelled") return task.status;
  if (task.dueDate && daysBetweenYmd(task.dueDate, todayYmd) > 0) return "overdue";
  return task.status;
}

export function alertLevelForTask(task: SecretaryTask, todayYmd: string): AlertLevel {
  const status = computeTaskStatus(task, todayYmd);
  if (status === "completed") return "green";
  if (status === "cancelled") return "green";
  if (status === "waiting_response") return "yellow";
  if (status === "overdue") {
    return task.priority === "urgent" ? "red" : "red";
  }
  if (task.dueDate) {
    const dueIn = daysBetweenYmd(todayYmd, task.dueDate);
    if (dueIn <= 1 && dueIn >= 0) return "yellow";
  }
  if (task.priority === "urgent") return "red";
  if (task.priority === "high") return "yellow";
  return "green";
}

export function isUrgentOverdue(task: SecretaryTask, todayYmd: string): boolean {
  return (
    task.priority === "urgent" &&
    computeTaskStatus(task, todayYmd) === "overdue"
  );
}

export function taskCategory(code: string): TaskTypeCategory {
  return taskTypeByCode(code)?.category ?? "other";
}

export function enrichTask(task: SecretaryTask, todayYmd: string): SecretaryTask {
  const status = computeTaskStatus(task, todayYmd);
  return {
    ...task,
    status,
    alertLevel: alertLevelForTask({ ...task, status }, todayYmd),
  };
}

export type TaskDashboardMetrics = {
  open: number;
  dueToday: number;
  overdue: number;
  urgent: number;
  waitingResponse: number;
  completedThisWeek: number;
  reportRelated: number;
  paymentRelated: number;
  diagnosisRelated: number;
  schoolDoctorComm: number;
};

function weekStartYmd(todayYmd: string): string {
  const d = new Date(`${todayYmd}T12:00:00.000Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

export function computeTaskDashboardMetrics(tasks: SecretaryTask[], todayYmd: string): TaskDashboardMetrics {
  const weekStart = weekStartYmd(todayYmd);
  const enriched = tasks.map((t) => enrichTask(t, todayYmd));

  return {
    open: enriched.filter((t) => isActiveStatus(t.status) && t.status !== "overdue").length,
    dueToday: enriched.filter(
      (t) => isActiveStatus(t.status) && t.dueDate === todayYmd
    ).length,
    overdue: enriched.filter((t) => t.status === "overdue").length,
    urgent: enriched.filter(
      (t) => isActiveStatus(t.status) && (t.priority === "urgent" || isUrgentOverdue(t, todayYmd))
    ).length,
    waitingResponse: enriched.filter((t) => t.status === "waiting_response").length,
    completedThisWeek: enriched.filter(
      (t) =>
        t.status === "completed" &&
        t.completionDate &&
        t.completionDate >= weekStart &&
        t.completionDate <= todayYmd
    ).length,
    reportRelated: enriched.filter(
      (t) => isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "report"
    ).length,
    paymentRelated: enriched.filter(
      (t) => isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "payment"
    ).length,
    diagnosisRelated: enriched.filter(
      (t) => isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "diagnosis"
    ).length,
    schoolDoctorComm: enriched.filter(
      (t) =>
        isActiveStatus(t.status) &&
        ["call_school", "call_doctor", "call_teacher", "call_parallel"].includes(t.taskTypeCode)
    ).length,
  };
}

export function linkedItemLabel(task: SecretaryTask): string {
  if (task.linkedPaymentId) return "Πληρωμή";
  if (task.linkedDiagnosisId) return "Διάγνωση";
  if (task.linkedReportId) return "Αναφορά";
  if (task.linkedAppointmentId) return "Ραντεβού";
  return "—";
}
