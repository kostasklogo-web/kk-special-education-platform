"use client";

import { FileDown } from "lucide-react";
import type { ManagementAnalyticsModel } from "@/lib/management/analytics/types";
import type { AnalyticsFiltersState, AnalyticsPeriodKind, CompareMode } from "@/lib/management/analytics/types";
import {
  COMPARE_MODE_LABELS,
  CENTER_FILTER_LABELS,
  PERIOD_KIND_LABELS,
  formatEuro,
  formatPct,
} from "@/lib/management/analytics/labels";
import { ComparedKpiCard, ChartBlock, DataTable, SectionHeading, TrendBadge } from "./AnalyticsUi";

type Props = {
  model: ManagementAnalyticsModel;
  fullAccess: boolean;
  filters: AnalyticsFiltersState;
  onFiltersChange: (next: AnalyticsFiltersState) => void;
};

export function TimeFiltersBar({ filters, onFiltersChange, periodLabel, comparePeriodLabel }: Props & {
  periodLabel: string;
  comparePeriodLabel: string;
}) {
  const periods: AnalyticsPeriodKind[] = ["day", "week", "month", "year", "custom"];
  const compareModes: CompareMode[] = [
    "previous_period",
    "same_period_last_month",
    "same_period_last_year",
    "selected_period",
  ];

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm" aria-label="Φίλτρα χρόνου">
      <SectionHeading
        title="Φίλτρα περιόδου"
        description={`Τρέχουσα: ${periodLabel} · Σύγκριση: ${comparePeriodLabel}`}
      />
      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-semibold text-ink-muted">Περίοδος</span>
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onFiltersChange({ ...filters, period: p })}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              filters.period === p
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-border bg-white text-ink-muted hover:bg-surface-muted"
            }`}
          >
            {PERIOD_KIND_LABELS[p]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-ink-muted">Ημερομηνία αναφοράς</span>
          <input
            type="date"
            value={filters.anchorYmd}
            onChange={(e) => onFiltersChange({ ...filters, anchorYmd: e.target.value })}
            className="rounded-lg border border-border px-2 py-1.5 text-sm"
          />
        </label>
        {filters.period === "custom" ? (
          <>
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-ink-muted">Από</span>
              <input
                type="date"
                value={filters.customFrom ?? ""}
                onChange={(e) => onFiltersChange({ ...filters, customFrom: e.target.value })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-ink-muted">Έως</span>
              <input
                type="date"
                value={filters.customTo ?? ""}
                onChange={(e) => onFiltersChange({ ...filters, customTo: e.target.value })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
          </>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-semibold text-ink-muted">Σύγκριση με</span>
        {compareModes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onFiltersChange({ ...filters, compareMode: m })}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              filters.compareMode === m
                ? "border-indigo-600 bg-indigo-50 text-indigo-950"
                : "border-border bg-white text-ink-muted"
            }`}
          >
            {COMPARE_MODE_LABELS[m]}
          </button>
        ))}
      </div>
    </section>
  );
}

function ReportGenerateButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.alert(`Πρωτότυπο: δημιουργία ${label}`)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-surface-muted"
    >
      <FileDown className="h-3.5 w-3.5" aria-hidden />
      Δημιουργία αναφοράς
    </button>
  );
}

