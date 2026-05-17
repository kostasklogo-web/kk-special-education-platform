"use client";

import { useState } from "react";
import type { DiagnosisDocument } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import { upsertDiagnosis } from "@/lib/secretary/diagnoses/store";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

type Props = {
  doc: DiagnosisDocument;
  onClose: () => void;
  onSaved: () => void;
};

export function UploadDocumentModal({ doc, onClose, onSaved }: Props) {
  const today = todayAthensYmd();
  const [fileName, setFileName] = useState(doc.fileName ?? "");

  const submit = () => {
    if (!fileName.trim()) return;
    upsertDiagnosis(
      {
        ...doc,
        fileName: fileName.trim(),
        fileUploadedAt: new Date().toISOString(),
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
      title="Ανέβασμα εγγράφου"
      subtitle={doc.childLabel}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={!fileName.trim()}
          className="w-full rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          Αποθήκευση αρχείου
        </button>
      }
    >
      <p className="mb-3 text-sm text-ink-muted">
        Το αρχείο αποθηκεύεται προστατευμένα (demo: καταγραφή ονόματος αρχείου μόνο).
      </p>
      <label className="block text-sm">
        <span className="text-ink-muted">Αρχείο</span>
        <input
          type="file"
          className="mt-1 w-full text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFileName(f.name);
          }}
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-ink-muted">Όνομα αρχείου</span>
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2"
        />
      </label>
    </SecretaryEntityDetailModal>
  );
}
