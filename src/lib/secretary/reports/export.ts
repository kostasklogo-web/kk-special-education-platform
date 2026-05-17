import type { ReportRequest } from "@/lib/secretary/types";
import { REPORT_STATUS_LABELS, REPORT_PRIORITY_LABELS } from "./labels";
import { isOpenReport } from "./calculations";

function downloadCsv(filename: string, rows: string[][]) {
  const bom = "\uFEFF";
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function reportRows(reports: ReportRequest[]): string[][] {
  return [
    [
      "Παιδί",
      "Τύπος",
      "Αιτήθηκε από",
      "Θεραπευτής",
      "Επόπτης",
      "Αίτηση",
      "Προθεσμία",
      "Ημέρες",
      "Προτεραιότητα",
      "Κατάσταση",
    ],
    ...reports.map((r) => [
      r.childLabel,
      r.reportTypeLabel,
      r.requestedBy,
      r.assignedTherapistLabel ?? "—",
      r.assignedSupervisorLabel ?? "—",
      r.requestDate,
      r.dueDate ?? "—",
      r.daysUntilDue !== null ? String(r.daysUntilDue) : "—",
      REPORT_PRIORITY_LABELS[r.priority],
      REPORT_STATUS_LABELS[r.status],
    ]),
  ];
}

export function exportOpenReportsExcel(reports: ReportRequest[]) {
  downloadCsv(
    `open-reports-${new Date().toISOString().slice(0, 10)}.csv`,
    reportRows(reports.filter(isOpenReport))
  );
}

export function exportOverdueReportsExcel(reports: ReportRequest[]) {
  downloadCsv(
    `overdue-reports-${new Date().toISOString().slice(0, 10)}.csv`,
    reportRows(reports.filter((r) => r.isOverdue && isOpenReport(r)))
  );
}

export function exportReportStatusListExcel(reports: ReportRequest[]) {
  downloadCsv(`report-status-${new Date().toISOString().slice(0, 10)}.csv`, reportRows(reports));
}

export function printChildReportHistoryPdf(childLabel: string, reports: ReportRequest[]) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = reports
    .map(
      (r) =>
        `<tr><td>${r.reportTypeLabel}</td><td>${REPORT_STATUS_LABELS[r.status]}</td><td>${r.requestDate}</td><td>${r.dueDate ?? "—"}</td><td>${r.deliveryDate ?? "—"}</td></tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ιστορικό αναφορών</title>
<style>body{font-family:system-ui,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}h1{font-size:18px}</style></head>
<body><h1>Ιστορικό αναφορών — ${childLabel}</h1>
<table><thead><tr><th>Τύπος</th><th>Κατάσταση</th><th>Αίτηση</th><th>Προθεσμία</th><th>Παράδοση</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.print()</script></body></html>`);
  w.document.close();
}

/** Print/export single approved or delivered report for archive. */
export function exportApprovedReportPdf(report: ReportRequest) {
  const w = window.open("", "_blank");
  if (!w) return;
  const fileLine = report.finalFileName
    ? `<p><strong>Αρχείο:</strong> ${report.finalFileName}</p>`
    : "";
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${report.reportTypeLabel}</title>
<style>body{font-family:system-ui,sans-serif;padding:32px;max-width:720px;margin:0 auto}h1{font-size:20px}dl{display:grid;grid-template-columns:140px 1fr;gap:8px;font-size:14px}.meta{color:#555;margin-top:24px;font-size:12px}</style></head>
<body>
<h1>${report.reportTypeLabel}</h1>
<p><strong>Παιδί:</strong> ${report.childLabel}</p>
<p><strong>Κατάσταση:</strong> ${REPORT_STATUS_LABELS[report.status]}</p>
<p><strong>Προθεσμία:</strong> ${report.dueDate ?? "—"}</p>
<p><strong>Σκοπός:</strong> ${report.purpose || "—"}</p>
${fileLine}
<p class="meta">Εγκεκριμένη τελική αναφορά · ${report.updatedAt.slice(0, 10)}</p>
<script>window.print()</script>
</body></html>`);
  w.document.close();
}

export function printMonthlyProductivityPdf(reports: ReportRequest[], monthLabel: string) {
  const delivered = reports.filter((r) => r.status === "delivered");
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Παραγωγικότητα αναφορών</title>
<style>body{font-family:system-ui,sans-serif;padding:24px}h1{font-size:18px}.kpi{display:flex;gap:24px;margin:16px 0}</style></head>
<body><h1>Παραγωγικότητα αναφορών — ${monthLabel}</h1>
<div class="kpi"><p><strong>Παραδόθηκαν:</strong> ${delivered.length}</p>
<p><strong>Ανοιχτά:</strong> ${reports.filter(isOpenReport).length}</p>
<p><strong>Εκπρόθεσμα:</strong> ${reports.filter((r) => r.isOverdue).length}</p></div>
<script>window.print()</script></body></html>`);
  w.document.close();
}
