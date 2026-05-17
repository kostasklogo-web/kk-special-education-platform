import type { TaskPriority, TaskStatus } from "@/lib/secretary/types";
import type { TaskTypeCategory } from "./catalog";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/secretary/labels";

export { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS };

export const TASK_STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  open: "bg-sky-100 text-sky-900 border-sky-200",
  in_progress: "bg-indigo-100 text-indigo-900 border-indigo-200",
  waiting_response: "bg-amber-100 text-amber-950 border-amber-200",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cancelled: "bg-zinc-200 text-zinc-600 border-zinc-300",
  overdue: "bg-red-100 text-red-900 border-red-200",
};

export const TASK_PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  low: "bg-zinc-100 text-zinc-700 border-zinc-200",
  normal: "bg-slate-100 text-slate-800 border-slate-200",
  high: "bg-amber-100 text-amber-950 border-amber-200",
  urgent: "bg-red-950 text-red-50 border-red-900",
};

export const TASK_CATEGORY_LABELS: Record<TaskTypeCategory, string> = {
  communication: "Επικοινωνία",
  report: "Αναφορές",
  payment: "Πληρωμές",
  diagnosis: "Διαγνώσεις",
  clinical: "Κλινικά",
  internal: "Εσωτερικά",
  other: "Άλλο",
};
