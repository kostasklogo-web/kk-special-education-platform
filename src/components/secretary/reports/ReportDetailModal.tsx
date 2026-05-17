"use client";

import { useState } from "react";
import type { RoleCode } from "@/lib/auth/roles";
import type { ReportDeliveryMethod, ReportRequest } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { REPORT_PRIORITY_LABELS } from "@/lib/secretary/reports/labels";
import { REPORT_DELIVERY_METHODS, reportSourceLabel } from "@/lib/secretary/reports/catalog";
import { applyWorkflowAction, canApplyAction, type WorkflowAction } from "@/lib/secretary/reports/workflow";
import { addReportFileVersion, upsertReport } from "@/lib/secretary/reports/store";
import { enrichReport } from "@/lib/secretary/reports/calculations";
import {
  canAssignTherapist,
  canClinicalDirectorApprove,
  canMarkDelivered,
  canSubmitDraft,
  canSupervisorReview,
  canArchiveReport,
  canExportReports,
} from "@/lib/secretary/reports/permissions";
import { exportApprovedReportPdf } from "@/lib/secretary/reports/export";
import { archiveReport, exportAndArchiveApproved } from "@/lib/secretary/reports/archive";
import { canShareReportWithParent } from "@/lib/secretary/reports/report-queries";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { EntityLinkedTasksPanel } from "@/components/secretary/tasks/EntityLinkedTasksPanel";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { CreateMeetingButton } from "@/components/secretary/meetings/CreateMeetingButton";
import { prefillMeetingFromReport } from "@/lib/secretary/meetings/meeting-prefill";
import { buildReportCommunicationPayload } from "@/components/secretary/reminders/communication-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { autoLogReportParentNotified } from "@/lib/secretary/communications/auto-log";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { ChildDiagnosisBadge } from "@/components/secretary/diagnoses/ChildDiagnosisBadge";

type Props = {
  report: ReportRequest;
  roleCodes: RoleCode[];
  onClose: () => void;
  onUpdated: () => void;
};

