export type TaskTypeCategory =
  | "communication"
  | "report"
  | "payment"
  | "diagnosis"
  | "clinical"
  | "internal"
  | "other";

export type SecretaryTaskTypeDef = {
  code: string;
  labelEl: string;
  category: TaskTypeCategory;
  requiresCommunicationLog?: boolean;
};

export const SECRETARY_TASK_TYPES: SecretaryTaskTypeDef[] = [
  { code: "call_parent", labelEl: "Τηλεφωνική επικοινωνία με γονέα", category: "communication", requiresCommunicationLog: true },
  { code: "call_school", labelEl: "Τηλεφωνική επικοινωνία με σχολείο", category: "communication", requiresCommunicationLog: true },
  { code: "call_doctor", labelEl: "Τηλεφωνική επικοινωνία με γιατρό", category: "communication", requiresCommunicationLog: true },
  { code: "call_teacher", labelEl: "Τηλεφωνική επικοινωνία με δάσκαλο", category: "communication", requiresCommunicationLog: true },
  { code: "call_parallel", labelEl: "Τηλεφωνική επικοινωνία με παράλληλη στήριξη", category: "communication", requiresCommunicationLog: true },
  { code: "call_partner", labelEl: "Τηλεφωνική επικοινωνία με συνεργάτη", category: "communication", requiresCommunicationLog: true },
  { code: "report_request", labelEl: "Αίτημα αναφοράς προόδου", category: "report" },
  { code: "report_monitoring", labelEl: "Παρακολούθηση αναφοράς", category: "report" },
  { code: "report_review", labelEl: "Έλεγχος αναφοράς", category: "report" },
  { code: "report_delivery", labelEl: "Παράδοση αναφοράς", category: "report" },
  { code: "report_followup", labelEl: "Follow-up αναφοράς", category: "report" },
  { code: "evaluation_request", labelEl: "Αίτημα αξιολόγησης", category: "clinical" },
  { code: "reevaluation_request", labelEl: "Αίτημα επαναξιολόγησης", category: "clinical" },
  { code: "history_request", labelEl: "Αίτημα λήψης ιστορικού", category: "clinical" },
  { code: "parent_info_request", labelEl: "Αίτημα ενημερωτικού ραντεβού", category: "clinical" },
  { code: "payment_followup", labelEl: "Follow-up οικονομικής οφειλής", category: "payment" },
  { code: "diagnosis_followup", labelEl: "Follow-up γνωμάτευσης", category: "diagnosis" },
  { code: "supervision_schedule", labelEl: "Προγραμματισμός εποπτείας", category: "internal" },
  { code: "internal_meeting", labelEl: "Προγραμματισμός εσωτερικής συνάντησης", category: "internal" },
  { code: "meeting_followup", labelEl: "Follow-up συνάντησης", category: "internal" },
  { code: "supervision_followup", labelEl: "Follow-up εποπτείας", category: "internal" },
  { code: "decision_action", labelEl: "Ενέργεια από απόφαση", category: "internal" },
  { code: "parent_meeting_followup", labelEl: "Ενημέρωση γονέα μετά από συνάντηση", category: "communication", requiresCommunicationLog: true },
  { code: "school_meeting_followup", labelEl: "Ενημέρωση σχολείου μετά από συνάντηση", category: "communication", requiresCommunicationLog: true },
  { code: "therapist_action_plan", labelEl: "Action plan θεραπευτή", category: "clinical" },
  { code: "management_review", labelEl: "Management review", category: "internal" },
  { code: "escalation_supervisor", labelEl: "Έκτακτο ζήτημα προς προϊστάμενο", category: "internal" },
  { code: "document_prep", labelEl: "Προετοιμασία εγγράφου", category: "other" },
  { code: "send_message", labelEl: "Αποστολή email / μηνύματος", category: "communication", requiresCommunicationLog: true },
  { code: "other", labelEl: "Άλλο", category: "other" },
  { code: "unpaid_followup", labelEl: "Follow-up οικονομικής οφειλής", category: "payment" },
  { code: "intake_followup", labelEl: "Follow-up νέου αιτήματος", category: "clinical" },
  { code: "no_show_followup", labelEl: "Follow-up μη προσέλευσης", category: "communication", requiresCommunicationLog: true },
];

export const TASK_ASSIGNEE_OPTIONS = [
  "Γραμματεία",
  "Υποδοχή Νίκαια",
  "Υποδοχή Εύοσμος",
  "Επόπτης",
  "Διοίκηση",
] as const;

export function taskTypeByCode(code: string): SecretaryTaskTypeDef | undefined {
  return SECRETARY_TASK_TYPES.find((t) => t.code === code);
}

export function taskTypeRequiresCommLog(code: string): boolean {
  return taskTypeByCode(code)?.requiresCommunicationLog ?? false;
}
