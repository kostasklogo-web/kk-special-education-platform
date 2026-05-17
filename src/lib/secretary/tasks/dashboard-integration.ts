import type { SecretaryDashboardData } from "@/lib/secretary/types";
import type { SecretaryTask } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { computeTaskDashboardMetrics } from "./calculations";
import { taskCategory } from "./calculations";
import { isActiveStatus } from "./calculations";

export function mergeDashboardWithTasks(
  base: SecretaryDashboardData,
  tasks: SecretaryTask[]
): SecretaryDashboardData {
  const today = todayAthensYmd();
  const m = computeTaskDashboardMetrics(tasks, today);

  const kpis = base.kpis.map((k) => {
    switch (k.id) {
      case "urgent_tasks":
        return { ...k, value: m.urgent, helper: `${m.overdue} εκπρόθεσμα` };
      default:
        return k;
    }
  });

  const taskAlerts: SecretaryDashboardData["urgentAlerts"] = tasks
    .filter((t) => isActiveStatus(t.status) && (t.status === "overdue" || t.priority === "urgent"))
    .slice(0, 4)
    .map((t) => ({
      id: `task-alert-${t.id}`,
      title: t.status === "overdue" ? "Εκπρόθεσμη εργασία" : "Επείγουσα εργασία",
      detail: `${t.title} · ${t.childLabel ?? "—"}`,
      alertLevel: "red" as const,
      href: `/secretary/tasks?task=${t.id}`,
    }));

  const todayTasks = tasks.filter((t) => isActiveStatus(t.status) && t.dueDate === today).length;
  if (todayTasks > 0) {
    taskAlerts.unshift({
      id: "tasks-today",
      title: "Εργασίες σήμερα",
      detail: `${todayTasks} προθεσμίες σήμερα`,
      alertLevel: "yellow",
      href: "/secretary/tasks?filter=due_today",
    });
  }

  const waiting = tasks.filter((t) => t.status === "waiting_response").length;
  if (waiting > 0) {
    taskAlerts.push({
      id: "tasks-waiting",
      title: "Αναμονή απάντησης",
      detail: `${waiting} εργασίες`,
      alertLevel: "yellow",
      href: "/secretary/tasks?filter=waiting_response",
    });
  }

  if (m.paymentRelated > 0) {
    taskAlerts.push({
      id: "tasks-payment",
      title: "Follow-up πληρωμών",
      detail: `${m.paymentRelated} ανοιχτές`,
      alertLevel: "red",
      href: "/secretary/tasks?filter=payment",
    });
  }

  if (m.diagnosisRelated > 0) {
    taskAlerts.push({
      id: "tasks-diagnosis",
      title: "Ανανέωση διαγνώσεων",
      detail: `${m.diagnosisRelated} εργασίες`,
      alertLevel: "yellow",
      href: "/secretary/tasks?filter=diagnosis",
    });
  }

  if (m.reportRelated > 0) {
    taskAlerts.push({
      id: "tasks-report",
      title: "Αναφορές σε εξέλιξη",
      detail: `${m.reportRelated} εργασίες`,
      alertLevel: "yellow",
      href: "/secretary/tasks?filter=report",
    });
  }

  return {
    ...base,
    kpis,
    urgentAlerts: [...taskAlerts, ...base.urgentAlerts].slice(0, 8),
  };
}

export function tasksForDashboardSection(tasks: SecretaryTask[]) {
  const today = todayAthensYmd();
  return {
    metrics: computeTaskDashboardMetrics(tasks, today),
    today: tasks.filter((t) => isActiveStatus(t.status) && t.dueDate === today),
    overdue: tasks.filter((t) => t.status === "overdue"),
    urgent: tasks.filter((t) => isActiveStatus(t.status) && t.priority === "urgent"),
    waiting: tasks.filter((t) => t.status === "waiting_response"),
    payment: tasks.filter((t) => isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "payment"),
    diagnosis: tasks.filter((t) => isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "diagnosis"),
    report: tasks.filter((t) => isActiveStatus(t.status) && taskCategory(t.taskTypeCode) === "report"),
  };
}
