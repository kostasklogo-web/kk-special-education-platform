"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateIntakeLeadAfterAppointment } from "@/lib/secretary/intake/schedule-prefill";
import { autoGenerateFromNoShow } from "@/lib/secretary/tasks/auto-generate";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { useScheduleIntakePrefill } from "@/lib/secretary/intake/use-schedule-intake-prefill";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import { useDiagnosisDocuments } from "@/components/secretary/diagnoses/DiagnosesChargeProvider";
import { useReportRequests } from "@/components/secretary/reports/ReportsChargeProvider";
import { useSecretaryTasks } from "@/components/secretary/tasks/TasksChargeProvider";
import type {
  DiagnosisDocument,
  PaymentObligation,
  SecretaryAppointment,
  SecretaryTask,
} from "@/lib/secretary/types";
import { buildChildWarningsMap } from "@/lib/secretary/child-warnings";
import { buildAppointmentInsights } from "@/lib/secretary/appointment-insights";
import { detectAppointmentConflicts } from "@/lib/secretary/conflicts";
import {
  LOCATION_FILTER_OPTIONS,
  SECRETARY_DEMO_CHILDREN,
  SECRETARY_DEMO_ROOMS,
  SECRETARY_DEMO_THERAPISTS,
  SECRETARY_SCHEDULE_APPOINTMENT_TYPES,
  type LocationFilter,
  type SecretaryScheduleTypeCode,
} from "@/lib/secretary/schedule-catalog";
import {
  defaultScheduleFilters,
  filterAppointments,
  normalizeScheduleFilters,
  type ScheduleFilterState,
} from "@/lib/secretary/schedule-utils";
import { getSafeAthensYmd } from "@/lib/schedule/athens-civil";
import { exportAppointmentsExcel, printDailySchedule } from "@/lib/secretary/schedule-export";
import { buildAppointmentReminderPayload } from "@/components/secretary/reminders/communication-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { UrgentAlerts } from "@/components/secretary/UrgentAlerts";
import { ScheduleFilterBar } from "./ScheduleFilterBar";
import { ScheduleDayView } from "./ScheduleDayView";
import { ScheduleWeekView } from "./ScheduleWeekView";
import { ScheduleMonthView } from "./ScheduleMonthView";
import { ScheduleToolbar } from "./ScheduleToolbar";
import { AppointmentFormModal } from "./AppointmentFormModal";
import { useMeetings } from "@/components/secretary/meetings/MeetingsChargeProvider";
import { mergeMeetingsIntoAppointments } from "@/lib/secretary/meetings/schedule-sync";
import type { SecretaryScheduleDataSource } from "@/lib/secretary/schedule-demo";

export type SecretaryScheduleWorkspaceProps = {
  organizationId: string;
  initialAppointments: SecretaryAppointment[];
  dataSource?: SecretaryScheduleDataSource;
  payments: PaymentObligation[];
  diagnoses: DiagnosisDocument[];
  tasks: SecretaryTask[];
  readOnly?: boolean;
};

function filtersFromSearchParams(sp: URLSearchParams): Partial<ScheduleFilterState> {
  const viewParam = sp.get("view");
  const view =
    viewParam === "week" ? "week" : viewParam === "month" ? "month" : ("day" as const);
  const loc = sp.get("location") as LocationFilter | null;
  const rawDate = sp.get("date");
  return {
    view,
    ...(rawDate ? { dateYmd: getSafeAthensYmd(rawDate) } : {}),
    location: loc && ["omilos", "nikaia", "evosmos"].includes(loc) ? loc : undefined,
    therapistId: sp.get("therapist") ?? undefined,
    roomId: sp.get("room") ?? undefined,
    childId: sp.get("child") ?? undefined,
    typeCode: sp.get("type") ?? undefined,
  };
}

