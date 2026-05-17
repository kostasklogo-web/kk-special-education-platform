"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, MessageCircle, Upload } from "lucide-react";
import type { DiagnosisDocument } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import { formatDateEl } from "@/lib/ui/child-labels";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import { DiagnosisStatusBadge } from "./DiagnosisStatusBadge";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildDiagnosisReminderPayload } from "@/components/secretary/reminders/communication-builders";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { EntityLinkedTasksPanel } from "@/components/secretary/tasks/EntityLinkedTasksPanel";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { upsertDiagnosis } from "@/lib/secretary/diagnoses/store";
import { startRenewalProcess, markDiagnosisRenewed, archiveDiagnosis } from "@/lib/secretary/diagnoses/renewal-workflow";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { renderReminderMessage } from "@/lib/secretary/reminders/render-message";
import { diagnosisTemplateForDocument } from "@/lib/secretary/diagnoses/reminder-templates";

type Props = {
  doc: DiagnosisDocument;
  consents: CommunicationConsent[];
  canMutate: boolean;
  canArchive: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onEdit: (doc: DiagnosisDocument) => void;
  onUpload: (doc: DiagnosisDocument) => void;
};

export function DiagnosisDetailModal({
  doc: initial,
  consents,
  canMutate,
  canArchive,
  onClose,
  onUpdated,
  onEdit,
  onUpload,
}: Props) {
  const today = todayAthensYmd();
  const { createReminderFromPayload, copyMessage, markSent } = useReminders();
  const [doc, setDoc] = useState(initial);

  const payload = buildDiagnosisReminderPayload(doc, consents);
  const tpl = diagnosisTemplateForDocument(doc);
  const msg = renderReminderMessage(tpl, payload.context, payload.suggestedChannel ?? "sms");

  const refresh = (d: DiagnosisDocument) => {
    setDoc(d);
    onUpdated();
  };

  const copyReminder = async () => {
    const rec = createReminderFromPayload(payload, payload.suggestedChannel ?? "sms", "copied");
    await copyMessage(rec.id, msg, payload.suggestedChannel ?? "sms");
  };

  const markReminderSent = () => {
    const rec = createReminderFromPayload(payload, payload.suggestedChannel ?? "sms", "sent");
    markSent(rec.id, payload.suggestedChannel ?? "sms", msg);
  };

  const startRenewal = () => {
    const { doc: updated } = startRenewalProcess(doc, today);
    refresh(updated);
  };

  return (
    <SecretaryEntityDetailModal
      open
      title="Λεπτομέρειες εγγράφου"
      subtitle={doc.childLabel}
      onClose={onClose}
      footer={
        canMutate ? (
          <div className="flex flex-col gap-2">
            <CreateReminderButton payload={payload} className="w-full" variant="primary" />
          </div>
        ) : null
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <DiagnosisStatusBadge status={doc.status} />
        <AlertBadge level={doc.alertLevel} />
        {!doc.fileName ? (
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
            Χωρίς αρχείο
          </span>
        ) : null}
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="Παιδί" value={doc.childLabel} />
        <Row label="Τοποθεσία" value={LOCATION_LABELS[doc.locationCode]} />
        <Row label="Τύπος" value={doc.documentType} />
        <Row label="Περιγραφή" value={doc.diagnosisDescription} />
        <Row label="Φορέας έκδοσης" value={doc.issuingAuthority} />
        {doc.doctorSpecialty ? <Row label="Ειδικότητα" value={doc.doctorSpecialty} /> : null}
        <Row label="Έκδοση" value={doc.issueDate ? formatDateEl(doc.issueDate) : "—"} />
        <Row label="Λήξη" value={formatDateEl(doc.expiryDate)} />
        <Row label="Ημέρες μέχρι λήξη" value={String(doc.daysUntilExpiry)} />
        <Row label="Ανανέωση" value={doc.renewalRequired ? "Ναι" : "Όχι"} />
        <Row label="Διαδικασία ανανέωσης" value={doc.renewalProcessStarted ? "Ξεκίνησε" : "—"} />
        {doc.renewalFollowUpDate ? (
          <Row label="Follow-up" value={formatDateEl(doc.renewalFollowUpDate)} />
        ) : null}
        <Row label="Υπεύθυνος" value={doc.responsiblePersonLabel ?? "—"} />
        {doc.fileName ? <Row label="Αρχείο" value={doc.fileName} /> : null}
        {doc.notes ? <Row label="Σημειώσεις" value={doc.notes} /> : null}
      </dl>

      <EntityLinkedTasksPanel link={{ kind: "diagnosis", diagnosisId: doc.id }} />

      {canMutate ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => onEdit(doc)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted"
          >
            Επεξεργασία
          </button>
          <button
            type="button"
            onClick={() => onUpload(doc)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
          >
            <Upload className="h-3.5 w-3.5" />
            {doc.fileName ? "Αντικατάσταση" : "Ανέβασμα"}
          </button>
          {!doc.renewalProcessStarted && doc.renewalRequired && !doc.renewedAt ? (
            <button
              type="button"
              onClick={startRenewal}
              className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900"
            >
              Έναρξη ανανέωσης
            </button>
          ) : null}
          {doc.renewalProcessStarted ? (
            <button
              type="button"
              onClick={() => refresh(markDiagnosisRenewed(doc, today))}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900"
            >
              Σημείωση ως ανανεωμένο
            </button>
          ) : null}
          <button
            type="button"
            onClick={copyReminder}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
          >
            <Copy className="h-3.5 w-3.5" />
            Αντιγραφή μηνύματος
          </button>
          <button
            type="button"
            onClick={markReminderSent}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Υπενθύμιση απεστάλη
          </button>
          <NewCommunicationLink
            size="sm"
            params={{ diagnosis: doc.id, childId: doc.childId, childLabel: doc.childLabel }}
          />
          {canArchive && !doc.archived ? (
            <button
              type="button"
              onClick={() => {
                if (!confirm("Αρχειοθέτηση εγγράφου;")) return;
                refresh(archiveDiagnosis(doc, today));
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Αρχειοθέτηση
            </button>
          ) : null}
          <Link
            href={`/secretary/tasks?childId=${doc.childId}&child=${encodeURIComponent(doc.childLabel)}`}
            className="text-xs font-semibold text-clinical-700 hover:underline"
          >
            Εργασίες →
          </Link>
        </div>
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
