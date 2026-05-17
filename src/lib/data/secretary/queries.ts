import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getDemoOrganizationId } from "@/lib/config/demo";
import { SECRETARY_DEMO_CONSENTS } from "@/lib/demo/secretary-reminders-demo";
import {
  buildSecretaryDemoDashboard,
  SECRETARY_DEMO_APPOINTMENTS,
  SECRETARY_DEMO_COMMUNICATIONS,
  SECRETARY_DEMO_DIAGNOSES,
  SECRETARY_DEMO_INTAKES,
  SECRETARY_DEMO_MEETINGS,
  SECRETARY_DEMO_PAYMENTS,
  SECRETARY_DEMO_PROGRAMS,
  SECRETARY_DEMO_REPORTS,
  SECRETARY_DEMO_TASKS,
} from "@/lib/demo/secretary-demo-data";
import type { SecretaryDashboardData } from "@/lib/secretary/types";

export async function getSecretaryDashboard(
  organizationId: string
): Promise<{ data: SecretaryDashboardData; source: "demo" | "db" }> {
  const demo = buildSecretaryDemoDashboard();
  try {
    const supabase = await createClient();
    const { count: intakeCount } = await supabase
      .from("client_intakes")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .is("deleted_at", null);

    if (intakeCount !== null && intakeCount > 0) {
      return { data: demo, source: "db" };
    }
  } catch {
    /* fall through */
  }
  return { data: demo, source: "demo" };
}

export async function listSecretaryDemoOrDb<T>(
  organizationId: string,
  table: string,
  fallback: T[]
): Promise<T[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .limit(200);
    if (!error && data && data.length > 0) return data as T[];
  } catch {
    /* demo */
  }
  return fallback;
}

export function getSecretaryDemoBundle(organizationId: string) {
  if (organizationId !== getDemoOrganizationId()) {
    return {
      appointments: SECRETARY_DEMO_APPOINTMENTS,
      payments: SECRETARY_DEMO_PAYMENTS,
      tasks: SECRETARY_DEMO_TASKS,
      diagnoses: SECRETARY_DEMO_DIAGNOSES,
      communications: SECRETARY_DEMO_COMMUNICATIONS,
      reports: SECRETARY_DEMO_REPORTS,
      meetings: SECRETARY_DEMO_MEETINGS,
      intakes: SECRETARY_DEMO_INTAKES,
      programs: SECRETARY_DEMO_PROGRAMS,
      consents: SECRETARY_DEMO_CONSENTS,
    };
  }
  return {
    appointments: SECRETARY_DEMO_APPOINTMENTS,
    payments: SECRETARY_DEMO_PAYMENTS,
    tasks: SECRETARY_DEMO_TASKS,
    diagnoses: SECRETARY_DEMO_DIAGNOSES,
    communications: SECRETARY_DEMO_COMMUNICATIONS,
    reports: SECRETARY_DEMO_REPORTS,
    meetings: SECRETARY_DEMO_MEETINGS,
    intakes: SECRETARY_DEMO_INTAKES,
    programs: SECRETARY_DEMO_PROGRAMS,
    consents: SECRETARY_DEMO_CONSENTS,
  };
}
