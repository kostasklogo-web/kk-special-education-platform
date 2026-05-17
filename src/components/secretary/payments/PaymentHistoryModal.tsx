"use client";

import { X } from "lucide-react";
import type { PaymentObligation } from "@/lib/secretary/types";
import { formatDateEl } from "@/lib/ui/child-labels";
import { getTransactionsForCharge } from "@/lib/secretary/payments/store";
import { PAYMENT_METHOD_LABELS, RECEIPT_STATUS_LABELS } from "@/lib/secretary/payments/labels";
import { printParentPaymentHistoryPdf } from "@/lib/secretary/payments/export";
import { EntityLinkedTasksPanel } from "@/components/secretary/tasks/EntityLinkedTasksPanel";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";

type Props = {
  charge: PaymentObligation;
  open: boolean;
  onClose: () => void;
};

export function PaymentHistoryModal({ charge, open, onClose }: Props) {
  if (!open) return null;
  const txs = getTransactionsForCharge(charge.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl" role="dialog" aria-modal="true">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Ιστορικό πληρωμών</h2>
            <p className="text-sm text-ink-muted">{charge.childLabel}</p>
            <EntityLinkedTasksBadge link={{ kind: "payment", paymentId: charge.id, childId: charge.childId }} />
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-muted" aria-label="Κλείσιμο">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <EntityLinkedTasksPanel link={{ kind: "payment", paymentId: charge.id }} />
          {txs.length === 0 ? (
            <p className="text-center text-sm text-ink-muted">Δεν υπάρχουν καταχωρήσεις πληρωμής.</p>
          ) : (
            <ul className="space-y-2">
              {txs.map((t) => (
                <li key={t.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex justify-between font-semibold text-ink">
                    <span>{t.amount}€</span>
                    <span>{formatDateEl(t.paymentDate)}</span>
                  </div>
                  <p className="text-ink-muted">
                    {PAYMENT_METHOD_LABELS[t.paymentMethod]} · {RECEIPT_STATUS_LABELS[t.receiptStatus]}
                  </p>
                  {t.notes ? <p className="mt-1 text-xs text-ink-faint">{t.notes}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <footer className="border-t border-border p-4">
          <button
            type="button"
            onClick={() => printParentPaymentHistoryPdf(charge, txs)}
            className="min-h-[44px] w-full rounded-lg border border-border text-sm font-semibold hover:bg-surface-muted"
          >
            Εξαγωγή PDF
          </button>
        </footer>
      </div>
    </div>
  );
}
