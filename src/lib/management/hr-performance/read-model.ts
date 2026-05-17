/**
 * HR Performance read model — role-filtered static demo.
 */

import {
  HR_AUDIT_LOG,
  HR_DEMO_USER_THERAPIST_MAP,
  HR_INCENTIVE_PROPOSALS,
  HR_MANAGEMENT_ADJUSTMENTS,
  HR_RELIABILITY_SUMMARY,
  HR_SUPERVISOR_EVALUATIONS,
  buildDemoTherapistProfiles,
  getRawTherapistBurnoutInputs,
} from "./demo-data";
import {
  canViewFinancialIncentives,
  canViewFullHrPerformance,
  canViewSupervisorHrPerformance,
  resolveViewerTherapistId,
} from "./permissions";
import { detectBurnoutRisks } from "./risk-rules";
import { buildOrgScoreDimensions, computeWeightedOverall, SCORING_PHILOSOPHY_EL } from "./scoring";
import type { HrPerformanceModel } from "./types";
import type { RoleCode } from "@/lib/auth/roles";

export function buildHrPerformanceModel(
  roleCodes: RoleCode[],
  userId: string | null
): HrPerformanceModel {
  const allTherapists = buildDemoTherapistProfiles();
  const scoreDimensions = buildOrgScoreDimensions();
  const orgScore = computeWeightedOverall(scoreDimensions);
  const burnoutRisks = detectBurnoutRisks(getRawTherapistBurnoutInputs());

  const viewerTherapistId = resolveViewerTherapistId(roleCodes, userId, HR_DEMO_USER_THERAPIST_MAP);
  const isManagement = canViewFullHrPerformance(roleCodes);
  const isSupervisor = canViewSupervisorHrPerformance(roleCodes) && !isManagement;
  const isTherapistSelf = viewerTherapistId !== null && !isManagement && !isSupervisor;

  let therapists = allTherapists;
  if (isTherapistSelf && viewerTherapistId) {
    therapists = allTherapists.filter((t) => t.id === viewerTherapistId);
  }

  let incentiveProposals = HR_INCENTIVE_PROPOSALS;
  if (isTherapistSelf && viewerTherapistId) {
    incentiveProposals = HR_INCENTIVE_PROPOSALS.filter((p) => p.therapistId === viewerTherapistId).map((p) => ({
      ...p,
      amountEur: null,
    }));
  }

  const viewerMode = isManagement ? "management" : isSupervisor ? "supervisor" : "therapist_self";

  return {
    periodLabel: "Μάιος 2026",
    centerLabel: "Νίκαια & Εύοσμος",
    philosophyNote: SCORING_PHILOSOPHY_EL,
    viewerMode,
    viewerTherapistId,
    therapists,
    scoreDimensions,
    organizationOverallScore: orgScore,
    incentiveProposals,
    managementAdjustments: isManagement ? HR_MANAGEMENT_ADJUSTMENTS : [],
    supervisorEvaluations: isManagement || isSupervisor ? HR_SUPERVISOR_EVALUATIONS : [],
    burnoutRisks: isManagement || isSupervisor ? burnoutRisks : burnoutRisks.filter((b) => b.therapistId === viewerTherapistId),
    auditLog: isManagement ? HR_AUDIT_LOG : [],
    reliabilitySummary: HR_RELIABILITY_SUMMARY,
    showFinancialAmounts: canViewFinancialIncentives(roleCodes),
    showAllTherapists: isManagement || isSupervisor,
  };
}
