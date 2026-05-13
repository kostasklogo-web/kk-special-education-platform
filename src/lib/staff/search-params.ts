import type { StaffFilters } from "@/lib/data/staff/types";

export type StaffPageSearch = {
  filters: StaffFilters;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export function parseStaffSearchParams(
  raw: Record<string, string | string[] | undefined>
): StaffPageSearch {
  const filters: StaffFilters = {
    centerId: firstString(raw.center) || null,
    roleCode: firstString(raw.role) || null,
    disciplineCode: firstString(raw.discipline) || null,
    employmentStatus: firstString(raw.status) || null,
  };
  return { filters };
}

export function buildStaffHref(filters?: StaffFilters): string {
  const p = new URLSearchParams();
  const f = filters;
  if (f?.centerId) p.set("center", f.centerId);
  if (f?.roleCode) p.set("role", f.roleCode);
  if (f?.disciplineCode) p.set("discipline", f.disciplineCode);
  if (f?.employmentStatus) p.set("status", f.employmentStatus);
  const qs = p.toString();
  return qs ? `/staff?${qs}` : "/staff";
}