export function SecretaryScheduleWorkspace({
  organizationId,
  initialAppointments,
  dataSource = "demo",
  payments: paymentsProp,
  diagnoses: diagnosesProp,
  tasks,
  readOnly = false,
}: SecretaryScheduleWorkspaceProps) {
  const livePayments = usePaymentCharges();
  const payments = livePayments.length > 0 ? livePayments : paymentsProp;
  const liveDiagnoses = useDiagnosisDocuments();
  const diagnoses = liveDiagnoses.length > 0 ? liveDiagnoses : diagnosesProp;
  const reports = useReportRequests();
  const liveTasks = useSecretaryTasks();
  const taskList = liveTasks.length > 0 ? liveTasks : tasks;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openReminder, consents } = useReminders();

  const meetings = useMeetings();
  const [appointments, setAppointments] = useState(initialAppointments);
  const scheduleAppointments = useMemo(
    () => mergeMeetingsIntoAppointments(appointments, meetings),
    [appointments, meetings]
  );
  const [filters, setFilters] = useState<ScheduleFilterState>(() =>
    defaultScheduleFilters(filtersFromSearchParams(searchParams))
  );
  const {
    prefill: intakePrefill,
    shouldOpenNewModal,
    typeCode: intakeTypeCode,
    clearPrefill,
  } = useScheduleIntakePrefill();

  const [modalOpen, setModalOpen] = useState(
    () => !readOnly && (searchParams.get("action") === "new" || shouldOpenNewModal)
  );
  const [presetType, setPresetType] = useState<SecretaryScheduleTypeCode | undefined>(
    () => (searchParams.get("type") as SecretaryScheduleTypeCode) || intakeTypeCode || undefined
  );
  const [editing, setEditing] = useState<SecretaryAppointment | null>(null);

  useEffect(() => {
    if (readOnly || !shouldOpenNewModal) return;
    setEditing(null);
    setPresetType(intakeTypeCode);
    setModalOpen(true);
  }, [readOnly, shouldOpenNewModal, intakeTypeCode, intakePrefill]);

  const syncUrl = useCallback(
    (next: ScheduleFilterState) => {
      const p = new URLSearchParams();
      if (next.view !== "day") p.set("view", next.view);
      p.set("date", getSafeAthensYmd(next.dateYmd));
      if (next.location !== "omilos") p.set("location", next.location);
      if (next.therapistId) p.set("therapist", next.therapistId);
      if (next.roomId) p.set("room", next.roomId);
      if (next.childId) p.set("child", next.childId);
      if (next.typeCode) p.set("type", next.typeCode);
      const q = p.toString();
      router.replace(q ? `/secretary/schedule?${q}` : "/secretary/schedule", { scroll: false });
    },
    [router]
  );

  const onFilterChange = (patch: Partial<ScheduleFilterState>) => {
    setFilters((f) => {
      const merged = { ...f, ...patch };
      const next = normalizeScheduleFilters(merged);
      syncUrl(next);
      return next;
    });
  };

  const selectedDateYmd = getSafeAthensYmd(filters.dateYmd);

  const childWarnings = useMemo(
    () => buildChildWarningsMap(payments, diagnoses, taskList, reports),
    [payments, diagnoses, taskList, reports]
  );

  const filtered = useMemo(
    () => filterAppointments(scheduleAppointments, filters),
    [scheduleAppointments, filters]
  );

  const insights = useMemo(
    () => buildAppointmentInsights(scheduleAppointments, childWarnings),
    [scheduleAppointments, childWarnings]
  );

  const conflictAlerts = useMemo(() => {
    return detectAppointmentConflicts(filtered)
      .filter((c) => c.alertLevel === "red")
      .slice(0, 6)
      .map((c) => ({
        id: c.id,
        title: "Σύγκρουση",
        detail: c.message,
        alertLevel: c.alertLevel as "red",
        href: undefined,
      }));
  }, [filtered]);

  const locationLabel =
    LOCATION_FILTER_OPTIONS.find((o) => o.value === filters.location)?.label ?? "Όμιλος";

  const openCreate = (typeCode?: SecretaryScheduleTypeCode) => {
    if (readOnly) return;
    setEditing(null);
    setPresetType(typeCode);
    setModalOpen(true);
  };

  const openEdit = (a: SecretaryAppointment) => {
    if (readOnly) return;
    setEditing(a);
    setPresetType(undefined);
    setModalOpen(true);
  };

  const clearIntakeScheduleParams = useCallback(() => {
    const p = new URLSearchParams(window.location.search);
    p.delete("action");
    p.delete("intake");
    const q = p.toString();
    router.replace(q ? `/secretary/schedule?${q}` : "/secretary/schedule", { scroll: false });
    clearPrefill();
  }, [router, clearPrefill]);

  const onSave = (a: SecretaryAppointment) => {
    setAppointments((prev) => {
      const idx = prev.findIndex((x) => x.id === a.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = a;
        return next;
      }
      return [...prev, a];
    });

    if (intakePrefill) {
      updateIntakeLeadAfterAppointment(intakePrefill.intakeId, a.appointmentTypeCode);
    }
    if (a.status === "no_show") {
      autoGenerateFromNoShow(a, todayAthensYmd());
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setPresetType(undefined);
    if (intakePrefill) clearIntakeScheduleParams();
  };

  const onDelete = (id: string) => {
    setAppointments((prev) => prev.filter((x) => x.id !== id));
  };

  const handlePrint = () => {
    printDailySchedule(
      filterAppointments(scheduleAppointments, { ...filters, view: "day" }),
      selectedDateYmd,
      locationLabel
    );
  };

  const handleExport = () => {
    exportAppointmentsExcel(filtered, `programma-${selectedDateYmd}`);
  };

  return (
    <div className="space-y-4">
      {dataSource === "demo" ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          Προβολή επίδειξης με ενδεικτικά δεδομένα
        </div>
      ) : null}

      <ScheduleToolbar
        readOnly={readOnly}
        onQuickCreate={openCreate}
        onSendReminder={() => {
          const target = filtered.find((a) => a.childId) ?? appointments.find((a) => a.childId);
          if (!target) {
            window.alert("Δεν υπάρχει ραντεβού με παιδί για υπενθύμιση.");
            return;
          }
          openReminder(buildAppointmentReminderPayload(target, consents));
        }}
        onPrint={handlePrint}
        onExport={handleExport}
      />

      <p className="text-sm text-ink-muted">
        <strong>{filtered.length}</strong> ραντεβού · ωράριο <strong>13:00–21:00</strong>
        {readOnly ? " · προβολή μόνο" : ""}
      </p>

      <ScheduleFilterBar
        filters={filters}
        onChange={onFilterChange}
        therapists={SECRETARY_DEMO_THERAPISTS}
        rooms={SECRETARY_DEMO_ROOMS}
        children={SECRETARY_DEMO_CHILDREN}
        appointmentTypes={[...SECRETARY_SCHEDULE_APPOINTMENT_TYPES]}
      />

      {conflictAlerts.length > 0 ? <UrgentAlerts alerts={conflictAlerts} /> : null}

      {filters.view === "day" ? (
        <ScheduleDayView appointments={filtered} insights={insights} onSelect={openEdit} />
      ) : filters.view === "week" ? (
        <ScheduleWeekView
          anchorYmd={selectedDateYmd}
          appointments={filtered}
          insights={insights}
          onSelect={openEdit}
        />
      ) : (
        <ScheduleMonthView
          anchorYmd={selectedDateYmd}
          appointments={filtered}
          insights={insights}
          onSelectDay={(ymd) => onFilterChange({ view: "day", dateYmd: ymd })}
          onSelect={openEdit}
        />
      )}

      {!readOnly ? (
        <AppointmentFormModal
          open={modalOpen}
          dateYmd={selectedDateYmd}
          organizationId={organizationId}
          existing={editing}
          presetType={presetType}
          intakePrefill={editing ? null : intakePrefill}
          allAppointments={appointments}
          onClose={closeModal}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  );
}
