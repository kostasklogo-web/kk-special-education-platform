import type { SecretaryMeeting } from "@/lib/secretary/types";
import { MEETING_STATUS_LABELS } from "./labels";
import { LOCATION_LABELS } from "@/lib/secretary/labels";

export function exportMeetingSummaryPdf(m: SecretaryMeeting) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${m.title}</title></head>
<body style="font-family:system-ui;padding:24px">
<h1>${m.title}</h1>
<p><strong>Τύπος:</strong> ${m.meetingTypeLabel}</p>
<p><strong>Ημερομηνία:</strong> ${m.meetingDate} ${m.startTime}–${m.endTime}</p>
<p><strong>Τοποθεσία:</strong> ${LOCATION_LABELS[m.locationCode]}</p>
<p><strong>Κατάσταση:</strong> ${MEETING_STATUS_LABELS[m.status]}</p>
<p><strong>Συμμετέχοντες:</strong> ${m.participants.join(", ")}</p>
<p><strong>Ατζέντα:</strong><br/>${(m.agenda || "—").replace(/\n/g, "<br/>")}</p>
${m.minutes?.summary ? `<p><strong>Πρακτικά:</strong><br/>${m.minutes.summary.replace(/\n/g, "<br/>")}</p>` : ""}
<script>window.print()</script></body></html>`);
  w.document.close();
}
