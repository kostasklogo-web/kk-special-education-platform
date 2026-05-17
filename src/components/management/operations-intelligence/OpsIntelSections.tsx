"use client";

import { Bell, RefreshCw } from "lucide-react";
import type { OperationsIntelligenceModel } from "@/lib/management/operations-intelligence/types";
import { OPS_ALERT_KIND_LABELS } from "@/lib/management/operations-intelligence/labels";
import {
  DataTable,
  HealthScoreCard,
  KpiCard,
  OccupancyHeatmap,
  OccupancyStrip,
  RiskBadge,
  SectionHeading,
  TrendBadge,
  TrendMiniChart,
} from "./OpsIntelUi";

type Props = {
  model: OperationsIntelligenceModel;
  fullAccess: boolean;
};

export function HealthOverviewSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4" aria-labelledby="ops-health">
      <SectionHeading
        title="Operational Health Overview"
        description="Σύνθετη εικόνα λειτουργικής υγείας κέντρου — βαθμολογίες & τάσεις"
      />
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-white">
        <div>
          <p className="text-xs text-slate-400">Συνολική λειτουργική βαθμολογία</p>
          <p className="text-3xl font-bold tabular-nums">{model.overallOperationalScore}/100</p>
        </div>
        <RiskBadge level={model.overallRiskLevel} />
        <p className="text-sm text-slate-300">{model.centerLabel}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {model.healthScores.map((s) => (
          <HealthScoreCard key={s.id} score={s} />
        ))}
      </div>
    </section>
  );
}

export function SchedulingIntelligenceSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Scheduling Intelligence"
        description="Υπερφόρτωση, κενά, bottlenecks, ακυρώσεις — ανίχνευση αναποτελεσματικοτήτων"
      />
      <OccupancyHeatmap cells={model.occupancyHeatmap} />
      <div className="grid gap-3 lg:grid-cols-2">
        {model.schedulingInsights.map((ins) => (
          <div
            key={ins.id}
            className="rounded-xl border border-border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase text-ink-muted">{ins.label}</p>
                <p className="mt-1 font-semibold text-ink">{ins.subject}</p>
              </div>
              <RiskBadge level={ins.riskLevel} />
            </div>
            <p className="mt-2 text-sm text-ink-muted">{ins.detail}</p>
            <p className="mt-2 text-xs tabular-nums text-ink-muted">
              {ins.center === "nikaia" ? "Νίκαια" : "Εύοσμος"} · τιμή {ins.metricValue} (όριο {ins.threshold})
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TherapistOpsSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4">
      <SectionHeading title="Therapist Operational Intelligence" description="Caseload, σημειώσεις, εποπτεία, τάσεις φόρτου" />
      <DataTable
        headers={[
          "Θεραπευτής",
          "Ειδικότητα",
          "Κέντρο",
          "Caseload",
          "Ολοκλ.%",
          "Σημειώσεις",
          "Αναφορές",
          "Εποπτεία (ημ.)",
          "Προσέλευση",
          "Ακυρ.%",
          "Ώρες",
          "Τάση",
        ]}
        rows={model.therapistRows.map((t) => [
          t.name,
          t.specialty,
          t.center === "nikaia" ? "Νίκαια" : "Εύοσμος",
          <RiskBadge key="c" level={t.caseloadPressure} />,
          `${t.completionConsistencyPct}%`,
          t.overdueNotes > 0 ? String(t.overdueNotes) : "—",
          t.overdueReports > 0 ? String(t.overdueReports) : "—",
          String(t.supervisionDaysAgo),
          `${t.attendanceStabilityPct}%`,
          `${t.cancellationRatePct}%`,
          String(t.workloadHours),
          <TrendBadge key="tr" trend={t.workloadTrend} />,
        ])}
      />
    </section>
  );
}

export function ChildOpsSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Child / Case Operational Intelligence"
        description="Παλινδρόμηση, προσέλευση, συντονισμός, οικονομική συνέχεια"
      />
      <DataTable
        headers={[
          "Παιδί",
          "Κέντρο",
          "Παλινδρ.",
          "Προσέλευση",
          "Ακυρώσεις",
          "Re-assessment",
          "Αναφορές",
          "Συντονισμός",
          "Θραυσματικότητα",
          "Επικοινωνία γ.",
          "Οικον. συνέχεια",
        ]}
        rows={model.childRows.map((c) => [
          c.childName,
          c.center === "nikaia" ? "Νίκαια" : "Εύοσμος",
          <RiskBadge key="r" level={c.regressionRisk} />,
          <RiskBadge key="a" level={c.attendanceDeterioration} />,
          <RiskBadge key="x" level={c.cancellationPattern} />,
          c.reassessmentOverdue ? "Ναι" : "—",
          c.reportsOverdue > 0 ? String(c.reportsOverdue) : "—",
          c.coordinationIssue ? "⚠ Ναι" : "—",
          <RiskBadge key="f" level={c.scheduleFragmentation} />,
          c.parentCommsFrequency === "high"
            ? "Υψηλή"
            : c.parentCommsFrequency === "elevated"
              ? "Αυξημένη"
              : "Κανονική",
          <RiskBadge key="fin" level={c.financialContinuityRisk} />,
        ])}
      />
    </section>
  );
}

