import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { LinkedChildSummary, ParentListItem, ParentRow, ParentSummary } from "@/lib/data/parents/types";

export async function listParents(params: { search?: string | null } = {}): Promise<{
  items: ParentListItem[];
  error: string | null;
}> {
  const supabase = await createClient();
  let q = supabase
    .from("parents")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, phone, address_line, notes, created_at, updated_at, deleted_at"
    )
    .is("deleted_at", null)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  const term = params.search?.trim().replace(/,/g, " ");
  if (term) {
    const escaped = term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    const pattern = `%${escaped}%`;
    q = q.or(
      `first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`
    );
  }

  const { data, error } = await q;

  if (error) {
    console.error("listParents", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης λίστας γονέων." };
  }

  const rows = (data ?? []) as ParentRow[];
  if (rows.length === 0) {
    return { items: [], error: null };
  }

  const parentIds = rows.map((r) => r.id);
  const { data: linkRows, error: linkErr } = await supabase
    .from("child_parent_relationships")
    .select("parent_id")
    .in("parent_id", parentIds)
    .is("deleted_at", null);

  if (linkErr) {
    console.error("listParents links", linkErr.message);
  }

  const countMap = new Map<string, number>();
  for (const row of linkRows ?? []) {
    const pid = (row as { parent_id: string }).parent_id;
    countMap.set(pid, (countMap.get(pid) ?? 0) + 1);
  }

  const items: ParentListItem[] = rows.map((r) => ({
    ...r,
    linked_children_count: countMap.get(r.id) ?? 0,
  }));

  return { items, error: null };
}

export async function getParentById(id: string): Promise<{
  parent: ParentRow | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parents")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, phone, address_line, notes, created_at, updated_at, deleted_at"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getParentById", error.message);
    return { parent: null, error: "Αποτυχία φόρτωσης γονέα." };
  }

  return { parent: (data as ParentRow) ?? null, error: null };
}

export async function listLinkedChildrenForParent(parentId: string): Promise<{
  links: LinkedChildSummary[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("child_parent_relationships")
    .select(
      "id, relationship, is_primary, children ( id, first_name, last_name )"
    )
    .eq("parent_id", parentId)
    .is("deleted_at", null);

  if (error) {
    console.error("listLinkedChildrenForParent", error.message);
    return { links: [], error: "Αποτυχία φόρτωσης συνδεδεμένων παιδιών." };
  }

  const links: LinkedChildSummary[] = (data ?? []).map((row: Record<string, unknown>) => {
    const raw = row.children as LinkedChildSummary["child"] | LinkedChildSummary["child"][] | null;
    const child = Array.isArray(raw) ? raw[0] ?? null : raw;
    return {
      link_id: row.id as string,
      relationship: (row.relationship as string) ?? "guardian",
      is_primary: Boolean(row.is_primary),
      child: child ?? { id: "", first_name: "", last_name: "" },
    };
  });

  return { links, error: null };
}

export async function listEligibleParentsForChild(
  childId: string,
  organizationId: string
): Promise<{ parents: ParentSummary[]; error: string | null }> {
  const supabase = await createClient();

  const { data: linked, error: e1 } = await supabase
    .from("child_parent_relationships")
    .select("parent_id")
    .eq("child_id", childId)
    .is("deleted_at", null);

  if (e1) {
    console.error("listEligibleParentsForChild", e1.message);
    return { parents: [], error: "Αποτυχία φόρτωσης συσχετίσεων." };
  }

  const linkedIds = new Set((linked ?? []).map((r: { parent_id: string }) => r.parent_id));

  const { data, error } = await supabase
    .from("parents")
    .select("id, first_name, last_name, email")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("listEligibleParentsForChild parents", error.message);
    return { parents: [], error: "Αποτυχία φόρτωσης διαθέσιμων γονέων." };
  }

  const parents = ((data as ParentSummary[]) ?? []).filter((p) => !linkedIds.has(p.id));

  return { parents, error: null };
}

export async function listChildrenEligibleForParent(
  parentId: string,
  organizationId: string
): Promise<{
  children: { id: string; first_name: string; last_name: string }[];
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: linked, error: e1 } = await supabase
    .from("child_parent_relationships")
    .select("child_id")
    .eq("parent_id", parentId)
    .is("deleted_at", null);

  if (e1) {
    console.error("listChildrenEligibleForParent", e1.message);
    return { children: [], error: "Αποτυχία φόρτωσης συσχετίσεων." };
  }

  const linkedIds = new Set((linked ?? []).map((r: { child_id: string }) => r.child_id));

  const { data: rows, error } = await supabase
    .from("children")
    .select("id, first_name, last_name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("listChildrenEligibleForParent children", error.message);
    return { children: [], error: "Αποτυχία φόρτωσης παιδιών." };
  }

  const children = ((rows ?? []) as { id: string; first_name: string; last_name: string }[]).filter(
    (c) => !linkedIds.has(c.id)
  );

  return { children, error: null };
}
