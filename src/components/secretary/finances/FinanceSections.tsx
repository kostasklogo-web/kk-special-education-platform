"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  MessageCircle,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ExecutiveFinanceModel } from "@/lib/secretary/finances/types";
import { FINANCE_ALERTS, FINANCE_EXPENSES, FINANCE_TRANSACTIONS } from "@/lib/secretary/finances/demo-data";
import {
  EXPENSE_CATEGORY_LABELS,
  FINANCE_CENTER_LABELS,
  formatEuro,
  formatEuroPrecise,
  formatPct,
  PARENT_BALANCE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_STATUS_LABELS,
  REVENUE_DEFINITIONS,
} from "@/lib/secretary/finances/labels";
import {
  BarRow,
  ExecutiveKpiCard,
  FinanceAlertBadge,
  MetricStrip,
  Panel,
  RiskBadge,
  SectionHeading,
} from "./FinanceUi";
import { formatDateEl } from "@/lib/ui/child-labels";
import type { ParentBalanceStatus } from "@/lib/secretary/finances/types";

const SENSITIVE = new Set(["payroll", "freelancers"]);

function balanceStatusClass(status: ParentBalanceStatus): string {
  const map: Record<ParentBalanceStatus, string> = {
    current: "border-emerald-200 bg-emerald-50 text-emerald-900",
    due_soon: "border-amber-200 bg-amber-50 text-amber-950",
    partial: "border-sky-200 bg-sky-50 text-sky-900",
    overdue: "border-orange-200 bg-orange-50 text-orange-950",
    management_review: "border-red-200 bg-red-50 text-red-900",
  };
  return map[status];
}

type SectionProps = { model: ExecutiveFinanceModel; fullAccess: boolean };

function safeMax(values: number[], floor = 1): number {
  if (!values.length) return floor;
  const m = Math.max(...values);
  return Number.isFinite(m) ? Math.max(m, floor) : floor;
}

