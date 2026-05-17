import type { EnrichedReminder } from "./normalize";
import { REMINDER_STATUS_LABELS_EXT } from "./labels";
import { REMINDER_CHANNEL_LABELS } from "./config";

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

function reminderRows(records: EnrichedReminder[]): string[][] {
  return [
    ["Ημερομηνία", "Ώρα", "Παιδί", "Γονέας", "Τύπος", "Κανάλι", "Κατάσταση", "Προτεραιότητα"],
    ...records.map((r) => [
      r.scheduledDate ?? r.createdAt.slice(0, 10),
      r.scheduledTime ?? "",
      r.childLabel ?? "",
      r.parentLabel ?? r.recipientName,
      r.templateLabel,
      REMINDER_CHANNEL_LABELS[r.channel],
      REMINDER_STATUS_LABELS_EXT[r.status] ?? r.status,
      r.priority,
    ]),
  ];
}

export function exportTodayRemindersExcel(records: EnrichedReminder[], todayYmd: string) {
  const today = records.filter((r) => r.isDueToday || r.scheduledDate === todayYmd);
  downloadCsv(`reminders-today-${todayYmd}.csv`, reminderRows(today));
}

export function exportOverdueRemindersExcel(records: EnrichedReminder[]) {
  downloadCsv(
    `reminders-overdue-${new Date().toISOString().slice(0, 10)}.csv`,
    reminderRows(records.filter((r) => r.isOverdue))
  );
}

export function printChildReminderHistoryPdf(childLabel: string, records: EnrichedReminder[]) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = records
    .map(
      (r) =>
        `<tr><td>${r.scheduledDate ?? ""}</td><td>${r.templateLabel}</td><td>${REMINDER_STATUS_LABELS_EXT[r.status] ?? r.status}</td><td>${r.channel}</td></tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Υπενθυμίσεις</title>
<style>body{font-family:system-ui;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px}</style></head>
<body><h1>Ιστορικό υπενθυμίσεων — ${childLabel}</h1>
<table><thead><tr><th>Ημερομηνία</th><th>Τύπος</th><th>Κατάσταση</th><th>Κανάλι</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.print()</script></body></html>`);
  w.document.close();
}

export function printMonthlyReminderReportPdf(records: EnrichedReminder[], monthLabel: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  const sent = records.filter((r) => ["sent", "copied", "completed"].includes(r.status)).length;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Αναφορά υπενθυμίσεων</title></head>
<body style="font-family:system-ui;padding:24px"><h1>Μηνιαία αναφορά υπενθυμίσεων — ${monthLabel}</h1>
<p>Σύνολο εγγραφών: ${records.length}</p><p>Ολοκληρωμένες: ${sent}</p>
<script>window.print()</script></body></html>`);
  w.document.close();
}
