"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  CalendarRange,
  FileText,
  GitBranch,
  LayoutDashboard,
  LineChart,
  Stethoscope,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { AnalyticsFiltersState, AnalyticsSectionId } from "@/lib/management/analytics/types";
import {
  buildManagementAnalyticsModel,
  defaultAnalyticsFilters,
} from "@/lib/management/analytics/read-model";
import { canViewFullManagementAnalytics } from "@/lib/management/analytics/permissions";
import { AnalyticsPrototypeBanner } from "./AnalyticsPrototypeBanner";
import { AnalyticsRoleBanner } from "./AnalyticsRoleBanner";
import {
  CaseFlowSection,
  DailyReportSection,
  FinancialAnalyticsSection,
  MonthlyReportSection,
  OverviewSection,
  TherapistAnalyticsSection,
  TimeFiltersBar,
  WeeklyReportSection,
  YearlyReportSection,
} from "./AnalyticsSections";

const SECTIONS: { id: AnalyticsSectionId; label: string; icon: typeof LayoutDashboard; managementOnly?: boolean }[] =
  [
    { id: "overview", label: "Επισκόπηση", icon: LayoutDashboard },
    { id: "financial", label: "Οικονομικά", icon: Wallet, managementOnly: true },
    { id: "therapists", label: "KPI θεραπευτών", icon: Stethoscope },
    { id: "caseflow", label: "Ροή περιστατικών", icon: GitBranch },
    { id: "daily", label: "Ημερήσια", icon: Calendar },
    { id: "weekly", label: "Εβδομαδιαία", icon: TrendingUp },
    { id: "monthly", label: "Μηνιαία", icon: BarChart3 },
    { id: "yearly", label: "Ετήσια", icon: LineChart, managementOnly: true },
  ];

type Props = { roleCodes: RoleCode[] };

export function AnalyticsWorkspace({ roleCodes }: Props) {
  const fullAccess = canViewFullManagementAnalytics(roleCodes);
  const [filters, setFilters] = useState<AnalyticsFiltersState>(defaultAnalyticsFilters);
  const [section, setSection] = useState<AnalyticsSectionId>("overview");

  const model = useMemo(
    () => buildManagementAnalyticsModel(filters, fullAccess),
    [filters, fullAccess]
  );

  const sectionProps = {
    model,
    fullAccess,
    filters,
    onFiltersChange: setFilters,
    periodLabel: model.periodLabel,
    comparePeriodLabel: model.comparePeriodLabel,
  };

  return (
    <div className="space-y-4">
      <AnalyticsPrototypeBanner />
      <AnalyticsRoleBanner roleCodes={roleCodes} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-gradient-to-r from-violet-900 to-indigo-900 px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <CalendarRange className="h-8 w-8 text-violet-300" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-violet-200">Αναλυτικά στοιχεία</p>
            <p className="text-lg font-bold">{model.periodLabel}</p>
          </div>
        </div>
        <p className="text-sm text-violet-200">
          Σύγκριση: <span className="font-semibold text-white">{model.comparePeriodLabel}</span>
        </p>
      </div>

      <TimeFiltersBar {...sectionProps} />

      <nav
        className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1 shadow-sm"
        aria-label="Ενότητες αναλυτικών"
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
              <FileText className="h-3 w-3 text-amber-500" aria-label="Διοίκηση" />
            ) : null}
          </button>
        ))}
      </nav>

      {section === "overview" ? <OverviewSection model={model} fullAccess={fullAccess} /> : null}
      {section === "financial" ? <FinancialAnalyticsSection model={model} fullAccess={fullAccess} /> : null}
      {section === "therapists" ? <TherapistAnalyticsSection {...sectionProps} /> : null}
      {section === "caseflow" ? <CaseFlowSection model={model} /> : null}
      {section === "daily" ? <DailyReportSection model={model} fullAccess={fullAccess} /> : null}
      {section === "weekly" ? <WeeklyReportSection model={model} fullAccess={fullAccess} /> : null}
      {section === "monthly" ? <MonthlyReportSection model={model} fullAccess={fullAccess} /> : null}
      {section === "yearly" ? <YearlyReportSection model={model} fullAccess={fullAccess} /> : null}
    </div>
  );
}
