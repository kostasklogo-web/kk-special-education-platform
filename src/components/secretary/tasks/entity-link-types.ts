export type EntityLink =
  | { kind: "child"; childId: string }
  | { kind: "payment"; paymentId: string; childId?: string | null }
  | { kind: "appointment"; appointmentId: string }
  | { kind: "diagnosis"; diagnosisId: string }
  | { kind: "report"; reportId: string }
  | { kind: "meeting"; meetingId: string };