export function ExecutiveDashboardSection({ model, fullAccess }: SectionProps) {
  const maxCenter = safeMax(model.revenueByCenter.map((r) => r.amount));
  const maxBudget = safeMax(model.budgetLines.map((b) => Math.max(b.budgetAmount, b.actualAmount)));
  const visibleKpis = model.kpis.filter((k) => fullAccess || !k.managementOnly);

  return (
    <section className="space-y-4" aria-labelledby="exec-dash">
      <SectionHeading
        title={`Executive Financial Dashboard — ${model.monthLabel}`}
        description="Επιχειρησιακή οικονομική εικόνα · σύγκριση με προηγούμενο μήνα"
      />

      <MetricStrip
        items={[
          {
            label: "Σύγκριση τζίρου",
            value: formatPct(model.priorMonthComparison.turnoverDeltaPct, true),
            tone: "good",
          },
          {
            label: "Πραγματικά έσοδα",
            value: formatPct(model.priorMonthComparison.realRevenueDeltaPct, true),
            tone: "good",
          },
          {
            label: "Έξοδα",
            value: formatPct(model.priorMonthComparison.expensesDeltaPct, true),
            tone: "bad",
          },
          {
            label: "Είσπραξη / τζίρος",
            value: formatPct(model.collectionRatePct),
            tone: model.collectionRatePct >= 90 ? "good" : "neutral",
          },
        ]}
      />

      {model.cashFlowWarning ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong>Προειδοποίηση ταμειακής ροής:</strong> αναμένονται σημαντικές εκροές πριν τις εισπράξεις
            Ιουνίου. Ρευστότητα {formatEuro(model.currentLiquidity)}.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleKpis.map((kpi) => (
          <ExecutiveKpiCard key={kpi.id} kpi={kpi} masked={!fullAccess && kpi.managementOnly} />
        ))}
      </div>

      <Panel title="Έσοδα από Πρόγραμμα (σύνδεση με συνεδρίες)">
        <MetricStrip
          items={[
            {
              label: "Υπολογιζόμενα έσοδα",
              value: formatEuro(model.scheduleMetrics.calculatedRevenue),
              tone: "neutral",
            },
            {
              label: "Πραγματικά έσοδα",
              value: formatEuro(model.scheduleMetrics.realRevenue),
              tone: "good",
            },
            {
              label: "Διαφορά / Τζίρος",
              value: formatEuro(model.scheduleMetrics.collectionGap),
              tone: "bad",
            },
            {
              label: "Κίνδυνος είσπραξης",
              value:
                model.scheduleMetrics.collectionRiskLevel === "high"
                  ? "Υψηλός"
                  : model.scheduleMetrics.collectionRiskLevel === "medium"
                    ? "Μέτριος"
                    : "Χαμηλός",
              tone: model.scheduleMetrics.collectionRiskLevel === "low" ? "good" : "neutral",
            },
          ]}
        />
        <p className="mt-3 text-xs text-ink-muted">
          Πηγή: πρόγραμμα control-center (demo) · {model.sessionCharges.length} γραμμές χρέωσης ·{" "}
          {model.scheduleSource === "control_center_demo" ? "χωρίς Supabase" : "βάση δεδομένων"}.
        </p>
      </Panel>

      <Panel title="Ορισμοί εσόδων (διοίκηση)">
        <dl className="grid gap-2 sm:grid-cols-2">
          {REVENUE_DEFINITIONS.map((d) => (
            <div key={d.term}>
              <dt className="text-xs font-bold text-ink">{d.term}</dt>
              <dd className="text-xs text-ink-muted">{d.definition}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Έσοδα ανά κέντρο (υπολογιζόμενα)">
          <div className="space-y-3">
            {model.revenueByCenter.map((r) => (
              <BarRow key={r.id} label={r.label} amount={r.amount} max={maxCenter} sublabel={`${r.sharePct}%`} />
            ))}
          </div>
        </Panel>
        <Panel title="Budget vs Actual — έξοδα">
          {fullAccess ? (
            <div className="space-y-3">
              {model.budgetLines.map((b) => (
                <div key={b.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{b.label}</span>
                    <span className={b.variance > 0 ? "text-amber-800" : "text-emerald-800"}>
                      {b.variance > 0 ? "+" : ""}
                      {formatEuro(b.variance)}
                    </span>
                  </div>
                  <BarRow label="Actual" amount={b.actualAmount} max={maxBudget} tone="rose" />
                </div>
              ))}
              <p className="text-xs text-ink-muted">
                Στόχος εσόδων: {formatEuro(model.budgetRevenueTarget)} · πραγματικά:{" "}
                {formatEuro(model.budgetRevenueActual)}
              </p>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-ink-muted">Διαθέσιμο στη διοίκηση / CEO.</p>
          )}
        </Panel>
      </div>
    </section>
  );
}

export function CashFlowSection({ model, fullAccess }: SectionProps) {
  if (!fullAccess) {
    return (
      <section className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-muted">
        Η πλήρης ταμειακή ροή και πρόβλεψη είναι διαθέσιμες στη διοίκηση / CEO.
      </section>
    );
  }

  const maxCash = safeMax(model.cashFlowMonths.flatMap((m) => [m.inflow, m.outflow]));

  return (
    <section className="space-y-4" aria-labelledby="cf-section">
      <SectionHeading
        title="Ταμειακή ροή & ρευστότητα"
        description="Εισροές, εκροές, τρέχουσα θέση και προβλέψεις"
      />

      <MetricStrip
        items={[
          { label: "Τρέχουσα ρευστότητα", value: formatEuro(model.currentLiquidity), tone: "neutral" },
          {
            label: "Εισροές μήνα",
            value: formatEuro(model.cashFlowMonths[model.cashFlowMonths.length - 1]?.inflow ?? 0),
            tone: "good",
          },
          {
            label: "Εκροές μήνα",
            value: formatEuro(model.cashFlowMonths[model.cashFlowMonths.length - 1]?.outflow ?? 0),
            tone: "bad",
          },
          {
            label: "Πρόβλεψη καθαρού (30ημ.)",
            value: formatEuro(model.cashFlowForecastNet),
            tone: model.cashFlowForecastNet >= 0 ? "good" : "bad",
          },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {model.cashFlowMonths.map((m) => {
          const net = m.inflow - m.outflow;
          const current = m.month === model.monthYmd.slice(0, 7);
          return (
            <div
              key={m.month}
              className={`rounded-xl border p-3 ${current ? "border-indigo-300 bg-indigo-50/40" : "border-border bg-white"}`}
            >
              <p className="text-xs font-semibold text-ink-muted">{m.labelEl}</p>
              <p className="mt-2 flex items-center gap-1 text-sm text-emerald-800">
                <ArrowUpRight className="h-3.5 w-3.5" /> {formatEuro(m.inflow)}
              </p>
              <p className="flex items-center gap-1 text-sm text-rose-700">
                <ArrowDownRight className="h-3.5 w-3.5" /> {formatEuro(m.outflow)}
              </p>
              <p className={`mt-2 text-sm font-bold ${net >= 0 ? "text-emerald-900" : "text-red-800"}`}>
                Καθαρό: {formatEuro(net)}
              </p>
              {m.liquidityEnd ? (
                <p className="mt-1 text-[10px] text-ink-muted">Ταμείο τέλους: {formatEuro(m.liquidityEnd)}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Επερχόμενες υποχρεώσεις">
          <ul className="space-y-2 text-sm">
            {model.upcomingLiabilities.map((e) => (
              <li key={e.id} className="flex justify-between gap-2 border-b border-border/50 pb-2">
                <span>
                  <span className="font-medium">{e.label}</span>
                  <span className="ml-2 text-xs text-ink-muted">{formatDateEl(e.dateYmd)}</span>
                </span>
                <span className="font-semibold text-rose-800 tabular-nums">−{formatEuro(e.amount)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Αναμενόμενες εισπράξεις">
          <ul className="space-y-2 text-sm">
            {model.upcomingInflows.map((e) => (
              <li key={e.id} className="flex justify-between gap-2 border-b border-border/50 pb-2">
                <span>
                  <span className="font-medium">{e.label}</span>
                  <span className="ml-2 text-xs text-ink-muted">{formatDateEl(e.dateYmd)}</span>
                </span>
                <span className="font-semibold text-emerald-800 tabular-nums">+{formatEuro(e.amount)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Σύγκριση μηνιαίας ταμειακής ροής">
        <div className="space-y-4">
          {model.cashFlowMonths.map((m) => (
            <div key={m.month}>
              <p className="mb-1 text-xs font-medium text-ink-muted">{m.labelEl}</p>
              <BarRow label="Εισροές" amount={m.inflow} max={maxCash} tone="emerald" />
              <BarRow label="Εκροές" amount={m.outflow} max={maxCash} tone="rose" />
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

export function BudgetSection({ model, fullAccess }: SectionProps) {
  if (!fullAccess) {
    return (
      <section className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-muted">
        Το budget tracking είναι διαθέσιμο στη διοίκηση.
      </section>
    );
  }

  const totalBudget = model.budgetLines.reduce((s, l) => s + l.budgetAmount, 0);
  const totalActual = model.budgetLines.reduce((s, l) => s + l.actualAmount, 0);

  return (
    <section className="space-y-4" aria-labelledby="budget-section">
      <SectionHeading
        title="Budget vs Actual"
        description={`${model.monthLabel} — παρακολούθηση αποκλίσεων ανά κατηγορία`}
      />

      <MetricStrip
        items={[
          { label: "Budget έξοδα", value: formatEuro(totalBudget), tone: "neutral" },
          { label: "Actual έξοδα", value: formatEuro(totalActual), tone: "bad" },
          {
            label: "Συνολική απόκλιση",
            value: formatEuro(totalActual - totalBudget),
            tone: totalActual > totalBudget ? "bad" : "good",
          },
          {
            label: "Στόχος εσόδων",
            value: formatEuro(model.budgetRevenueTarget),
            tone: "neutral",
          },
        ]}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/60 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2.5">Κατηγορία</th>
              <th className="px-3 py-2.5 text-right">Budget</th>
              <th className="px-3 py-2.5 text-right">Actual</th>
              <th className="px-3 py-2.5 text-right">Απόκλιση</th>
              <th className="px-3 py-2.5 text-right">%</th>
              <th className="px-3 py-2.5">Κατάσταση</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {model.budgetLines.map((row) => (
              <tr key={row.category} className="hover:bg-surface-muted/20">
                <td className="px-3 py-2.5 font-medium">{row.label}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatEuro(row.budgetAmount)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatEuro(row.actualAmount)}</td>
                <td
                  className={`px-3 py-2.5 text-right font-semibold tabular-nums ${row.variance > 0 ? "text-amber-800" : "text-emerald-800"}`}
                >
                  {row.variance > 0 ? "+" : ""}
                  {formatEuro(row.variance)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatPct(row.variancePct, true)}</td>
                <td className="px-3 py-2.5">
                  {row.variance > 100 ? (
                    <span className="text-xs font-semibold text-red-700">Υπέρβαση</span>
                  ) : row.variance > 0 ? (
                    <span className="text-xs font-semibold text-amber-700">Προσοχή</span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700">Εντός</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Panel title="Στόχος εσόδων vs πραγματικά">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-ink-muted">Στόχος μήνα</p>
            <p className="text-xl font-bold tabular-nums">{formatEuro(model.budgetRevenueTarget)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Πραγματική είσπραξη</p>
            <p className="text-xl font-bold tabular-nums text-emerald-800">
              {formatEuro(model.budgetRevenueActual)}
            </p>
            <p className="text-xs text-amber-800">
              Υστέρηση {formatEuro(model.budgetRevenueTarget - model.budgetRevenueActual)} (
              {formatPct((model.budgetRevenueActual / model.budgetRevenueTarget) * 100 - 100, true)} vs στόχο)
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}

function RevenueBreakdownPanel({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; label: string; amount: number; sharePct: number }[];
}) {
  const max = safeMax(rows.map((r) => r.amount));
  return (
    <Panel title={title}>
      <div className="space-y-2">
        {rows.map((r) => (
          <BarRow key={r.id} label={r.label} amount={r.amount} max={max} sublabel={`${r.sharePct}%`} tone="indigo" />
        ))}
      </div>
    </Panel>
  );
}

export function RevenueAnalysisSection({ model }: SectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="rev-section">
      <SectionHeading
        title="Ανάλυση εσόδων"
        description="Κατανομή υπολογιζόμενων εσόδων μήνα — πολυεπίπεδη ανάλυση"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueBreakdownPanel title="Ανά κέντρο" rows={model.revenueByCenter} />
        <RevenueBreakdownPanel title="Ανά ειδικότητα" rows={model.revenueBySpecialty} />
        <RevenueBreakdownPanel title="Ανά θεραπευτή / συνεργάτη" rows={model.revenueByTherapist} />
        <RevenueBreakdownPanel title="Ανά τύπο προγράμματος" rows={model.revenueByProgramType} />
        <RevenueBreakdownPanel title="Ομαδικά προγράμματα" rows={model.revenueByGroupPrograms} />
        <RevenueBreakdownPanel title="Αξιολογήσεις & αναφορές" rows={model.revenueByEvaluations} />
      </div>
    </section>
  );
}

export function ParentsFinancialSection({ model }: SectionProps) {
  const rows = model.parentProfilesFromSchedule ?? [];
  return (
    <section className="space-y-3" aria-labelledby="parents-fin">
      <SectionHeading title="Οικονομική παρακολούθηση γονέων" description="Από χρεώσεις προγράμματος" />
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/60 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2.5">Γονέας</th>
              <th className="px-3 py-2.5">Παιδιά</th>
              <th className="px-3 py-2.5">Κέντρο</th>
              <th className="px-3 py-2.5 text-right">Αναμενόμενο</th>
              <th className="px-3 py-2.5 text-right">Πληρώθηκε</th>
              <th className="px-3 py-2.5 text-right">Υπόλοιπο</th>
              <th className="px-3 py-2.5 text-right">Ημέρες καθυστέρησης</th>
              <th className="px-3 py-2.5 text-right">Συνέπεια</th>
              <th className="px-3 py-2.5">Κίνδυνος</th>
              <th className="px-3 py-2.5">Κατάσταση</th>
              <th className="px-3 py-2.5 text-right">Συνεδρίες</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface-muted/30">
                <td className="px-3 py-2.5 font-medium">{row.parentName}</td>
                <td className="px-3 py-2.5 text-ink-muted">{row.children.join(", ")}</td>
                <td className="px-3 py-2.5">{FINANCE_CENTER_LABELS[row.center]}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {formatEuroPrecise(row.monthlyExpectedCharge)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatEuroPrecise(row.amountPaid)}</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {formatEuroPrecise(row.outstandingAmount)}
                </td>
                <td className="px-3 py-2.5 text-right">{row.overdueDays > 0 ? row.overdueDays : "—"}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{row.paymentConsistencyPct}%</td>
                <td className="px-3 py-2.5">
                  <RiskBadge risk={row.riskLevel} />
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${balanceStatusClass(row.status)}`}
                  >
                    {PARENT_BALANCE_STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-ink-muted tabular-nums">{row.linkedChargeIds.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ExpensesSection({ fullAccess }: { fullAccess: boolean }) {
  const visible = fullAccess
    ? FINANCE_EXPENSES
    : FINANCE_EXPENSES.map((e) =>
        SENSITIVE.has(e.category) ? { ...e, amount: 0, description: `${e.description} (διοίκηση)` } : e
      );

  return (
    <section className="space-y-3" aria-labelledby="exp-section">
      <SectionHeading title="Εξοδολόγιο" description="Λειτουργικά έξοδα ομίλου — Νίκαια & Εύοσμος" />
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(EXPENSE_CATEGORY_LABELS) as (keyof typeof EXPENSE_CATEGORY_LABELS)[]).map((code) => {
          const total = visible.filter((e) => e.category === code).reduce((s, e) => s + e.amount, 0);
          return (
            <div key={code} className="rounded-lg border border-border bg-white px-3 py-2 text-center">
              <p className="text-[10px] font-bold uppercase text-ink-muted">{EXPENSE_CATEGORY_LABELS[code]}</p>
              <p className="mt-1 text-sm font-bold tabular-nums">{total > 0 ? formatEuro(total) : "—"}</p>
            </div>
          );
        })}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="border-b bg-surface-muted/60 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2.5">Κατηγορία</th>
              <th className="px-3 py-2.5">Περιγραφή</th>
              <th className="px-3 py-2.5">Κέντρο</th>
              <th className="px-3 py-2.5 text-right">Ποσό</th>
              <th className="px-3 py-2.5">Πληρωμή</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((ex) => (
              <tr key={ex.id}>
                <td className="px-3 py-2.5 font-medium">{EXPENSE_CATEGORY_LABELS[ex.category]}</td>
                <td className="px-3 py-2.5">{ex.description}</td>
                <td className="px-3 py-2.5">
                  {ex.center === "omilos" ? "Όμιλος" : FINANCE_CENTER_LABELS[ex.center]}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold">
                  {ex.amount > 0 ? formatEuroPrecise(ex.amount) : "—"}
                </td>
                <td className="px-3 py-2.5">
                  {ex.paidAt ? formatDateEl(ex.paidAt) : <span className="text-amber-700">Εκκρεμεί</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TransactionsSection() {
  return (
    <section className="space-y-3" aria-labelledby="tx-section">
      <SectionHeading title="Πληρωμές / κινήσεις" description="Πραγματικά έσοδα — εισπράξεις μήνα" />
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="border-b bg-surface-muted/60 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2.5">Ημ/νία</th>
              <th className="px-3 py-2.5">Γονέας</th>
              <th className="px-3 py-2.5">Παιδί</th>
              <th className="px-3 py-2.5">Κέντρο</th>
              <th className="px-3 py-2.5 text-right">Ποσό</th>
              <th className="px-3 py-2.5">Τρόπος</th>
              <th className="px-3 py-2.5">Μήνας</th>
              <th className="px-3 py-2.5">Απόδειξη</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FINANCE_TRANSACTIONS.map((tx) => (
              <tr key={tx.id}>
                <td className="px-3 py-2.5">{formatDateEl(tx.paymentDate)}</td>
                <td className="px-3 py-2.5 font-medium">{tx.parentName}</td>
                <td className="px-3 py-2.5">{tx.childName}</td>
                <td className="px-3 py-2.5">{FINANCE_CENTER_LABELS[tx.center]}</td>
                <td className="px-3 py-2.5 text-right font-medium text-emerald-800">
                  {formatEuroPrecise(tx.amount)}
                </td>
                <td className="px-3 py-2.5">{PAYMENT_METHOD_LABELS[tx.paymentMethod]}</td>
                <td className="px-3 py-2.5 text-ink-muted">{tx.relatedMonth.slice(0, 7)}</td>
                <td className="px-3 py-2.5">
                  <span className="rounded border px-2 py-0.5 text-xs">{RECEIPT_STATUS_LABELS[tx.receiptStatus]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ForecastSection({ model, fullAccess }: SectionProps) {
  if (!fullAccess) {
    return (
      <section className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-muted">
        Η πρόβλεψη & risk forecast είναι διαθέσιμες στη διοίκηση.
      </section>
    );
  }

  const f = model.forecast;
  return (
    <section className="space-y-4" aria-labelledby="forecast-section">
      <SectionHeading
        title="Πρόβλεψη & risk forecast"
        description={f.nextMonthLabel}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <TrendingUp className="h-5 w-5 text-emerald-700" aria-hidden />
          <p className="mt-2 text-xs font-semibold uppercase text-emerald-900">Προβλεπόμενα έσοδα</p>
          <p className="text-2xl font-bold text-emerald-900 tabular-nums">{formatEuro(f.projectedRevenue)}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <TrendingDown className="h-5 w-5 text-rose-700" aria-hidden />
          <p className="mt-2 text-xs font-semibold uppercase text-rose-900">Προβλεπόμενα έξοδα</p>
          <p className="text-2xl font-bold text-rose-900 tabular-nums">{formatEuro(f.projectedExpenses)}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <Target className="h-5 w-5 text-indigo-700" aria-hidden />
          <p className="mt-2 text-xs font-semibold uppercase text-indigo-900">Καθαρό (πρόβλεψη)</p>
          <p className="text-2xl font-bold text-indigo-900 tabular-nums">{formatEuro(f.projectedNet)}</p>
          <p className="mt-1 text-xs text-indigo-800">
            Είσπραξη εκτίμηση: {formatPct(f.collectionRateForecastPct)}
          </p>
        </div>
      </div>
      <Panel title="Risk forecast — διοίκηση">
        <div className="flex flex-wrap items-start gap-2">
          <FinanceAlertBadge level={f.riskLevel} />
          <p className="text-sm text-ink-muted">{f.riskSummary}</p>
        </div>
      </Panel>
    </section>
  );
}

export function AlertsSection() {
  return (
    <section className="space-y-3" aria-labelledby="alerts-section">
      <SectionHeading title="Οικονομικές ειδοποιήσεις" description="Alerts για γραμματεία & διοίκηση" />
      <ul className="space-y-2">
        {FINANCE_ALERTS.map((alert) => (
          <li
            key={alert.id}
            className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
              alert.level === "critical"
                ? "border-red-200 bg-red-50/80"
                : alert.level === "warning"
                  ? "border-amber-200 bg-amber-50/80"
                  : "border-border bg-white"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <FinanceAlertBadge level={alert.level} />
                <span className="font-semibold text-ink">{alert.title}</span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{alert.detail}</p>
            </div>
            {alert.href ? (
              <Link
                href={alert.href}
                className="shrink-0 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
              >
                Άνοιγμα
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
