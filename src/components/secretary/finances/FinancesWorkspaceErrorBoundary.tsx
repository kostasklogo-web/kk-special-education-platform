"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { buildExecutiveFinanceModel } from "@/lib/secretary/finances/executive-model";
import type { ExecutiveFinanceModel } from "@/lib/secretary/finances/types";
import { FinancesPrototypeBanner } from "./FinancesPrototypeBanner";
import { FinancesRoleBanner } from "./FinancesRoleBanner";
import { FinancesScheduleFallbackBanner } from "./FinancesScheduleFallbackBanner";
import { ExecutiveDashboardSection } from "./FinanceSections";
import type { RoleCode } from "@/lib/auth/roles";
import { canViewFullFinances } from "@/lib/secretary/finances/permissions";

type Props = { roleCodes: RoleCode[]; children: ReactNode };

type State = { hasError: boolean; model: ExecutiveFinanceModel | null };

export class FinancesWorkspaceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, model: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[finances] UI error boundary:", error, info.componentStack);
    try {
      this.setState({ model: buildExecutiveFinanceModel() });
    } catch {
      /* buildExecutiveFinanceModel must not throw */
    }
  }

  render() {
    if (this.state.hasError && this.state.model) {
      const fullAccess = canViewFullFinances(this.props.roleCodes);
      return (
        <div className="space-y-4">
          <FinancesPrototypeBanner />
          <FinancesRoleBanner roleCodes={this.props.roleCodes} />
          <FinancesScheduleFallbackBanner visible />
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              Προέκυψε σφάλμα εμφάνισης. Εμφανίζεται ασφαλής προβολή με ενδεικτικά δεδομένα· δοκιμάστε
              ανανέωση σελίδας αν το πρόβλημα επαναληφθεί.
            </p>
          </div>
          <ExecutiveDashboardSection model={this.state.model} fullAccess={fullAccess} />
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-900">
          <p className="font-semibold">Δεν ήταν δυνατή η φόρτωση των οικονομικών.</p>
          <p className="mt-2 text-red-800">Ανανεώστε τη σελίδα ή επικοινωνήστε με την υποστήριξη.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
