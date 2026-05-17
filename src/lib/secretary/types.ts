/**
 * Secretary / Front Desk Control Center — domain types.
 * Maps to `secretary_*` and related tables; therapy sessions remain in `sessions`.
 */

export type AlertLevel = "red" | "yellow" | "green";

export type LeadStatus =
  | "new_interest"
  | "awaiting_contact"
  | "contact_made"
  | "parent_info_scheduled"
  | "history_scheduled"
  | "evaluation_scheduled"
  | "awaiting_parent"
  | "active_case"
  | "closed_unsuitable"
  | "incomplete_inquiry"
  | "draft"
  | "new_inquiry"
  | "intake_submitted"
  | "active_client"
  | "closed";

export type IntakeUrgencyLevel = "low" | "normal" | "high" | "urgent";

export type IntakeCompletenessLevel = "draft" | "incomplete" | "complete";

export type AppointmentLocationCode = "nikaia" | "evosmos" | "online" | "phone";

export type SecretaryAppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled"
  | "pending_followup";

export type AppointmentPriority = "low" | "normal" | "high" | "urgent";

export type PaymentMethod = "cash" | "bank_transfer" | "pos" | "iris" | "other";

export type PaymentReceiptStatus = "pending" | "issued" | "not_required" | "needs_review";

export type PaymentStatus =
  | "paid"
  | "partially_paid"
  | "due_soon"
  | "overdue_1_30"
  | "overdue_30_60"
  | "overdue_60_plus"
  | "suspended_management"
  /** @deprecated Use overdue_* */
  | "overdue"
  /** @deprecated Use suspended_management */
  | "suspended";

export type PaymentTransaction = {
  id: string;
  chargeId: string;
  organizationId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptStatus: PaymentReceiptStatus;
  notes: string;
  recordedAt: string;
};

export type TaskStatus = "open" | "in_progress" | "waiting_response" | "completed" | "cancelled" | "overdue";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type CaseProgramStatus = "active" | "paused" | "completed" | "archived";

export type DiagnosisDocumentTypeCode =
  | "kedasy"
  | "public_hospital"
  | "child_psychiatrist"
  | "developmental"
  | "neurologist"
  | "private_doctor"
  | "therapy_referral"
  | "school_certificate"
  | "parallel_support_approval"
  | "other";

export type DiagnosisDocumentStatus =
  | "active"
  | "expiring_60"
  | "expiring_30"
  | "expiring_7"
  | "expired"
  | "renewal_in_progress"
  | "renewed"
  | "no_renewal_required"
  | "needs_review"
  | "archived";

export type ReportRequestSource =
  | "parent"
  | "school"
  | "doctor"
  | "therapist"
  | "supervisor"
  | "clinical_director"
  | "management"
  | "other";

export type ReportDeliveryMethod = "email" | "print" | "in_person" | "parent_portal" | "other";

export type ReportRequestPriority = "low" | "normal" | "high" | "urgent";

export type ReportRequestStatus =
  | "requested"
  | "assigned_therapist"
  | "draft_in_progress"
  | "draft_completed"
  | "supervisor_review"
  | "corrections_requested"
  | "clinical_director_review"
  | "approved"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled"
  | "archived";

export type ReportFileVersion = {
  id: string;
  kind: "draft" | "final";
  fileName: string;
  uploadedAt: string;
  uploadedByLabel: string;
};

export type ReportDeliveryStatus = "pending" | "delivered" | "not_applicable";

export type CommunicationTypeCode =
  | "parent_call"
  | "school_call"
  | "doctor_call"
  | "teacher_call"
  | "parallel_support_call"
  | "therapist_call"
  | "supervisor_call"
  | "partner_call"
  | "email"
  | "sms"
  | "viber"
  | "whatsapp"
  | "in_person"
  | "internal_staff"
  | "other";

export type CommunicationStatus =
  | "completed"
  | "waiting_response"
  | "needs_followup"
  | "overdue_followup"
  | "cancelled";

