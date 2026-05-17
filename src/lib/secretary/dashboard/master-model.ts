import { addDaysAthensCalendar, todayAthensYmd } from "@/lib/schedule/athens-civil";
import type { AuditLogEntry } from "@/lib/gdpr/types";
import { detectAppointmentConflicts } from "@/lib/secretary/conflicts";
import { appointmentYmdAthens } from "@/lib/secretary/schedule-utils";
import type { LocationFilter } from "@/lib/secretary/schedule-catalog";
import { computeCommunicationDashboardMetrics, enrichCommunication } from "@/lib/secretary/communications/calculations";
import {
  isDoctorCommunication,
  isParentCommunication,
  isSchoolCommunication,
} from "@/lib/secretary/communications/catalog";
import { computeDiagnosisDashboardMetrics, enrichDiagnosis } from "@/lib/secretary/diagnoses/calculations";
import {
  computeMeetingDashboardMetrics,
  enrichMeeting,
  isOpenMeeting,
} from "@/lib/secretary/meetings/calculations";
import {
  daysBetweenYmd,
  enrichCharge,
  isManagementReviewStatus,
} from "@/lib/secretary/payments/calculations";
import { computeReportDashboardMetrics, enrichReport, isOpenReport } from "@/lib/secretary/reports/calculations";
import {
  computeTaskDashboardMetrics,
  enrichTask,
  isActiveStatus,
  taskCategory,
} from "@/lib/secretary/tasks/calculations";
import type {
  AlertLevel,
  ClientIntake,
  CommunicationLog,
  DiagnosisDocument,
  PaymentObligation,
  ReportRequest,
  ScheduleConflict,
  SecretaryAppointment,
  SecretaryMeeting,
  SecretaryTask,
} from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import type { AutomationQueueItem, ReminderDashboardStats } from "@/lib/secretary/reminders/types";

export type DashboardCardTone = AlertLevel | "orange" | "dark_red";

export type DashboardSectionCard = {
  id: string;
  label: string;
  value: number;
  helper?: string;
  tone: DashboardCardTone;
  href?: string;
};

export type DashboardModuleKey =
  | "schedule"
  | "intake"
  | "payments"
  | "tasks"
  | "communications"
  | "diagnoses"
  | "reports"
  | "reminders"
  | "meetings"
  | "gdpr";

export type DashboardDateScope = "today" | "week" | "month";

export type DashboardActionRow = {
  id: string;
  listId: string;
  module: DashboardModuleKey;
  title: string;
  childLabel: string | null;
  parentLabel: string | null;
  priority: string;
  dueLabel: string;
  statusLabel: string;
  tone: DashboardCardTone;
  href: string;
  childId: string | null;
  entityId: string;
  locationCode?: string;
  responsible?: string | null;
  searchText: string;
};

export type MasterDashboardKpis = {
  dailyCompletionPct: number;
  reminderCompletionPct: number;
  paymentFollowUpPct: number;
  overdueTaskCount: number;
  reportDelayCount: number;
  diagnosisRiskCount: number;
  scheduleConflictCount: number;
};

export type MasterDashboardState = {
  sections: {
    todayOverview: DashboardSectionCard[];
    financial: DashboardSectionCard[];
    clinical: DashboardSectionCard[];
    operational: DashboardSectionCard[];
    communications: DashboardSectionCard[];
    gdpr: DashboardSectionCard[];
  };
  completionKpis: MasterDashboardKpis;
  conflicts: ScheduleConflict[];
  actionLists: Record<string, DashboardActionRow[]>;
  allActionRows: DashboardActionRow[];
};

export type MasterDashboardInput = {
  todayYmd: string;
  location: LocationFilter;
  dateScope: DashboardDateScope;
  moduleFilter: DashboardModuleKey | "all";
  responsibleFilter: string;
  searchQ: string;
  appointments: SecretaryAppointment[];
  payments: PaymentObligation[];
  tasks: SecretaryTask[];
  communications: CommunicationLog[];
  diagnoses: DiagnosisDocument[];
  reports: ReportRequest[];
  meetings: SecretaryMeeting[];
  intakes: ClientIntake[];
  consents: CommunicationConsent[];
  reminderStats: ReminderDashboardStats;
  reminderQueue: AutomationQueueItem[];
  auditEntries: AuditLogEntry[];
};

