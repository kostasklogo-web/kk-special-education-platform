"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Copy, Check, Calendar, Phone } from "lucide-react";
import { useReminders } from "./ReminderProvider";
import type { ReminderChannel, ReminderTemplateCode } from "@/lib/secretary/reminders/types";
import { renderReminderMessage } from "@/lib/secretary/reminders/render-message";
import { channelAllowed, consentWarning } from "@/lib/secretary/reminders/consent";
import { REMINDER_CHANNEL_LABELS, REMINDER_STATUS_LABELS } from "@/lib/secretary/reminders/config";
import { templatesForEntity, type CommunicationEntityKind } from "@/lib/secretary/reminders/template-filters";
import { ReminderStatusBadge } from "./ReminderStatusBadge";

const CHANNELS: ReminderChannel[] = ["sms", "email", "whatsapp", "viber", "phone_call"];

export function ReminderSendModal() {
  const {
    openPayload,
    closeReminder,
    getConsentForChild,
    createReminderFromPayload,
    updateReminderBody,
    copyMessage,
    markSent,
    scheduleReminder,
    reminders,
  } = useReminders();

  const [channel, setChannel] = useState<ReminderChannel>("sms");
  const [templateCode, setTemplateCode] = useState<ReminderTemplateCode>("appointment_confirmation");
  const [scheduleAt, setScheduleAt] = useState("");
  const [activeReminderId, setActiveReminderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const messageTouchedRef = useRef(false);
  const openedKeyRef = useRef<string | null>(null);

  const entityKind: CommunicationEntityKind | null = openPayload?.entityType ?? null;
  const templateOptions = useMemo(
    () => (entityKind ? templatesForEntity(entityKind) : []),
    [entityKind]
  );

  const renderedMessage = useMemo(() => {
    if (!openPayload) return "";
    return renderReminderMessage(templateCode, openPayload.context, channel);
  }, [openPayload, templateCode, channel]);

  useEffect(() => {
    if (!openPayload) {
      openedKeyRef.current = null;
      messageTouchedRef.current = false;
      return;
    }
    const key = `${openPayload.entityType}:${openPayload.entityId}`;
    setTemplateCode(openPayload.templateCode);
    setChannel(openPayload.suggestedChannel ?? "sms");
    setCopied(false);
    setScheduleAt("");
    messageTouchedRef.current = false;

    const existing = reminders.find(
      (r) =>
        r.entityId === openPayload.entityId &&
        r.entityType === openPayload.entityType &&
        ["pending", "scheduled"].includes(r.status)
    );
    if (existing) {
      setActiveReminderId(existing.id);
      setDraftMessage(existing.messageBody);
      openedKeyRef.current = key;
      return;
    }
    if (openedKeyRef.current === key) return;
    openedKeyRef.current = key;
    const created = createReminderFromPayload(openPayload, openPayload.suggestedChannel ?? "sms", "pending");
    setActiveReminderId(created.id);
    setDraftMessage(created.messageBody);
  }, [openPayload, reminders, createReminderFromPayload]);

  useEffect(() => {
    if (!openPayload || messageTouchedRef.current) return;
    setDraftMessage(renderedMessage);
    if (activeReminderId) updateReminderBody(activeReminderId, renderedMessage);
  }, [renderedMessage, openPayload, activeReminderId, updateReminderBody]);

  const consent = openPayload ? getConsentForChild(openPayload.childId) : null;
  const warning = consentWarning(consent, channel);
  const activeReminder = reminders.find((r) => r.id === activeReminderId);

  if (!openPayload) return null;

  const syncBody = (body: string) => {
    setDraftMessage(body);
    if (activeReminderId) updateReminderBody(activeReminderId, body);
  };

  const handleCopy = async () => {
    if (!activeReminderId) return;
    await copyMessage(activeReminderId, draftMessage, channel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkSent = () => {
    if (!activeReminderId) return;
    markSent(activeReminderId, channel, draftMessage);
  };

  const handlePhoneLog = () => {
    if (!activeReminderId) return;
    markSent(activeReminderId, "phone_call", draftMessage);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" role="dialog" aria-modal="true">
        <header className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Επικοινωνία</h2>
            <p className="text-sm text-ink-muted">
              {openPayload.childLabel} · {openPayload.recipientName}
            </p>
          </div>
          <button type="button" onClick={closeReminder} className="rounded-lg p-2 hover:bg-surface-muted" aria-label="Κλείσιμο">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {warning ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="alert">
              {warning}
            </p>
          ) : null}

          {consent ? (
            <p className="text-[11px] text-ink-faint">
              Συγκατάθεση: SMS {consent.smsConsent ? "✓" : "✗"} · Email {consent.emailConsent ? "✓" : "✗"} · WA{" "}
              {consent.whatsappConsent ? "✓" : "✗"} · Viber {consent.viberConsent ? "✓" : "✗"}
            </p>
          ) : null}

          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Πρότυπο μηνύματος
            <select
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-3 text-sm"
              value={templateCode}
              onChange={(e) => {
                messageTouchedRef.current = false;
                setTemplateCode(e.target.value as ReminderTemplateCode);
              }}
            >
              {templateOptions.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.nameEl}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-xs font-semibold uppercase text-ink-muted">Κανάλι</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CHANNELS.map((ch) => {
                const allowed = channelAllowed(consent, ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    disabled={!allowed && ch !== "phone_call"}
                    onClick={() => {
                      messageTouchedRef.current = false;
                      setChannel(ch);
                    }}
                    className={`min-h-[44px] rounded-lg border px-2 text-xs font-bold ${
                      channel === ch
                        ? "border-clinical-600 bg-clinical-600 text-white"
                        : allowed
                          ? "border-border bg-white text-ink"
                          : "border-border bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {REMINDER_CHANNEL_LABELS[ch]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="text-[11px] text-ink-muted">
            {channel === "email" ? "Μακροκείμενο (email)" : "Σύντομο (SMS / WhatsApp / Viber)"}
          </p>
          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Προεπισκόπηση / επεξεργασία
            <textarea
              className="mt-1 min-h-[160px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-relaxed text-ink"
              value={draftMessage}
              onChange={(e) => {
                messageTouchedRef.current = true;
                syncBody(e.target.value);
              }}
            />
          </label>

          {activeReminder ? <ReminderStatusBadge status={activeReminder.status} /> : null}

          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Προγραμματισμός υπενθύμισης (προαιρετικό)
            <input
              type="datetime-local"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-border px-3 text-sm"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </label>
        </div>

        <footer className="grid gap-2 border-t border-border p-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-clinical-600 bg-white text-sm font-bold text-clinical-700"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Αντιγράφηκε!" : "Αντιγραφή μηνύματος"}
          </button>
          <button
            type="button"
            disabled={!!warning && channel !== "phone_call"}
            onClick={handleMarkSent}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-clinical-600 text-sm font-bold text-white disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Σημείωση ως απεσταλμένο
          </button>
          <button
            type="button"
            onClick={handlePhoneLog}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-semibold sm:col-span-2"
          >
            <Phone className="h-4 w-4" />
            Καταγραφή τηλεφωνικής κλήσης
          </button>
          {scheduleAt ? (
            <button
              type="button"
              onClick={() => {
                if (activeReminderId) {
                  updateReminderBody(activeReminderId, draftMessage);
                  scheduleReminder(activeReminderId, new Date(scheduleAt).toISOString());
                  closeReminder();
                }
              }}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold sm:col-span-2"
            >
              <Calendar className="h-4 w-4" />
              Προγραμματισμός ({REMINDER_STATUS_LABELS.scheduled})
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
