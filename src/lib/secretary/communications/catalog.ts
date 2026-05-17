import type { CommunicationReasonCode, CommunicationTypeCode } from "@/lib/secretary/types";

export type CommunicationTypeDef = {
  code: CommunicationTypeCode;
  labelEl: string;
  category: "parent" | "school" | "doctor" | "clinical" | "digital" | "internal" | "other";
};

export const COMMUNICATION_TYPES: CommunicationTypeDef[] = [
  { code: "parent_call", labelEl: "Τηλεφωνική επικοινωνία με γονέα", category: "parent" },
  { code: "school_call", labelEl: "Τηλεφωνική επικοινωνία με σχολείο", category: "school" },
  { code: "doctor_call", labelEl: "Τηλεφωνική επικοινωνία με γιατρό", category: "doctor" },
  { code: "teacher_call", labelEl: "Τηλεφωνική επικοινωνία με δάσκαλο", category: "school" },
  { code: "parallel_support_call", labelEl: "Τηλεφωνική επικοινωνία με παράλληλη στήριξη", category: "school" },
  { code: "therapist_call", labelEl: "Τηλεφωνική επικοινωνία με θεραπευτή", category: "clinical" },
  { code: "supervisor_call", labelEl: "Τηλεφωνική επικοινωνία με επόπτη", category: "clinical" },
  { code: "partner_call", labelEl: "Τηλεφωνική επικοινωνία με εξωτερικό συνεργάτη", category: "other" },
  { code: "email", labelEl: "Email", category: "digital" },
  { code: "sms", labelEl: "SMS", category: "digital" },
  { code: "viber", labelEl: "Viber", category: "digital" },
  { code: "whatsapp", labelEl: "WhatsApp", category: "digital" },
  { code: "in_person", labelEl: "Δια ζώσης συνάντηση", category: "internal" },
  { code: "internal_staff", labelEl: "Εσωτερική ενημέρωση", category: "internal" },
  { code: "other", labelEl: "Άλλο", category: "other" },
];

export const COMMUNICATION_REASONS: { code: CommunicationReasonCode; labelEl: string }[] = [
  { code: "parent_update", labelEl: "Ενημέρωση γονέα" },
  { code: "parent_request", labelEl: "Αίτημα γονέα" },
  { code: "school_request", labelEl: "Αίτημα σχολείου" },
  { code: "doctor_request", labelEl: "Αίτημα γιατρού" },
  { code: "teacher_coordination", labelEl: "Συντονισμός με δάσκαλο" },
  { code: "parallel_coordination", labelEl: "Συντονισμός με παράλληλη στήριξη" },
  { code: "schedule_issue", labelEl: "Θέμα προγράμματος" },
  { code: "payment_issue", labelEl: "Θέμα πληρωμής" },
  { code: "diagnosis_issue", labelEl: "Θέμα γνωμάτευσης" },
  { code: "evaluation_issue", labelEl: "Θέμα αξιολόγησης" },
  { code: "reevaluation_issue", labelEl: "Θέμα επαναξιολόγησης" },
  { code: "report_issue", labelEl: "Θέμα αναφοράς προόδου" },
  { code: "behavior_issue", labelEl: "Θέμα συμπεριφοράς παιδιού" },
  { code: "emergency", labelEl: "Έκτακτο περιστατικό" },
  { code: "prior_followup", labelEl: "Follow-up προηγούμενης επικοινωνίας" },
  { code: "other", labelEl: "Άλλο" },
];

export const CONTACT_ROLE_OPTIONS = [
  { value: "parent", label: "Γονέας" },
  { value: "school", label: "Σχολείο" },
  { value: "doctor", label: "Γιατρός" },
  { value: "teacher", label: "Δάσκαλος" },
  { value: "parallel_support", label: "Παράλληλη στήριξη" },
  { value: "therapist", label: "Θεραπευτής" },
  { value: "supervisor", label: "Επόπτης" },
  { value: "partner", label: "Εξωτερικός συνεργάτης" },
  { value: "internal", label: "Εσωτερικό" },
  { value: "other", label: "Άλλο" },
] as const;

export const RESPONSIBLE_PERSON_OPTIONS = [
  "Γραμματεία",
  "Υποδοχή Νίκαια",
  "Υποδοχή Εύοσμος",
  "Επόπτης",
  "Διοίκηση",
] as const;

export function communicationTypeByCode(code: string): CommunicationTypeDef | undefined {
  return COMMUNICATION_TYPES.find((t) => t.code === code);
}

export function communicationReasonByCode(code: string) {
  return COMMUNICATION_REASONS.find((r) => r.code === code);
}

export function isParentCommunication(code: CommunicationTypeCode): boolean {
  return ["parent_call", "email", "sms", "viber", "whatsapp"].includes(code);
}

export function isSchoolCommunication(code: CommunicationTypeCode): boolean {
  return ["school_call", "teacher_call", "parallel_support_call"].includes(code);
}

export function isDoctorCommunication(code: CommunicationTypeCode): boolean {
  return code === "doctor_call";
}
