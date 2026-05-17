import type { DiagnosisDocument } from "@/lib/secretary/types";
import { DIAGNOSIS_STATUS_LABELS } from "./labels";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import { formatDateEl } from "@/lib/ui/child-labels";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function diagnosesToCsv(rows: DiagnosisDocument[]): string {
  const header = [
    "Παιδί",
    "Τοποθεσία",
    "Τύπος",
    "Περιγραφή",
    "Αρχή έκδοσης",
    "Λήξη",
    "Ημέρες",
    "Κατάσταση",
    "Υπεύθυνος",
  ];
  const lines = rows.map((d) =>
    [
      d.childLabel,
      LOCATION_LABELS[d.locationCode],
      d.documentType,
      d.diagnosisDescription,
      d.issuingAuthority,
      d.issueDate ? formatDateEl(d.issueDate) : "",
      formatDateEl(d.expiryDate),
      d.daysUntilExpiry,
      DIAGNOSIS_STATUS_LABELS[d.status],
      d.responsiblePersonLabel ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function exportActiveDiagnosesExcel(docs: DiagnosisDocument[], filename = "gnwmateuseis-energes.csv") {
  const active = docs.filter((d) => !d.archived && d.status !== "archived");
  downloadBlob(filename, new Blob(["\uFEFF" + diagnosesToCsv(active)], { type: "text/csv;charset=utf-8" }));
}

export function exportExpiringDiagnosesExcel(docs: DiagnosisDocument[], filename = "gnwmateuseis-lpigoun.csv") {
  const rows = docs.filter(
    (d) => !d.archived && ["expiring_60", "expiring_30", "expiring_7"].includes(d.status)
  );
  downloadBlob(filename, new Blob(["\uFEFF" + diagnosesToCsv(rows)], { type: "text/csv;charset=utf-8" }));
}

export function exportExpiredDiagnosesExcel(docs: DiagnosisDocument[], filename = "gnwmateuseis-ligmena.csv") {
  const rows = docs.filter((d) => !d.archived && d.status === "expired");
  downloadBlob(filename, new Blob(["\uFEFF" + diagnosesToCsv(rows)], { type: "text/csv;charset=utf-8" }));
}

export function exportRenewalFollowUpExcel(
  docs: DiagnosisDocument[],
  filename = "gnwmateuseis-ananeoseis.csv"
) {
  const rows = docs.filter(
    (d) => d.renewalProcessStarted || (d.renewalRequired && d.daysUntilExpiry <= 60 && !d.renewedAt)
  );
  downloadBlob(filename, new Blob(["\uFEFF" + diagnosesToCsv(rows)], { type: "text/csv;charset=utf-8" }));
}

export function printChildDiagnosisHistoryPdf(childLabel: string, docs: DiagnosisDocument[]) {
  const rows = docs
    .filter((d) => d.childLabel === childLabel)
    .map(
      (d) =>
        `<tr><td>${d.documentType}</td><td>${d.expiryDate}</td><td>${DIAGNOSIS_STATUS_LABELS[d.status]}</td><td>${d.issuingAuthority}</td></tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/><title>Γνωματεύσεις — ${childLabel}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;text-align:left}</style></head>
<body><h1>Ιστορικό γνωματεύσεων — ${childLabel}</h1><table><thead><tr><th>Τύπος</th><th>Λήξη</th><th>Κατάσταση</th><th>Αρχή έκδοσης</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.print();
}
