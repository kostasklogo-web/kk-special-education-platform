import type { SecretaryMeeting } from "@/lib/secretary/types";
import { emptyMinutes } from "./calculations";

/** Enrich demo meetings with governance sample data when not overridden in localStorage. */
export function applyDemoGovernanceSeed(m: SecretaryMeeting, hasUserOverride: boolean): SecretaryMeeting {
  if (hasUserOverride) return m;

  switch (m.id) {
    case "meet-demo-2":
      return {
        ...m,
        staffMemberLabel: "Βασιλείου Ν.",
        status: "needs_minutes",
        minutesMissing: true,
        followUpRequired: true,
      };
    case "meet-demo-3":
      return {
        ...m,
        clinicalRiskFlag: true,
        isEmergency: true,
        priority: "urgent",
        staffMemberLabel: "Κωνσταντίνου Ε.",
      };
    case "meet-demo-4":
      return {
        ...m,
        status: "needs_followup",
        organizerLabel: "Γενικός Διευθυντής",
        staffMemberLabel: null,
        departmentSpecialty: "Διοίκηση",
        minutes: {
          ...emptyMinutes(),
          summary: "Εξετάστηκαν λειτουργικά θέματα εβδομάδας.",
          mainIssues: "Προσωπικό, χώροι, πληρωμές.",
          decisionsText: "Αναθέσεις follow-up σε γραμματεία και διοίκηση.",
          followUpActions: "Ενημέρωση ομάδας έως Παρασκευή.",
        },
        minutesMissing: false,
        followUpRequired: true,
        hrRiskFlag: false,
        decisions: [
          {
            id: "dec-demo-1",
            text: "Έλεγχος εκκρεμών πληρωμών έως Παρασκευή",
            responsiblePersonLabel: "Γραμματεία",
            dueDate: m.meetingDate,
            childId: null,
            childLabel: null,
            staffLabel: null,
            department: "Διοίκηση",
            status: "open",
            linkedTaskId: null,
          },
          {
            id: "dec-demo-2",
            text: "Σύνταξη μηνιαίας έκθεσης εποπτείας",
            responsiblePersonLabel: "Κλινικός Διευθυντής",
            dueDate: m.meetingDate,
            childId: null,
            childLabel: null,
            staffLabel: null,
            department: "Διοίκηση",
            status: "in_progress",
            linkedTaskId: null,
          },
        ],
      };
    default:
      return m;
  }
}
