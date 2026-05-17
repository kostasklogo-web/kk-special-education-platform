"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { PaymentObligation, PaymentMethod, PaymentReceiptStatus } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { PAYMENT_METHOD_LABELS, RECEIPT_STATUS_LABELS } from "@/lib/secretary/payments/labels";
import { registerPayment } from "@/lib/secretary/payments/store";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";
import { EntityLinkedTasksPanel } from "@/components/secretary/tasks/EntityLinkedTasksPanel";

const field =
  "mt-1 min-h-[44px] w-full rounded-lg border border-border bg-white px-3 text-base text-ink focus:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500/30";

type Props = {
  charge: PaymentObligation;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function RegisterPaymentModal({ charge, open, onClose, onSaved }: Props) {
  const today = todayAthensYmd();
  const [amount, setAmount] = useState(String(charge.balance > 0 ? charge.balance : ""));
  const [paymentDate, setPaymentDate] = useState(today);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [receipt, setReceipt] = useState<PaymentReceiptStatus>("pending");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setError("Εισάγετε έγκυρο ποσό.");
      return;
    }
    const result = registerPayment({
      chargeId: charge.id,
      amount: num,
      paymentDate,
      paymentMethod: method,
      receiptStatus: receipt,
      notes: notes.trim(),
      todayYmd: today,
    });
    if (!result) {
      setError("Αποτυχία αποθήκευσης.");
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-white shadow-xl sm:rounded-2xl" role="dialog" aria-modal="true">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-bold text-ink">Καταχώριση πληρωμής</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-muted" aria-label="Κλείσιμο">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-3 p-4">
          <div className="rounded-lg bg-surface-muted/50 px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-ink">{charge.childLabel}</p>
              <EntityLinkedTasksBadge link={{ kind: "payment", paymentId: charge.id, childId: charge.childId }} />
            </div>
            <p className="text-ink-muted">Γονέας: {charge.parentLabel ?? "—"}</p>
            <p className="text-ink-muted">
              Υπόλοιπο: <strong className="text-ink">{charge.balance}€</strong>
            </p>
          </div>
          <EntityLinkedTasksPanel link={{ kind: "payment", paymentId: charge.id }} />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Ποσό πληρωμής *
            <input
              type="number"
              min={0.01}
              step={0.01}
              className={field}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Ημερομηνία πληρωμής *
            <input type="date" className={field} value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </label>
          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Τρόπος πληρωμής
            <select className={field} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase text-ink-muted">
            Κατάσταση απόδειξης
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
            <textarea className={field} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        <footer className="flex gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] flex-1 rounded-lg border border-border text-sm font-semibold"
          >
            Ακύρωση
          </button>
          <button
            type="button"
            onClick={submit}
            className="min-h-[48px] flex-[2] rounded-lg bg-clinical-600 text-sm font-bold text-white hover:bg-clinical-700"
          >
            Αποθήκευση
          </button>
        </footer>
      </div>
    </div>
  );
}
