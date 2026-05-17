"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Baby,
  Brain,
  CalendarClock,
  ClipboardList,
  Gauge,
  Landmark,
  LineChart,
  ListOrdered,
  Stethoscope,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { PredictiveSectionId } from "@/lib/management/predictive-intelligence/types";
import { buildPredictiveIntelligenceModel } from "@/lib/management/predictive-intelligence/read-model";
import { PredictivePrototypeBanner } from "./PredictivePrototypeBanner";
import { PredictiveRoleBanner } from "./PredictiveRoleBanner";
import {
  CapacityForecastSection,
  ChildContinuitySection,
  ClinicalWorkflowSection,
  FinancialForecastSection,
  ForecastDashboardSection,
  OverviewStrip,
  RiskScoringSection,
  TherapistBurnoutSection,
  WaitingListSection,
} from "./PredictiveSections";

const SECTIONS: { id: PredictiveSectionId; label: string; icon: typeof Brain }[] = [
  { id: "dashboard", label: "Πρόβλεψη", icon: LineChart },
  { id: "child", label: "Συνέχεια παιδιού", icon: Baby },
  { id: "burnout", label: "Burnout θεραπευτών", icon: Stethoscope },
  { id: "capacity", label: "Χωρητικότητα", icon: CalendarClock },
  { id: "financial", label: "Οικονομικά", icon: Landmark },
  { id: "clinical", label: "Κλινική ροή", icon: ClipboardList },
  { id: "waiting", label: "Λίστα αναμονής", icon: ListOrdered },
  { id: "scoring", label: "Risk scoring", icon: Gauge },
];

type Props = { roleCodes: RoleCode[] };

export function PredictiveWorkspace({ roleCodes }: Props) {
  const model = useMemo(() => buildPredictiveIntelligenceModel(), []);
  const [section, setSection] = useState<PredictiveSectionId>("dashboard");

  const criticalCount =
    model.riskDistribution.find((d) => d.level === "critical")?.count ?? 0;

  return (
    <div className="space-y-4">
      <PredictivePrototypeBanner />
      <PredictiveRoleBanner roleCodes={roleCodes} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-950 via-indigo-950 to-violet-900 px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-violet-300" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-violet-300">Predictive Intelligence</p>
            <p className="text-lg font-bold">Πολυεπιστημονικά κέντρα · πρόβλεψη λειτουργίας</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-violet-300" aria-hidden />
          <span>
            {criticalCount > 0 ? (
              <span className="font-semibold text-red-300">{criticalCount} κρίσιμοι κίνδυνοι</span>
            ) : (
              <span className="text-violet-200">Κανονική πρόβλεψη</span>
            )}
          </span>
        </div>
      </div>

      <OverviewStrip model={model} />

      <nav
        className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1 shadow-sm"
        aria-label="Ενότητες predictive intelligence"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              section === id
                ? "bg-violet-900 text-white shadow-sm"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      {section === "dashboard" ? <ForecastDashboardSection model={model} /> : null}
      {section === "child" ? <ChildContinuitySection model={model} /> : null}
      {section === "burnout" ? <TherapistBurnoutSection model={model} /> : null}
      {section === "capacity" ? <CapacityForecastSection model={model} /> : null}
      {section === "financial" ? <FinancialForecastSection model={model} /> : null}
      {section === "clinical" ? <ClinicalWorkflowSection model={model} /> : null}
      {section === "waiting" ? <WaitingListSection model={model} /> : null}
      {section === "scoring" ? <RiskScoringSection model={model} /> : null}
    </div>
  );
}
