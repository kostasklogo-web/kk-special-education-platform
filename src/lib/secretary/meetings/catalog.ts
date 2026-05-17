import type { MeetingTypeCode } from "@/lib/secretary/types";

export type MeetingTypeDef = {
  code: MeetingTypeCode;
  labelEl: string;
  clinical: boolean;
  emergency?: boolean;
  defaultDurationMin: number;
};

export const MEETING_TYPES: MeetingTypeDef[] = [
  { code: "individual_supervision", labelEl: "Ατομική εποπτεία θεραπευτή", clinical: true, defaultDurationMin: 60 },
  { code: "group_supervision", labelEl: "Ομαδική εποπτεία", clinical: true, defaultDurationMin: 90 },
  { code: "case_supervision", labelEl: "Εποπτεία περιστατικού", clinical: true, defaultDurationMin: 60 },
  { code: "interdisciplinary", labelEl: "Διεπιστημονική συνάντηση", clinical: true, defaultDurationMin: 45 },
  { code: "clinical_director", labelEl: "Συνάντηση με Κλινικό Διευθυντή", clinical: true, defaultDurationMin: 45 },
  { code: "supervisor", labelEl: "Συνάντηση με Επόπτη", clinical: true, defaultDurationMin: 45 },
  { code: "ceo", labelEl: "Συνάντηση με Γενικό Διευθυντή / CEO", clinical: false, defaultDurationMin: 45 },
  { code: "secretary", labelEl: "Συνάντηση γραμματείας", clinical: false, defaultDurationMin: 30 },
  { code: "admin_internal", labelEl: "Εσωτερική διοικητική συνάντηση", clinical: false, defaultDurationMin: 45 },
  { code: "hr", labelEl: "Συνάντηση HR", clinical: false, defaultDurationMin: 60 },
  { code: "parent", labelEl: "Συνάντηση για γονέα", clinical: true, defaultDurationMin: 45 },
  { code: "school", labelEl: "Συνάντηση για σχολείο", clinical: true, defaultDurationMin: 45 },
  { code: "emergency", labelEl: "Έκτακτη συνάντηση", clinical: true, emergency: true, defaultDurationMin: 30 },
  { code: "crisis", labelEl: "Συνάντηση κρίσης", clinical: true, emergency: true, defaultDurationMin: 45 },
  { code: "staff_evaluation", labelEl: "Συνάντηση αξιολόγησης προσωπικού", clinical: false, defaultDurationMin: 60 },
  { code: "onboarding", labelEl: "Συνάντηση onboarding", clinical: false, defaultDurationMin: 60 },
  { code: "performance_review", labelEl: "Συνάντηση performance review", clinical: false, defaultDurationMin: 60 },
  { code: "other", labelEl: "Άλλο", clinical: false, defaultDurationMin: 45 },
];

export const MEETING_PARTICIPANT_OPTIONS = [
  "Γραμματεία",
  "Κλινικός Διευθυντής",
  "Γενικός Διευθυντής",
  "Επόπτης Λογ.",
  "Επόπτης Εργ.",
  "Επόπτης Ψυχ.",
  "Βασιλείου Ν.",
  "Ζωγράφου Σ.",
  "Παπαδάκη Μ.",
  "Κωνσταντίνου Ε.",
] as const;

export const MEETING_DEPARTMENT_OPTIONS = [
  "Λογοθεραπεία",
  "Εργοθεραπεία",
  "Ψυχολογία",
  "Ειδική αγωγή",
  "Διοίκηση",
  "HR",
  "Γραμματεία",
] as const;

export function meetingTypeLabel(code: MeetingTypeCode | string): string {
  return MEETING_TYPES.find((t) => t.code === code)?.labelEl ?? code;
}

export function meetingTypeDef(code: MeetingTypeCode | string): MeetingTypeDef | undefined {
  return MEETING_TYPES.find((t) => t.code === code);
}

export function isClinicalMeetingType(code: MeetingTypeCode | string): boolean {
  return meetingTypeDef(code)?.clinical ?? false;
}

export function isEmergencyMeetingType(code: MeetingTypeCode | string): boolean {
  return meetingTypeDef(code)?.emergency ?? false;
}