export function ReportDetailModal({ report: initial, roleCodes, onClose, onUpdated }: Props) {
  const today = todayAthensYmd();
  const { consents } = useReminders();
  const [report, setReport] = useState(initial);
  const [deliveredTo, setDeliveredTo] = useState(report.deliveredTo ?? report.parentLabel ?? "");
  const [deliveryMethod, setDeliveryMethod] = useState<ReportDeliveryMethod>(
    report.deliveryMethod ?? "email"
  );
  const [reviewComment, setReviewComment] = useState("");

  const refresh = (r: ReportRequest) => {
    setReport(r);
    onUpdated();
  };

  const run = (action: WorkflowAction) => {
    if (!canApplyAction(report, action)) return;
    const next = applyWorkflowAction(report, action, today, {
      updatedByLabel: "Γραμματεία",
      deliveredTo: action === "mark_delivered" ? deliveredTo : undefined,
      deliveryMethod: action === "mark_delivered" ? deliveryMethod : undefined,
      supervisorReviewComments:
        action === "return_corrections"
          ? reviewComment
          : (report.supervisorReviewComments ?? undefined),
      clinicalDirectorComments:
        action === "approve" ? reviewComment : (report.clinicalDirectorComments ?? undefined),
    });
    refresh(next);
  };

  const uploadFile = (kind: "draft" | "final") => {
    const name = kind === "final" ? `final-${report.id}.pdf` : `draft-${report.id}.pdf`;
    const next = addReportFileVersion(report, kind, name, "Γραμματεία", today);
    refresh(next);
  };

  const notifyParent = () => {
    autoLogReportParentNotified(report, today);
    upsertReport(
      enrichReport(
        {
          ...report,
          linkedCommunicationIds: [...report.linkedCommunicationIds],
        },
        today
      ),
      today
    );
  };

  const actions: { action: WorkflowAction; label: string; show: boolean; variant?: "primary" | "danger" }[] = [
    { action: "assign_therapist", label: "Ανάθεση θεραπευτή", show: canAssignTherapist(roleCodes) && canApplyAction(report, "assign_therapist") },
    { action: "start_draft", label: "Έναρξη σύνταξης", show: canSubmitDraft(roleCodes) && canApplyAction(report, "start_draft") },
    { action: "complete_draft", label: "Ολοκλήρωση draft", show: canSubmitDraft(roleCodes) && canApplyAction(report, "complete_draft") },
    { action: "send_supervisor", label: "Αποστολή σε επόπτη", show: canSubmitDraft(roleCodes) && canApplyAction(report, "send_supervisor") },
    { action: "return_corrections", label: "Επιστροφή για διορθώσεις", show: canSupervisorReview(roleCodes) && canApplyAction(report, "return_corrections"), variant: "danger" },
    { action: "send_clinical_director", label: "Προς Κ.Δ.", show: canSupervisorReview(roleCodes) && canApplyAction(report, "send_clinical_director") },
    { action: "approve", label: "Έγκριση", show: (canSupervisorReview(roleCodes) || canClinicalDirectorApprove(roleCodes)) && canApplyAction(report, "approve"), variant: "primary" },
    { action: "mark_ready", label: "Έτοιμη προς παράδοση", show: canMarkDelivered(roleCodes) && canApplyAction(report, "mark_ready") },
    { action: "mark_delivered", label: "Σημείωση παράδοσης", show: canMarkDelivered(roleCodes) && canApplyAction(report, "mark_delivered"), variant: "primary" },
  ];

  const payload = buildReportCommunicationPayload(report, consents);

  return (
    <SecretaryEntityDetailModal
      open
      title="Αίτημα αναφοράς"
      subtitle={report.childLabel}
      onClose={onClose}
      footer={
        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
          {canApplyAction(report, "mark_delivered") && canMarkDelivered(roleCodes) ? (
            <>
              <label className="block text-xs font-medium text-ink">
                Παραδόθηκε σε
                <input
                  className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm"
                  value={deliveredTo}
                  onChange={(e) => setDeliveredTo(e.target.value)}
                />
              </label>
              <label className="block text-xs font-medium text-ink">
                Τρόπος παράδοσης
                <select
                  className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as ReportDeliveryMethod)}
                >
                  {REPORT_DELIVERY_METHODS.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.labelEl}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
          {["return_corrections", "approve"].some((a) => canApplyAction(report, a as WorkflowAction)) ? (
            <label className="block text-xs font-medium text-ink">
              Σχόλια έλεγχου
              <textarea
                className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm"
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </label>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {actions
              .filter((a) => a.show)
              .map((a) => (
                <button
                  key={a.action}
                  type="button"
                  onClick={() => run(a.action)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${
                    a.variant === "primary"
                      ? "bg-clinical-600 text-white hover:bg-clinical-700"
                      : a.variant === "danger"
                        ? "border border-red-300 bg-red-50 text-red-900"
                        : "border border-border bg-white hover:bg-surface-muted"
                  }`}
                >
                  {a.label}
                </button>
              ))}
          </div>
          <CreateReminderButton payload={payload} className="w-full" variant="primary" />
          <CreateMeetingButton prefill={prefillMeetingFromReport(report)} className="w-full" label="Νέα συνάντηση" />
          {report.status === "ready_for_delivery" ? (
            <button
              type="button"
              onClick={notifyParent}
              className="w-full rounded-lg border border-clinical-300 bg-clinical-50 px-3 py-2 text-sm font-semibold text-clinical-900"
            >
              Ενημέρωση γονέα & καταγραφή
            </button>
          ) : null}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ReportStatusBadge status={report.status} overdue={report.isOverdue} />
        <AlertBadge level={report.alertLevel} />
        <ChildDiagnosisBadge childId={report.childId} compact />
        <NewCommunicationLink
          params={{ report: report.id, childId: report.childId, childLabel: report.childLabel }}
        />
      </div>

      <EntityLinkedTasksPanel link={{ kind: "report", reportId: report.id }} />

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Τύπος" value={report.reportTypeLabel} />
        <Row label="Τοποθεσία" value={LOCATION_LABELS[report.locationCode]} />
        <Row label="Πηγή" value={reportSourceLabel(report.requestSource)} />
        <Row label="Αιτήθηκε από" value={report.requestedBy} />
        <Row label="Σκοπός" value={report.purpose || "—"} />
        <Row label="Προτεραιότητα" value={REPORT_PRIORITY_LABELS[report.priority]} />
        <Row label="Ημ. αιτήματος" value={formatDateEl(report.requestDate)} />
        <Row
          label="Προθεσμία"
          value={
            report.dueDate
              ? `${formatDateEl(report.dueDate)}${report.daysUntilDue !== null ? ` (${report.daysUntilDue} ημ.)` : ""}`
              : "—"
          }
        />
        <Row label="Θεραπευτής" value={report.assignedTherapistLabel ?? "—"} />
        <Row label="Επόπτης" value={report.assignedSupervisorLabel ?? "—"} />
        <Row
          label="Έγκριση Κ.Δ."
          value={report.clinicalDirectorApprovalRequired ? "Ναι" : "Όχι"}
        />
        {report.supervisorReviewComments ? (
          <Row label="Σχόλια επόπτη" value={report.supervisorReviewComments} />
        ) : null}
        {report.deliveryDate ? (
          <Row label="Παράδοση" value={`${formatDateEl(report.deliveryDate)} → ${report.deliveredTo ?? "—"}`} />
        ) : null}
        {report.notes ? <Row label="Σημειώσεις" value={report.notes} /> : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => uploadFile("draft")}
          className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-surface-muted"
        >
          Upload draft
        </button>
        <button
          type="button"
          onClick={() => uploadFile("final")}
          className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-surface-muted"
        >
          Upload τελικό
        </button>
        {canExportReports(roleCodes) &&
        ["approved", "ready_for_delivery", "delivered"].includes(report.status) ? (
          <button
            type="button"
            onClick={() => exportApprovedReportPdf(report)}
            className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900"
          >
            Εξαγωγή PDF
          </button>
        ) : null}
        {canArchiveReport(roleCodes) && !report.archived ? (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Αρχειοθέτηση αναφοράς; Το αρχείο δεν διαγράφεται μόνιμα χωρίς έγκριση διοίκησης."
                )
              ) {
                refresh(archiveReport(report, today, "Διοίκηση"));
              }
            }}
            className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-surface-muted"
          >
            Αρχειοθέτηση
          </button>
        ) : null}
        {canArchiveReport(roleCodes) &&
        ["approved", "ready_for_delivery"].includes(report.status) ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Εξαγωγή PDF και αρχειοθέτηση;")) {
                refresh(exportAndArchiveApproved(report, today, "Γραμματεία"));
              }
            }}
            className="rounded border border-clinical-300 bg-clinical-50 px-2 py-1 text-xs font-semibold text-clinical-900"
          >
            PDF & αρχειοθέτηση
          </button>
        ) : null}
      </div>
      {canShareReportWithParent(report) ? (
        <p className="mt-2 text-[11px] text-emerald-800">
          Επιτρέπεται κοινοποίηση στο parent portal (τελική εγκεκριμένη αναφορά).
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-ink-faint">
          Το parent portal εμφανίζει μόνο τελικές εγκεκριμένες αναφορές — όχι πρόχειρα.
        </p>
      )}
      {report.fileVersions.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-ink-muted">
          {report.fileVersions.map((f) => (
            <li key={f.id}>
              {f.kind === "draft" ? "Πρόχειρο" : "Τελικό"}: {f.fileName} ({formatDateEl(f.uploadedAt.slice(0, 10))})
            </li>
          ))}
        </ul>
      ) : null}
    </SecretaryEntityDetailModal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
