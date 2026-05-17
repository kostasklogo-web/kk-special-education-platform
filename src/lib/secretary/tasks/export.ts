import type { SecretaryTask } from "@/lib/secretary/types";
import { downloadCsv, rowsToCsv } from "@/lib/secretary/exports";
import { formatDateEl } from "@/lib/ui/child-labels";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "./labels";
import { linkedItemLabel } from "./calculations";
import { isActiveStatus } from "./calculations";

export function exportTaskListExcel(tasks: SecretaryTask[], filename: string) {
  const headers = [
    "Προτεραιότητα",
    "Προθεσμία",
    "Παιδί",
    "Γονέας",
    "Τύπος",
    "Τίτλος",
    "Υπεύθυνος",
    "Κατάσταση",
    "Σύνδεση",
  ];
  const rows = tasks.map((t) => [
    TASK_PRIORITY_LABELS[t.priority],
    t.dueDate ? formatDateEl(t.dueDate) : "",
    t.childLabel ?? "",
    t.parentLabel ?? "",
    t.taskTypeLabel,
    t.title,
    t.assignedToLabel ?? "",
    TASK_STATUS_LABELS[t.status],
    linkedItemLabel(t),
  ]);
  downloadCsv(filename, rowsToCsv(headers, rows));
}

export function exportOverdueTasksExcel(tasks: SecretaryTask[]) {
  const overdue = tasks.filter((t) => t.status === "overdue");
  exportTaskListExcel(overdue, `ekkremeis-ergasies-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function printWeeklyTaskReportPdf(tasks: SecretaryTask[], weekLabel: string) {
  const active = tasks.filter((t) => isActiveStatus(t.status));
  const rows = active
    .map(
      (t) =>
        `<tr><td>${TASK_PRIORITY_LABELS[t.priority]}</td><td>${t.dueDate ?? "—"}</td><td>${t.childLabel ?? "—"}</td><td>${t.title}</td><td>${TASK_STATUS_LABELS[t.status]}</td></tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/><title>Εργασίες ${weekLabel}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;font-size:13px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:6px} th{background:#f5f5f5}</style></head>
    <body><h1>Εβδομαδιαία αναφορά εργασιών</h1><p>${weekLabel}</p>
    <table><thead><tr><th>Προτεραιότητα</th><th>Προθεσμία</th><th>Παιδί</th><th>Εργασία</th><th>Κατάσταση</th></tr></thead><tbody>${rows}</tbody></table>
    <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export function printChildTaskHistoryPdf(childLabel: string, tasks: SecretaryTask[]) {
  const rows = tasks
    .map(
      (t) =>
        `<tr><td>${formatDateEl(t.dueDate ?? t.createdAt.slice(0, 10))}</td><td>${t.taskTypeLabel}</td><td>${t.title}</td><td>${TASK_STATUS_LABELS[t.status]}</td><td>${t.outcome ?? (t.notes.slice(0, 40) || "—")}</td></tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/><title>Εργασίες ${childLabel}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;font-size:13px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:6px}</style></head>
    <body><h1>Ιστορικό εργασιών — ${childLabel}</h1>
    <table><thead><tr><th>Ημ/νία</th><th>Τύπος</th><th>Τίτλος</th><th>Κατάσταση</th><th>Αποτέλεσμα</th></tr></thead><tbody>${rows || "<tr><td colspan=5>—</td></tr>"}</tbody></table>
    <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
