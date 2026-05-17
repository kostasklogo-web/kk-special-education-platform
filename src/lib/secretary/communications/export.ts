import type { CommunicationLog } from "@/lib/secretary/types";
import { downloadCsv, rowsToCsv } from "@/lib/secretary/exports";
import { formatDateEl } from "@/lib/ui/child-labels";
import {
  COMMUNICATION_PRIORITY_LABELS,
  COMMUNICATION_STATUS_LABELS,
} from "./labels";

export function exportCommunicationLogExcel(logs: CommunicationLog[], filename: string) {
  const headers = [
    "Ημερομηνία",
    "Ώρα",
    "Παιδί",
    "Γονέας",
    "Επαφή",
    "Ρόλος",
    "Τύπος",
    "Λόγος",
    "Κατάσταση",
    "Προτεραιότητα",
    "Follow-up",
    "Υπεύθυνος",
    "Περίληψη",
  ];
  const rows = logs.map((c) => [
    formatDateEl(c.communicationDate),
    c.communicationTime ?? "",
    c.childLabel ?? "",
    c.parentLabel ?? "",
    c.contactPerson,
    c.contactRole,
    c.communicationTypeLabel,
    c.reason,
    COMMUNICATION_STATUS_LABELS[c.status],
    COMMUNICATION_PRIORITY_LABELS[c.priority],
    c.followUpDate ? formatDateEl(c.followUpDate) : "",
    c.responsiblePersonLabel ?? "",
    c.summary,
  ]);
  downloadCsv(filename, rowsToCsv(headers, rows));
}

export function printChildCommunicationHistoryPdf(childLabel: string, logs: CommunicationLog[]) {
  const rows = logs
    .map(
      (c) =>
        `<tr><td>${formatDateEl(c.communicationDate)}</td><td>${c.communicationTypeLabel}</td><td>${c.contactPerson}</td><td>${c.reason}</td><td>${COMMUNICATION_STATUS_LABELS[c.status]}</td><td>${c.summary.slice(0, 80)}</td></tr>`
    )
    .join("");
  printHtml(
    `Ιστορικό επικοινωνιών — ${childLabel}`,
    `<table><thead><tr><th>Ημ/νία</th><th>Τύπος</th><th>Επαφή</th><th>Λόγος</th><th>Κατάσταση</th><th>Περίληψη</th></tr></thead><tbody>${rows || "<tr><td colspan=6>—</td></tr>"}</tbody></table>`
  );
}

export function printRoleCommunicationHistoryPdf(
  title: string,
  logs: CommunicationLog[]
) {
  const rows = logs
    .map(
      (c) =>
        `<tr><td>${formatDateEl(c.communicationDate)}</td><td>${c.childLabel ?? "—"}</td><td>${c.contactPerson}</td><td>${c.communicationTypeLabel}</td><td>${c.summary.slice(0, 60)}</td></tr>`
    )
    .join("");
  printHtml(
    title,
    `<table><thead><tr><th>Ημ/νία</th><th>Παιδί</th><th>Επαφή</th><th>Τύπος</th><th>Περίληψη</th></tr></thead><tbody>${rows}</tbody></table>`
  );
}

export function printWeeklyCommunicationReportPdf(logs: CommunicationLog[], weekLabel: string) {
  const rows = logs
    .map(
      (c) =>
        `<tr><td>${formatDateEl(c.communicationDate)}</td><td>${c.childLabel ?? "—"}</td><td>${c.contactPerson}</td><td>${c.communicationTypeLabel}</td><td>${COMMUNICATION_STATUS_LABELS[c.status]}</td></tr>`
    )
    .join("");
  printHtml(
    `Εβδομαδιαία αναφορά επικοινωνιών — ${weekLabel}`,
    `<table><thead><tr><th>Ημ/νία</th><th>Παιδί</th><th>Επαφή</th><th>Τύπος</th><th>Κατάσταση</th></tr></thead><tbody>${rows}</tbody></table>`
  );
}

function printHtml(title: string, tableHtml: string) {
  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;font-size:13px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:6px} th{background:#f5f5f5} h1{font-size:18px}</style></head>
    <body><h1>${title}</h1>${tableHtml}<script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
