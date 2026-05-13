import type { CenterSummary } from "@/lib/data/children/types";
import type { DisciplineOption } from "@/lib/data/sessions/queries";
import type { StaffPageSearch } from "@/lib/staff/search-params";
import { buildStaffHref } from "@/lib/staff/search-params";
import { EMPLOYMENT_STATUS_LABELS_EL } from "@/lib/ui/staff-labels";
import type { EmploymentStatus } from "@/lib/data/staff/types";
import { roleLabelEl } from "@/lib/auth/roles";
import type { RoleCode } from "@/lib/auth/roles";

const FILTER_ROLES: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST"];
const STATUSES = Object.keys(EMPLOYMENT_STATUS_LABELS_EL) as EmploymentStatus[];

type StaffFiltersFormProps = {
  search: StaffPageSearch;
  centers: CenterSummary[];
  disciplines: DisciplineOption[];
};

export function StaffFiltersForm({ search, centers, disciplines }: StaffFiltersFormProps) {
  const f = search.filters;

  return (
    <form method="get" action="/staff" className="mb-6 rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="filter_center" className="mb-1 block text-xs font-medium text-ink-muted">
            Κέντρο
          </label>
          <select
            id="filter_center"
            name="center"
            defaultValue={f.centerId ?? ""}
            className="min-w-[11rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">Όλα</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter_role" className="mb-1 block text-xs font-medium text-ink-muted">
            Ρόλος
          </label>
          <select
            id="filter_role"
            name="role"
            defaultValue={f.roleCode ?? ""}
            className="min-w-[11rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">Όλοι</option>
            {FILTER_ROLES.map((code) => (
              <option key={code} value={code}>
                {roleLabelEl(code)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter_discipline" className="mb-1 block text-xs font-medium text-ink-muted">
            Ειδικότητα
          </label>
          <select
            id="filter_discipline"
            name="discipline"
            defaultValue={f.disciplineCode ?? ""}
            className="min-w-[11rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">Όλες</option>
            {disciplines.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name_el}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter_status" className="mb-1 block text-xs font-medium text-ink-muted">
            Κατάσταση
          </label>
          <select
            id="filter_status"
            name="status"
            defaultValue={f.employmentStatus ?? ""}
            className="min-w-[10rem] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">Όλες</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {EMPLOYMENT_STATUS_LABELS_EL[s]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
        >
          Εφαρμογή
        </button>
        <a href={buildStaffHref()} className="text-sm font-medium text-clinical-700 hover:underline">
          Καθαρισμός
        </a>
      </div>
    </form>
  );
}
