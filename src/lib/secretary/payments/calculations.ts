import type { AlertLevel, PaymentObligation, PaymentStatus } from "@/lib/secretary/types";

export function daysBetweenYmd(fromYmd: string, toYmd: string): number {
  return Math.round(
    (Date.parse(`${toYmd}T12:00:00.000Z`) - Date.parse(`${fromYmd}T12:00:00.000Z`)) / 86400000
  );
}

export function overdueDays(dueDate: string, todayYmd: string): number {
  return daysBetweenYmd(dueDate, todayYmd);
}

export function computePaymentStatus(
  charge: Pick<
    PaymentObligation,
    "balance" | "paidAmount" | "expectedAmount" | "dueDate" | "escalatedToManagement"
  >,
  todayYmd: string
): PaymentStatus {
  if (charge.escalatedToManagement) return "suspended_management";
  if (charge.balance <= 0) return charge.paidAmount > 0 ? "paid" : "paid";

  const days = overdueDays(charge.dueDate, todayYmd);

  if (days > 60) return "suspended_management";
  if (days >= 30) return "overdue_30_60";
  if (days >= 1) return "overdue_1_30";

  const dueInDays = daysBetweenYmd(todayYmd, charge.dueDate);
  if (dueInDays <= 7) return charge.paidAmount > 0 ? "partially_paid" : "due_soon";

  return charge.paidAmount > 0 ? "partially_paid" : "due_soon";
}

export function alertLevelForPaymentStatus(status: PaymentStatus): AlertLevel {
  switch (status) {
    case "paid":
      return "green";
    case "partially_paid":
    case "due_soon":
      return "yellow";
    case "overdue_1_30":
    case "overdue":
      return "red";
    case "overdue_30_60":
      return "red";
    case "overdue_60_plus":
    case "suspended_management":
    case "suspended":
      return "red";
    default:
      return "yellow";
  }
}

export function isManagementReviewStatus(status: PaymentStatus): boolean {
  return status === "suspended_management" || status === "suspended" || status === "overdue_60_plus";
}

export function enrichCharge(charge: PaymentObligation, todayYmd: string): PaymentObligation {
  const balance = Math.max(0, roundMoney(charge.expectedAmount - charge.paidAmount));
  const base = { ...charge, balance };
  const paymentStatus = computePaymentStatus(base, todayYmd);
  return {
    ...base,
    paymentStatus,
    alertLevel: alertLevelForPaymentStatus(paymentStatus),
  };
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export type PaymentDashboardMetrics = {
  expectedThisMonth: number;
  collectedThisMonth: number;
  cashFlowPct: number;
  unpaidTotal: number;
  overdueTotal: number;
  dueIn7Days: number;
  overdueParentCount: number;
  managementReviewCount: number;
};

export function computeDashboardMetrics(
  charges: PaymentObligation[],
  monthYmd: string,
  todayYmd: string
): PaymentDashboardMetrics {
  const monthPrefix = monthYmd.slice(0, 7);
  const inMonth = charges.filter((c) => c.obligationMonth.startsWith(monthPrefix));

  const expectedThisMonth = inMonth.reduce((s, c) => s + c.expectedAmount, 0);
  const collectedThisMonth = inMonth.reduce((s, c) => s + c.paidAmount, 0);
  const cashFlowPct =
    expectedThisMonth > 0 ? Math.round((collectedThisMonth / expectedThisMonth) * 100) : 0;

  const unpaid = charges.filter((c) => c.balance > 0);
  const unpaidTotal = unpaid.reduce((s, c) => s + c.balance, 0);

  const overdue = unpaid.filter((c) => overdueDays(c.dueDate, todayYmd) >= 1);
  const overdueTotal = overdue.reduce((s, c) => s + c.balance, 0);

  const dueIn7Days = unpaid.filter((c) => {
    const d = daysBetweenYmd(todayYmd, c.dueDate);
    return d >= 0 && d <= 7;
  }).length;

  const overdueParentIds = new Set(overdue.map((c) => c.parentLabel ?? c.childId));
  const managementReviewCount = charges.filter(
    (c) => isManagementReviewStatus(c.paymentStatus) || c.escalatedToManagement
  ).length;

  return {
    expectedThisMonth: roundMoney(expectedThisMonth),
    collectedThisMonth: roundMoney(collectedThisMonth),
    cashFlowPct,
    unpaidTotal: roundMoney(unpaidTotal),
    overdueTotal: roundMoney(overdueTotal),
    dueIn7Days,
    overdueParentCount: overdueParentIds.size,
    managementReviewCount,
  };
}
