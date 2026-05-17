"use client";

import { useState } from "react";
import type { AppointmentLocationCode, DiagnosisDocumentTypeCode } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import {
  DIAGNOSIS_DOCUMENT_TYPES,
  DIAGNOSIS_RESPONSIBLE_OPTIONS,
} from "@/lib/secretary/diagnoses/catalog";
import { documentTypeLabel } from "@/lib/secretary/diagnoses/catalog";
import { createDiagnosisDraft } from "@/lib/secretary/diagnoses/store";
import { LOCATION_FILTER_OPTIONS } from "@/lib/secretary/schedule-catalog";
import { SECRETARY_DEMO_CHILDREN } from "@/lib/secretary/schedule-catalog";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";

const field =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

type Props = {
  onClose: () => void;
  onCreated: () => void;
  prefillChildId?: string;
  prefillChildLabel?: string;
};

export function CreateDiagnosisModal({ onClose, onCreated, prefillChildId, prefillChildLabel }: Props) {
  const today = todayAthensYmd();
  const [childId, setChildId] = useState(prefillChildId ?? "");
  const [locationCode, setLocationCode] = useState<AppointmentLocationCode>("nikaia");
  const [typeCode, setTypeCode] = useState<DiagnosisDocumentTypeCode>("kedasy");
  const [description, setDescription] = useState("");
  const [authority, setAuthority] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState(addDaysAthensCalendar(today, 365));
  const [renewalRequired, setRenewalRequired] = useState(true);
  const [responsible, setResponsible] = useState("Γραμματεία");
  const [notes, setNotes] = useState("");

  const childLabel =
    SECRETARY_DEMO_CHILDREN.find((c) => c.id === childId)?.label ?? prefillChildLabel ?? "";

  const submit = () => {
    if (!childId || !expiryDate || !authority.trim()) return;
    createDiagnosisDraft(
      {
        childId,
        childLabel,
        locationCode,
        documentTypeCode: typeCode,
        documentType: documentTypeLabel(typeCode),
        diagnosisDescription: description.trim() || documentTypeLabel(typeCode),
        issuingAuthority: authority.trim(),
        doctorSpecialty: specialty.trim() || null,
        issueDate: issueDate || null,
        expiryDate,
        renewalRequired,
        responsiblePersonLabel: responsible,
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
      title="Νέο διαγνωστικό έγγραφο"
      subtitle="Καταχώριση γνωμάτευσης / εγγράφου"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={!childId || !expiryDate || !authority.trim()}
          className="w-full rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-clinical-700 disabled:opacity-50"
        >
          Αποθήκευση
        </button>
      }
    >
      <div className="grid max-h-[60vh] gap-3 overflow-y-auto text-sm sm:grid-cols-2">
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Παιδί *</span>
          <select value={childId} onChange={(e) => setChildId(e.target.value)} className={field}>
            <option value="">— Επιλογή —</option>
            {SECRETARY_DEMO_CHILDREN.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Τοποθεσία</span>
          <select
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value as AppointmentLocationCode)}
            className={field}
          >
            {LOCATION_FILTER_OPTIONS.filter((o) => o.value !== "omilos").map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Τύπος εγγράφου *</span>
          <select
            value={typeCode}
            onChange={(e) => setTypeCode(e.target.value as DiagnosisDocumentTypeCode)}
            className={field}
          >
            {DIAGNOSIS_DOCUMENT_TYPES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.labelEl}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Περιγραφή / διάγνωση</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Φορέας έκδοσης *</span>
          <input value={authority} onChange={(e) => setAuthority(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ειδικότητα γιατρού</span>
          <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ημ. έκδοσης</span>
          <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ημ. λήξης *</span>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={field} />
        </label>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={renewalRequired}
            onChange={(e) => setRenewalRequired(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-ink-muted">Απαιτείται ανανέωση</span>
        </label>
        <label className="block">
          <span className="text-ink-muted">Υπεύθυνος</span>
          <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className={field}>
            {DIAGNOSIS_RESPONSIBLE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Σημειώσεις</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={field} />
        </label>
      </div>
    </SecretaryEntityDetailModal>
  );
}
