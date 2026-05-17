"use client";

import { useState } from "react";
import type {
  AppointmentLocationCode,
  ReportRequestPriority,
  ReportRequestSource,
} from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import {
  REPORT_SOURCES,
  REPORT_THERAPIST_OPTIONS,
  REPORT_SUPERVISOR_OPTIONS,
  REPORT_TYPES,
  reportTypeLabel,
} from "@/lib/secretary/reports/catalog";
import { createReportDraft } from "@/lib/secretary/reports/store";
import { SECRETARY_DEMO_CHILDREN } from "@/lib/secretary/schedule-catalog";
import { parentLabelForChild } from "@/lib/secretary/schedule-catalog";
import { todayAthensYmd, addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import { REPORT_PRIORITY_LABELS } from "@/lib/secretary/reports/labels";

const field =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

type Props = {
  onClose: () => void;
  onCreated: () => void;
  prefillChildId?: string;
  prefillChildLabel?: string;
};

export function CreateReportModal({ onClose, onCreated, prefillChildId, prefillChildLabel }: Props) {
  const today = todayAthensYmd();
  const [childId, setChildId] = useState(prefillChildId ?? "");
  const [locationCode, setLocationCode] = useState<AppointmentLocationCode>("nikaia");
  const [reportTypeCode, setReportTypeCode] = useState("progress");
  const [requestedBy, setRequestedBy] = useState("");
  const [requestSource, setRequestSource] = useState<ReportRequestSource>("parent");
  const [requestDate, setRequestDate] = useState(today);
  const [dueDate, setDueDate] = useState(addDaysAthensCalendar(today, 14));
  const [priority, setPriority] = useState<ReportRequestPriority>("normal");
  const [purpose, setPurpose] = useState("");
  const [therapist, setTherapist] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [cdRequired, setCdRequired] = useState(false);
  const [notes, setNotes] = useState("");

  const childLabel =
    SECRETARY_DEMO_CHILDREN.find((c) => c.id === childId)?.label ?? prefillChildLabel ?? "";
  const parentLabel = childId ? parentLabelForChild(childId) : null;

  const submit = () => {
    if (!childId || !requestedBy.trim()) return;
    createReportDraft(
      {
        childId,
        childLabel,
        parentLabel,
        locationCode,
        reportTypeCode,
        reportTypeLabel: reportTypeLabel(reportTypeCode),
        requestedBy: requestedBy.trim(),
        requestSource,
        requestDate,
        dueDate: dueDate || null,
        priority,
        purpose: purpose.trim(),
        assignedTherapistLabels: therapist ? [therapist] : [],
        assignedTherapistLabel: therapist || null,
        assignedSupervisorLabel: supervisor || null,
        clinicalDirectorApprovalRequired: cdRequired,
        status: therapist ? "assigned_therapist" : "requested",
        notes: notes.trim(),
        createdByLabel: "Γραμματεία",
        updatedByLabel: "Γραμματεία",
      },
      today
    );
    onCreated();
    onClose();
  };

  return (
    <SecretaryEntityDetailModal
      open
      title="Νέο αίτημα αναφοράς"
      subtitle="Καταχώριση αιτήματος από γονέα, σχολείο ή φορέα"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={!childId || !requestedBy.trim()}
          className="w-full rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-clinical-700 disabled:opacity-50"
        >
          Καταχώριση αιτήματος
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-ink">Παιδί</span>
          <select className={field} value={childId} onChange={(e) => setChildId(e.target.value)}>
            <option value="">— Επιλογή —</option>
            {SECRETARY_DEMO_CHILDREN.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Τοποθεσία</span>
          <select
            className={field}
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value as AppointmentLocationCode)}
          >
            <option value="nikaia">Νίκαια</option>
            <option value="evosmos">Εύοσμος</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Τύπος αναφοράς</span>
          <select className={field} value={reportTypeCode} onChange={(e) => setReportTypeCode(e.target.value)}>
            {REPORT_TYPES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.labelEl}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Πηγή αιτήματος</span>
          <select
            className={field}
            value={requestSource}
            onChange={(e) => setRequestSource(e.target.value as ReportRequestSource)}
          >
            {REPORT_SOURCES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.labelEl}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Αιτήθηκε από</span>
          <input className={field} value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Ημερομηνία αιτήματος</span>
          <input type="date" className={field} value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Προθεσμία</span>
          <input type="date" className={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Προτεραιότητα</span>
          <select
            className={field}
            value={priority}
            onChange={(e) => setPriority(e.target.value as ReportRequestPriority)}
          >
            {(Object.keys(REPORT_PRIORITY_LABELS) as ReportRequestPriority[]).map((p) => (
              <option key={p} value={p}>
                {REPORT_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-ink">Σκοπός αναφοράς</span>
          <textarea className={field} rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Θεραπευτής (προαιρετικό)</span>
          <select className={field} value={therapist} onChange={(e) => setTherapist(e.target.value)}>
            <option value="">— Αργότερα —</option>
            {REPORT_THERAPIST_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Επόπτης</span>
          <select className={field} value={supervisor} onChange={(e) => setSupervisor(e.target.value)}>
            <option value="">—</option>
            {REPORT_SUPERVISOR_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={cdRequired} onChange={(e) => setCdRequired(e.target.checked)} />
          <span>Απαιτείται έγκριση κλινικού διευθυντή</span>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-ink">Σημειώσεις</span>
          <textarea className={field} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>
    </SecretaryEntityDetailModal>
  );
}
