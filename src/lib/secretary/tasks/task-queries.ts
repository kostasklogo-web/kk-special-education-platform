import type { SecretaryTask, TaskStatus } from "@/lib/secretary/types";
import { enrichTask, isActiveStatus } from "./calculations";

export function isOpenTask(task: SecretaryTask): boolean {
  return isActiveStatus(task.status);
}

export function openTasksForChild(
  tasks: SecretaryTask[],
  childId: string,
  todayYmd: string
): SecretaryTask[] {
  return tasks
    .filter((t) => t.childId === childId && isOpenTask(enrichTask(t, todayYmd)))
    .map((t) => enrichTask(t, todayYmd))
    .sort((a, b) => {
      const da = a.dueDate ?? "9999-99-99";
      const db = b.dueDate ?? "9999-99-99";
      return da.localeCompare(db);
    });
}

export function tasksLinkedToPayment(tasks: SecretaryTask[], paymentId: string, todayYmd: string) {
  return tasks
    .filter((t) => t.linkedPaymentId === paymentId)
    .map((t) => enrichTask(t, todayYmd));
}

export function tasksLinkedToAppointment(tasks: SecretaryTask[], appointmentId: string, todayYmd: string) {
  return tasks
    .filter((t) => t.linkedAppointmentId === appointmentId)
    .map((t) => enrichTask(t, todayYmd));
}

export function tasksLinkedToDiagnosis(tasks: SecretaryTask[], diagnosisId: string, todayYmd: string) {
  return tasks
    .filter((t) => t.linkedDiagnosisId === diagnosisId)
    .map((t) => enrichTask(t, todayYmd));
}

export function tasksLinkedToReport(tasks: SecretaryTask[], reportId: string, todayYmd: string) {
  return tasks
    .filter((t) => t.linkedReportId === reportId)
    .map((t) => enrichTask(t, todayYmd));
}

export function tasksLinkedToMeeting(tasks: SecretaryTask[], meetingId: string, todayYmd: string) {
  return tasks
    .filter((t) => t.linkedMeetingId === meetingId)
    .map((t) => enrichTask(t, todayYmd));
}

export function openTasksLinkedToPayment(tasks: SecretaryTask[], paymentId: string, todayYmd: string) {
  return tasksLinkedToPayment(tasks, paymentId, todayYmd).filter((t) => isOpenTask(t));
}

export function openTasksLinkedToAppointment(
  tasks: SecretaryTask[],
  appointmentId: string,
  todayYmd: string
) {
  return tasksLinkedToAppointment(tasks, appointmentId, todayYmd).filter((t) => isOpenTask(t));
}

export function openTasksLinkedToDiagnosis(tasks: SecretaryTask[], diagnosisId: string, todayYmd: string) {
  return tasksLinkedToDiagnosis(tasks, diagnosisId, todayYmd).filter((t) => isOpenTask(t));
}

export function openTasksLinkedToMeeting(tasks: SecretaryTask[], meetingId: string, todayYmd: string) {
  return tasksLinkedToMeeting(tasks, meetingId, todayYmd).filter((t) => isOpenTask(t));
}

export function openTasksLinkedToReport(tasks: SecretaryTask[], reportId: string, todayYmd: string) {
  return tasksLinkedToReport(tasks, reportId, todayYmd).filter((t) => isOpenTask(t));
}

export function worstOpenTaskForChild(
  tasks: SecretaryTask[],
  childId: string,
  todayYmd: string
): SecretaryTask | null {
  const open = openTasksForChild(tasks, childId, todayYmd);
  if (open.length === 0) return null;
  return open.sort((a, b) => {
    const score = (t: SecretaryTask) => {
      let s = 0;
      if (t.status === "overdue") s += 100;
      if (t.priority === "urgent") s += 50;
      if (t.priority === "high") s += 20;
      if (t.status === "waiting_response") s += 10;
      return s;
    };
    return score(b) - score(a);
  })[0];
}

export type TaskBadgeTone = "neutral" | "warning" | "urgent";

export function taskBadgeTone(task: SecretaryTask): TaskBadgeTone {
  if (task.status === "overdue" || task.priority === "urgent") return "urgent";
  if (task.priority === "high" || task.status === "waiting_response") return "warning";
  return "neutral";
}

export function taskBadgeLabel(openCount: number, worst: SecretaryTask | null): string | null {
  if (openCount === 0) return null;
  if (openCount === 1 && worst) {
    if (worst.status === "overdue") return "Εκπρόθεσμη εργασία";
    if (worst.priority === "urgent") return "Επείγουσα εργασία";
    return "1 ανοιχτή εργασία";
  }
  return `${openCount} ανοιχτές εργασίες`;
}

export const TASK_BADGE_CLASS: Record<TaskBadgeTone, string> = {
  urgent: "border-red-900 bg-red-950 text-red-50",
  warning: "border-amber-300 bg-amber-100 text-amber-950",
  neutral: "border-sky-300 bg-sky-100 text-sky-900",
};

export function statusRank(status: TaskStatus): number {
  const order: TaskStatus[] = [
    "overdue",
    "waiting_response",
    "in_progress",
    "open",
    "completed",
    "cancelled",
  ];
  return order.indexOf(status);
}