function scopeEnd(todayYmd: string, scope: DashboardDateScope): string {
  if (scope === "today") return todayYmd;
  if (scope === "week") return addDaysAthensCalendar(todayYmd, 7);
  return addDaysAthensCalendar(todayYmd, 30);
}

function inDateScope(ymd: string | null | undefined, todayYmd: string, scope: DashboardDateScope): boolean {
  if (!ymd) return scope !== "today";
  const end = scopeEnd(todayYmd, scope);
  return ymd >= todayYmd && ymd <= end;
}

function matchesLocation(
  locationCode: string | undefined,
  filter: LocationFilter
): boolean {
  if (filter === "omilos") return true;
  return locationCode === filter;
}

function toneFromAlert(level: AlertLevel, urgent?: boolean): DashboardCardTone {
  if (urgent) return "dark_red";
  return level;
}

function row(
  partial: Omit<DashboardActionRow, "searchText"> & { searchText?: string }
): DashboardActionRow {
  const searchText =
    partial.searchText ??
    [partial.title, partial.childLabel, partial.parentLabel, partial.statusLabel, partial.responsible]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  return { ...partial, searchText };
}

export function buildMasterDashboard(input: MasterDashboardInput): MasterDashboardState {
  const {
    todayYmd,
    location,
    dateScope,
    moduleFilter,
    responsibleFilter,
    searchQ,
    appointments,
    payments,
    tasks,
    communications,
    diagnoses,
    reports,
    meetings,
    intakes,
    consents,
    reminderStats,
    reminderQueue,
    auditEntries,
  } = input;

  const pay = payments.map((p) => enrichCharge(p, todayYmd));
  const taskList = tasks.map((t) => enrichTask(t, todayYmd));
  const comms = communications.map((c) => enrichCommunication(c, todayYmd));
  const docs = diagnoses.map((d) => enrichDiagnosis(d, todayYmd));
  const reps = reports.map((r) => enrichReport(r, todayYmd));
  const meets = meetings.map((m) => enrichMeeting(m, todayYmd));

  const apptsScoped = appointments.filter((a) => {
    if (!matchesLocation(a.locationCode, location)) return false;
    return appointmentYmdAthens(a) === todayYmd || dateScope !== "today";
  });

  const todayAppts = apptsScoped.filter((a) => appointmentYmdAthens(a) === todayYmd);
  const evalToday = todayAppts.filter((a) =>
    ["evaluation", "reevaluation"].includes(a.appointmentTypeCode)
  ).length;
  const historyToday = todayAppts.filter((a) => a.appointmentTypeCode === "history_taking").length;
  const parentInfoToday = todayAppts.filter((a) => a.appointmentTypeCode === "parent_info").length;

  const meetingMetrics = computeMeetingDashboardMetrics(meets, todayYmd);
  const meetingsToday = meets.filter((m) => m.isToday && !m.archived).length;

  const pendingRemindersToday = reminderStats.toSendToday + reminderQueue.length;

  const taskMetrics = computeTaskDashboardMetrics(taskList, todayYmd);
  const commMetrics = computeCommunicationDashboardMetrics(comms, todayYmd);
  const diagMetrics = computeDiagnosisDashboardMetrics(docs, todayYmd);
  const reportMetrics = computeReportDashboardMetrics(reps, todayYmd);

  const dueTodayPay = pay.filter((c) => c.balance > 0 && c.dueDate === todayYmd);
  const due7Pay = pay.filter((c) => {
    if (c.balance <= 0) return false;
    const d = daysBetweenYmd(todayYmd, c.dueDate);
    return d >= 0 && d <= 7;
  });
  const overdue1_30 = pay.filter(
    (c) => c.balance > 0 && ["overdue_1_30", "overdue"].includes(c.paymentStatus)
  );
  const overdue30_60 = pay.filter((c) => c.balance > 0 && c.paymentStatus === "overdue_30_60");
  const overdue60plus = pay.filter(
    (c) =>
      c.balance > 0 &&
      (c.paymentStatus === "overdue_60_plus" || isManagementReviewStatus(c.paymentStatus))
  );
  const mgmtReview = pay.filter(
    (c) => c.escalatedToManagement || isManagementReviewStatus(c.paymentStatus)
  );

  const openReportsDueSoon = reps.filter(
    (r) => isOpenReport(r) && r.isDueSoon && !r.isOverdue
  );
  const openReportsOverdue = reps.filter((r) => isOpenReport(r) && r.isOverdue);

  const conflicts = detectAppointmentConflicts(
    appointments.filter((a) => matchesLocation(a.locationCode, location))
  );

  const consentChildIds = new Set(consents.filter((c) => c.smsConsent || c.emailConsent).map((c) => c.childId));
  const childrenNeedingComm = new Set(
    comms
      .filter((c) => c.status !== "completed" && c.childId)
      .map((c) => c.childId as string)
  );
  let missingConsent = 0;
  for (const id of childrenNeedingComm) {
    if (!consentChildIds.has(id)) missingConsent += 1;
  }

  const exportsToday = auditEntries.filter(
    (e) => e.action === "export" && e.occurredAt.slice(0, 10) === todayYmd
  ).length;

  const missingFileClass = docs.filter((d) => !d.archived && !d.fileName && d.renewalRequired).length;
  const pendingIntakeConsent = intakes.filter(
    (i) => !["closed", "closed_unsuitable", "active_client"].includes(i.leadStatus) && !i.gdprConsent
  ).length;

  const sections: MasterDashboardState["sections"] = {
    todayOverview: [
      {
        id: "today_appts",
        label: "Σημερινά ραντεβού",
        value: todayAppts.length,
        tone: "green" as const,
        href: "/secretary/schedule",
      },
      {
        id: "eval_today",
        label: "Αξιολογήσεις σήμερα",
        value: evalToday,
        tone: (evalToday > 0 ? "yellow" : "green") as DashboardCardTone,
        href: "/secretary/schedule?type=evaluation",
      },
      {
        id: "history_today",
        label: "Λήψη ιστορικού σήμερα",
        value: historyToday,
        tone: historyToday > 0 ? "yellow" : "green",
        href: "/secretary/schedule?type=history_taking",
      },
      {
        id: "parent_info_today",
        label: "Ενημερωτικά ραντεβού",
        value: parentInfoToday,
        tone: parentInfoToday > 0 ? "yellow" : "green",
        href: "/secretary/schedule?type=parent_info",
      },
      {
        id: "meetings_today",
        label: "Συναντήσεις / εποπτείες",
        value: meetingsToday,
        tone: meetingsToday > 0 ? "orange" : "green",
        href: "/secretary/meetings",
      },
      {
        id: "reminders_today",
        label: "Υπενθυμίσεις σήμερα",
        value: pendingRemindersToday,
        tone: pendingRemindersToday > 0 ? "orange" : "green",
        href: "/secretary/reminders",
      },
      {
        id: "urgent_tasks",
        label: "Επείγουσες εργασίες",
        value: taskMetrics.urgent,
        tone: taskMetrics.urgent > 0 ? "red" : "green",
        href: "/secretary/tasks?filter=urgent",
      },
    ],
    financial: [
      {
        id: "pay_today",
        label: "Πληρωμές σήμερα",
        value: dueTodayPay.length,
        tone: dueTodayPay.length > 0 ? "yellow" : "green",
        href: "/secretary/payments",
      },
      {
        id: "pay_7d",
        label: "Πληρωμές σε 7 ημέρες",
        value: due7Pay.length,
        tone: due7Pay.length > 0 ? "yellow" : "green",
        href: "/secretary/payments",
      },
      {
        id: "od_1_30",
        label: "Καθυστέρηση 1–30 ημέρες",
        value: overdue1_30.length,
        tone: overdue1_30.length > 0 ? "orange" : "green",
        href: "/secretary/payments?filter=overdue",
      },
      {
        id: "od_30_60",
        label: "Καθυστέρηση 30–60 ημέρες",
        value: overdue30_60.length,
        tone: overdue30_60.length > 0 ? "red" : "green",
        href: "/secretary/payments",
      },
      {
        id: "od_60",
        label: "Καθυστέρηση 60+ ημέρες",
        value: overdue60plus.length,
        tone: overdue60plus.length > 0 ? "dark_red" : "green",
        href: "/secretary/payments",
      },
      {
        id: "mgmt_review",
        label: "Έλεγχος διοίκησης",
        value: mgmtReview.length,
        tone: mgmtReview.length > 0 ? "dark_red" : "green",
        href: "/secretary/payments",
      },
    ],
    clinical: [
      {
        id: "diag_60",
        label: "Διαγνώσεις ≤60 ημέρες",
        value: diagMetrics.expiring60,
        tone: diagMetrics.expiring60 > 0 ? "yellow" : "green",
        href: "/secretary/diagnoses",
      },
      {
        id: "diag_30",
        label: "Διαγνώσεις ≤30 ημέρες",
        value: diagMetrics.expiring30,
        tone: diagMetrics.expiring30 > 0 ? "orange" : "green",
        href: "/secretary/diagnoses",
      },
      {
        id: "diag_7",
        label: "Διαγνώσεις ≤7 ημέρες",
        value: diagMetrics.expiring7,
        tone: diagMetrics.expiring7 > 0 ? "red" : "green",
        href: "/secretary/diagnoses",
      },
      {
        id: "diag_exp",
        label: "Ληγμένες διαγνώσεις",
        value: diagMetrics.expired,
        tone: diagMetrics.expired > 0 ? "dark_red" : "green",
        href: "/secretary/diagnoses",
      },
      {
        id: "rep_soon",
        label: "Αναφορές σύντομα",
        value: openReportsDueSoon.length,
        tone: openReportsDueSoon.length > 0 ? "yellow" : "green",
        href: "/secretary/reports",
      },
      {
        id: "rep_od",
        label: "Εκπρόθεσμες αναφορές",
        value: openReportsOverdue.length,
        tone: openReportsOverdue.length > 0 ? "red" : "green",
        href: "/secretary/reports",
      },
    ],
    operational: [
      {
        id: "tasks_open",
        label: "Ανοιχτές εργασίες",
        value: taskMetrics.open + taskMetrics.overdue,
        tone: "yellow",
        href: "/secretary/tasks",
      },
      {
        id: "tasks_today",
        label: "Λήξη σήμερα",
        value: taskMetrics.dueToday,
        tone: taskMetrics.dueToday > 0 ? "orange" : "green",
        href: "/secretary/tasks",
      },
      {
        id: "tasks_od",
        label: "Εκπρόθεσμες",
        value: taskMetrics.overdue,
        tone: taskMetrics.overdue > 0 ? "red" : "green",
        href: "/secretary/tasks",
      },
      {
        id: "tasks_wait",
        label: "Αναμονή απάντησης",
        value: taskMetrics.waitingResponse,
        tone: taskMetrics.waitingResponse > 0 ? "yellow" : "green",
        href: "/secretary/tasks",
      },
      {
        id: "tasks_urgent",
        label: "Επείγουσες",
        value: taskMetrics.urgent,
        tone: taskMetrics.urgent > 0 ? "red" : "green",
        href: "/secretary/tasks",
      },
      {
        id: "tasks_followup",
        label: "Follow-up κλήσεις",
        value: taskList.filter(
          (t) =>
            isActiveStatus(t.status) &&
            (taskCategory(t.taskTypeCode) === "communication" || t.title.toLowerCase().includes("κλήση"))
        ).length,
        tone: "yellow",
        href: "/secretary/tasks",
      },
    ],
    communications: [
      {
        id: "comm_today",
        label: "Επικοινωνίες σήμερα",
        value: commMetrics.today,
        tone: "green",
        href: "/secretary/communications",
      },
      {
        id: "comm_wait",
        label: "Αναμονή απάντησης",
        value: commMetrics.waitingResponse,
        tone: commMetrics.waitingResponse > 0 ? "yellow" : "green",
        href: "/secretary/communications",
      },
      {
        id: "comm_parent",
        label: "Κλήσεις γονέων",
        value: comms.filter(
          (c) =>
            isParentCommunication(c.communicationTypeCode) &&
            !["completed", "cancelled"].includes(c.status)
        ).length,
        tone: "orange",
        href: "/secretary/communications",
      },
      {
        id: "comm_school_doc",
        label: "Σχολείο / γιατρός",
        value: comms.filter(
          (c) =>
            (isSchoolCommunication(c.communicationTypeCode) ||
              isDoctorCommunication(c.communicationTypeCode)) &&
            !["completed", "cancelled"].includes(c.status)
        ).length,
        tone: "yellow",
        href: "/secretary/communications",
      },
      {
        id: "comm_od",
        label: "Εκπρόθεσμο follow-up",
        value: commMetrics.overdueFollowUps,
        tone: commMetrics.overdueFollowUps > 0 ? "red" : "green",
        href: "/secretary/communications",
      },
    ],
    gdpr: [
      {
        id: "gdpr_consent",
        label: "Έλλειψη συγκατάθεσης",
        value: missingConsent,
        tone: missingConsent > 0 ? "red" : "green",
        href: "/settings/gdpr",
      },
      {
        id: "gdpr_export",
        label: "Ευαίσθητες εξαγωγές σήμερα",
        value: exportsToday,
        tone: exportsToday > 0 ? "orange" : "green",
        href: "/settings/gdpr",
      },
      {
        id: "gdpr_files",
        label: "Αρχεία χωρίς ταξινόμηση",
        value: missingFileClass,
        tone: missingFileClass > 0 ? "yellow" : "green",
        href: "/secretary/diagnoses",
      },
      {
        id: "gdpr_intake",
        label: "Εκκρεμεί συγκατάθεση intake",
        value: pendingIntakeConsent,
        tone: pendingIntakeConsent > 0 ? "yellow" : "green",
        href: "/secretary/new-case",
      },
      {
        id: "gdpr_audit",
        label: "Καταγραφές audit (24ω)",
        value: auditEntries.filter((e) => e.occurredAt.slice(0, 10) === todayYmd).length,
        tone: "green",
        href: "/settings/gdpr",
      },
    ],
  };

  const scheduleRows: DashboardActionRow[] = todayAppts
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .map((a) =>
      row({
        id: `sched-${a.id}`,
        listId: "todaySchedule",
        module: "schedule",
        title: a.appointmentTypeLabel,
        childLabel: a.childLabel,
        parentLabel: null,
        priority: a.priority,
        dueLabel: new Date(a.startsAt).toLocaleTimeString("el-GR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        statusLabel: a.status,
        tone: a.priority === "urgent" ? "red" : "green",
        href: `/secretary/schedule?date=${todayYmd}&child=${a.childId ?? ""}`,
        childId: a.childId,
        entityId: a.id,
        locationCode: a.locationCode,
        responsible: a.staffLabels[0] ?? null,
      })
    );

  const reminderRows: DashboardActionRow[] = reminderQueue.slice(0, 30).map((q) =>
    row({
      id: `rem-${q.id}`,
      listId: "remindersToSend",
      module: "reminders",
      title: q.templateLabel,
      childLabel: q.childLabel,
      parentLabel: q.recipientName,
      priority: q.priority === "high" ? "urgent" : "normal",
      dueLabel: "Σήμερα",
      statusLabel: q.reason,
      tone: q.priority === "high" ? "orange" : "yellow",
      href: "/secretary/reminders",
      childId: q.childId,
      entityId: q.entityId,
    })
  );

  const paymentRows: DashboardActionRow[] = [...dueTodayPay, ...overdue1_30.slice(0, 15)]
    .map((c) =>
      row({
        id: `pay-${c.id}`,
        listId: "overduePayments",
        module: "payments",
        title: `Υπόλοιπο ${c.balance}€`,
        childLabel: c.childLabel,
        parentLabel: c.parentLabel ?? null,
        priority: isManagementReviewStatus(c.paymentStatus) ? "urgent" : "high",
        dueLabel: c.dueDate,
        statusLabel: c.paymentStatus,
        tone: toneFromAlert(c.alertLevel, c.escalatedToManagement),
        href: `/secretary/payments?child=${encodeURIComponent(c.childLabel)}`,
        childId: c.childId,
        entityId: c.id,
        locationCode: c.locationCode,
      })
    );

  const diagnosisRows: DashboardActionRow[] = docs
    .filter((d) => !d.archived && (d.daysUntilExpiry <= 60 || d.status === "expired"))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    .slice(0, 20)
    .map((d) =>
      row({
        id: `diag-${d.id}`,
        listId: "expiringDiagnoses",
        module: "diagnoses",
        title: d.documentType,
        childLabel: d.childLabel,
        parentLabel: null,
        priority: d.daysUntilExpiry < 0 ? "urgent" : d.daysUntilExpiry <= 7 ? "high" : "normal",
        dueLabel: d.expiryDate,
        statusLabel: `Λήξη σε ${d.daysUntilExpiry} ημ.`,
        tone: d.daysUntilExpiry < 0 ? "dark_red" : d.daysUntilExpiry <= 7 ? "red" : "yellow",
        href: `/secretary/diagnoses?id=${d.id}`,
        childId: d.childId,
        entityId: d.id,
        locationCode: d.locationCode,
      })
    );

  const reportRows: DashboardActionRow[] = reps
    .filter((r) => isOpenReport(r))
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 20)
    .map((r) =>
      row({
        id: `rep-${r.id}`,
        listId: "pendingReports",
        module: "reports",
        title: r.reportTypeLabel,
        childLabel: r.childLabel,
        parentLabel: null,
        priority: r.priority,
        dueLabel: r.dueDate ?? "—",
        statusLabel: r.status,
        tone: r.isOverdue ? "red" : r.isDueSoon ? "yellow" : "green",
        href: `/secretary/reports?id=${r.id}`,
        childId: r.childId,
        entityId: r.id,
        locationCode: r.locationCode,
        responsible: r.assignedTherapistLabel,
      })
    );

  const urgentTaskRows: DashboardActionRow[] = taskList
    .filter((t) => isActiveStatus(t.status))
    .slice(0, 40)
    .map((t) =>
      row({
        id: `task-${t.id}`,
        listId: "urgentTasks",
        module: "tasks",
        title: t.title,
        childLabel: t.childLabel,
        parentLabel: null,
        priority: t.priority,
        dueLabel: t.dueDate ?? "—",
        statusLabel: t.status,
        tone: t.status === "overdue" ? "red" : "orange",
        href: `/secretary/tasks?id=${t.id}`,
        childId: t.childId,
        entityId: t.id,
        locationCode: t.locationCode,
        responsible: t.assignedToLabel,
      })
    );

  const meetingMinuteRows: DashboardActionRow[] = meets
    .filter((m) => isOpenMeeting(m) && (m.minutesMissing || m.status === "needs_minutes"))
    .slice(0, 15)
    .map((m) =>
      row({
        id: `meet-${m.id}`,
        listId: "meetingsMinutes",
        module: "meetings",
        title: m.title,
        childLabel: m.childLabel,
        parentLabel: null,
        priority: m.priority,
        dueLabel: m.meetingDate,
        statusLabel: "Χωρίς πρακτικά",
        tone: "orange",
        href: `/secretary/meetings?id=${m.id}`,
        childId: m.childId,
        entityId: m.id,
        locationCode: m.locationCode,
        responsible: m.organizerLabel,
      })
    );

  const commWaitRows: DashboardActionRow[] = comms
    .filter((c) => c.status === "waiting_response" || c.status === "overdue_followup")
    .slice(0, 20)
    .map((c) =>
      row({
        id: `comm-${c.id}`,
        listId: "waitingCommunications",
        module: "communications",
        title: c.summary ? c.summary.slice(0, 80) : c.communicationTypeLabel,
        childLabel: c.childLabel,
        parentLabel: c.parentLabel ?? null,
        priority: c.priority,
        dueLabel: c.followUpDate ?? c.communicationDate,
        statusLabel: c.status,
        tone: c.status === "overdue_followup" ? "red" : "yellow",
        href: `/secretary/communications?id=${c.id}`,
        childId: c.childId,
        entityId: c.id,
        locationCode: c.locationCode,
        responsible: c.responsiblePersonLabel,
      })
    );

  const intakeRows: DashboardActionRow[] = intakes
    .filter((i) =>
      ["new_interest", "awaiting_contact", "incomplete_inquiry", "evaluation_scheduled"].includes(
        i.leadStatus
      )
    )
    .slice(0, 15)
    .map((i) => {
      const childName = `${i.childFirstName} ${i.childLastName}`.trim();
      return row({
        id: `intake-${i.id}`,
        listId: "newLeads",
        module: "intake",
        title: childName || "Νέο αίτημα",
        childLabel: childName,
        parentLabel: i.parentPrimaryName,
        priority: i.urgencyLevel === "urgent" ? "urgent" : "normal",
        dueLabel: i.submittedAt.slice(0, 10),
        statusLabel: i.leadStatus,
        tone: i.leadStatus === "incomplete_inquiry" ? "orange" : "yellow",
        href: `/secretary/new-case?id=${i.id}`,
        childId: i.childId,
        entityId: i.id,
        searchText: `${childName} ${i.parentPrimaryName} ${i.phonePrimary} ${i.schoolName ?? ""}`,
      });
    });

  const actionLists: Record<string, DashboardActionRow[]> = {
    todaySchedule: scheduleRows,
    remindersToSend: reminderRows,
    overduePayments: paymentRows,
    expiringDiagnoses: diagnosisRows,
    pendingReports: reportRows,
    urgentTasks: urgentTaskRows,
    meetingsMinutes: meetingMinuteRows,
    waitingCommunications: commWaitRows,
    newLeads: intakeRows,
  };

  let allActionRows = Object.values(actionLists).flat();

  if (moduleFilter !== "all") {
    allActionRows = allActionRows.filter((r) => r.module === moduleFilter);
    for (const key of Object.keys(actionLists)) {
      actionLists[key] = actionLists[key].filter((r) => r.module === moduleFilter);
    }
  }

  if (responsibleFilter.trim()) {
    const q = responsibleFilter.trim().toLowerCase();
    const filt = (r: DashboardActionRow) => (r.responsible ?? "").toLowerCase().includes(q);
    allActionRows = allActionRows.filter(filt);
    for (const key of Object.keys(actionLists)) {
      actionLists[key] = actionLists[key].filter(filt);
    }
  }

  if (dateScope !== "today") {
    const inScope = (r: DashboardActionRow) => {
      const d = r.dueLabel.slice(0, 10);
      if (d.length !== 10) return true;
      return inDateScope(d, todayYmd, dateScope);
    };
    allActionRows = allActionRows.filter(inScope);
    for (const key of Object.keys(actionLists)) {
      actionLists[key] = actionLists[key].filter(inScope);
    }
  }

  const q = searchQ.trim().toLowerCase();
  if (q) {
    allActionRows = allActionRows.filter((r) => r.searchText.includes(q));
    for (const key of Object.keys(actionLists)) {
      actionLists[key] = actionLists[key].filter((r) => r.searchText.includes(q));
    }
  }

  const dueTodayTotal = taskMetrics.dueToday + pendingRemindersToday;
  const completedToday =
    taskList.filter((t) => t.status === "completed" && t.completionDate === todayYmd).length +
    reminderStats.completedThisWeek;
  const dailyCompletionPct =
    dueTodayTotal > 0 ? Math.min(100, Math.round((completedToday / dueTodayTotal) * 100)) : 100;

  const reminderDenom = reminderStats.toSendToday + reminderStats.completedThisWeek;
  const reminderCompletionPct =
    reminderDenom > 0
      ? Math.round((reminderStats.completedThisWeek / reminderDenom) * 100)
      : 100;

  const payFollowDenom = due7Pay.length + overdue1_30.length;
  const payContacted = 0;
  const paymentFollowUpPct =
    payFollowDenom > 0 ? Math.round((payContacted / payFollowDenom) * 100) : 100;

  const completionKpis: MasterDashboardKpis = {
    dailyCompletionPct,
    reminderCompletionPct,
    paymentFollowUpPct,
    overdueTaskCount: taskMetrics.overdue,
    reportDelayCount: openReportsOverdue.length,
    diagnosisRiskCount: diagMetrics.expiring7 + diagMetrics.expired,
    scheduleConflictCount: conflicts.filter((c) => c.alertLevel === "red").length,
  };

  return {
    sections,
    completionKpis,
    conflicts,
    actionLists,
    allActionRows,
  };
}

