/** Role codes from public.roles (technical English identifiers). */
export const ROLE_CODES = [
  "ORG_OWNER",
  "ORG_ADMIN",
  "RECEPTION",
  "SUPERVISOR",
  "THERAPIST",
  "PARENT",
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

const ROLE_LABEL_EL: Record<RoleCode, string> = {
  ORG_OWNER: "Ιδιοκτήτης",
  ORG_ADMIN: "Διοίκηση",
  RECEPTION: "Γραμματεία",
  SUPERVISOR: "Επόπτης",
  THERAPIST: "Θεραπευτής",
  PARENT: "Γονέας",
};

const ROLE_PRIORITY: RoleCode[] = [
  "ORG_OWNER",
  "ORG_ADMIN",
  "RECEPTION",
  "SUPERVISOR",
  "THERAPIST",
  "PARENT",
];

export function roleLabelEl(code: RoleCode): string {
  return ROLE_LABEL_EL[code];
}

export function primaryRoleCode(roleCodes: RoleCode[]): RoleCode | null {
  for (const code of ROLE_PRIORITY) {
    if (roleCodes.includes(code)) return code;
  }
  return roleCodes[0] ?? null;
}

export function primaryRoleLabelEl(roleCodes: RoleCode[]): string {
  const p = primaryRoleCode(roleCodes);
  return p ? roleLabelEl(p) : "Χωρίς ρόλο";
}

export function isManagement(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => c === "ORG_OWNER" || c === "ORG_ADMIN");
}

export function isStaffFacing(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => c !== "PARENT");
}
