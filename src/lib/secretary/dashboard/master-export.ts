import { downloadCsv, rowsToCsv } from "@/lib/secretary/exports";
import { exportOverdueListExcel } from "@/lib/secretary/payments/export";
import { exportActiveDiagnosesExcel } from "@/lib/secretary/diagnoses/export";
import { exportTaskListExcel } from "@/lib/secretary/tasks/export";
import type { DashboardActionRow } from "./master-model";
import type { PaymentObligation } from "@/lib/secretary/types";
import type { DiagnosisDocument } from "@/lib/secretary/types";
import type { SecretaryTask } from "@/lib/secretary/types";

function printHtml(title: string, bodyHtml: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;color:#111}
      h1{font-size:18px;margin:0 0 8px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
      th{background:#f4f4f5}
      .meta{color:#666;font-size:11px;margin-bottom:16px}
    </style></head><body>
    <h1>${title}</h1>
    <p class="meta">Ημερομηνία εκτύπωσης: ${new Date().toLocaleString("el-GR")} · GDPR watermark</p>
    ${bodyHtml}
    </body></html>`);
  w.document.close();
  w.print();
}

function actionRowsTable(rows: DashboardActionRow[]): string {
  if (rows.length === 0) return "<p>Δεν υπάρχουν εγγραφές.</p>";
  const head = `<tr><th>Παιδί</th><th>Γονέας</th><th>Τίτλος</th><th>Προτεραιότητα</th><th>Λήξη</th><th>Κατάσταση</th></tr>`;
  const body = rows
    .map(
      (r) =>
        `<tr><td>${r.childLabel ?? "—"}</td><td>${r.parentLabel ?? "—"}</td><td>${r.title}</td><td>${r.priority}</td><td>${r.dueLabel}</td><td>${r.statusLabel}</td></tr>`
    )
    .join("");
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

export function exportTodayActionListPdf(rows: DashboardActionRow[], dateLabel: string) {
  printHtml(`Λίστα ενεργειών — ${dateLabel}`, actionRowsTable(rows));
}

export function exportWeeklyOperationsPdf(rows: DashboardActionRow[], weekLabel: string) {
  printHtml(`Εβδομαδιαία λειτουργία γραμματείας — ${weekLabel}`, actionRowsTable(rows));
}

export function exportOverduePaymentsExcel(charges: PaymentObligation[], todayYmd: string) {
  exportOverdueListExcel(charges, todayYmd);
}

export function exportDiagnosisRenewalListExcel(docs: DiagnosisDocument[]) {
  const renewing = docs.filter((d) => !d.archived && d.renewalRequired);
  exportActiveDiagnosesExcel(renewing);
}

export function exportPendingTasksExcel(tasks: SecretaryTask[], todayYmd: string) {
  const open = tasks.filter((t) => !["completed", "cancelled"].includes(t.status));
  exportTaskListExcel(open, `ergasies-ekkremeis-${todayYmd}.csv`);
}

export function exportDashboardSearchCsv(rows: DashboardActionRow[], filename: string) {
  const headers = ["Παιδί", "Γονέας", "Τίτλος", "Module", "Προτεραιότητα", "Λήξη", "Κατάσταση"];
  const data = rows.map((r) => [
    r.childLabel ?? "",
    r.parentLabel ?? "",
    r.title,
    r.module,
    r.priority,
    r.dueLabel,
    r.statusLabel,
  ]);
  downloadCsv(filename, rowsToCsv(headers, data));
}
