/**
 * Static demo therapist–child assignments (client-safe).
 * Mutable prototype state lives in server-only demo-store.ts.
 */

import { disciplineLabelEl } from "@/lib/data/therapist-assignments/disciplines";
import type { TherapistChildAssignment } from "@/lib/data/therapist-assignments/types";
import {
  DEMO_CLINICAL_CHILD_B_ID,
  DEMO_CLINICAL_CHILD_ID,
} from "@/lib/demo/clinical-demo-ids";

export const DEMO_DEV_THERAPIST_USER_ID = "00000000-0000-0000-0000-000000000000";
export const DEMO_THERAPIST_B_USER_ID = "00000000-0000-4000-8000-000000000201";
export const DEMO_SUPERVISOR_USER_ID = "00000000-0000-4000-8000-000000000301";

/** Supervisee user ids for demo supervisor scope (not session-derived). */
export function getDemoSuperviseeUserIds(supervisorUserId: string): string[] {
  if (supervisorUserId === DEMO_SUPERVISOR_USER_ID) {
    return [DEMO_DEV_THERAPIST_USER_ID, DEMO_THERAPIST_B_USER_ID];
  }
  if (supervisorUserId === DEMO_DEV_THERAPIST_USER_ID) {
    return [DEMO_THERAPIST_B_USER_ID];
  }
  return [];
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/** Immutable seed rows for an organization (clone before mutating on server). */
export function buildDemoTherapistAssignmentsSeed(
  organizationId: string
): TherapistChildAssignment[] {
  const now = new Date().toISOString();
  return [
    {
      id: "asg-demo-001",
      organizationId,
      childId: DEMO_CLINICAL_CHILD_ID,
      therapistUserId: DEMO_DEV_THERAPIST_USER_ID,
      therapistDisplayName: "Τοπικός Χρήστης (dev)",
      disciplineCode: "speech_therapy",
      disciplineLabelEl: disciplineLabelEl("speech_therapy"),
      assignmentRole: "primary_therapist",
      status: "active",
      startsAt: isoDaysAgo(120),
      endsAt: null,
      assignmentSource: "manual",
      assignedByUserId: DEMO_SUPERVISOR_USER_ID,
      assignedByDisplayName: "Επόπτης Demo",
      assignmentReason: "Έναρξη λογοθεραπείας",
      endedReason: null,
      notes: "Κύρια ανάθεση λογοθεραπείας.",
      supervisorUserId: DEMO_SUPERVISOR_USER_ID,
      supervisorDisplayName: "Επόπτης Demo",
      canViewConfidential: false,
      createdAt: isoDaysAgo(120),
      updatedAt: now,
    },
    {
      id: "asg-demo-002",
      organizationId,
      childId: DEMO_CLINICAL_CHILD_ID,
      therapistUserId: DEMO_THERAPIST_B_USER_ID,
      therapistDisplayName: "Μαρία Εργοθεραπεύτρια",
      disciplineCode: "occupational_therapy",
      disciplineLabelEl: disciplineLabelEl("occupational_therapy"),
      assignmentRole: "co_therapist",
      status: "active",
      startsAt: isoDaysAgo(90),
      endsAt: null,
      assignmentSource: "manual",
      assignedByUserId: DEMO_SUPERVISOR_USER_ID,
      assignedByDisplayName: "Επόπτης Demo",
      assignmentReason: "Διεπιστημονική εργοθεραπεία",
      endedReason: null,
      notes: null,
      supervisorUserId: DEMO_SUPERVISOR_USER_ID,
      supervisorDisplayName: "Επόπτης Demo",
      canViewConfidential: false,
      createdAt: isoDaysAgo(90),
      updatedAt: now,
    },
    {
      id: "asg-demo-003",
      organizationId,
      childId: DEMO_CLINICAL_CHILD_ID,
      therapistUserId: "00000000-0000-4000-8000-000000000401",
      therapistDisplayName: "Γιάννης Ψυχολόγος (πρώην)",
      disciplineCode: "psychology",
      disciplineLabelEl: disciplineLabelEl("psychology"),
      assignmentRole: "primary_therapist",
      status: "ended",
      startsAt: isoDaysAgo(400),
      endsAt: isoDaysAgo(60),
      assignmentSource: "manual",
      assignedByUserId: DEMO_SUPERVISOR_USER_ID,
      assignedByDisplayName: "Επόπτης Demo",
      assignmentReason: "Αρχική ψυχολογική αξιολόγηση",
      endedReason: "transfer",
      notes: "Ιστορική ανάθεση — πρόσβαση λήγει αυτόματα.",
      supervisorUserId: DEMO_SUPERVISOR_USER_ID,
      supervisorDisplayName: "Επόπτης Demo",
      canViewConfidential: false,
      createdAt: isoDaysAgo(400),
      updatedAt: isoDaysAgo(60),
    },
    {
      id: "asg-demo-004",
      organizationId,
      childId: DEMO_CLINICAL_CHILD_B_ID,
      therapistUserId: DEMO_DEV_THERAPIST_USER_ID,
      therapistDisplayName: "Τοπικός Χρήστης (dev)",
      disciplineCode: "psychotherapy",
      disciplineLabelEl: disciplineLabelEl("psychotherapy"),
      assignmentRole: "primary_therapist",
      status: "active",
      startsAt: isoDaysAgo(30),
      endsAt: isoDaysFromNow(14),
      assignmentSource: "temporary",
      assignedByUserId: DEMO_SUPERVISOR_USER_ID,
      assignedByDisplayName: "Επόπτης Demo",
      assignmentReason: "Προσωρινή κάλυψη",
      endedReason: null,
      notes: "Προσωρινή ανάθεση — λήγει σε 14 ημέρες.",
      supervisorUserId: DEMO_SUPERVISOR_USER_ID,
      supervisorDisplayName: "Επόπτης Demo",
      canViewConfidential: false,
      createdAt: isoDaysAgo(30),
      updatedAt: now,
    },
    {
      id: "asg-demo-005",
      organizationId,
      childId: DEMO_CLINICAL_CHILD_ID,
      therapistUserId: DEMO_SUPERVISOR_USER_ID,
      therapistDisplayName: "Επόπτης Demo",
      disciplineCode: null,
      disciplineLabelEl: null,
      assignmentRole: "supervisor_oversight",
      status: "active",
      startsAt: isoDaysAgo(200),
      endsAt: null,
      assignmentSource: "manual",
      assignedByUserId: DEMO_DEV_THERAPIST_USER_ID,
      assignedByDisplayName: "Σύστημα",
      assignmentReason: "Εποπτεία ομάδας",
      endedReason: null,
      notes: "Σύνδεση επόπτη με φάκελο (όχι θεραπευτική συνεδρία).",
      supervisorUserId: null,
      supervisorDisplayName: null,
      canViewConfidential: true,
      createdAt: isoDaysAgo(200),
      updatedAt: now,
    },
  ];
}
