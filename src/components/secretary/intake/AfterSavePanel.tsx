"use client";

import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  MessageCircle,
  Stethoscope,
  User,
  ListTodo,
} from "lucide-react";
import type { ClientIntake } from "@/lib/secretary/types";
import type { SecretaryScheduleTypeCode } from "@/lib/secretary/schedule-catalog";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import type { OpenReminderPayload } from "@/components/secretary/reminders/reminder-payload";
import { scheduleUrlFromIntake } from "@/lib/secretary/intake/schedule-prefill";
import { LeadStatusBadge } from "./LeadStatusBadge";

function welcomePayload(intake: ClientIntake): OpenReminderPayload {
  const childLabel = `${intake.childFirstName} ${intake.childLastName}`;
  return {
    templateCode: "appointment_confirmation",
    entityType: "child",
    entityId: intake.id,
    childId: intake.childId,
    childLabel,
    recipientName: intake.parentPrimaryName || intake.parentNames,
    recipientPhone: intake.phonePrimary,
    recipientEmail: intake.email,
    context: {
      parent_name: intake.parentPrimaryName || intake.parentNames,
      child_name: childLabel,
      appointment_date: "σύντομα",
      appointment_time: "—",
      appointment_type: "Καλωσόρισμα / πρώτη επικοινωνία",
      location: "Κέντρο",
      center_name: "Κέντρο Ειδικής Αγωγής",
      center_phone: "210 0000000",
      center_email: "info@example.gr",
    },
    suggestedChannel: intake.consentSms ? "sms" : intake.consentEmail ? "email" : "sms",
  };
}

type Props = {
  intake: ClientIntake;
  onNewCase: () => void;
};

const SCHEDULE_ACTIONS: {
  type: SecretaryScheduleTypeCode;
  label: string;
  icon: typeof Calendar;
}[] = [
  { type: "parent_info", label: "Προγραμμάτισε ενημερωτικό ραντεβού", icon: Calendar },
  { type: "history_taking", label: "Προγραμμάτισε λήψη ιστορικού", icon: ClipboardList },
  { type: "evaluation", label: "Προγραμμάτισε αξιολόγηση", icon: Stethoscope },
];

export function AfterSavePanel({ intake, onNewCase }: Props) {
  const { openReminder } = useReminders();
  const childLabel = `${intake.childFirstName} ${intake.childLastName}`;

  return (
    <div className="space-y-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-emerald-950">Αποθηκεύτηκε: {childLabel}</p>
          <p className="text-xs text-emerald-900/80">Επιλέξτε την επόμενη ενέργεια</p>
        </div>
        <LeadStatusBadge status={intake.leadStatus} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {SCHEDULE_ACTIONS.map(({ type, label, icon: Icon }) => (
          <Link
            key={type}
            href={scheduleUrlFromIntake(intake, type)}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-emerald-50"
          >
            <Icon className="h-4 w-4 shrink-0 text-clinical-600" />
            {label}
          </Link>
        ))}
        <Link
          href={`/secretary/tasks?followup=${intake.id}`}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-emerald-50"
        >
          <ListTodo className="h-4 w-4 shrink-0 text-clinical-600" />
          Δημιούργησε follow-up task
        </Link>
        <button
          type="button"
          onClick={() => openReminder(welcomePayload(intake))}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-emerald-50 sm:col-span-2"
        >
          <MessageCircle className="h-4 w-4 shrink-0 text-clinical-600" />
          Στείλε μήνυμα καλωσορίσματος
        </button>
        {intake.childId ? (
          <Link
            href={`/children/${intake.childId}`}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-clinical-600 px-3 py-2 text-sm font-bold text-white hover:bg-clinical-700 sm:col-span-2"
          >
            <User className="h-4 w-4" />
            Άνοιγμα προφίλ παιδιού
          </Link>
        ) : (
          <p className="text-xs text-emerald-900 sm:col-span-2">
            Το προφίλ παιδιού δημιουργείται με πλήρη αποθήκευση και GDPR.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-emerald-200/80 pt-3">
        <button
          type="button"
          onClick={onNewCase}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
        >
          Νέο περιστατικό
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("secretary-intake-print", { detail: intake }))}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
        >
          Εκτύπωση PDF
        </button>
      </div>
    </div>
  );
}
