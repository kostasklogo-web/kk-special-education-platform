"use client";

import { useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  Shield,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { HrSectionId } from "@/lib/management/hr-performance/types";
import { buildHrPerformanceModel } from "@/lib/management/hr-performance/read-model";
import { canViewFullHrPerformance } from "@/lib/management/hr-performance/permissions";
import { HrPerfPrototypeBanner } from "./HrPerfPrototypeBanner";
import { HrPerfRoleBanner } from "./HrPerfRoleBanner";
import {
  ClinicalSection,
  IncentivesSection,
  ManagementSection,
  OverviewSection,
  ReliabilitySection,
  RisksSection,
  ScoringSection,
  SupervisorSection,
  TeamSection,
  TherapistPicker,
  TherapistSelfSection,
} from "./HrPerfSections";

const SECTIONS: {
  id: HrSectionId;
  label: string;
  icon: typeof BarChart3;
  managementOnly?: boolean;
  supervisorOnly?: boolean;
  therapistOnly?: boolean;
}[] = [
  { id: "overview", label: "Επισκόπηση", icon: Stethoscope },
  { id: "reliability", label: "Αξιοπιστία", icon: ClipboardCheck },
  { id: "clinical", label: "Κλινική συνεισφορά", icon: FileText },
  { id: "team", label: "Ομάδα", icon: Users },
  { id: "scoring", label: "Βαθμολόγηση", icon: BarChart3 },
  { id: "incentives", label: "Κίνητρα", icon: Award },
  { id: "management", label: "Έλεγχοι Διοίκησης", icon: Shield, managementOnly: true },
  { id: "supervisor", label: "Αξιολόγηση επόπτη", icon: HeartHandshake, supervisorOnly: true },
  { id: "therapist_self", label: "Η απόδοσή μου", icon: User, therapistOnly: true },
  { id: "risks", label: "Κίνδυνοι", icon: AlertTriangle },
];

type Props = { roleCodes: RoleCode[]; userId: string | null };

export function HrPerfWorkspace({ roleCodes, userId }: Props) {
  const model = useMemo(() => buildHrPerformanceModel(roleCodes, userId), [roleCodes, userId]);
  const fullAccess = canViewFullHrPerformance(roleCodes);
  const [section, setSection] = useState<HrSectionId>(
    model.viewerMode === "therapist_self" ? "therapist_self" : "overview"
  );
  const [selectedTherapistId, setSelectedTherapistId] = useState(model.therapists[0]?.id ?? "t1");

  const visibleSections = SECTIONS.filter((s) => {
    if (s.managementOnly && !fullAccess) return false;
    if (s.supervisorOnly && model.viewerMode === "therapist_self") return false;
    if (s.therapistOnly && model.viewerMode !== "therapist_self") return false;
    if (model.viewerMode === "therapist_self" && s.id === "overview" && section === "therapist_self") return true;
    return true;
  });

  const therapist =
    model.therapists.find((t) => t.id === selectedTherapistId) ?? model.therapists[0]!;
  const criticalRisks = model.burnoutRisks.filter((b) => b.level === "critical" || b.level === "high").length;

  return (
    <div className="space-y-4">
      <HrPerfPrototypeBanner />
      <HrPerfRoleBanner roleCodes={roleCodes} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-gradient-to-r from-violet-900 to-indigo-900 px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-violet-300" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-violet-200">HR Απόδοση</p>
            <p className="text-lg font-bold">
              {model.periodLabel} · {model.centerLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-violet-200 text-xs">Σκορ οργανισμού</p>
            <p className="font-bold tabular-nums">{model.organizationOverallScore}/100</p>
          </div>
          {model.showAllTherapists ? (
            <div>
              <p className="text-violet-200 text-xs">Ενεργοί κίνδυνοι</p>
              <p className="font-bold tabular-nums">{criticalRisks}</p>
            </div>
          ) : null}
          {therapist ? (
            <div>
              <p className="text-violet-200 text-xs">Το σκορ μου</p>
              <p className="font-bold tabular-nums">{therapist.overallScore}/100</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1 shadow-sm">
        {visibleSections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              section === id ? "bg-violet-600 text-white" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      {model.showAllTherapists && section !== "therapist_self" ? (
        <TherapistPicker
          therapists={model.therapists}
          selectedId={selectedTherapistId}
          onSelect={setSelectedTherapistId}
        />
      ) : null}

      {section === "overview" && therapist ? <OverviewSection model={model} therapist={therapist} /> : null}
      {section === "reliability" ? <ReliabilitySection model={model} /> : null}
      {section === "clinical" ? <ClinicalSection /> : null}
      {section === "team" ? <TeamSection /> : null}
      {section === "scoring" ? <ScoringSection model={model} /> : null}
      {section === "incentives" ? <IncentivesSection model={model} /> : null}
      {section === "management" && fullAccess ? <ManagementSection model={model} /> : null}
      {section === "supervisor" && model.supervisorEvaluations.length > 0 ? (
        <SupervisorSection model={model} />
      ) : null}
      {section === "therapist_self" && therapist ? <TherapistSelfSection therapist={therapist} /> : null}
      {section === "risks" ? <RisksSection model={model} /> : null}
    </div>
  );
}
