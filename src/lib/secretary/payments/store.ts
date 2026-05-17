"use client";

import { getDemoOrganizationId } from "@/lib/config/demo";
import { SECRETARY_DEMO_PAYMENTS } from "@/lib/demo/secretary-demo-data";
import type {
  PaymentMethod,
  PaymentObligation,
  PaymentReceiptStatus,
  PaymentTransaction,
} from "@/lib/secretary/types";
import { enrichCharge, roundMoney } from "./calculations";
import { syncAutoTaskFromPayment } from "@/lib/secretary/tasks/auto-generate";

const CHARGES_KEY = "secretary-payment-charges-v1";
const TX_KEY = "secretary-payment-transactions-v1";

export const PAYMENTS_UPDATED_EVENT = "secretary-payments-updated";

function loadJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function persistCharges(list: PaymentObligation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHARGES_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(PAYMENTS_UPDATED_EVENT));
}

function persistTx(list: PaymentTransaction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TX_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(PAYMENTS_UPDATED_EVENT));
}

export function getStoredCharges(): PaymentObligation[] {
  return loadJson<PaymentObligation>(CHARGES_KEY);
}

export function getAllCharges(todayYmd: string): PaymentObligation[] {
  const stored = getStoredCharges();
  const demoIds = new Set(SECRETARY_DEMO_PAYMENTS.map((c) => c.id));
  const merged = [
    ...SECRETARY_DEMO_PAYMENTS.map((c) => enrichCharge(c, todayYmd)),
    ...stored.filter((c) => !demoIds.has(c.id)).map((c) => enrichCharge(c, todayYmd)),
  ];
  return merged.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
}

export function getTransactions(): PaymentTransaction[] {
  return loadJson<PaymentTransaction>(TX_KEY).sort(
    (a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt)
  );
}

export function getTransactionsForCharge(chargeId: string): PaymentTransaction[] {
  return getTransactions().filter((t) => t.chargeId === chargeId);
}

export function upsertCharge(charge: PaymentObligation, todayYmd: string): PaymentObligation {
  const enriched = enrichCharge(charge, todayYmd);
  const demoIds = new Set(SECRETARY_DEMO_PAYMENTS.map((c) => c.id));
  if (demoIds.has(enriched.id)) {
    const stored = getStoredCharges();
    const idx = stored.findIndex((c) => c.id === enriched.id);
    if (idx >= 0) stored[idx] = enriched;
    else stored.unshift(enriched);
    persistCharges(stored);
    return enriched;
  }
  const stored = getStoredCharges();
  const idx = stored.findIndex((c) => c.id === enriched.id);
  if (idx >= 0) stored[idx] = enriched;
  else stored.unshift(enriched);
  persistCharges(stored);
  syncAutoTaskFromPayment(enriched, todayYmd);
  return enriched;
}

export function registerPayment(input: {
  chargeId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptStatus: PaymentReceiptStatus;
  notes: string;
  todayYmd: string;
}): { charge: PaymentObligation; transaction: PaymentTransaction } | null {
  const charges = getAllCharges(input.todayYmd);
  const charge = charges.find((c) => c.id === input.chargeId);
  if (!charge) return null;

  const tx: PaymentTransaction = {
    id: `ptx-${Date.now()}`,
    chargeId: charge.id,
    organizationId: charge.organizationId,
    amount: roundMoney(input.amount),
    paymentDate: input.paymentDate,
    paymentMethod: input.paymentMethod,
    receiptStatus: input.receiptStatus,
    notes: input.notes,
    recordedAt: new Date().toISOString(),
  };

  const txs = getTransactions();
  txs.unshift(tx);
  persistTx(txs);

  const updated = upsertCharge(
    {
      ...charge,
      paidAmount: roundMoney(charge.paidAmount + input.amount),
      paymentDate: input.paymentDate,
      paymentMethod: input.paymentMethod,
      receiptStatus: input.receiptStatus,
      notes: input.notes
        ? charge.notes
          ? `${charge.notes}\n[${input.paymentDate}] ${input.notes}`
          : `[${input.paymentDate}] ${input.notes}`
        : charge.notes,
    },
    input.todayYmd
  );

  return { charge: updated, transaction: tx };
}

export function createChargeDraft(
  partial: Omit<PaymentObligation, "id"> & { id?: string },
  todayYmd: string
): PaymentObligation {
  const org = partial.organizationId || getDemoOrganizationId();
  const charge: PaymentObligation = {
    id: partial.id ?? `charge-${Date.now()}`,
    organizationId: org,
    childId: partial.childId,
    childLabel: partial.childLabel,
    parentId: partial.parentId,
    parentLabel: partial.parentLabel,
    locationCode: partial.locationCode,
    obligationMonth: partial.obligationMonth,
    programLabel: partial.programLabel,
    expectedAmount: partial.expectedAmount,
    paidAmount: partial.paidAmount ?? 0,
    balance: partial.balance ?? partial.expectedAmount,
    dueDate: partial.dueDate,
    paymentDate: partial.paymentDate ?? null,
    paymentMethod: partial.paymentMethod ?? null,
    paymentStatus: partial.paymentStatus ?? "due_soon",
    alertLevel: partial.alertLevel ?? "yellow",
    receiptStatus: partial.receiptStatus ?? "pending",
    notes: partial.notes ?? "",
    escalatedToManagement: partial.escalatedToManagement ?? false,
    expectedAmountLocked: partial.expectedAmountLocked ?? true,
    lastReminderAt: partial.lastReminderAt ?? null,
  };
  return upsertCharge(charge, todayYmd);
}
