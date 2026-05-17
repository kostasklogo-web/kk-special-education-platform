"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Search,
} from "lucide-react";
import type {
  ClientIntake,
  CommunicationLog,
  DiagnosisDocument,
  PaymentObligation,
  ReportRequest,
  SecretaryAppointment,
  SecretaryTask,
} from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import { LOCATION_FILTER_OPTIONS, type LocationFilter } from "@/lib/secretary/schedule-catalog";
import { formatAthensLongDateFromYmd, todayAthensYmd } from "@/lib/schedule/athens-civil";
import { getAllIntakes, INTAKE_UPDATED_EVENT } from "@/lib/secretary/intake/store";
import { getAllTasks, TASKS_UPDATED_EVENT } from "@/lib/secretary/tasks/store";
import { PAYMENTS_UPDATED_EVENT } from "@/lib/secretary/payments/store";
import { DIAGNOSES_UPDATED_EVENT } from "@/lib/secretary/diagnoses/store";
import { REPORTS_UPDATED_EVENT } from "@/lib/secretary/reports/store";
import { MEETINGS_UPDATED_EVENT } from "@/lib/secretary/meetings/store";
import { COMMUNICATIONS_UPDATED_EVENT } from "@/lib/secretary/communications/store";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import { useDiagnosisDocuments } from "@/components/secretary/diagnoses/DiagnosesChargeProvider";
import { useReportRequests } from "@/components/secretary/reports/ReportsChargeProvider";
import { useSecretaryTasks } from "@/components/secretary/tasks/TasksChargeProvider";
import { useCommunicationsLog } from "@/components/secretary/communications/CommunicationsLogProvider";
import { useMeetings } from "@/components/secretary/meetings/MeetingsChargeProvider";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { GdprExportBinding } from "@/components/gdpr/GdprExportBinding";
import { getAuditLogEntries, AUDIT_LOG_UPDATED_EVENT } from "@/lib/gdpr";
import { buildMasterDashboard } from "@/lib/secretary/dashboard/master-model";
import {
  exportDiagnosisRenewalListExcel,
  exportOverduePaymentsExcel,
  exportPendingTasksExcel,
  exportTodayActionListPdf,
} from "@/lib/secretary/dashboard/master-export";
import { TodayCommandCenter } from "./TodayCommandCenter";
import { DashboardLoadingState, DashboardErrorState } from "./DashboardShellStates";
import { DashboardSection } from "./DashboardSection";
import { AlertBadge } from "@/components/secretary/AlertBadge";

type Props = {
  appointments: SecretaryAppointment[];
  payments: PaymentObligation[];
  diagnoses: DiagnosisDocument[];
  tasks: SecretaryTask[];
  communications: CommunicationLog[];
  reports: ReportRequest[];
  intakes: ClientIntake[];
  consents: CommunicationConsent[];
};