export function defaultMasterDashboardInput(
  partial: Partial<MasterDashboardInput>
): MasterDashboardInput {
  const todayYmd = partial.todayYmd ?? todayAthensYmd();
  return {
    todayYmd,
    location: partial.location ?? "omilos",
    dateScope: partial.dateScope ?? "today",
    moduleFilter: partial.moduleFilter ?? "all",
    responsibleFilter: partial.responsibleFilter ?? "",
    searchQ: partial.searchQ ?? "",
    appointments: partial.appointments ?? [],
    payments: partial.payments ?? [],
    tasks: partial.tasks ?? [],
    communications: partial.communications ?? [],
    diagnoses: partial.diagnoses ?? [],
    reports: partial.reports ?? [],
    meetings: partial.meetings ?? [],
    intakes: partial.intakes ?? [],
    consents: partial.consents ?? [],
    reminderStats: partial.reminderStats ?? {
      toSendToday: 0,
      appointmentPending: 0,
      paymentPending: 0,
      overduePending: 0,
      diagnosisPending: 0,
      reportPending: 0,
      taskPending: 0,
      evaluationPending: 0,
      completedThisWeek: 0,
      failedOrNotSent: 0,
    },
    reminderQueue: partial.reminderQueue ?? [],
    auditEntries: partial.auditEntries ?? [],
  };
}
