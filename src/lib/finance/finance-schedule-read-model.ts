/**
 * Finance ↔ Schedule integrated read model (prototype).
 * Transforms control-center demo schedule blocks into billable charges & revenue metrics.
 * Does not modify /schedule/control-center — only reads via public demo API.
 */

import { getControlCenterDemoBlocksForDate } from "@/lib/schedule/control-center-demo";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import {
  addDaysAthensCalendar,
  formatYmdAthensFromUtcMs,
  getSafeAthensYmd,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";
import {
  CONTROL_CENTER_DEMO_THERAPISTS,
  CONTROL_CENTER_DEMO_CHILDREN,
} from "@/lib/demo/schedule-control-center-data";
import {
  SECRETARY_DEMO_CHILDREN,
  SECRETARY_DEMO_PARENT_BY_CHILD,
} from "@/lib/secretary/schedule-catalog";
import { FINANCE_TRANSACTIONS } from "@/lib/secretary/finances/demo-data";
import type { FinanceCenterCode, ParentBalanceStatus, ParentPaymentRisk } from "@/lib/secretary/finances/types";
import {
  BILLING_TYPE_LABELS,
  classifyBillingType,
  durationMinutesFromBlock,
  expectedChargeForBlock,
  invoicedAmountForBlock,
  isBlockBillable,
} from "./billing-rules";
import type {
  FinanceScheduleMetrics,
  FinanceScheduleReadModel,
  ParentFinancialProfile,
  SessionBillingCharge,
  SessionChargeBillingStatus,
  SessionPaymentStatus,
} from "./types";

const MONTH_NAMES = [
  "Ιανουάριος",
  "Φεβρουάριος",
  "Μάρτιος",
  "Απρίλιος",
  "Μάιος",
  "Ιούνιος",
  "Ιούλιος",
  "Αύγουστος",
  "Σεπτέμβριος",
  "Οκτώβριος",
  "Νοέμβριος",
  "Δεκέμβριος",
];

function monthLabelFromYmd(ymd: string): string {
  const [y, m] = ymd.split("-").map(Number);
  return `${MONTH_NAMES[m - 1] ?? "—"} ${y}`;
}

function daysInMonth(ymd: string): number {
  const [y, m] = ymd.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function centerFromBlock(b: ControlBoardBlock): { code: FinanceCenterCode; label: string } {
  const label = b.centerLabel ?? "";
  if (b.centerId === "proto-c-2" || label.includes("Νίκαια")) {
    return { code: "nikaia", label: label || "Νίκαια" };
  }
  if (b.centerId === "proto-c-1" || label.includes("Εύοσμος")) {
    return { code: "evosmos", label: label || "Εύοσμος" };
  }
  return { code: "nikaia", label: label || "Νίκαια" };
}

function therapistName(userId: string): string {
  return (
    CONTROL_CENTER_DEMO_THERAPISTS.find((t) => t.user_id === userId)?.display_name ??
    "Θεραπευτής"
  );
}

function resolveChild(block: ControlBoardBlock): { childId: string | null; childName: string } {
  if (block.childId) {
    const sec = SECRETARY_DEMO_CHILDREN.find((c) => c.id === block.childId);
    if (sec) return { childId: sec.id, childName: sec.label };
    const cc = CONTROL_CENTER_DEMO_CHILDREN.find((c) => c.id === block.childId);
    if (cc) return { childId: block.childId, childName: cc.label };
  }
  const name = block.subtitle?.split(",")[0]?.trim() || block.title?.replace(/^Ατομικό · /, "").trim();
  if (!name) return { childId: null, childName: "—" };
  const sec = SECRETARY_DEMO_CHILDREN.find((c) => c.label === name || name.startsWith(c.label.split(" ")[0] ?? ""));
  if (sec) return { childId: sec.id, childName: sec.label };
  return { childId: null, childName: name };
}

function parentForChild(childId: string | null, childName: string): { parentId: string | null; parentName: string } {
  if (childId && SECRETARY_DEMO_PARENT_BY_CHILD[childId]) {
    return { parentId: childId, parentName: SECRETARY_DEMO_PARENT_BY_CHILD[childId] };
  }
  const guess = Object.entries(SECRETARY_DEMO_PARENT_BY_CHILD).find(([, p]) =>
    childName && p.includes(childName.split(" ")[0] ?? "")
  );
  if (guess) return { parentId: guess[0], parentName: guess[1] };
  return { parentId: null, parentName: "—" };
}

function athensTimeRange(startsAt: string, endsAt: string): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("el-GR", {
      timeZone: "Europe/Athens",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  return `${fmt(startsAt)}–${fmt(endsAt)}`;
}

/** Demo variety: some sessions cancelled/absence without editing control-center data. */
function demoStatusOverride(b: ControlBoardBlock): ControlBoardBlock["status"] {
  const h = b.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  if (h % 41 === 0) return "cancelled";
  if (h % 37 === 0) return "absence";
  if (h % 29 === 0) return "no_show";
  return b.status;
}

const monthBlocksCache = new Map<string, ControlBoardBlock[]>();

function loadScheduleBlocksForMonth(monthYmd: string): ControlBoardBlock[] {
  const prefix = monthYmd.slice(0, 7);
  const cached = monthBlocksCache.get(prefix);
  if (cached) return cached;

  const lastDay = daysInMonth(prefix + "-01");
  const all: ControlBoardBlock[] = [];
  const seenGroup = new Set<string>();

  for (let d = 1; d <= lastDay; d++) {
    const ymd = `${prefix}-${String(d).padStart(2, "0")}`;
    let dayBlocks: ControlBoardBlock[] = [];
    try {
      dayBlocks = getControlCenterDemoBlocksForDate(ymd);
    } catch {
      continue;
    }
    for (const b of dayBlocks) {
      if (b.disciplineCode === "brk") continue;
      if (b.sessionKind === "group" && b.sessionGroupId) {
        if (seenGroup.has(`${ymd}-${b.sessionGroupId}`)) continue;
        seenGroup.add(`${ymd}-${b.sessionGroupId}`);
      }
      all.push({ ...b, status: demoStatusOverride(b) });
    }
  }
  monthBlocksCache.set(prefix, all);
  return all;
}

function blockToCharge(b: ControlBoardBlock, nowMs: number): SessionBillingCharge | null {
  const billingType = classifyBillingType(b);
  if (billingType === "non_billable" || billingType === "supervision") {
    if (b.disciplineCode === "brk") return null;
  }

  const billable = isBlockBillable(b, billingType);
  const expected = expectedChargeForBlock(b, billingType);
  const invoiced = invoicedAmountForBlock(b, billingType, expected);
  const dateYmd = formatYmdAthensFromUtcMs(Date.parse(b.starts_at));
  const { childId, childName } = resolveChild(b);
  const { parentId, parentName } = parentForChild(childId, childName);
  const center = centerFromBlock(b);
  const tid = b.therapistUserIds[0] ?? "unknown";
  const startMs = Date.parse(b.starts_at);
  const endMs = Date.parse(b.ends_at);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  const isForecast = billable && startMs > nowMs;

  let billingStatus: SessionChargeBillingStatus = "non_billable";
  if (billingType === "cancelled") billingStatus = "cancelled";
  else if (billingType === "absence") billingStatus = "absence";
  else if (billable) billingStatus = "billable";

  return {
    sessionId: `${dateYmd}:${b.id}`,
    sessionGroupId: b.sessionGroupId ?? null,
    childId,
    childName: b.sessionKind === "group" ? b.subtitle || childName : childName,
    parentId,
    parentName,
    therapistId: tid,
    therapistName: therapistName(tid),
    specialtyCode: b.disciplineCode,
    specialtyLabel: b.disciplineNameEl ?? b.disciplineCode,
    center: center.code,
    centerLabel: center.label,
    roomId: b.roomId ?? null,
    roomLabel: b.roomLabel,
    dateYmd,
    startsAt: b.starts_at,
    endsAt: b.ends_at,
    durationMinutes: durationMinutesFromBlock(b),
    sessionKind: b.sessionKind,
    sessionStatus: b.status,
    billingType,
    billingStatus,
    expectedCharge: expected,
    invoicedAmount: invoiced,
    paidAmount: 0,
    outstandingAmount: expected,
    paymentStatus: billable ? "outstanding" : "waived",
    isBillable: billable,
    isForecast,
    scheduleSource: "control_center_demo",
  };
}

function allocatePayments(charges: SessionBillingCharge[]): SessionBillingCharge[] {
  const paidByChild = new Map<string, number>();
  for (const tx of FINANCE_TRANSACTIONS) {
    const key = tx.childName;
    paidByChild.set(key, (paidByChild.get(key) ?? 0) + tx.amount);
  }

  const expectedByChild = new Map<string, number>();
  for (const c of charges) {
    if (!c.isBillable || c.isForecast) continue;
    const key = c.childName.split(",")[0]?.trim() ?? c.childName;
    expectedByChild.set(key, (expectedByChild.get(key) ?? 0) + c.expectedCharge);
  }

  return charges.map((c) => {
    if (!c.isBillable) {
      return { ...c, paidAmount: 0, outstandingAmount: 0, paymentStatus: "waived" as SessionPaymentStatus };
    }
    if (c.isForecast) {
      return {
        ...c,
        paidAmount: 0,
        outstandingAmount: c.expectedCharge,
        paymentStatus: "not_due" as SessionPaymentStatus,
      };
    }

    const childKey = c.childName.split(",")[0]?.trim() ?? c.childName;
    const childPaid = paidByChild.get(childKey) ?? 0;
    const childExpected = expectedByChild.get(childKey) ?? 1;
    const ratio = Math.min(1, childPaid / childExpected);
    const paid = Math.round(c.expectedCharge * ratio * 100) / 100;
    const outstanding = Math.max(0, Math.round((c.expectedCharge - paid) * 100) / 100);

    let paymentStatus: SessionPaymentStatus = "outstanding";
    if (paid >= c.expectedCharge - 0.01) paymentStatus = "paid";
    else if (paid > 0) paymentStatus = "partial";

    return { ...c, paidAmount: paid, outstandingAmount: outstanding, paymentStatus };
  });
}

function computeMetrics(charges: SessionBillingCharge[]): FinanceScheduleMetrics {
  const billable = charges.filter((c) => c.isBillable);
  const realized = billable.filter((c) => !c.isForecast);
  const forecast = billable.filter((c) => c.isForecast);

  const calculatedRevenue = realized.reduce((s, c) => s + c.expectedCharge, 0);
  const turnover = realized.reduce((s, c) => s + c.invoicedAmount, 0);
  const realRevenue = realized.reduce((s, c) => s + c.paidAmount, 0);
  const forecastRevenue = forecast.reduce((s, c) => s + c.expectedCharge, 0);
  const outstandingBalance = realized.reduce((s, c) => s + c.outstandingAmount, 0);
  const collectionRatePct =
    turnover > 0 ? Math.round((realRevenue / turnover) * 1000) / 10 : 0;
  const collectionGap = Math.max(0, turnover - realRevenue);

  let collectionRiskLevel: FinanceScheduleMetrics["collectionRiskLevel"] = "low";
  if (collectionRatePct < 80 || outstandingBalance > 2_500) collectionRiskLevel = "high";
  else if (collectionRatePct < 90 || outstandingBalance > 1_000) collectionRiskLevel = "medium";

  return {
    calculatedRevenue,
    realRevenue,
    turnover,
    forecastRevenue,
    outstandingBalance,
    collectionRatePct,
    collectionGap,
    billableSessionCount: billable.length,
    paidSessionCount: realized.filter((c) => c.paymentStatus === "paid").length,
    outstandingSessionCount: realized.filter((c) => c.outstandingAmount > 0).length,
    forecastSessionCount: forecast.length,
    collectionRiskLevel,
  };
}

function buildParentProfiles(charges: SessionBillingCharge[]): ParentFinancialProfile[] {
  const byParent = new Map<string, ParentFinancialProfile>();

  for (const c of charges) {
    if (!c.isBillable || c.parentName === "—") continue;
    const pid = c.parentId ?? c.parentName;
    let row = byParent.get(pid);
    if (!row) {
      row = {
        id: pid,
        parentName: c.parentName,
        children: [],
        center: c.center,
        monthlyExpectedCharge: 0,
        amountPaid: 0,
        outstandingAmount: 0,
        overdueDays: 0,
        paymentConsistencyPct: 100,
        riskLevel: "low",
        linkedChargeIds: [],
        status: "current",
      };
      byParent.set(pid, row);
    }
    const childLabel = c.childName.split(",")[0]?.trim() ?? c.childName;
    if (!row.children.includes(childLabel)) row.children.push(childLabel);
    if (!c.isForecast) {
      row.monthlyExpectedCharge += c.expectedCharge;
      row.amountPaid += c.paidAmount;
      row.outstandingAmount += c.outstandingAmount;
    }
    row.linkedChargeIds.push(c.sessionId);
  }

  for (const row of byParent.values()) {
    const pct =
      row.monthlyExpectedCharge > 0
        ? Math.round((row.amountPaid / row.monthlyExpectedCharge) * 100)
        : 100;
    row.paymentConsistencyPct = Math.min(100, pct);

    if (row.outstandingAmount <= 0) {
      row.status = "current";
      row.riskLevel = "low";
    } else if (pct >= 50) {
      row.status = "partial";
      row.riskLevel = "medium";
      row.overdueDays = 5;
    } else if (row.outstandingAmount >= 300) {
      row.status = "management_review";
      row.riskLevel = "critical";
      row.overdueDays = 32;
    } else {
      row.status = "overdue";
      row.riskLevel = "high";
      row.overdueDays = 18;
    }
  }

  return [...byParent.values()].sort((a, b) => b.outstandingAmount - a.outstandingAmount);
}

function aggregateRevenueSlices(charges: SessionBillingCharge[]) {
  const realized = charges.filter((c) => c.isBillable && !c.isForecast);
  const sumBy = (key: (c: SessionBillingCharge) => string, label: (c: SessionBillingCharge) => string) => {
    const map = new Map<string, { id: string; label: string; amount: number }>();
    for (const c of realized) {
      const k = key(c);
      const cur = map.get(k) ?? { id: k, label: label(c), amount: 0 };
      cur.amount += c.expectedCharge;
      map.set(k, cur);
    }
    const total = [...map.values()].reduce((s, r) => s + r.amount, 0) || 1;
    return [...map.values()]
      .map((r) => ({ ...r, sharePct: Math.round((r.amount / total) * 1000) / 10 }))
      .sort((a, b) => b.amount - a.amount);
  };

  return {
    byCenter: sumBy(
      (c) => c.center,
      (c) => (c.center === "nikaia" ? "Νίκαια" : "Εύοσμος")
    ),
    bySpecialty: sumBy((c) => c.specialtyCode, (c) => c.specialtyLabel),
    byTherapist: sumBy((c) => c.therapistId, (c) => c.therapistName),
    byProgramType: sumBy(
      (c) =>
        c.sessionKind === "group"
          ? "group"
          : c.billingType === "evaluation"
            ? "evaluation"
            : c.billingType === "parent_counseling"
              ? "parent"
              : "individual",
      (c) =>
        c.sessionKind === "group"
          ? "Ομαδικά"
          : c.billingType === "evaluation"
            ? "Αξιολογήσεις"
            : c.billingType === "parent_counseling"
              ? "Συμβουλευτική γονέων"
              : "Ατομικές συνεδρίες"
    ),
    byGroup: sumBy(
      (c) => (c.sessionKind === "group" ? c.sessionGroupId ?? c.sessionId : "skip"),
      (c) => (c.sessionKind === "group" ? (c.childName.split("·")[0]?.trim() ?? "Ομάδα") : "—")
    ).filter((r) => r.id !== "skip"),
    byEvaluations: sumBy(
      (c) => (c.billingType === "evaluation" ? c.sessionId : "skip"),
      (c) => c.specialtyLabel
    ).filter((r) => r.id !== "skip"),
  };
}

export type FinanceScheduleAggregates = ReturnType<typeof aggregateRevenueSlices>;

export function buildFinanceScheduleReadModel(monthYmdInput?: string): FinanceScheduleReadModel & {
  aggregates: FinanceScheduleAggregates;
} {
  const today = todayAthensYmd();
  const monthPrefix = getSafeAthensYmd(monthYmdInput ?? today).slice(0, 7);
  const monthYmd = `${monthPrefix}-01`;
  const nowMs = Date.now();

  const blocks = loadScheduleBlocksForMonth(monthPrefix);
  let charges = blocks
    .map((b) => blockToCharge(b, nowMs))
    .filter((c): c is SessionBillingCharge => c !== null);

  charges = allocatePayments(charges);
  const metrics = computeMetrics(charges);
  const parentProfiles = buildParentProfiles(charges);
  const aggregates = aggregateRevenueSlices(charges);

  return {
    monthYmd,
    monthLabel: monthLabelFromYmd(monthPrefix + "-01"),
    source: "control_center_demo",
    metrics,
    charges,
    parentProfiles,
    aggregates,
  };
}

export { safeBuildFinanceScheduleReadModel } from "./finance-schedule-safe";

export function chargeProgramLabel(c: SessionBillingCharge): string {
  return BILLING_TYPE_LABELS[c.billingType] ?? c.billingType;
}

export function chargeTimeLabel(c: SessionBillingCharge): string {
  if (!Number.isFinite(Date.parse(c.startsAt))) return c.dateYmd;
  try {
    return `${c.dateYmd} · ${athensTimeRange(c.startsAt, c.endsAt)}`;
  } catch {
    return c.dateYmd;
  }
}

export { BILLING_TYPE_LABELS };