export function OverviewSection({ model, fullAccess }: Pick<Props, "model" | "fullAccess">) {
  const max = Math.max(...model.chartSeries.map((c) => c.current), 1);
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Επισκόπηση διοίκησης"
        description="Σύνοψη οικονομικών, KPI θεραπευτών και ροής περιστατικών"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {model.financial.slice(0, 4).map((m) => (
          <ComparedKpiCard key={m.id} metric={m} masked={!fullAccess && m.managementOnly} />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {model.chartSeries.map((s) => (
          <ChartBlock key={s.label} label={s.label} current={s.current} previous={s.previous} max={max} />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {model.caseFlow.metrics.slice(0, 3).map((m) => (
          <ComparedKpiCard key={m.id} metric={m} />
        ))}
      </div>
    </section>
  );
}

export function FinancialAnalyticsSection({ model, fullAccess }: Pick<Props, "model" | "fullAccess">) {
  if (!fullAccess) {
    return (
      <section className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-muted">
        Τα οικονομικά αναλυτικά στοιχεία είναι διαθέσιμα μόνο στη διοίκηση / CEO.
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Οικονομική ανάλυση"
        description="Τζίρος, έσοδα, ταμειακή ροή, budget και είσπραξη — με σύγκριση περιόδων"
        action={<ReportGenerateButton label="οικονομικής" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {model.financial.map((m) => (
          <ComparedKpiCard key={m.id} metric={m} />
        ))}
      </div>
    </section>
  );
}

export function TherapistAnalyticsSection({ model, filters, onFiltersChange }: Props) {
  const specialties = [...new Set(model.therapistRows.map((t) => t.specialty))];
  return (
    <section className="space-y-4">
      <SectionHeading
        title="KPI θεραπευτών"
        description="Παραγωγικότητα, αξιοποίηση, σημειώσεις, αναφορές και ομαδικές συνεδρίες"
        action={<ReportGenerateButton label="KPI θεραπευτών" />}
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.centerFilter ?? "all"}
          onChange={(e) => onFiltersChange({ ...filters, centerFilter: e.target.value })}
          className="rounded-lg border border-border px-2 py-1.5 text-xs"
          aria-label="Κέντρο"
        >
          {Object.entries(CENTER_FILTER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={filters.specialtyFilter ?? "all"}
          onChange={(e) => onFiltersChange({ ...filters, specialtyFilter: e.target.value })}
          className="rounded-lg border border-border px-2 py-1.5 text-xs"
          aria-label="Ειδικότητα"
        >
          <option value="all">Όλες οι ειδικότητες</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        headers={[
          "Θεραπευτής",
          "Ειδικότητα",
          "Κέντρο",
          "Ώρες",
          "Ολοκληρ.",
          "Ακυρ.",
          "Απουσ.",
          "Αξιοπ.",
          "Σημειώσεις",
          "Αναφορές",
          "Εποπτεία",
          "Caseload",
          "Ομάδες",
          "Σύγκριση",
        ]}
        rows={model.therapistRows.map((t) => [
          t.name,
          t.specialty,
          t.center === "nikaia" ? "Νίκαια" : "Εύοσμος",
          String(t.scheduledHours),
          String(t.completedSessions),
          String(t.cancellations),
          String(t.absences),
          `${t.utilizationPct}%`,
          `${t.noteCompletionPct}%`,
          `${t.reportCompletionPct}%`,
          String(t.supervisionSessions),
          String(t.avgCaseload),
          String(t.groupSessions),
          t.comparison ? (
            <TrendBadge trend={t.comparison.trend} label={formatPct(t.comparison.deltaPct, true)} />
          ) : (
            "—"
          ),
        ])}
      />
    </section>
  );
}

export function CaseFlowSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Ανάλυση ροής περιστατικών"
        description="Νέα περιστατικά, αναμονή, αξιολογήσεις, μετατροπές και αποχωρήσεις"
        action={<ReportGenerateButton label="ροής περιστατικών" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {model.caseFlow.metrics.map((m) => (
          <ComparedKpiCard key={m.id} metric={m} />
        ))}
      </div>
    </section>
  );
}

export function DailyReportSection({ model, fullAccess }: Pick<Props, "model" | "fullAccess">) {
  const r = model.dailyReport;
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Ημερήσια αναφορά διοίκησης"
        description={r.dateLabel}
        action={<ReportGenerateButton label="ημερήσιας" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComparedKpiCard
          metric={{
            id: "rev",
            label: "Έσοδα ημέρας",
            formatted: fullAccess ? formatEuro(r.revenueToday) : "—",
            comparison: { current: r.revenueToday, previous: r.revenueToday * 0.94, delta: 0, deltaPct: 6, trend: "up" },
          }}
          masked={!fullAccess}
        />
        <ComparedKpiCard
          metric={{
            id: "sess",
            label: "Ολοκληρωμένες συνεδρίες",
            formatted: String(r.completedSessions),
            comparison: { current: r.completedSessions, previous: 44, delta: 3, deltaPct: 6.8, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "abs",
            label: "Απουσίες",
            formatted: String(r.absences),
            comparison: { current: r.absences, previous: 4, delta: -1, deltaPct: -25, trend: "down" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "can",
            label: "Ακυρώσεις",
            formatted: String(r.cancellations),
            comparison: { current: r.cancellations, previous: 3, delta: -1, deltaPct: -33, trend: "down" },
          }}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-4 text-sm">
          <p className="font-semibold text-ink">Επείγοντα θέματα</p>
          <ul className="mt-2 list-inside list-disc text-ink-muted">
            {r.urgentIssues.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-sm">
          <p className="font-semibold text-ink">Λειτουργικά</p>
          <p className="mt-2 text-ink-muted">Νέα leads: {r.newLeads}</p>
          <p className="text-ink-muted">Εκκρεμείς εργασίες: {r.pendingTasks}</p>
          {fullAccess ? (
            <>
              <p className="mt-2 text-emerald-800">Εισροές: {formatEuro(r.cashIn)}</p>
              <p className="text-rose-800">Εκροές: {formatEuro(r.cashOut)}</p>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function WeeklyReportSection({ model, fullAccess }: Pick<Props, "model" | "fullAccess">) {
  const r = model.weeklyReport;
  return (
    <section className="space-y-4">
      <SectionHeading title="Εβδομαδιαία αναφορά" description={r.weekLabel} action={<ReportGenerateButton label="εβδομαδιαίας" />} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fullAccess ? (
          <>
            <ComparedKpiCard
              metric={{
                id: "wr",
                label: "Εβδομαδιαία έσοδα",
                formatted: formatEuro(r.weeklyRevenue),
                comparison: { current: r.weeklyRevenue, previous: r.weeklyRevenue * 0.96, delta: 0, deltaPct: 4, trend: "up" },
              }}
            />
            <ComparedKpiCard
              metric={{
                id: "wcf",
                label: "Ταμειακή ροή εβδομάδας",
                formatted: formatEuro(r.weeklyCashFlow),
                comparison: { current: r.weeklyCashFlow, previous: r.weeklyCashFlow * 0.9, delta: 0, deltaPct: 10, trend: "up" },
              }}
            />
          </>
        ) : null}
        <ComparedKpiCard
          metric={{
            id: "prod",
            label: "Παραγωγικότητα θεραπευτών",
            formatted: formatPct(r.therapistProductivityPct),
            comparison: { current: r.therapistProductivityPct, previous: 83, delta: 3, deltaPct: 3.6, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "att",
            label: "Τάση προσέλευσης",
            formatted: formatPct(r.attendanceTrendPct),
            comparison: { current: r.attendanceTrendPct, previous: 92.1, delta: 2.1, deltaPct: 2.3, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "nc",
            label: "Νέα περιστατικά",
            formatted: String(r.newCases),
            comparison: { current: r.newCases, previous: r.newCases - 1, delta: 1, deltaPct: 12.5, trend: "up" },
          }}
        />
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Λειτουργικοί κίνδυνοι</p>
        <ul className="mt-2 list-inside list-disc">
          {r.operationalRisks.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs">Καθυστερήσεις αναφορών: {r.reportDelays}</p>
      </div>
    </section>
  );
}

export function MonthlyReportSection({ model, fullAccess }: Pick<Props, "model" | "fullAccess">) {
  const r = model.monthlyReport;
  const riskLabel =
    r.collectionRiskLevel === "high" ? "Υψηλός" : r.collectionRiskLevel === "medium" ? "Μέτριος" : "Χαμηλός";
  return (
    <section className="space-y-4">
      <SectionHeading title="Μηνιαία αναφορά" description={r.monthLabel} action={<ReportGenerateButton label="μηνιαίας" />} />
      {fullAccess ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ComparedKpiCard
            metric={{
              id: "mr",
              label: "Έσοδα",
              formatted: formatEuro(r.revenue),
              comparison: { current: r.revenue, previous: r.revenue * 0.97, delta: 0, deltaPct: 3, trend: "up" },
            }}
          />
          <ComparedKpiCard
            metric={{
              id: "me",
              label: "Έξοδα",
              formatted: formatEuro(r.expenses),
              comparison: { current: r.expenses, previous: r.expenses * 0.98, delta: 0, deltaPct: 2, trend: "up" },
            }}
          />
          <ComparedKpiCard
            metric={{
              id: "mn",
              label: "Καθαρό",
              formatted: formatEuro(r.netResult),
              comparison: { current: r.netResult, previous: r.netResult * 0.95, delta: 0, deltaPct: 5, trend: "up" },
            }}
          />
          <ComparedKpiCard
            metric={{
              id: "mbv",
              label: "Απόκλιση budget",
              formatted: formatEuro(r.budgetVariance),
              comparison: { current: r.budgetVariance, previous: 800, delta: 0, deltaPct: 0, trend: "flat" },
            }}
          />
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-4 text-sm">
          <p className="font-semibold">Ροή περιστατικών</p>
          <p className="mt-2 text-ink-muted">{r.caseFlowSummary}</p>
          <p className="mt-2 text-ink-muted">Αξιοποίηση θεραπευτών: {formatPct(r.therapistUtilizationPct)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-sm">
          <p className="font-semibold">Κίνδυνοι</p>
          <p className="mt-2 text-ink-muted">Διαγνωστικές / αναφορές: {r.diagnosisRiskCount} εκκρεμότητες</p>
          {fullAccess ? (
            <p className="mt-2 font-medium text-amber-900">Κίνδυνος είσπραξης: {riskLabel}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function YearlyReportSection({ model, fullAccess }: Pick<Props, "model" | "fullAccess">) {
  const r = model.yearlyReport;
  if (!fullAccess) {
    return (
      <section className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-muted">
        Η ετήσια αναφορά είναι διαθέσιμη στη διοίκηση / CEO.
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <SectionHeading title="Ετήσια αναφορά" description={r.yearLabel} action={<ReportGenerateButton label="ετήσιας" />} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ComparedKpiCard
          metric={{
            id: "yt",
            label: "Ετήσιος τζίρος",
            formatted: formatEuro(r.annualTurnover),
            comparison: { current: r.annualTurnover, previous: r.annualTurnover * 0.92, delta: 0, deltaPct: 8, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "yr",
            label: "Πραγματικά έσοδα (έτος)",
            formatted: formatEuro(r.annualRealRevenue),
            comparison: { current: r.annualRealRevenue, previous: r.annualRealRevenue * 0.93, delta: 0, deltaPct: 7, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "ye",
            label: "Έξοδα (έτος)",
            formatted: formatEuro(r.annualExpenses),
            comparison: { current: r.annualExpenses, previous: r.annualExpenses * 0.96, delta: 0, deltaPct: 4, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "yn",
            label: "Καθαρό κέρδος/ζημία",
            formatted: formatEuro(r.netProfitLoss),
            comparison: { current: r.netProfitLoss, previous: r.netProfitLoss * 0.88, delta: 0, deltaPct: 12, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "yg",
            label: "Τάση ανάπτυξης",
            formatted: formatPct(r.growthTrendPct, true),
            comparison: { current: r.growthTrendPct, previous: r.growthTrendPct - 2, delta: 2, deltaPct: 2, trend: "up" },
          }}
        />
        <ComparedKpiCard
          metric={{
            id: "yf",
            label: "Καθαρή ροή παιδιών",
            formatted: String(r.childFlowNet),
            comparison: { current: r.childFlowNet, previous: r.childFlowNet - 2, delta: 2, deltaPct: 15, trend: "up" },
          }}
        />
      </div>
      <DataTable
        headers={["Κέντρο", "Έσοδα", "Μερίδιο"]}
        rows={r.centerComparison.map((c) => [c.center, formatEuro(c.revenue), `${c.sharePct}%`])}
      />
    </section>
  );
}