export function FinancialOpsSection({ model, fullAccess }: Props) {
  if (!fullAccess) {
    return (
      <section className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-muted">
        Η οικονομική operational intelligence είναι διαθέσιμη σε CEO / Διοίκηση / Κλινική Διεύθυνση.
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Financial Operational Intelligence"
        description="Είσπραξη, οφειλές, ταμειακή ροή, πληρότητα vs έσοδα"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {model.financialInsights.map((f) => (
          <KpiCard key={f.id} label={f.label} value={f.currentValue} helper={f.detail} risk={f.riskLevel} />
        ))}
      </div>
      <OccupancyStrip label="Πληρότητα vs στόχος εσόδων (Νίκαια)" pct={91} />
      <OccupancyStrip label="Πληρότητα vs στόχος εσόδων (Εύοσμος)" pct={68} />
    </section>
  );
}

export function SecretaryOpsSection({ model }: Pick<Props, "model">) {
  const s = model.secretaryOps;
  return (
    <section className="space-y-4">
      <SectionHeading title="Secretary Operational Intelligence" description="Υπενθυμίσεις, tasks, επικοινωνίες, συντονισμός αναφορών" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Εκπρόθεσμες υπενθυμίσεις" value={String(s.overdueReminders)} risk={s.overdueReminders > 5 ? "high" : "medium"} />
        <KpiCard label="Ανοιχτές εργασίες" value={String(s.unresolvedTasks)} risk={s.unresolvedTasks > 12 ? "high" : "low"} />
        <KpiCard label="Υπερφορτωμένες ημέρες" value={String(s.overloadedDays)} risk={s.overloadedDays >= 3 ? "medium" : "low"} />
        <KpiCard label="Backlog επικοινωνιών" value={String(s.communicationBacklog)} risk={s.communicationBacklog > 8 ? "high" : "medium"} />
        <KpiCard label="Συντονισμός αναφορών" value={String(s.pendingReportCoordination)} risk="medium" />
        <KpiCard label="Follow-up συναντήσεων" value={String(s.unresolvedMeetingFollowups)} risk="medium" />
      </div>
    </section>
  );
}

export function SupervisionIntelSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4">
      <SectionHeading title="Supervision Intelligence" description="Εποπτεία θεραπευτών & διεπιστημονική review" />
      <DataTable
        headers={["Θεραπευτής", "Ημέρες από εποπτεία", "Κενές σημειώσεις", "Εκκρεμείς ενέργειες", "Κίνδυνος"]}
        rows={model.supervisionRows.map((r) => [
          r.therapistName,
          String(r.daysSinceSupervision),
          r.missingNotes ? "Ναι" : "—",
          String(r.unresolvedActions),
          <RiskBadge key="rk" level={r.riskLevel} />,
        ])}
      />
      <SectionHeading title="Διεπιστημονικά κενά" />
      <DataTable
        headers={["Παιδί", "Ημέρες από review", "Ειδικότητες", "Κίνδυνος"]}
        rows={model.interdisciplinaryGaps.map((g) => [
          g.childName,
          String(g.daysSinceReview),
          g.specialtiesInvolved.join(", "),
          <RiskBadge key="g" level={g.riskLevel} />,
        ])}
      />
    </section>
  );
}

export function TrendAnalysisSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4">
      <SectionHeading title="Trend Analysis" description="Εβδομαδιαίες, μηνιαίες, ετήσιες τάσεις & συγκρίσεις" />
      <div className="grid gap-4 lg:grid-cols-3">
        <TrendMiniChart points={model.weeklyTrends} label="Εβδομαδιαία τάση (operational score)" />
        <TrendMiniChart points={model.monthlyTrends} label="Μηνιαία τάση" />
        <TrendMiniChart points={model.yearlyTrends} label="Ετήσια τάση" />
      </div>
      <DataTable
        headers={["Κέντρο", "Εβδομάδα", "Μήνας", "Έτος", "Τάση"]}
        rows={model.centerComparison.map((r) => [
          r.label,
          String(r.weekly),
          String(r.monthly),
          String(r.yearly),
          <TrendBadge key="t" trend={r.trend} />,
        ])}
      />
      <DataTable
        headers={["Ειδικότητα", "Εβδομάδα", "Μήνας", "Έτος", "Τάση"]}
        rows={model.specialtyComparison.map((r) => [
          r.label,
          String(r.weekly),
          String(r.monthly),
          String(r.yearly),
          <TrendBadge key="t" trend={r.trend} />,
        ])}
      />
      <DataTable
        headers={["Θεραπευτής", "Εβδομάδα", "Μήνας", "Έτος", "Τάση"]}
        rows={model.therapistComparison.map((r) => [
          r.label,
          String(r.weekly),
          String(r.monthly),
          String(r.yearly),
          <TrendBadge key="t" trend={r.trend} />,
        ])}
      />
    </section>
  );
}

export function AlertsEngineSection({ model }: Pick<Props, "model">) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Alerts Engine"
        description="Κατάταξη επείγοντος — κανόνες workflow (όχι AI)"
        action={
          <button
            type="button"
            onClick={() => window.alert("Πρωτότυπο: ανανέωση κανόνων ανίχνευσης.")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Ανανέωση rules
          </button>
        }
      />
      <ul className="space-y-2">
        {model.alerts.map((a, i) => (
          <li
            key={a.id}
            className={`flex flex-wrap items-start gap-3 rounded-xl border p-4 ${
              a.level === "critical"
                ? "border-red-300 bg-red-50"
                : a.level === "high"
                  ? "border-orange-200 bg-orange-50"
                  : "border-border bg-white"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {i + 1}
            </span>
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={a.level} />
                <span className="text-[10px] font-bold uppercase text-ink-muted">
                  {OPS_ALERT_KIND_LABELS[a.kind]}
                </span>
                {a.center ? (
                  <span className="text-[10px] text-ink-muted">
                    {a.center === "evosmos" ? "Εύοσμος" : a.center === "nikaia" ? "Νίκαια" : "Όμιλος"}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 font-semibold text-ink">{a.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{a.detail}</p>
              <p className="mt-2 text-xs font-medium text-indigo-900">→ {a.suggestedAction}</p>
            </div>
            <span className="text-xs tabular-nums text-ink-muted">Urgency {a.urgencyRank}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
