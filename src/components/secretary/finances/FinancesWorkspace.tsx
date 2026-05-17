"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  LayoutDashboard,
  LineChart,
  PieChart,
  Receipt,
  Scale,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { buildExecutiveFinanceModel } from "@/lib/secretary/finances/executive-model";
import { FINANCE_ALERTS } from "@/lib/secretary/finances/demo-data";
import { canViewFullFinances } from "@/lib/secretary/finances/permissions";
import { FinancesPrototypeBanner } from "./FinancesPrototypeBanner";
import { FinancesRoleBanner } from "./FinancesRoleBanner";
import {
  AlertsSection,
  BudgetSection,
  CashFlowSection,
  ExecutiveDashboardSection,
  ExpensesSection,
  ForecastSection,
  ParentsFinancialSection,
  RevenueAnalysisSection,
  TransactionsSection,
} from "./FinanceSections";

type SectionId =
  | "dashboard"
  | "cashflow"
  | "budget"
  | "revenue"
  | "parents"
  | "expenses"
  | "transactions"
  | "forecast"
  | "alerts";

const SECTIONS: { id: SectionId; label: string; icon: typeof LayoutDashboard; managementPreferred?: boolean }[] = [
  { id: "dashboard", label: "Διοικητικός πίνακας", icon: LayoutDashboard },
  { id: "cashflow", label: "Ταμειακή ροή", icon: TrendingUp, managementPreferred: true },
  { id: "budget", label: "Προϋπολογισμός", icon: Target, managementPreferred: true },
  { id: "revenue", label: "Ανάλυση εσόδων", icon: PieChart },
  { id: "parents", label: "Γονείς", icon: Scale },
  { id: "expenses", label: "Εξοδολόγιο", icon: Building2, managementPreferred: true },
  { id: "transactions", label: "Πληρωμές", icon: Receipt },
  { id: "forecast", label: "Πρόβλεψη", icon: LineChart, managementPreferred: true },
  { id: "alerts", label: "Ειδοποιήσεις", icon: Bell },
];

type Props = { roleCodes: RoleCode[] };

export function FinancesWorkspace({ roleCodes }: Props) {
  const fullAccess = canViewFullFinances(roleCodes);
  const model = useMemo(() => buildExecutiveFinanceModel(), []);
  const [section, setSection] = useState<SectionId>("dashboard");

  const alertCount = FINANCE_ALERTS.filter((a) => a.level !== "info").length;

  return (
    <div className="space-y-4">
      <FinancesPrototypeBanner />
      <FinancesRoleBanner roleCodes={roleCodes} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-indigo-300" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-300">Οικονομικό κέντρο ελέγχου</p>
            <p className="text-lg font-bold">{model.monthLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs">Ταμειακή ροή</p>
            <p className="font-bold tabular-nums">
              {fullAccess
                ? model.kpis.find((k) => k.id === "cashflow")?.formatted ?? "—"
                : model.kpis.find((k) => k.id === "real_revenue")?.formatted ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Είσπραξη</p>
            <p className="font-bold tabular-nums">{model.collectionRatePct}%</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Alerts</p>
            <p className="font-bold text-amber-300">{alertCount}</p>
          </div>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1 shadow-sm"
        aria-label="Ενότητες οικονομικών"
      >
        {SECTIONS.map(({ id, label, icon: Icon, managementPreferred }) => (
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
            {managementPreferred && !fullAccess ? (
              <BarChart3 className="h-3 w-3 text-amber-500" aria-label="Διοίκηση" />
            ) : null}
            {id === "alerts" && alertCount > 0 ? (
              <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{alertCount}</span>
            ) : null}
          </button>
        ))}
      </nav>

      {section === "dashboard" ? <ExecutiveDashboardSection model={model} fullAccess={fullAccess} /> : null}
      {section === "cashflow" ? <CashFlowSection model={model} fullAccess={fullAccess} /> : null}
      {section === "budget" ? <BudgetSection model={model} fullAccess={fullAccess} /> : null}
      {section === "revenue" ? <RevenueAnalysisSection model={model} fullAccess={fullAccess} /> : null}
      {section === "parents" ? <ParentsFinancialSection /> : null}
      {section === "expenses" ? <ExpensesSection fullAccess={fullAccess} /> : null}
      {section === "transactions" ? <TransactionsSection /> : null}
      {section === "forecast" ? <ForecastSection model={model} fullAccess={fullAccess} /> : null}
      {section === "alerts" ? <AlertsSection /> : null}
    </div>
  );
}