export function MasterSecretaryDashboard(props: Props) {
  const today = todayAthensYmd();
  const [location, setLocation] = useState<LocationFilter>("omilos");
  const [searchQ, setSearchQ] = useState("");
  const [auditTick, setAuditTick] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const livePayments = usePaymentCharges();
  const liveDiagnoses = useDiagnosisDocuments();
  const liveReports = useReportRequests();
  const liveTasksCtx = useSecretaryTasks();
  const liveComms = useCommunicationsLog();
  const liveMeetings = useMeetings();
  const { stats: reminderStats, queue: reminderQueue } = useReminders();

  const [liveTasks, setLiveTasks] = useState<SecretaryTask[]>(() => getAllTasks(today));
  const [liveIntakes, setLiveIntakes] = useState<ClientIntake[]>(() => getAllIntakes());

  const payments = livePayments.length > 0 ? livePayments : props.payments;
  const diagnoses = liveDiagnoses.length > 0 ? liveDiagnoses : props.diagnoses;
  const reports = liveReports.length > 0 ? liveReports : props.reports;
  const tasks = liveTasksCtx.length > 0 ? liveTasksCtx : liveTasks.length > 0 ? liveTasks : props.tasks;
  const communications = liveComms.length > 0 ? liveComms : props.communications;
  const intakes = liveIntakes.length > 0 ? liveIntakes : props.intakes;

  useEffect(() => {
    const refresh = () => {
      setLiveTasks(getAllTasks(today));
      setLiveIntakes(getAllIntakes());
      setAuditTick((n) => n + 1);
    };
    refresh();
    const events = [
      TASKS_UPDATED_EVENT,
      INTAKE_UPDATED_EVENT,
      PAYMENTS_UPDATED_EVENT,
      DIAGNOSES_UPDATED_EVENT,
      REPORTS_UPDATED_EVENT,
      MEETINGS_UPDATED_EVENT,
      COMMUNICATIONS_UPDATED_EVENT,
      AUDIT_LOG_UPDATED_EVENT,
    ];
    for (const ev of events) window.addEventListener(ev, refresh);
    return () => {
      for (const ev of events) window.removeEventListener(ev, refresh);
    };
  }, [today]);

  useEffect(() => {
    setLoadState("loading");
    const timer = window.setTimeout(() => {
      try {
        buildMasterDashboard({
          todayYmd: today,
          location,
          dateScope: "today",
          moduleFilter: "all",
          responsibleFilter: "",
          searchQ: "",
          appointments: props.appointments,
          payments,
          tasks,
          communications,
          diagnoses,
          reports,
          meetings: liveMeetings,
          intakes,
          consents: props.consents,
          reminderStats,
          reminderQueue,
          auditEntries: [],
        });
        setLoadState("ready");
        setErrorMessage("");
      } catch (e) {
        setLoadState("error");
        setErrorMessage(e instanceof Error ? e.message : "Άγνωστο σφάλμα.");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    today,
    location,
    payments,
    tasks,
    communications,
    diagnoses,
    reports,
    intakes,
    props.appointments,
    props.consents,
    reminderStats,
    reminderQueue,
    liveMeetings,
  ]);

  const state = useMemo(() => {
    try {
      return buildMasterDashboard({
        todayYmd: today,
        location,
        dateScope: "today",
        moduleFilter: "all",
        responsibleFilter: "",
        searchQ,
        appointments: props.appointments,
        payments,
        tasks,
        communications,
        diagnoses,
        reports,
        meetings: liveMeetings,
        intakes,
        consents: props.consents,
        reminderStats,
        reminderQueue,
        auditEntries: getAuditLogEntries(200),
      });
    } catch {
      return null;
    }
  }, [
    today,
    location,
    searchQ,
    props.appointments,
    payments,
    tasks,
    communications,
    diagnoses,
    reports,
    intakes,
    props.consents,
    reminderStats,
    reminderQueue,
    liveMeetings,
    auditTick,
  ]);

  const retry = () => {
    setLoadState("loading");
    setAuditTick((n) => n + 1);
    window.setTimeout(() => setLoadState(state ? "ready" : "error"), 400);
  };

  if (loadState === "loading") {
    return <DashboardLoadingState />;
  }

  if (loadState === "error" || !state) {
    return (
      <DashboardErrorState
        message={errorMessage || "Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά."}
        onRetry={retry}
      />
    );
  }

  const urgentCount =
    (state.actionLists.urgentTasks?.length ?? 0) +
    (state.actionLists.overduePayments?.length ?? 0) +
    state.conflicts.filter((c) => c.alertLevel === "red").length;

  return (
    <GdprExportBinding module="dashboard">
      {(requestExport) => (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/secretary/schedule"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-clinical-600 px-4 text-sm font-bold text-white shadow hover:bg-clinical-700 sm:flex-none"
            >
              <Calendar className="h-4 w-4" />
              Πρόγραμμα
            </Link>
            <Link
              href="/secretary/new-case"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-clinical-600 bg-white px-4 text-sm font-bold text-clinical-700 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Νέο περιστατικό
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="relative flex-1 text-sm">
              <span className="sr-only">Αναζήτηση</span>
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-faint" />
              <input
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Αναζήτηση παιδιού, γονέα, τηλεφώνου…"
                className="w-full rounded-xl border py-2.5 pl-9 pr-3 shadow-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-ink-muted">Τοποθεσία</span>
              <select
                className="min-h-[44px] rounded-xl border px-3"
                value={location}
                onChange={(e) => setLocation(e.target.value as LocationFilter)}
              >
                {LOCATION_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {urgentCount > 0 ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              <strong>{urgentCount}</strong> επείγοντα θέματα χρειάζονται προσοχή τώρα.
            </p>
          ) : null}

          <TodayCommandCenter
            todayYmd={today}
            actionRows={state.allActionRows}
            conflicts={state.conflicts}
            searchQ={searchQ}
          />

          {state.conflicts.length > 0 ? (
            <section className="rounded-xl border border-red-200 bg-red-50/60 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-red-950">
                <AlertTriangle className="h-4 w-4" />
                Προσοχή — πρόγραμμα
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-red-900">
                {state.conflicts.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <AlertBadge level={c.alertLevel} className="mr-1" />
                    {c.message}
                  </li>
                ))}
              </ul>
              <Link href="/secretary/schedule" className="mt-2 inline-block text-xs font-bold text-red-800 underline">
                Άνοιγμα προγράμματος
              </Link>
            </section>
          ) : null}

          <CollapsiblePanel
            title="Σύνοψη ημέρας"
            subtitle="Αριθμοί ανά τομέα — πατήστε για λεπτομέρειες"
            open={showDetails}
            onToggle={() => setShowDetails((v) => !v)}
          >
            <div className="space-y-4 pt-2">
              <div className="grid gap-2 sm:grid-cols-3">
                <SummaryChip label="Ραντεβού σήμερα" value={state.sections.todayOverview[0]?.value ?? 0} />
                <SummaryChip label="Επείγοντα" value={state.sections.todayOverview[6]?.value ?? 0} />
                <SummaryChip label="Υπενθυμίσεις" value={state.sections.todayOverview[5]?.value ?? 0} />
              </div>
              <DashboardSection title="Οικονομικά" cards={state.sections.financial} />
              <DashboardSection title="Έγγραφα & αναφορές" cards={state.sections.clinical} />
              <DashboardSection title="Επικοινωνίες" cards={state.sections.communications} />
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                  onClick={() =>
                    requestExport("PDF σήμερα", () =>
                      exportTodayActionListPdf(state.allActionRows, formatAthensLongDateFromYmd(today))
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF λίστας
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                  onClick={() =>
                    requestExport("Excel πληρωμών", () => exportOverduePaymentsExcel(payments, today))
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  Excel πληρωμές
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                  onClick={() =>
                    requestExport("Excel εργασιών", () => exportPendingTasksExcel(tasks, today))
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  Excel εργασίες
                </button>
              </div>
            </div>
          </CollapsiblePanel>
        </div>
      )}
    </GdprExportBinding>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-center shadow-sm">
      <p className="text-2xl font-bold tabular-nums text-ink">{value}</p>
      <p className="text-[11px] font-medium text-ink-muted">{label}</p>
    </div>
  );
}

function CollapsiblePanel({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-card shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        onClick={onToggle}
      >
        <div>
          <p className="font-bold text-ink">{title}</p>
          <p className="text-xs text-ink-muted">{subtitle}</p>
        </div>
        {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {open ? <div className="border-t border-border px-4 pb-4">{children}</div> : null}
    </section>
  );
}

