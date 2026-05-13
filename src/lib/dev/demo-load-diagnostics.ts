import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  getAuthGatingTemporarilyDisabled,
  getDemoOrganizationId,
} from "@/lib/config/demo";
import { getDashboardOverview } from "@/lib/data/dashboard/queries";
import { listChildren } from "@/lib/data/children/queries";
import { listSessionsInRange } from "@/lib/data/sessions/queries";
import {
  athensEndOfDayUtcIso,
  athensStartOfDayUtcIso,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";
import type { PostgrestError } from "@supabase/supabase-js";

export type DemoQueryDiagnostic = {
  area: string;
  /** PostgREST / Postgres message (safe; not secrets). */
  technical: string;
};

function formatPostgrestError(error: PostgrestError | null): string {
  if (!error) return "";
  const parts = [error.code, error.message, error.details, error.hint].filter(
    (x): x is string => Boolean(x && String(x).trim())
  );
  return parts.join(" | ");
}

export type DemoLoadDiagnostics = {
  supabaseUrlConfigured: boolean;
  supabaseAnonKeyConfigured: boolean;
  authGatingDisabled: boolean;
  demoOrganizationId: string;
  organizationRowPresent: boolean | null;
  organizationLookupError: string | null;
  /** High-level messages already shown in UI (e.g. Greek). */
  dashboardOverviewMessages: string[];
  /** Raw PostgREST errors from targeted probes. */
  postgrestErrors: DemoQueryDiagnostic[];
};

export async function collectDemoLoadDiagnostics(): Promise<DemoLoadDiagnostics> {
  const { url, anonKey } = getSupabasePublicEnv();
  const orgId = getDemoOrganizationId();
  const postgrestErrors: DemoQueryDiagnostic[] = [];
  const dashboardOverviewMessages: string[] = [];

  let organizationRowPresent: boolean | null = null;
  let organizationLookupError: string | null = null;

  try {
    const supabase = await createClient();

    const orgRes = await supabase.from("organizations").select("id").eq("id", orgId).maybeSingle();
    if (orgRes.error) {
      organizationLookupError = formatPostgrestError(orgRes.error);
      organizationRowPresent = null;
      postgrestErrors.push({
        area: "organizations (demo id lookup)",
        technical: organizationLookupError,
      });
    } else {
      organizationRowPresent = Boolean(orgRes.data);
      if (!organizationRowPresent) {
        postgrestErrors.push({
          area: "organizations (demo id lookup)",
          technical: `No row returned for id=${orgId} (seed may be missing).`,
        });
      }
    }

    const pushIfError = (area: string, error: PostgrestError | null) => {
      if (error) {
        postgrestErrors.push({ area, technical: formatPostgrestError(error) });
      }
    };

    const chProbe = await supabase.from("children").select("id").limit(1);
    pushIfError("children (raw probe)", chProbe.error);

    const ymd = todayAthensYmd();
    const fromIso = athensStartOfDayUtcIso(ymd);
    const toIso = athensEndOfDayUtcIso(ymd);
    const sessProbe = await supabase
      .from("sessions")
      .select("id")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .gte("starts_at", fromIso)
      .lte("starts_at", toIso)
      .limit(1);
    pushIfError("sessions (raw probe, today Athens)", sessProbe.error);

    const urProbe = await supabase.from("user_roles").select("id").limit(1);
    pushIfError("user_roles (raw probe; optional for demo org resolution)", urProbe.error);

    const overview = await getDashboardOverview(orgId);
    dashboardOverviewMessages.push(...overview.errors);

    const { error: childrenListError } = await listChildren({});
    if (childrenListError) {
      dashboardOverviewMessages.push(`children list (app): ${childrenListError}`);
      const sameListProbe = await supabase
        .from("children")
        .select(
          "id, organization_id, primary_center_id, first_name, last_name, date_of_birth, gender, preferred_language, status, school_name, school_grade, enrollment_start_date, notes, created_at, updated_at, deleted_at"
        )
        .is("deleted_at", null)
        .order("last_name", { ascending: true })
        .limit(1);
      if (sameListProbe.error) {
        postgrestErrors.push({
          area: "children (same select as listChildren)",
          technical: formatPostgrestError(sameListProbe.error),
        });
      }
    }

    const { error: sessionsListError } = await listSessionsInRange({
      organizationId: orgId,
      fromIso,
      toIso,
    });
    if (sessionsListError) {
      dashboardOverviewMessages.push(`sessions list (app, today): ${sessionsListError}`);
      const sessSame = await supabase
        .from("sessions")
        .select(
          "id, organization_id, center_id, room_id, child_id, therapist_user_id, discipline_code, starts_at, ends_at, status, session_kind, internal_notes, created_at, updated_at, deleted_at"
        )
        .eq("organization_id", orgId)
        .is("deleted_at", null)
        .gte("starts_at", fromIso)
        .lte("starts_at", toIso)
        .order("starts_at", { ascending: true })
        .limit(1);
      if (sessSame.error) {
        postgrestErrors.push({
          area: "sessions (same select as listSessionsInRange)",
          technical: formatPostgrestError(sessSame.error),
        });
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    postgrestErrors.push({
      area: "collectDemoLoadDiagnostics",
      technical: msg,
    });
  }

  return {
    supabaseUrlConfigured: Boolean(url),
    supabaseAnonKeyConfigured: Boolean(anonKey),
    authGatingDisabled: getAuthGatingTemporarilyDisabled(),
    demoOrganizationId: orgId,
    organizationRowPresent,
    organizationLookupError,
    dashboardOverviewMessages,
    postgrestErrors,
  };
}
