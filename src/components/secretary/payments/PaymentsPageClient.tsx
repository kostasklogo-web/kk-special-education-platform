"use client";

import { useState } from "react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import type { PaymentObligation } from "@/lib/secretary/types";
import { PAYMENT_STATUS_LABELS } from "@/lib/secretary/labels";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import {
  buildPaymentReminderPayload,
  paymentTemplateForStatus,
} from "@/components/secretary/reminders/communication-builders";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";

export function PaymentsPageClient({ payments }: { payments: PaymentObligation[] }) {
  const { consents } = useReminders();
  const today = todayAthensYmd();
  const [selected, setSelected] = useState<PaymentObligation | null>(null);

  return (
    <>
      <ul className="space-y-2">
        {payments.map((p) => {
          const tpl = paymentTemplateForStatus(p, today);
          const payload = buildPaymentReminderPayload(p, consents, tpl);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelected(p)}
                className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm hover:bg-surface-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{p.childLabel}</p>
                    <AlertBadge level={p.alertLevel} />
                  </div>
                  <p className="text-sm text-ink-muted">
                    {p.parentLabel ?? "—"} · Υπόλοιπο <strong>{p.balance}€</strong> · Λήξη {p.dueDate}
                  </p>
                  <p className="text-xs text-ink-faint">{PAYMENT_STATUS_LABELS[p.paymentStatus]}</p>
                </div>
                {p.balance > 0 ? <CreateReminderButton payload={payload} size="sm" /> : null}
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <PaymentDetailModal payment={selected} today={today} consents={consents} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}

function PaymentDetailModal({
  payment: p,
  today,
  consents,
  onClose,
}: {
  payment: PaymentObligation;
  today: string;
  consents: CommunicationConsent[];
  onClose: () => void;
}) {
  const tpl = paymentTemplateForStatus(p, today);
  const payload = buildPaymentReminderPayload(p, consents, tpl);

  return (
    <SecretaryEntityDetailModal
      open
      title="Λεπτομέρειες πληρωμής"
      subtitle={p.childLabel}
      onClose={onClose}
      footer={<CreateReminderButton payload={payload} className="w-full" variant="primary" />}
    >
      <dl className="space-y-2 text-sm">
        <DetailRow label="Γονέας" value={p.parentLabel ?? "—"} />
        <DetailRow label="Υπόλοιπο" value={`${p.balance}€`} />
        <DetailRow label="Λήξη" value={p.dueDate} />
        <DetailRow label="Κατάσταση" value={PAYMENT_STATUS_LABELS[p.paymentStatus]} />
        {p.notes ? <DetailRow label="Σημειώσεις" value={p.notes} /> : null}
      </dl>
    </SecretaryEntityDetailModal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
