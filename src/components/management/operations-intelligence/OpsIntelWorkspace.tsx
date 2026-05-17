"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Baby,
  Bell,
  CalendarClock,
  HeartPulse,
  Landmark,
  LineChart,
  Stethoscope,
  Users,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { OpsSectionId } from "@/lib/management/operations-intelligence/types";
import { buildOperationsIntelligenceModel } from "@/lib/management/operations-intelligence/read-model";
import { canViewFullOperationsIntelligence } from "@/lib/management/operations-intelligence/permissions";
import { OpsIntelPrototypeBanner } from "./OpsIntelPrototypeBanner";
import { OpsIntelRoleBanner } from "./OpsIntelRoleBanner";
import { RiskBadge } from "./OpsIntelUi";
import {
  AlertsEngineSection,
  ChildOpsSection,
  FinancialOpsSection,
  HealthOverviewSection,
  SchedulingIntelligenceSection,
  SecretaryOpsSection,
  SupervisionIntelSection,
  TherapistOpsSection,
  TrendAnalysisSection,
} from "./OpsIntelSections";

const SECTIONS: {
  id: OpsSectionId;
  label: string;
  icon: typeof Activity;
  managementOnly?: boolean;
}[] = [
  { id: "health", label: "Υγεία λειτουργίας", icon: HeartPulse },
  { id: "scheduling", label: "Πρόγραμμα", icon: CalendarClock },
  { id: "therapists", label: "Θεραπευτές", icon: Stethoscope },
  { id: "cases", label: "Παιδιά / περιστατικά", icon: Baby },
  { id: "financial", label: "Οικονομικά", icon: Landmark, managementOnly: true },
  { id: "secretary", label: "Γραμματεία", icon: Users },
  { id: "supervision", label: "Εποπτεία", icon: Activity },
  { id: "trends", label: "Τάσεις", icon: LineChart },
  { id: "alerts", label: "Alerts", icon: Bell },
];

type Props = { roleCodes: RoleCode[] };

export function OpsIntelWorkspace({ roleCodes }: Props) {
  const fullAccess = canViewFullOperationsIntelligence(roleCodes);
  const model = useMemo(() => buildOperationsIntelligenceModel(fullAccess), [fullAccess]);
  const [section, setSection] = useState<OpsSectionId>("health");

  const criticalCount = model.alerts.filter((a) => a.level === "critical" || a.level === "high").length;

  return (
    <div className="space-y-4">
      <OpsIntelPrototypeBanner />
      <OpsIntelRoleBanner roleCodes={roleCodes} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-gradient-to-r from-teal-900 to-cyan-900 px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-teal-300" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-teal-200">Operational Intelligence</p>
            <p className="text-lg font-bold">Κέντρα {model.centerLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-teal-200 text-xs">Λειτουργική βαθμολογία</p>
            <p className="font-bold tabular-nums">{model.overallOperationalScore}/100</p>
          </div>
          <div>
            <p className="text-teal-200 text-xs">Ενεργά alerts</p>
            <p className="font-bold text-amber-200">{criticalCount}</p>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-teal-200 text-xs">Συνολικός κίνδυνος</p>
            <RiskBadge level={model.overallRiskLevel} />
          </div>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1 shadow-sm"
        aria-label="Ενότητες operational intelligence"
      >
        {SECTIONS.map(({ id, label, icon: Icon, managementOnly }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              section === id
                ? "bg-slate-900 text-white shadow-sm"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            {label}
            {managementOnly && !fullAccess ? (
              <Landmark className="h-3 w-3 text-amber-500" aria-label="Διοίκηση" />
            ) : null}
            {id === "alerts" && criticalCount > 0 ? (
              <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{criticalCount}</span>
            ) : null}
          </button>
        ))}
      </nav>

      {section === "health" ? <HealthOverviewSection model={model} /> : null}
      {section === "scheduling" ? <SchedulingIntelligenceSection model={model} /> : null}
      {section === "therapists" ? <TherapistOpsSection model={model} /> : null}
      {section === "cases" ? <ChildOpsSection model={model} /> : null}
      {section === "financial" ? <FinancialOpsSection model={model} fullAccess={fullAccess} /> : null}
      {section === "secretary" ? <SecretaryOpsSection model={model} /> : null}
      {section === "supervision" ? <SupervisionIntelSection model={model} /> : null}
      {section === "trends" ? <TrendAnalysisSection model={model} /> : null}
      {section === "alerts" ? <AlertsEngineSection model={model} /> : null}
    </div>
  );
}
