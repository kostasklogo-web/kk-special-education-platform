import type { SecretaryDashboardData } from "@/lib/secretary/types";
import type { PaymentObligation } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { computeDashboardMetrics } from "./calculations";
import { paymentAlertsFromCharges } from "./payment-warnings";

export function mergeDashboardWithPayments(
  base: SecretaryDashboardData,
  charges: PaymentObligation[]
): SecretaryDashboardData {
  const today = todayAthensYmd();
  const monthYmd = `${today.slice(0, 7)}-01`;
  const metrics = computeDashboardMetrics(charges, monthYmd, today);

  const unpaidCount = charges.filter((c) => c.balance > 0).length;
  const overdueCount = charges.filter(
    (c) => c.balance > 0 && (c.paymentStatus.startsWith("overdue") || c.paymentStatus === "overdue")
  ).length;
  const mgmtCount = charges.filter(
    (c) => c.escalatedToManagement || c.paymentStatus === "suspended_management"
  ).length;

  const kpis = base.kpis.map((k) => {
    switch (k.id) {
      case "unpaid":
        return { ...k, value: unpaidCount, helper: `${metrics.unpaidTotal}€ συνολικά` };
      case "overdue_pay":
        return { ...k, value: overdueCount, helper: `${metrics.overdueTotal}€ καθυστερημένα` };
      case "due_soon_pay":
        return { ...k, value: metrics.dueIn7Days, helper: "Εντός 7 ημερών" };
      default:
        return k;
    }
  });

  const paymentAlerts = paymentAlertsFromCharges(charges, today);
  const urgentAlerts = [...paymentAlerts, ...base.urgentAlerts].slice(0, 8);

  if (mgmtCount > 0 && !urgentAlerts.some((a) => a.title.includes("διοίκηση"))) {
    urgentAlerts.unshift({
      id: "pay-mgmt-review",
      title: "Έλεγχος διοίκησης — πληρωμές",
      detail: `${mgmtCount} υποθέσεις απαιτούν απόφαση διοίκησης`,
      alertLevel: "red",
      href: "/secretary/payments?filter=suspended_management",
    });
  }

  return { ...base, kpis, urgentAlerts };
}
