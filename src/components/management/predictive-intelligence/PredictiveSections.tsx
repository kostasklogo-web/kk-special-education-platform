"use client";

import type { PredictiveIntelligenceModel } from "@/lib/management/predictive-intelligence/types";
import { HORIZON_LABELS } from "@/lib/management/predictive-intelligence/labels";
import {
  ForecastCurve,
  PredictiveHeatmap,
  RiskBadge,
  RiskCard,
  SectionHeading,
} from "./PredictiveUi";

type Props = { model: PredictiveIntelligenceModel };

export function ForecastDashboardSection({ model }: Props) {
  const fd = model.forecastDashboard;
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Operational Forecast Dashboard"
        description="Πρόβλεψη φόρτου λειτουργίας — 7 ημέρες, 30 ημέρες, τρίμηνο, έτος"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <ForecastCurve points={fd.sevenDay} title="Πρόβλεψη 7 ημερών (φόρτος %)" />
        <ForecastCurve points={fd.thirtyDay} title="Πρόβλεψη 30 ημερών" />
        <ForecastCurve points={fd.quarter} title="Τριμηνιαία πρόβλεψη" />
        <ForecastCurve points={fd.year} title="Ετήσια τάση" />
      </div>
      <PredictiveHeatmap rows={model.heatmapRows} />
    </section>
  );
}

export function ChildContinuitySection({ model }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Child Continuity Risk"
        description="Dropout, προσέλευση, οικονομική συνέχεια, αποσύνδεση γονέα/θεραπείας"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {model.childContinuityRisks.map((item) => (
          <RiskCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function TherapistBurnoutSection({ model }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Therapist Burnout Risk"
        description="Υπερφόρτωση, caseload, αναφορές, ομαδικές, καθυστέρηση εποπτείας"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {model.therapistBurnoutRisks.map((item) => (
          <RiskCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function CapacityForecastSection({ model }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Scheduling Capacity Forecast"
        description="Αίθουσες, ώρες, λίστα αναμονής, staffing bottlenecks"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {model.capacityForecasts.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-ink">{c.label}</p>
              <RiskBadge level={c.riskLevel} />
            </div>
            <p className="mt-1 text-sm text-ink-muted">{c.dayOrPeriod}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-ink">{c.predictedLoadPct}%</p>
            <p className="mt-1 text-xs text-ink-muted">προβλεπόμενη φόρτωση</p>
            <p className="mt-2 text-sm text-ink-muted">{c.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinancialForecastSection({ model }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Financial Forecasting"
        description="Ταμειακή ροή, είσπραξη, budget, πληρότητα vs έσοδα, εποχικότητα"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {model.financialForecasts.map((f) => (
          <div
            key={f.id}
            className={`rounded-xl border p-4 shadow-sm ${
              f.riskLevel === "critical" || f.riskLevel === "high"
                ? "border-orange-200 bg-orange-50/50"
                : "border-border bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold uppercase text-ink-muted">{HORIZON_LABELS[f.horizon]}</p>
              <RiskBadge level={f.riskLevel} />
            </div>
            <p className="mt-2 font-semibold text-ink">{f.title}</p>
            <p className="mt-2 text-sm">
              Τρέχον: <span className="font-medium">{f.currentValue}</span>
            </p>
            <p className="text-sm">
              Πρόβλεψη: <span className="font-bold text-violet-900">{f.predictedValue}</span>
            </p>
            <p className="mt-1 text-xs font-medium text-ink-muted">{f.changeLabel}</p>
            {f.warning ? <p className="mt-2 text-xs text-orange-900">{f.warning}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClinicalWorkflowSection({ model }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Clinical Workflow Risk"
        description="Αναφορές, reassessment, εποπτεία, διεπιστημονική, στόχοι"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {model.clinicalWorkflowRisks.map((item) => (
          <RiskCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function WaitingListSection({ model }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Waiting List Forecast"
        description="Intake, αξιολογήσεις, ειδικότητες, κορεσμός προγράμματος"
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-surface-muted/60 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2.5">Ειδικότητα</th>
              <th className="px-3 py-2.5 text-right">Τώρα</th>
              <th className="px-3 py-2.5 text-right">Πρόβλεψη 30ημ.</th>
              <th className="px-3 py-2.5 text-right">Εβδ. έως slot</th>
              <th className="px-3 py-2.5">Κορεσμός</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {model.waitingListForecasts.map((w) => (
              <tr key={w.specialty} className="hover:bg-surface-muted/30">
                <td className="px-3 py-2.5 font-medium">{w.specialty}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{w.currentWait}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold">{w.predicted30d}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{w.weeksToSlot}</td>
                <td className="px-3 py-2.5">
                  <RiskBadge level={w.saturationRisk} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function RiskScoringSection({ model }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title="Risk Scoring"
        description="Κατανομή επιπέδων κινδύνου & κορυφαίες προτεινόμενες παρεμβάσεις"
      />
      <div className="flex flex-wrap gap-3">
        {model.riskDistribution.map((d) => (
          <div key={d.level} className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
            <RiskBadge level={d.level} />
            <p className="mt-2 text-2xl font-bold tabular-nums">{d.count}</p>
            <p className="text-xs text-ink-muted">περιστατικά</p>
          </div>
        ))}
      </div>
      <SectionHeading title="Προτεραιότητα παρεμβάσεων" />
      <div className="grid gap-4 lg:grid-cols-2">
        {model.topInterventions.map((item) => (
          <RiskCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function OverviewStrip({ model }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-950 to-indigo-950 px-4 py-3 text-white">
      <div>
        <p className="text-xs text-violet-300">Συνολικό predictive score</p>
        <p className="text-3xl font-bold tabular-nums">{model.overallPredictiveScore}/100</p>
      </div>
      <RiskBadge level={model.overallRiskLevel} />
      <p className="text-sm text-violet-200">{model.centerLabel}</p>
      <p className="ml-auto text-xs text-violet-300">
        {model.topInterventions.filter((i) => i.riskLevel === "critical" || i.riskLevel === "high").length}{" "}
        υψηλοί/κρίσιμοι κίνδυνοι
      </p>
    </div>
  );
}