export type CommunicationReasonCode =
  | "parent_update"
  | "parent_request"
  | "school_request"
  | "doctor_request"
  | "teacher_coordination"
  | "parallel_coordination"
  | "schedule_issue"
  | "payment_issue"
  | "diagnosis_issue"
  | "evaluation_issue"
  | "reevaluation_issue"
  | "report_issue"
  | "behavior_issue"
  | "emergency"
  | "prior_followup"
  | "other";

export type SecretaryAppointmentType = {
  code: string;
  nameEl: string;
  defaultDurationMin: number;
  isClinicalSession: boolean;
};

export type ClientIntake = {
  id: string;
  organizationId: string;
  childId: string | null;
  leadStatus: LeadStatus;
  completeness: IntakeCompletenessLevel;
  childFirstName: string;
  childLastName: string;
  dateOfBirth: string | null;
  parentNames: string;
  parentPrimaryName: string;
  parentSecondaryName: string | null;
  phonePrimary: string;
  phoneSecondary: string | null;
  email: string | null;
  addressFull: string | null;
  addressArea: string | null;
  schoolName: string | null;
  schoolGrade: string | null;
  mainReason: string;
  referralSource: string | null;
  existingDiagnosis: string | null;
  hasExistingDiagnosis: boolean;
  diagnosisDocumentExists: boolean;
  multipleDiagnosisDocuments: boolean;
  diagnosisType: string | null;
  diagnosisExpiryDate: string | null;
  doctorName: string | null;
  currentTherapies: string | null;
  previousTherapies: string | null;
  parentConcerns: string | null;
  preferredTimes: string | null;
  interestedServices: string | null;
  urgencyLevel: IntakeUrgencyLevel;
  notes: string | null;
  gdprConsent: boolean;
  consentPhone: boolean;
  consentSms: boolean;
  consentEmail: boolean;
  consentViber: boolean;
  consentWhatsapp: boolean;
  schoolDoctorContactConsent: boolean;
  consentExternalProfessionals: boolean;
  followUpReminderAt: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type AppointmentReminderStatus = "none" | "pending" | "scheduled" | "sent";

export type SecretaryAppointment = {
  id: string;
  organizationId: string;
  childId: string | null;
  childLabel: string | null;
  parentId: string | null;
  parentLabel: string | null;
  appointmentTypeCode: string;
  appointmentTypeLabel: string;
  locationCode: AppointmentLocationCode;
  startsAt: string;
  endsAt: string;
  status: SecretaryAppointmentStatus;
  priority: AppointmentPriority;
  roomId: string | null;
  roomLabel: string | null;
  staffIds: string[];
  staffLabels: string[];
  notes: string;
  reminderAt: string | null;
  reminderStatus: AppointmentReminderStatus;
  sessionId: string | null;
};

export type PaymentObligation = {
  id: string;
  organizationId: string;
  childId: string;
  childLabel: string;
  parentId: string | null;
  parentLabel: string | null;
  locationCode: AppointmentLocationCode;
  obligationMonth: string;
  programLabel: string;
  expectedAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  alertLevel: AlertLevel;
  receiptStatus: PaymentReceiptStatus;
  notes: string;
  escalatedToManagement: boolean;
  expectedAmountLocked: boolean;
  lastReminderAt: string | null;
};

export type TaskReminderStatus = "none" | "pending" | "scheduled" | "sent";

export type SecretaryTask = {
  id: string;
  organizationId: string;
  childId: string | null;
  childLabel: string | null;
  parentId: string | null;
  parentLabel: string | null;
  locationCode: AppointmentLocationCode;
  staffMemberLabel: string | null;
  taskTypeCode: string;
  taskTypeLabel: string;
  title: string;
  requestedByLabel: string | null;
  assignedToLabel: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  dueTime: string | null;
  followUpDate: string | null;
  linkedAppointmentId: string | null;
  linkedPaymentId: string | null;
  linkedDiagnosisId: string | null;
  linkedReportId: string | null;
  linkedMeetingId: string | null;
  completionDate: string | null;
  outcome: string | null;
  notes: string;
  alertLevel: AlertLevel;
  reminderDate: string | null;
  reminderTime: string | null;
  reminderStatus: TaskReminderStatus;
  reminderMessage: string | null;
  autoGenerated: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DiagnosisDocument = {
  id: string;
  organizationId: string;
  childId: string;
  childLabel: string;
  parentLabel: string | null;
  locationCode: AppointmentLocationCode;
  documentTypeCode: DiagnosisDocumentTypeCode;
  /** Display label (Greek) */
  documentType: string;
  diagnosisDescription: string;
  issuingAuthority: string;
  doctorSpecialty: string | null;
  issueDate: string | null;
  expiryDate: string;
  renewalRequired: boolean;
  renewalProcessStarted: boolean;
  renewalFollowUpDate: string | null;
  responsiblePersonLabel: string | null;
  status: DiagnosisDocumentStatus;
  alertLevel: AlertLevel;
  daysUntilExpiry: number;
  notes: string;
  fileName: string | null;
  fileUploadedAt: string | null;
  archived: boolean;
  renewedAt: string | null;
  createdByLabel: string;
  createdAt: string;
  updatedByLabel: string | null;
  updatedAt: string;
};

export type CommunicationLog = {
  id: string;
  organizationId: string;
  locationCode: AppointmentLocationCode;
  childId: string | null;
  childLabel: string | null;
  parentId: string | null;
  parentLabel: string | null;
  contactPerson: string;
  contactRole: string;
  contactPhone: string | null;
  contactEmail: string | null;
  communicationTypeCode: CommunicationTypeCode;
  communicationTypeLabel: string;
  reasonCode: CommunicationReasonCode;
  reason: string;
  summary: string;
  outcome: string | null;
  nextActionRequired: boolean;
  nextAction: string | null;
  followUpDate: string | null;
  followUpTime: string | null;
  priority: TaskPriority;
  status: CommunicationStatus;
  responsiblePersonLabel: string | null;
  linkedTaskId: string | null;
  linkedAppointmentId: string | null;
  linkedPaymentId: string | null;
  linkedDiagnosisId: string | null;
  linkedReportId: string | null;
  linkedMeetingId: string | null;
  occurredAt: string;
  communicationDate: string;
  communicationTime: string | null;
  createdByLabel: string;
  createdAt: string;
  autoGenerated: boolean;
  alertLevel: AlertLevel;
};

export type ReportRequest = {
  id: string;
  childId: string;
  childLabel: string;
  parentLabel: string | null;
  locationCode: AppointmentLocationCode;
  reportTypeCode: string;
  reportTypeLabel: string;
  requestedBy: string;
  requestSource: ReportRequestSource;
  requestDate: string;
  dueDate: string | null;
  priority: ReportRequestPriority;
  purpose: string;
  assignedTherapistLabels: string[];
  assignedTherapistLabel: string | null;
  assignedSupervisorLabel: string | null;
  clinicalDirectorApprovalRequired: boolean;
  status: ReportRequestStatus;
  notes: string;
  linkedAppointmentId: string | null;
  linkedDiagnosisId: string | null;
  linkedCommunicationIds: string[];
  deliveryMethod: ReportDeliveryMethod | null;
  deliveryDate: string | null;
  deliveredTo: string | null;
  fileVersions: ReportFileVersion[];
  finalFileName: string | null;
  supervisorReviewComments: string | null;
  clinicalDirectorComments: string | null;
  supervisorReviewStartedAt: string | null;
  createdByLabel: string;
  createdAt: string;
  updatedByLabel: string;
  updatedAt: string;
  archived: boolean;
  alertLevel: AlertLevel;
  daysUntilDue: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
  isUrgentOverdue: boolean;
  deliveryStatus: ReportDeliveryStatus;
};

export type MeetingTypeCode =
  | "individual_supervision"
  | "group_supervision"
  | "case_supervision"
  | "interdisciplinary"
  | "clinical_director"
  | "supervisor"
  | "ceo"
  | "secretary"
  | "admin_internal"
  | "hr"
  | "parent"
  | "school"
  | "emergency"
  | "crisis"
  | "staff_evaluation"
  | "onboarding"
  | "performance_review"
  | "other";

export type MeetingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "postponed"
  | "needs_minutes"
  | "needs_followup"
  | "pending_decision"
  | "closed";

export type MeetingDecisionStatus = "open" | "in_progress" | "completed" | "cancelled" | "overdue";

export type MeetingFollowUpStatus = "none" | "pending" | "overdue" | "complete";

export type MeetingDecision = {
  id: string;
  text: string;
  responsiblePersonLabel: string;
  dueDate: string | null;
  childId: string | null;
  childLabel: string | null;
  staffLabel: string | null;
  department: string | null;
  status: MeetingDecisionStatus;
  linkedTaskId: string | null;
};

export type MeetingMinutes = {
  summary: string;
  mainIssues: string;
  decisionsText: string;
  responsibilities: string;
  deadlines: string;
  risks: string;
  followUpActions: string;
  nextMeetingDate: string | null;
  caseFormulation: string;
  therapeuticConcerns: string;
  goalsReviewed: string;
  suggestedAdjustments: string;
  supervisorFeedback: string;
  therapistActionPlan: string;
  clinicalNotes: string;
  hrNotes: string;
  administrativeNotes: string;
  managementNotes: string;
};

export type SecretaryMeeting = {
  id: string;
  organizationId: string;
  title: string;
  meetingTypeCode: MeetingTypeCode;
  meetingTypeLabel: string;
  locationCode: AppointmentLocationCode;
  meetingDate: string;
  startTime: string;
  endTime: string;
  startsAt: string;
  endsAt: string;
  organizerLabel: string;
  participants: string[];
  requiredParticipants: string[];
  optionalParticipants: string[];
  childId: string | null;
  childLabel: string | null;
  parentLabel: string | null;
  staffMemberLabel: string | null;
  departmentSpecialty: string | null;
  priority: TaskPriority;
  status: MeetingStatus;
  agenda: string;
  minutes: MeetingMinutes | null;
  minutesMissing: boolean;
  decisions: MeetingDecision[];
  followUpRequired: boolean;
  linkedTaskIds: string[];
  linkedReportIds: string[];
  linkedAppointmentIds: string[];
  linkedCommunicationIds: string[];
  linkedPerformanceReviewId: string | null;
  isClinical: boolean;
  isEmergency: boolean;
  clinicalRiskFlag: boolean;
  hrRiskFlag: boolean;
  isClosed: boolean;
  closedAt: string | null;
  createdByLabel: string;
  createdAt: string;
  updatedByLabel: string;
  updatedAt: string;
  archived: boolean;
  alertLevel: AlertLevel;
  followUpStatus: MeetingFollowUpStatus;
  isToday: boolean;
  isUpcoming: boolean;
};

/** @deprecated Use SecretaryMeeting */
export type InternalMeeting = Pick<
  SecretaryMeeting,
  | "id"
  | "meetingTypeCode"
  | "meetingTypeLabel"
  | "childId"
  | "childLabel"
  | "agenda"
  | "startsAt"
  | "endsAt"
  | "locationCode"
> & {
  status: SecretaryAppointmentStatus;
  attendeeLabels: string[];
};

export type DashboardKpi = {
  id: string;
  label: string;
  value: number;
  helper: string;
  alertLevel: AlertLevel;
  href?: string;
};

export type SecretaryDashboardData = {
  kpis: DashboardKpi[];
  urgentAlerts: { id: string; title: string; detail: string; alertLevel: AlertLevel; href?: string }[];
  todayAppointments: SecretaryAppointment[];
};

export type ScheduleConflict = {
  id: string;
  kind: "therapist" | "room" | "child" | "hours" | "payment" | "diagnosis" | "communication";
  message: string;
  appointmentId?: string;
  alertLevel: AlertLevel;
};

export type CaseProgram = {
  id: string;
  childId: string;
  childLabel: string;
  serviceTypeCode: string;
  serviceTypeLabel: string;
  frequencyPerWeek: number;
  startDate: string;
  endDate: string | null;
  therapistLabels: string[];
  paymentPackageLabel: string | null;
  status: CaseProgramStatus;
};

export type GlobalSearchResult = {
  kind: "child" | "parent" | "task" | "payment" | "diagnosis";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};
