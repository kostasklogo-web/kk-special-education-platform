"use client";

import { useState } from "react";
import type { AppointmentLocationCode, DiagnosisDocument, DiagnosisDocumentTypeCode } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import {
  DIAGNOSIS_DOCUMENT_TYPES,
  DIAGNOSIS_RESPONSIBLE_OPTIONS,
  documentTypeLabel,
} from "@/lib/secretary/diagnoses/catalog";
import { upsertDiagnosis } from "@/lib/secretary/diagnoses/store";
import { LOCATION_FILTER_OPTIONS } from "@/lib/secretary/schedule-catalog";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

const field =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

type Props = {
  doc: DiagnosisDocument;
  onClose: () => void;
  onSaved: () => void;
};

export function EditDiagnosisModal({ doc: initial, onClose, onSaved }: Props) {
  const today = todayAthensYmd();
  const [doc, setDoc] = useState(initial);

  const patch = <K extends keyof DiagnosisDocument>(key: K, value: DiagnosisDocument[K]) => {
    setDoc((d) => ({ ...d, [key]: value }));
  };

  const submit = () => {
    upsertDiagnosis(
      {
        ...doc,
        documentType: documentTypeLabel(doc.documentTypeCode),
        updatedByLabel: "Γραμματεία",
        updatedAt: new Date().toISOString(),
      },
      today
    );
    onSaved();
    onClose();
  };

  return (
    <SecretaryEntityDetailModal
      open
      title="Επεξεργασία εγγράφου"
      subtitle={doc.childLabel}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-clinical-700"
        >
          Αποθήκευση
        </button>
      }
    >
      <div className="grid max-h-[60vh] gap-3 overflow-y-auto text-sm sm:grid-cols-2">
        <label className="block">
          <span className="text-ink-muted">Τοποθεσία</span>
          <select
            value={doc.locationCode}
            onChange={(e) => patch("locationCode", e.target.value as AppointmentLocationCode)}
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
          <span className="text-ink-muted">Τύπος</span>
          <select
            value={doc.documentTypeCode}
            onChange={(e) => {
              const code = e.target.value as DiagnosisDocumentTypeCode;
              patch("documentTypeCode", code);
              patch("documentType", documentTypeLabel(code));
            }}
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
          <span className="text-ink-muted">Περιγραφή</span>
          <input
            value={doc.diagnosisDescription}
            onChange={(e) => patch("diagnosisDescription", e.target.value)}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Φορέας έκδοσης</span>
          <input
            value={doc.issuingAuthority}
            onChange={(e) => patch("issuingAuthority", e.target.value)}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ειδικότητα</span>
          <input
            value={doc.doctorSpecialty ?? ""}
            onChange={(e) => patch("doctorSpecialty", e.target.value || null)}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ημ. έκδοσης</span>
          <input
            type="date"
            value={doc.issueDate ?? ""}
            onChange={(e) => patch("issueDate", e.target.value || null)}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ημ. λήξης</span>
          <input
            type="date"
            value={doc.expiryDate}
            onChange={(e) => patch("expiryDate", e.target.value)}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Follow-up ανανέωσης</span>
          <input
            type="date"
            value={doc.renewalFollowUpDate ?? ""}
            onChange={(e) => patch("renewalFollowUpDate", e.target.value || null)}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Υπεύθυνος</span>
          <select
            value={doc.responsiblePersonLabel ?? "Γραμματεία"}
            onChange={(e) => patch("responsiblePersonLabel", e.target.value)}
            className={field}
          >
            {DIAGNOSIS_RESPONSIBLE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={doc.renewalRequired}
            onChange={(e) => patch("renewalRequired", e.target.checked)}
          />
          <span className="text-ink-muted">Απαιτείται ανανέωση</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={doc.renewalProcessStarted}
            onChange={(e) => patch("renewalProcessStarted", e.target.checked)}
          />
          <span className="text-ink-muted">Διαδικασία ανανέωσης</span>
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Σημειώσεις</span>
          <textarea value={doc.notes} onChange={(e) => patch("notes", e.target.value)} rows={3} className={field} />
        </label>
      </div>
    </SecretaryEntityDetailModal>
  );
}
