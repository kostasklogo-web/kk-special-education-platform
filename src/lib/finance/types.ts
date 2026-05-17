/**
 * Finance ↔ Schedule read-model types (prototype; no DB schema).
 */

import type { FinanceCenterCode } from "@/lib/secretary/finances/types";
import type { SessionKind, SessionStatus } from "@/lib/data/sessions/types";

export type SessionBillingType =
  | "individual_45"
  | "clinical_50"
  | "group_90"
  | "evaluation"
  | "parent_counseling"
  | "makeup"
  | "cancelled"
  | "absence"
  | "supervision"
  | "non_billable";

export type SessionChargeBillingStatus =
  | "billable"
  | "non_billable"
  | "cancelled"
  | "absence"
  | "invoiced";

export type SessionPaymentStatus =
  | "paid"
  | "partial"
  | "outstanding"
  | "not_due"
  | "waived";

export type SessionBillingCharge = {
  sessionId: string;
  sessionGroupId: string | null;
  childId: string | null;
  childName: string;
  parentId: string | null;
  parentName: string;
  therapistId: string;
  therapistName: string;
  specialtyCode: string;
  specialtyLabel: string;
  center: FinanceCenterCode;
  centerLabel: string;
  roomId: string | null;
  roomLabel: string | null;
  dateYmd: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  sessionKind: SessionKind;
  sessionStatus: SessionStatus;
  billingType: SessionBillingType;
  billingStatus: SessionChargeBillingStatus;
  expectedCharge: number;
  invoicedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: SessionPaymentStatus;
  isBillable: boolean;
  isForecast: boolean;
  scheduleSource: "control_center_demo" | "sessions_db";
};

export type FinanceScheduleMetrics = {
  calculatedRevenue: number;
  realRevenue: number;
  turnover: number;
  forecastRevenue: number;
  outstandingBalance: number;
  collectionRatePct: number;
  collectionGap: number;
  billableSessionCount: number;
  paidSessionCount: number;
  outstandingSessionCount: number;
  forecastSessionCount: number;
  collectionRiskLevel: "low" | "medium" | "high";
};

export type ParentFinancialProfile = {
  id: string;
  parentName: string;
  children: string[];
  center: FinanceCenterCode;
  monthlyExpectedCharge: number;
  amountPaid: number;
  outstandingAmount: number;
  overdueDays: number;
  paymentConsistencyPct: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  linkedChargeIds: string[];
  status: import("@/lib/secretary/finances/types").ParentBalanceStatus;
};

export type FinanceScheduleReadModel = {
  monthYmd: string;
  monthLabel: string;
  source: "control_center_demo" | "sessions_db";
  metrics: FinanceScheduleMetrics;
  charges: SessionBillingCharge[];
  parentProfiles: ParentFinancialProfile[];
};
