import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ProgressReportFilters, ProgressReportListItem } from "@/lib/data/progress-reports/types";

function mapChildName(row: { first_name?: string; last_name?: string } | null): string {
  if (!row) return "—";
  const fn = row.first_name ?? "";
  const ln = row.last_name ?? "";
  const t = `${ln} ${fn}`.trim();
  return t || "—";
}

export async function listProgressReportsForOrganization(params: {
  organizationId: string;
  filters?: ProgressReportFilters;
}): Promise<{ items: ProgressReportListItem[]; error: string | null }> {
  const supabase = await createClient();
  let q = supabase
    .from("progress_reports")
    .select(
      "id, organization_id, child_id, title, status, period_start, period_end, summary, updated_at, children(first_name, last_name)"
    )
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const f = params.filters;
  if (f?.childId) {
    q = q.eq("child_id", f.childId);
  }
  if (f?.status === "open") {
    q = q.in("status", ["draft", "pending", "pending_review"]);
  } else if (f?.status) {
    q = q.eq("status", f.status);
  }

  const { data, error } = await q;

  if (error) {
    console.error("listProgressReportsForOrganization", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης αναφορών προόδου." };
  }

  const items: ProgressReportListItem[] = (data ?? []).map((raw) => {
    const r = raw as {
      id: string;
      organization_id: string;
      child_id: string;
      title: string;
      status: string;
      period_start: string | null;
      period_end: string | null;
      summary: string | null;
      updated_at: string;
      children: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
    };
    const ch = Array.isArray(r.children) ? r.children[0] : r.children;
    return {
      id: r.id,
      organization_id: r.organization_id,
      child_id: r.child_id,
      child_name: mapChildName(ch),
      title: r.title,
      status: r.status,
      period_start: r.period_start,
      period_end: r.period_end,
      summary: r.summary,
      updated_at: r.updated_at,
    };
  });

  return { items, error: null };
}

export async function getProgressReportById(
  id: string
): Promise<{ item: ProgressReportListItem | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("progress_reports")
    .select(
      "id, organization_id, child_id, title, status, period_start, period_end, summary, updated_at, children(first_name, last_name)"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getProgressReportById", error.message);
    return { item: null, error: "Αποτυχία φόρτωσης αναφοράς." };
  }
  if (!data) return { item: null, error: null };

  const r = data as Record<string, unknown>;
  const rawCh = r.children as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  const ch = Array.isArray(rawCh) ? rawCh[0] : rawCh;

  return {
    item: {
      id: r.id as string,
      organization_id: r.organization_id as string,
      child_id: r.child_id as string,
      child_name: mapChildName(ch ?? null),
      title: r.title as string,
      status: r.status as string,
      period_start: (r.period_start as string | null) ?? null,
      period_end: (r.period_end as string | null) ?? null,
      summary: (r.summary as string | null) ?? null,
      updated_at: r.updated_at as string,
    },
    error: null,
  };
}
