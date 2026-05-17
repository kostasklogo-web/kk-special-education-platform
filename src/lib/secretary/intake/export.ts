import type { ClientIntake } from "@/lib/secretary/types";
import { LEAD_STATUS_LABELS, URGENCY_LABELS } from "./labels";
import { downloadCsv, rowsToCsv } from "@/lib/secretary/exports";
import { formatDateEl, formatApproximateAgeYearsEl } from "@/lib/ui/child-labels";

export function exportIntakeListExcel(intakes: ClientIntake[], filename: string) {
  const headers = [
    "Κατάσταση",
    "Παιδί",
    "Ηλικία",
    "Γονέας",
    "Τηλέφωνο",
    "Email",
    "Λόγος",
    "Επείγον",
    "Ημερομηνία",
  ];
  const rows = intakes.map((i) => [
    LEAD_STATUS_LABELS[i.leadStatus],
    `${i.childFirstName} ${i.childLastName}`,
    formatApproximateAgeYearsEl(i.dateOfBirth),
    i.parentNames,
    i.phonePrimary,
    i.email ?? "",
    i.mainReason,
    URGENCY_LABELS[i.urgencyLevel],
    formatDateEl(i.submittedAt.slice(0, 10)),
  ]);
  downloadCsv(filename, rowsToCsv(headers, rows));
}

export function exportPendingLeadsExcel(intakes: ClientIntake[]) {
  const pending = intakes.filter(
    (i) => !["active_case", "active_client", "closed", "closed_unsuitable"].includes(i.leadStatus)
  );
  exportIntakeListExcel(pending, `ekkremei-leads-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function printIntakePdf(intake: ClientIntake) {
  const sections = [
    ["Παιδί", `${intake.childFirstName} ${intake.childLastName}`],
    ["Ημερομηνία γέννησης", intake.dateOfBirth ?? "—"],
    ["Ηλικία", formatApproximateAgeYearsEl(intake.dateOfBirth)],
    ["Γονέας", intake.parentNames],
    ["Τηλέφωνο", intake.phonePrimary],
    ["Δεύτερο τηλ.", intake.phoneSecondary ?? "—"],
    ["Email", intake.email ?? "—"],
    ["Διεύθυνση", intake.addressFull ?? intake.addressArea ?? "—"],
    ["Σχολείο", `${intake.schoolName ?? "—"} ${intake.schoolGrade ?? ""}`],
    ["Κύριος λόγος", intake.mainReason],
    ["Ανησυχίες", intake.parentConcerns ?? "—"],
    ["Παραπομπή", intake.referralSource ?? "—"],
    ["Διάγνωση", intake.hasExistingDiagnosis ? intake.diagnosisType ?? "Ναι" : "Όχι"],
    ["Λήξη διάγνωσης", intake.diagnosisExpiryDate ?? "—"],
    ["Θεραπείες", intake.currentTherapies ?? "—"],
    ["Υπηρεσίες", intake.interestedServices ?? "—"],
    ["Προτιμώμενες ώρες", intake.preferredTimes ?? "—"],
    ["Επείγον", URGENCY_LABELS[intake.urgencyLevel]],
    ["Κατάσταση", LEAD_STATUS_LABELS[intake.leadStatus]],
    ["Σημειώσεις", intake.notes ?? "—"],
  ];

  const rows = sections
    .map(
      ([label, value]) =>
        `<tr><th style="text-align:left;width:35%;padding:6px;border:1px solid #ddd;background:#f5f5f5">${label}</th><td style="padding:6px;border:1px solid #ddd">${value}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/>
    <title>Intake ${intake.childLastName}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px} h1{font-size:18px}</style></head>
    <body>
    <h1>Φόρμα Intake — ${intake.childFirstName} ${intake.childLastName}</h1>
    <p style="color:#555;font-size:13px">Ημερομηνία: ${formatDateEl(intake.submittedAt.slice(0, 10))}</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">${rows}</table>
    <script>window.onload=()=>window.print()</script>
    </body></html>`;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
