import type { RoleCode } from "@/lib/auth/roles";
import { primaryRoleCode, roleLabelEl } from "@/lib/auth/roles";

type RoleBadgeProps = {
  roleCodes: RoleCode[];
  className?: string;
};

export function RoleBadge({ roleCodes, className = "" }: RoleBadgeProps) {
  const primary = primaryRoleCode(roleCodes);
  const label = primary ? roleLabelEl(primary) : "Χωρίς ρόλο";

  if (roleCodes.length <= 1) {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-clinical-100 bg-clinical-50 px-2.5 py-0.5 text-xs font-medium text-clinical-800 ${className}`}
      title={roleCodes.map(roleLabelEl).join(", ")}
    >
      {label}
      <span className="text-clinical-600">+{roleCodes.length - 1}</span>
    </span>
  );
}
