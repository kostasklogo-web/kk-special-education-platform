"use client";

import { useMemo, useState } from "react";
import type { ClinicalChildProfileBundle, ClinicalProfileTab } from "@/lib/clinical/child-profile/types";
import {
  canViewClinicalDirectorComments,
  canViewInterdisciplinarySection,
  canViewSessionNoteClinicalBody,
  canViewSupervisionSection,
} from "@/lib/clinical/child-profile/permissions";
import type { RoleCode } from "@/lib/auth/roles";
import type { ParentSummary } from "@/lib/data/parents/types";
import { ChildParentsPanel } from "@/components/children/child-parents-panel";
import { ProfileSectionCard } from "@/components/children/profile-section-card";
import { ClinicalProfileHeader } from "./ClinicalProfileHeader";
import { ClinicalWorkflowRail } from "./ClinicalWorkflowRail";
import { ClinicalAlertsStrip } from "./ClinicalAlertsStrip";
import { ClinicalSectionNav } from "./ClinicalSectionNav";
import { ClinicalOverviewSection } from "./sections/ClinicalOverviewSection";
import { ClinicalTimelineSection } from "./sections/ClinicalTimelineSection";
import { ClinicalGoalsSection } from "./sections/ClinicalGoalsSection";
import { ClinicalSessionNotesSection } from "./sections/ClinicalSessionNotesSection";
import { ClinicalReportsSection } from "./sections/ClinicalReportsSection";
import { ClinicalEvaluationsSection } from "./sections/ClinicalEvaluationsSection";
import { ClinicalInterdisciplinarySection } from "./sections/ClinicalInterdisciplinarySection";
import { ClinicalSupervisionSection } from "./sections/ClinicalSupervisionSection";
import { ClinicalAlertsSection } from "./sections/ClinicalAlertsSection";
import { ClinicalPrototypeBanner } from "./ClinicalPrototypeBanner";
import { ClinicalOverviewStrip } from "./ClinicalOverviewStrip";

type Props = {
  bundle: ClinicalChildProfileBundle;
  roleCodes: RoleCode[];
  canMutate: boolean;
  canScheduleSessions: boolean;
  canWriteGoals: boolean;
  eligibleParents: ParentSummary[];
  loadWarnings?: string[];
  isPrototype?: boolean;
  dataSource?: "database" | "demo" | "demo-fallback";
};

export function ClinicalChildProfileShell({
  bundle,
  roleCodes,
  canMutate,
  canScheduleSessions,
  canWriteGoals,
  eligibleParents,
  loadWarnings = [],
  isPrototype = false,
}: Props) {
  const [tab, setTab] = useState<ClinicalProfileTab>("overview");

  const canViewNoteBodies = canViewSessionNoteClinicalBody(roleCodes);
  const showSupervision = canViewSupervisionSection(roleCodes);
  const showInterdisciplinary = canViewInterdisciplinarySection(roleCodes);
  const showDirectorComments = canViewClinicalDirectorComments(roleCodes);

  const visibleTabs = useMemo((): ClinicalProfileTab[] => {
    const tabs: ClinicalProfileTab[] = [
      "overview",
      "alerts",
      "timeline",
      "goals",
      "notes",
      "reports",
      "evaluations",
    ];
    if (showInterdisciplinary) tabs.push("interdisciplinary");
    if (showSupervision) tabs.push("supervision");
    return tabs;
  }, [showInterdisciplinary, showSupervision]);

  const alertCount = bundle.alerts.length;
  const { child, parentLinks, counts } = bundle;
  const prototypeNotice = loadWarnings[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-clinical-50/40 via-surface-page to-surface-page">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {isPrototype && prototypeNotice ? (
          <ClinicalPrototypeBanner message={prototypeNotice} />
        ) : null}

        {loadWarnings.length > 1 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {loadWarnings.slice(1).map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        ) : null}

        <ClinicalProfileHeader
          child={child}
          parentLinks={parentLinks}
          canMutate={canMutate}
          canScheduleSessions={canScheduleSessions}
          canWriteGoals={canWriteGoals}
          showSecretaryLink={false}
        />

        <ClinicalOverviewStrip bundle={bundle} />

        <ClinicalWorkflowRail
          childId={child.id}
          counts={{
            goals: counts.activeGoals + counts.completedGoals,
            sessionNotes: counts.sessionNotes,
            reports: counts.reports,
          }}
          onNavigate={setTab}
        />

        {alertCount > 0 && tab !== "alerts" ? (
          <ClinicalAlertsStrip alerts={bundle.alerts.slice(0, 3)} />
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-clinical-100 bg-white shadow-shell">
          <div className="border-b border-clinical-100/80 bg-clinical-50/30 px-4 pt-3 sm:px-6">
            <p className="pb-2 text-[10px] font-bold uppercase tracking-widest text-clinical-800">
              Κλινικές ενότητες
            </p>
            <ClinicalSectionNav
              active={tab}
              onChange={setTab}
              visibleTabs={visibleTabs}
              alertCount={alertCount}
            />
          </div>
          <div className="min-h-[420px] p-4 sm:p-6">
            {tab === "overview" && (
              <ClinicalOverviewSection bundle={bundle} canViewNoteBodies={canViewNoteBodies} />
            )}
            {tab === "alerts" && <ClinicalAlertsSection alerts={bundle.alerts} />}
            {tab === "timeline" && <ClinicalTimelineSection events={bundle.timeline} />}
            {tab === "goals" && (
              <ClinicalGoalsSection
                childId={child.id}
                goals={bundle.goals}
                goalProgress={bundle.goalProgress}
                canWrite={canWriteGoals}
              />
            )}
            {tab === "notes" && (
              <ClinicalSessionNotesSection
                childId={child.id}
                notes={bundle.sessionNotes}
                goals={bundle.goals}
                canViewBodies={canViewNoteBodies}
              />
            )}
            {tab === "reports" && (
              <ClinicalReportsSection childId={child.id} reports={bundle.progressReports} />
            )}
            {tab === "evaluations" && (
              <ClinicalEvaluationsSection
                childId={child.id}
                sessions={bundle.sessions}
                evaluationSummary={bundle.evaluationSummary}
                alerts={bundle.alerts}
              />
            )}
            {tab === "interdisciplinary" && showInterdisciplinary && (
              <ClinicalInterdisciplinarySection collaboration={bundle.collaboration} />
            )}
            {tab === "supervision" && showSupervision && (
              <ClinicalSupervisionSection
                supervision={bundle.supervision}
                canViewDirectorComments={showDirectorComments}
              />
            )}
          </div>
        </div>

        {!isPrototype ? (
          <ProfileSectionCard
            title="Γονείς / κηδεμόνες (κλινική προβολή)"
            description="Σύνδεση γονέων για κλινική επικοινωνία."
          >
            <ChildParentsPanel
              childId={child.id}
              links={parentLinks}
              eligibleParents={eligibleParents}
              canMutate={canMutate}
            />
          </ProfileSectionCard>
        ) : (
          <ProfileSectionCard title="Γονείς / κηδεμόνες" description="Προβολή μόνο (πρωτότυπο).">
            <ul className="text-sm">
              {parentLinks.map((l) => (
                <li key={l.relationship_id}>
                  {l.parent.first_name} {l.parent.last_name}
                  {l.is_primary ? " (κύριος)" : ""}
                </li>
              ))}
            </ul>
          </ProfileSectionCard>
        )}
      </div>
    </div>
  );
}
