import type { AlertLevel } from "./types";
import type { DiagnosisDocument, PaymentObligation, ReportRequest, SecretaryTask } from "./types";
import { isOpenReport } from "@/lib/secretary/reports/calculations";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import {
  MANAGEMENT_REVIEW_LABEL,
  requiresManagementReview,
} from "@/lib/secretary/payments/payment-warnings";

export type ChildWarningKind = "payment" | "diagnosis" | "task" | "report";

export type ChildWarning = {
  kind: ChildWarningKind;
  level: AlertLevel;
  shortLabel: string;
  title: string;
};

export type ChildWarningsMap = Map<string, ChildWarning[]>;

function worstLevel(levels: AlertLevel[]): AlertLevel {
  if (levels.includes("red")) return "red";
  if (levels.includes("yellow")) return "yellow";
  return "green";
}

export function buildChildWarningsMap(
  payments: PaymentObligation[],
  diagnoses: DiagnosisDocument[],
  tasks: SecretaryTask[],
  reports: ReportRequest[] = []
): ChildWarningsMap {
  const map: ChildWarningsMap = new Map();

  const push = (childId: string, w: ChildWarning) => {
    const list = map.get(childId) ?? [];
    list.push(w);
    map.set(childId, list);
  };

  const todayYmd = todayAthensYmd();

  for (const p of payments) {
    if (p.balance <= 0) continue;
    if (requiresManagementReview(p, todayYmd)) {
      push(p.childId, {
        kind: "payment",
        level: "red",
        shortLabel: "Διοίκηση",
        title: `${MANAGEMENT_REVIEW_LABEL} — ${p.balance}€`,
      });
    } else if (
      p.paymentStatus === "overdue" ||
      p.paymentStatus === "suspended" ||
      p.paymentStatus.startsWith("overdue_") ||
      p.paymentStatus === "suspended_management"
    ) {
      push(p.childId, {
        kind: "payment",
        level: "red",
        shortLabel: "Πληρωμή",
        title: `Υπόλοιπο ${p.balance}€ — καθυστέρηση`,
      });
    } else if (p.paymentStatus === "due_soon" || p.paymentStatus === "partially_paid") {
      push(p.childId, {
        kind: "payment",
        level: "yellow",
        shortLabel: "Πληρωμή",
        title: `Υπόλοιπο ${p.balance}€`,
      });
    }
  }

  for (const d of diagnoses) {
    if (d.archived) continue;
    if (d.status === "expired" || d.daysUntilExpiry < 0) {
      push(d.childId, {
        kind: "diagnosis",
        level: "red",
        shortLabel: "Διάγνωση",
        title: "Ληγμένο έγγραφο",
      });
    } else if (
      d.status === "expiring_7" ||
      d.status === "expiring_30" ||
      (d.daysUntilExpiry <= 30 && d.renewalRequired)
    ) {
      push(d.childId, {
        kind: "diagnosis",
        level: d.daysUntilExpiry <= 7 || d.status === "expiring_7" ? "red" : "yellow",
        shortLabel: "Διάγνωση",
        title: `Λήγει σε ${d.daysUntilExpiry} ημέρες`,
      });
    }
  }

  for (const t of tasks) {
    if (!t.childId) continue;
    if (["completed", "cancelled"].includes(t.status)) continue;
    const level: AlertLevel =
      t.status === "overdue" || t.priority === "urgent" ? "red" : t.priority === "high" ? "yellow" : "yellow";
    push(t.childId, {
      kind: "task",
      level,
      shortLabel: "Εργασία",
      title: t.title,
    });
  }

  for (const r of reports) {
    if (!isOpenReport(r)) continue;
    if (r.isUrgentOverdue || (r.isOverdue && r.priority === "urgent")) {
      push(r.childId, {
        kind: "report",
        level: "red",
        shortLabel: "Αναφορά",
        title: `Επείγουσα εκπρόθεσμη — ${r.reportTypeLabel}`,
      });
    } else if (r.isOverdue) {
      push(r.childId, {
        kind: "report",
        level: "red",
        shortLabel: "Αναφορά",
        title: `Εκπρόθεσμη — ${r.reportTypeLabel}`,
      });
    } else if (r.isDueSoon || r.priority === "urgent") {
      push(r.childId, {
        kind: "report",
        level: "yellow",
        shortLabel: "Αναφορά",
        title: `Προθεσμία — ${r.reportTypeLabel}`,
      });
    } else if (["approved", "ready_for_delivery"].includes(r.status)) {
      push(r.childId, {
        kind: "report",
        level: "green",
        shortLabel: "Αναφορά",
        title: `Έτοιμη προς παράδοση — ${r.reportTypeLabel}`,
      });
    }
  }

  return map;
}

export function warningsForChild(map: ChildWarningsMap, childId: string | null): ChildWarning[] {
  if (!childId) return [];
  return map.get(childId) ?? [];
}

export function worstWarningLevel(warnings: ChildWarning[]): AlertLevel | null {
  if (warnings.length === 0) return null;
  return worstLevel(warnings.map((w) => w.level));
}
