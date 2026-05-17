"use client";

import { useState } from "react";
import type {
  AppointmentLocationCode,
  CommunicationLog,
  CommunicationReasonCode,
  CommunicationStatus,
  TaskPriority,
} from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import {
  COMMUNICATION_REASONS,
  COMMUNICATION_TYPES,
  CONTACT_ROLE_OPTIONS,
  RESPONSIBLE_PERSON_OPTIONS,
} from "@/lib/secretary/communications/catalog";
import { COMMUNICATION_PRIORITY_LABELS } from "@/lib/secretary/communications/labels";
import { COMMUNICATION_STATUS_LABELS } from "@/lib/secretary/communications/labels";
import { LOCATION_FILTER_OPTIONS } from "@/lib/secretary/schedule-catalog";
import { createCommunicationDraft } from "@/lib/secretary/communications/store";
import { createFollowUpTaskFromCommunication } from "@/lib/secretary/communications/create-followup-task";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

export type CommunicationDraftPrefill = Partial<CommunicationLog>;

type Props = {
  prefill?: CommunicationDraftPrefill;
  onClose: () => void;
  onCreated: (log: CommunicationLog) => void;
};

const field =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

export function CreateCommunicationModal({ prefill, onClose, onCreated }: Props) {
  const today = todayAthensYmd();
  const now = new Date();
  const [childLabel, setChildLabel] = useState(prefill?.childLabel ?? "");
  const [parentLabel, setParentLabel] = useState(prefill?.parentLabel ?? "");
  const [contactPerson, setContactPerson] = useState(prefill?.contactPerson ?? "");
  const [contactRole, setContactRole] = useState(prefill?.contactRole ?? "parent");
  const [contactPhone, setContactPhone] = useState(prefill?.contactPhone ?? "");
  const [typeCode, setTypeCode] = useState(prefill?.communicationTypeCode ?? "parent_call");
  const [reasonCode, setReasonCode] = useState<CommunicationReasonCode>(
    prefill?.reasonCode ?? "parent_update"
  );
  const [summary, setSummary] = useState(prefill?.summary ?? "");
  const [outcome, setOutcome] = useState(prefill?.outcome ?? "");
  const [status, setStatus] = useState<CommunicationStatus>(prefill?.status ?? "completed");
  const [priority, setPriority] = useState<TaskPriority>(prefill?.priority ?? "normal");
  const [locationCode, setLocationCode] = useState<AppointmentLocationCode>(
    prefill?.locationCode ?? "nikaia"
  );
  const [commDate, setCommDate] = useState(prefill?.communicationDate ?? today);
  const [commTime, setCommTime] = useState(
    prefill?.communicationTime ?? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );
  const [nextRequired, setNextRequired] = useState(prefill?.nextActionRequired ?? false);
  const [nextAction, setNextAction] = useState(prefill?.nextAction ?? "");
  const [followUpDate, setFollowUpDate] = useState(prefill?.followUpDate ?? "");
  const [followUpTime, setFollowUpTime] = useState(prefill?.followUpTime ?? "");
  const [responsible, setResponsible] = useState(prefill?.responsiblePersonLabel ?? "Γραμματεία");

  const typeDef = COMMUNICATION_TYPES.find((t) => t.code === typeCode);
  const reasonDef = COMMUNICATION_REASONS.find((r) => r.code === reasonCode);

  const submit = () => {
    if (!contactPerson.trim() || !summary.trim()) return;
    if (nextRequired && (!followUpDate || !responsible.trim())) return;

    const occurredAt = `${commDate}T${commTime || "12:00"}:00.000Z`;
    const log = createCommunicationDraft(
      {
        ...prefill,
        childId: prefill?.childId ?? null,
        childLabel: childLabel.trim() || null,
        parentLabel: parentLabel.trim() || null,
        contactPerson: contactPerson.trim(),
        contactRole,
        contactPhone: contactPhone.trim() || null,
        communicationTypeCode: typeCode,
        communicationTypeLabel: typeDef?.labelEl ?? typeCode,
        reasonCode,
        reason: reasonDef?.labelEl ?? reasonCode,
        summary: summary.trim(),
        outcome: outcome.trim() || null,
        status: nextRequired ? "needs_followup" : status,
        priority,
        locationCode,
        communicationDate: commDate,
        communicationTime: commTime || null,
        occurredAt,
        nextActionRequired: nextRequired,
        nextAction: nextRequired ? nextAction.trim() || "Follow-up" : null,
        followUpDate: nextRequired ? followUpDate : null,
        followUpTime: nextRequired ? followUpTime || null : null,
        responsiblePersonLabel: nextRequired ? responsible : null,
        linkedTaskId: prefill?.linkedTaskId ?? null,
      },
      today
    );

    if (nextRequired && !log.linkedTaskId) {
      const taskId = createFollowUpTaskFromCommunication(log, today);
      if (taskId) {
        createCommunicationDraft({ ...log, linkedTaskId: taskId }, today);
      }
    }

    onCreated(log);
    onClose();
  };

  return (
    <SecretaryEntityDetailModal
      open
      title="Νέα επικοινωνία"
      subtitle="Γρήγορη καταχώριση κατά τη διάρκεια κλήσης"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={!contactPerson.trim() || !summary.trim() || (nextRequired && (!followUpDate || !responsible.trim()))}
          className="w-full rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-clinical-700 disabled:opacity-50"
        >
          Αποθήκευση
        </button>
      }
    >
      <div className="grid max-h-[60vh] gap-3 overflow-y-auto text-sm sm:grid-cols-2">
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Παιδί</span>
          <input value={childLabel} onChange={(e) => setChildLabel(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Γονέας</span>
          <input value={parentLabel} onChange={(e) => setParentLabel(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Επαφή *</span>
          <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ρόλος επαφής</span>
          <select value={contactRole} onChange={(e) => setContactRole(e.target.value)} className={field}>
            {CONTACT_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Τηλέφωνο</span>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Τύπος *</span>
          <select value={typeCode} onChange={(e) => setTypeCode(e.target.value as typeof typeCode)} className={field}>
            {COMMUNICATION_TYPES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.labelEl}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Λόγος *</span>
          <select
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value as CommunicationReasonCode)}
            className={field}
          >
            {COMMUNICATION_REASONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.labelEl}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Ημερομηνία</span>
          <input type="date" value={commDate} onChange={(e) => setCommDate(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ώρα</span>
          <input type="time" value={commTime} onChange={(e) => setCommTime(e.target.value)} className={field} />
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
          <span className="text-ink-muted">Κατάσταση *</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as CommunicationStatus)} className={field}>
            {(Object.keys(COMMUNICATION_STATUS_LABELS) as CommunicationStatus[]).map((s) => (
              <option key={s} value={s}>
                {COMMUNICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Προτεραιότητα</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className={field}
          >
            {(Object.keys(COMMUNICATION_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {COMMUNICATION_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Περίληψη *</span>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className={field} />
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Αποτέλεσμα</span>
          <input value={outcome} onChange={(e) => setOutcome(e.target.value)} className={field} />
        </label>
        <label className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" checked={nextRequired} onChange={(e) => setNextRequired(e.target.checked)} />
          <span className="font-medium">Απαιτείται επόμενη ενέργεια (αυτόματη εργασία)</span>
        </label>
        {nextRequired ? (
          <>
            <label className="block">
              <span className="text-ink-muted">Follow-up ημερομηνία *</span>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className="text-ink-muted">Follow-up ώρα</span>
              <input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className="text-ink-muted">Υπεύθυνος *</span>
              <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className={field}>
                {RESPONSIBLE_PERSON_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 block">
              <span className="text-ink-muted">Επόμενη ενέργεια</span>
              <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className={field} />
            </label>
          </>
        ) : null}
      </div>
    </SecretaryEntityDetailModal>
  );
}
