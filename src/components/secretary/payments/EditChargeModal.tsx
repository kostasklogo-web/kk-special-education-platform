"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { PaymentObligation, PaymentReceiptStatus } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { RECEIPT_STATUS_LABELS } from "@/lib/secretary/payments/labels";
import { upsertCharge } from "@/lib/secretary/payments/store";
import { EntityLinkedTasksPanel } from "@/components/secretary/tasks/EntityLinkedTasksPanel";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { roundMoney } from "@/lib/secretary/payments/calculations";

const field =
  "mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-3 text-base text-ink focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

type Props = {
  charge: PaymentObligation;
  open: boolean;
  canEditExpectedAmount: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function EditChargeModal({ charge, open, canEditExpectedAmount, onClose, onSaved }: Props) {
  const today = todayAthensYmd();
  const [expected, setExpected] = useState(String(charge.expectedAmount));
  const [receipt, setReceipt] = useState<PaymentReceiptStatus>(charge.receiptStatus);
  const [notes, setNotes] = useState(charge.notes);

  if (!open) return null;

  const submit = () => {
    const expectedAmount = canEditExpectedAmount ? roundMoney(Number(expected)) : charge.expectedAmount;
    upsertCharge(
      {
        ...charge,
        expectedAmount,
        receiptStatus: receipt,
        notes: notes.trim(),
        expectedAmountLocked: !canEditExpectedAmount,
      },
      today
    );
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-white shadow-xl sm:rounded-2xl" role="dialog" aria-modal="true">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Επεξεργασία χρέωσης</h2>
            <EntityLinkedTasksBadge link={{ kind: "payment", paymentId: charge.id, childId: charge.childId }} />
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-muted" aria-label="Κλείσιμο">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-3 p-4">
          <p className="text-sm text-ink-muted">
            {charge.childLabel} · {charge.programLabel}
          </p>
          <EntityLinkedTasksPanel link={{ kind: "payment", paymentId: charge.id }} />
          <NewCommunicationLink
            params={{
              payment: charge.id,
              childId: charge.childId,
              childLabel: charge.childLabel,
            }}
          />
          {canEditExpectedAmount ? (
            <label className="block text-xs font-semibold uppercase text-ink-muted">
              Αναμενόμενο ποσό (έγκριση διοίκησης)
              <input
                type="number"
                min={0}
                step={0.01}
                className={field}
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
              />
            </label>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              Το αναμενόμενο ποσό ({charge.expectedAmount}€) αλλάζει μόνο με έγκριση διοίκησης.
            </p>
          )}
          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Απόδειξη
            <select className={field} value={receipt} onChange={(e) => setReceipt(e.target.value as PaymentReceiptStatus)}>
              {(Object.keys(RECEIPT_STATUS_LABELS) as PaymentReceiptStatus[]).map((r) => (
                <option key={r} value={r}>
                  {RECEIPT_STATUS_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Σημειώσεις
            <textarea className={field} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        <footer className="flex gap-2 border-t border-border p-4">
          <button type="button" onClick={onClose} className="min-h-[48px] flex-1 rounded-lg border border-border text-sm font-semibold">
            Ακύρωση
          </button>
          <button
            type="button"
            onClick={submit}
            className="min-h-[48px] flex-[2] rounded-lg bg-clinical-600 text-sm font-bold text-white"
          >
            Αποθήκευση
          </button>
        </footer>
      </div>
    </div>
  );
}
