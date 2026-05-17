import type { SecretaryMeeting } from "@/lib/secretary/types";
import { MEETING_STATUS_LABELS, MEETING_PRIORITY_LABELS } from "./labels";
import { LOCATION_LABELS } from "@/lib/secretary/labels";

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

function meetingRows(meetings: SecretaryMeeting[]): string[][] {
  return [
    ["Ημερομηνία", "Ώρα", "Τύπος", "Τίτλος", "Τοποθεσία", "Συμμετέχοντες", "Παιδί", "Προτεραιότητα", "Κατάσταση"],
    ...meetings.map((m) => [
      m.meetingDate,
      `${m.startTime}-${m.endTime}`,
      m.meetingTypeLabel,
      m.title,
      LOCATION_LABELS[m.locationCode],
      m.participants.join("; "),
      m.childLabel ?? "",
      MEETING_PRIORITY_LABELS[m.priority],
      MEETING_STATUS_LABELS[m.status],
    ]),
  ];
}

export function exportMeetingsExcel(meetings: SecretaryMeeting[], filename: string) {
  downloadCsv(filename, meetingRows(meetings));
}

export function printTodayMeetingsPdf(meetings: SecretaryMeeting[], dateLabel: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = meetings
    .map(
      (m) =>
        `<tr><td>${m.startTime}</td><td>${m.meetingTypeLabel}</td><td>${m.title}</td><td>${m.participants.join(", ")}</td></tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Συναντήσεις</title>
<style>body{font-family:system-ui;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px}</style></head>
<body><h1>Συναντήσεις — ${dateLabel}</h1><table><thead><tr><th>Ώρα</th><th>Τύπος</th><th>Τίτλος</th><th>Συμμετέχοντες</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.print()</script></body></html>`);
  w.document.close();
}

export function printChildMeetingHistoryPdf(childLabel: string, meetings: SecretaryMeeting[]) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = meetings
    .map(
      (m) =>
        `<tr><td>${m.meetingDate}</td><td>${m.meetingTypeLabel}</td><td>${MEETING_STATUS_LABELS[m.status]}</td></tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ιστορικό συναντήσεων</title></head>
<body style="font-family:system-ui;padding:24px"><h1>Ιστορικό συναντήσεων — ${childLabel}</h1>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>Ημερομηνία</th><th>Τύπος</th><th>Κατάσταση</th></tr>${rows}</table>
<script>window.print()</script></body></html>`);
  w.document.close();
}

export function printSupervisionHistoryPdf(therapistLabel: string, meetings: SecretaryMeeting[]) {
  const supervision = meetings.filter((m) =>
    ["individual_supervision", "group_supervision", "case_supervision"].includes(m.meetingTypeCode)
  );
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = supervision
    .map(
      (m) =>
        `<tr><td>${m.meetingDate}</td><td>${m.meetingTypeLabel}</td><td>${m.title}</td><td>${MEETING_STATUS_LABELS[m.status]}</td></tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ιστορικό εποπτείας</title></head>
<body style="font-family:system-ui;padding:24px"><h1>Ιστορικό εποπτείας — ${therapistLabel}</h1>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>Ημερομηνία</th><th>Τύπος</th><th>Τίτλος</th><th>Κατάσταση</th></tr>${rows}</table>
<script>window.print()</script></body></html>`);
  w.document.close();
}

export function printMonthlySupervisionReportPdf(monthLabel: string, meetings: SecretaryMeeting[]) {
  const clinical = meetings.filter((m) => m.isClinical);
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = clinical
    .map(
      (m) =>
        `<tr><td>${m.meetingDate}</td><td>${m.staffMemberLabel ?? "—"}</td><td>${m.meetingTypeLabel}</td><td>${MEETING_STATUS_LABELS[m.status]}</td></tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Μηνιαία έκθεση εποπτείας</title></head>
<body style="font-family:system-ui;padding:24px"><h1>Μηνιαία έκθεση εποπτείας — ${monthLabel}</h1>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>Ημερομηνία</th><th>Θεραπευτής</th><th>Τύπος</th><th>Κατάσταση</th></tr>${rows}</table>
<script>window.print()</script></body></html>`);
  w.document.close();
}

export function printUnresolvedDecisionsReportPdf(
  rows: { meetingTitle: string; meetingDate: string; text: string; responsiblePersonLabel: string; dueDate: string | null; status: string }[]
) {
  const w = window.open("", "_blank");
  if (!w) return;
  const body = rows
    .map(
      (r) =>
        `<tr><td>${r.meetingDate}</td><td>${r.meetingTitle}</td><td>${r.text}</td><td>${r.responsiblePersonLabel}</td><td>${r.dueDate ?? "—"}</td><td>${r.status}</td></tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Εκκρεμείς διοικητικές αποφάσεις</title></head>
<body style="font-family:system-ui;padding:24px"><h1>Διοίκηση — εκκρεμείς αποφάσεις</h1>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
<thead><tr><th>Ημ/νία</th><th>Συνάντηση</th><th>Απόφαση</th><th>Υπεύθυνος</th><th>Προθεσμία</th><th>Κατάσταση</th></tr></thead>
<tbody>${body || "<tr><td colspan=6>Δεν υπάρχουν εκκρεμείς αποφάσεις</td></tr>"}</tbody></table>
<script>window.print()</script></body></html>`);
  w.document.close();
}

export function exportDecisionsExcel(meetings: SecretaryMeeting[]) {
  const rows: string[][] = [
    ["Συνάντηση", "Απόφαση", "Υπεύθυνος", "Προθεσμία", "Κατάσταση"],
  ];
  for (const m of meetings) {
    for (const d of m.decisions) {
      rows.push([m.title, d.text, d.responsiblePersonLabel, d.dueDate ?? "", d.status]);
    }
  }
  downloadCsv(`meeting-decisions-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}
