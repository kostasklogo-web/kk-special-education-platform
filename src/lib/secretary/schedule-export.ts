import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";
import { formatAthensLongDateFromYmd } from "@/lib/schedule/athens-civil";
import type { SecretaryAppointment } from "./types";
import { APPOINTMENT_STATUS_LABELS, LOCATION_LABELS, REMINDER_STATUS_LABELS } from "./labels";
import { appointmentYmdAthens, sortAppointmentsByStart } from "./schedule-utils";
import { downloadCsv, rowsToCsv } from "./exports";

export function exportAppointmentsExcel(
  appointments: SecretaryAppointment[],
  filenameBase: string
): void {
  const headers = [
    "Ημερομηνία",
    "Ώρα έναρξης",
    "Ώρα λήξης",
    "Παιδί",
    "Γονέας",
    "Τύπος",
    "Τοποθεσία",
    "Αίθουσα",
    "Προσωπικό",
    "Κατάσταση",
    "Υπενθύμιση",
    "Σημειώσεις",
  ];
  const rows = [...appointments].sort(sortAppointmentsByStart).map((a) => [
    appointmentYmdAthens(a),
    formatAthensTimeEl(a.startsAt),
    formatAthensTimeEl(a.endsAt),
    a.childLabel ?? "",
    a.parentLabel ?? "",
    a.appointmentTypeLabel,
    LOCATION_LABELS[a.locationCode],
    a.roomLabel ?? "",
    a.staffLabels.join("; "),
    APPOINTMENT_STATUS_LABELS[a.status],
    REMINDER_STATUS_LABELS[a.reminderStatus],
    a.notes,
  ]);
  downloadCsv(`${filenameBase}.csv`, rowsToCsv(headers, rows));
}

export function printDailySchedule(
  appointments: SecretaryAppointment[],
  dateYmd: string,
  locationLabel: string
): void {
  const dayAppts = appointments
    .filter((a) => appointmentYmdAthens(a) === dateYmd)
    .sort(sortAppointmentsByStart);

  const rows = dayAppts
    .map(
      (a) => `
      <tr>
        <td>${formatAthensTimeEl(a.startsAt)} – ${formatAthensTimeEl(a.endsAt)}</td>
        <td><strong>${a.childLabel ?? "—"}</strong><br/><span class="muted">${a.parentLabel ?? ""}</span></td>
        <td>${a.appointmentTypeLabel}</td>
        <td>${LOCATION_LABELS[a.locationCode]}${a.roomLabel ? ` · ${a.roomLabel}` : ""}</td>
        <td>${a.staffLabels[0] ?? "—"}</td>
        <td>${APPOINTMENT_STATUS_LABELS[a.status]}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/>
    <title>Πρόγραμμα ${dateYmd}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      .sub { color: #555; font-size: 13px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #f3f4f6; }
      .muted { color: #666; font-size: 11px; }
      @media print { body { padding: 12px; } }
    </style></head><body>
    <h1>Ημερήσιο πρόγραμμα — ${formatAthensLongDateFromYmd(dateYmd)}</h1>
    <p class="sub">${locationLabel} · ${dayAppts.length} ραντεβού · Ωράριο 13:00–21:00</p>
    <table>
      <thead><tr>
        <th>Ώρα</th><th>Παιδί / Γονέας</th><th>Τύπος</th><th>Τοποθεσία</th><th>Προσωπικό</th><th>Κατάσταση</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="6">Δεν υπάρχουν ραντεβού.</td></tr>'}</tbody>
    </table>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>`;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
