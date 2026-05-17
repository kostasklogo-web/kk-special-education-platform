import type { PaymentObligation, PaymentTransaction } from "@/lib/secretary/types";
import { downloadCsv, rowsToCsv } from "@/lib/secretary/exports";
import { formatDateEl } from "@/lib/ui/child-labels";
import {
  locationLabel,
  PAYMENT_DISPLAY_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_STATUS_LABELS,
} from "./labels";
import { isManagementReviewStatus } from "./calculations";

export function exportUnpaidBalancesExcel(charges: PaymentObligation[]) {
  const unpaid = charges.filter((c) => c.balance > 0);
  const headers = ["Παιδί", "Γονέας", "Τοποθεσία", "Μήνας", "Αναμενόμενο", "Πληρωμένο", "Υπόλοιπο", "Λήξη", "Κατάσταση"];
  const rows = unpaid.map((c) => [
    c.childLabel,
    c.parentLabel ?? "",
    locationLabel(c.locationCode),
    c.obligationMonth.slice(0, 7),
    String(c.expectedAmount),
    String(c.paidAmount),
    String(c.balance),
    formatDateEl(c.dueDate),
    PAYMENT_DISPLAY_STATUS_LABELS[c.paymentStatus],
  ]);
  downloadCsv(`anexoflita-${new Date().toISOString().slice(0, 10)}.csv`, rowsToCsv(headers, rows));
}

export function exportOverdueListExcel(charges: PaymentObligation[], todayYmd: string) {
  const overdue = charges.filter(
    (c) =>
      c.balance > 0 &&
      (c.paymentStatus.startsWith("overdue") ||
        c.paymentStatus === "overdue" ||
        isManagementReviewStatus(c.paymentStatus))
  );
  const headers = ["Παιδί", "Γονέας", "Υπόλοιπο", "Λήξη", "Ημέρες καθυστέρησης", "Κατάσταση"];
  const rows = overdue.map((c) => {
    const days = Math.max(
      0,
      Math.round(
        (Date.parse(`${todayYmd}T12:00:00.000Z`) - Date.parse(`${c.dueDate}T12:00:00.000Z`)) /
          86400000
      )
    );
    return [
      c.childLabel,
      c.parentLabel ?? "",
      String(c.balance),
      formatDateEl(c.dueDate),
      String(days),
      PAYMENT_DISPLAY_STATUS_LABELS[c.paymentStatus],
    ];
  });
  downloadCsv(`kathusteriseis-${todayYmd}.csv`, rowsToCsv(headers, rows));
}

export function printMonthlyCollectionPdf(
  charges: PaymentObligation[],
  monthYmd: string,
  metrics: { expected: number; collected: number; cashFlowPct: number }
) {
  const monthPrefix = monthYmd.slice(0, 7);
  const inMonth = charges.filter((c) => c.obligationMonth.startsWith(monthPrefix));
  const rows = inMonth
    .map(
      (c) =>
        `<tr><td>${c.childLabel}</td><td>${c.parentLabel ?? "—"}</td><td>${c.expectedAmount}€</td><td>${c.paidAmount}€</td><td>${c.balance}€</td><td>${PAYMENT_DISPLAY_STATUS_LABELS[c.paymentStatus]}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/>
    <title>Συλλογή ${monthPrefix}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;font-size:13px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:6px} th{background:#f5f5f5}</style>
    </head><body>
    <h1>Μηνιαία συλλογή — ${monthPrefix}</h1>
    <p>Αναμενόμενα: <strong>${metrics.expected}€</strong> · Εισπράξεις: <strong>${metrics.collected}€</strong> · Cash flow: <strong>${metrics.cashFlowPct}%</strong></p>
    <table><thead><tr><th>Παιδί</th><th>Γονέας</th><th>Αναμενόμενο</th><th>Εισπράξεις</th><th>Υπόλοιπο</th><th>Κατάσταση</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <script>window.onload=()=>window.print()</script>
    </body></html>`;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export function printParentPaymentHistoryPdf(
  charge: PaymentObligation,
  transactions: PaymentTransaction[]
) {
  const txRows = transactions
    .map(
      (t) =>
        `<tr><td>${formatDateEl(t.paymentDate)}</td><td>${t.amount}€</td><td>${PAYMENT_METHOD_LABELS[t.paymentMethod]}</td><td>${RECEIPT_STATUS_LABELS[t.receiptStatus]}</td><td>${t.notes || "—"}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"/>
    <title>Ιστορικό ${charge.childLabel}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px;font-size:13px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ddd;padding:6px}</style>
    </head><body>
    <h1>Ιστορικό πληρωμών</h1>
    <p><strong>${charge.childLabel}</strong> · ${charge.parentLabel ?? "—"} · ${charge.programLabel}</p>
    <p>Αναμενόμενο: ${charge.expectedAmount}€ · Πληρωμένο: ${charge.paidAmount}€ · Υπόλοιπο: ${charge.balance}€</p>
    <table><thead><tr><th>Ημ/νία</th><th>Ποσό</th><th>Τρόπος</th><th>Απόδειξη</th><th>Σημειώσεις</th></tr></thead>
    <tbody>${txRows || "<tr><td colspan=5>Δεν υπάρχουν καταχωρήσεις</td></tr>"}</tbody></table>
    <script>window.onload=()=>window.print()</script>
    </body></html>`;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
