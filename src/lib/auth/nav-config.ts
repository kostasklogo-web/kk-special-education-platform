import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Home,
  Settings,
  Stethoscope,
  Target,
  Users,
  UsersRound,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** If set, user must have at least one of these roles. If omitted, any authenticated user sees the item. */
  anyOf?: RoleCode[];
};

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Αρχική", icon: Home },
  {
    href: "/children",
    label: "Παιδιά",
    icon: UsersRound,
    anyOf: [
      "ORG_OWNER",
      "ORG_ADMIN",
      "RECEPTION",
      "SUPERVISOR",
      "THERAPIST",
    ],
  },
  {
    href: "/parents",
    label: "Γονείς / Κηδεμόνες",
    icon: Users,
    anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST"],
  },
  {
    href: "/staff",
    label: "Προσωπικό",
    icon: Stethoscope,
    anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST"],
  },
  {
    href: "/schedule",
    label: "Πρόγραμμα",
    icon: CalendarDays,
    anyOf: [
      "ORG_OWNER",
      "ORG_ADMIN",
      "RECEPTION",
      "THERAPIST",
      "SUPERVISOR",
    ],
  },
  {
    href: "/attendance",
    label: "Παρουσίες",
    icon: ClipboardCheck,
    anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "THERAPIST", "SUPERVISOR"],
  },
  {
    href: "/therapy-goals",
    label: "Θεραπευτικοί Στόχοι",
    icon: Target,
    anyOf: [
      "ORG_OWNER",
      "ORG_ADMIN",
      "RECEPTION",
      "SUPERVISOR",
      "THERAPIST",
    ],
  },
  {
    href: "/session-notes",
    label: "Σημειώσεις Συνεδριών",
    icon: FileText,
    anyOf: [
      "ORG_OWNER",
      "ORG_ADMIN",
      "RECEPTION",
      "SUPERVISOR",
      "THERAPIST",
    ],
  },
  {
    href: "/reports",
    label: "Αναφορές",
    icon: BarChart3,
    anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST"],
  },
  {
    href: "/rooms",
    label: "Αίθουσες",
    icon: Building2,
    anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST"],
  },
  {
    href: "/settings",
    label: "Ρυθμίσεις",
    icon: Settings,
    anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
  },
];

export function navItemsForRoles(roleCodes: RoleCode[]): NavItem[] {
  if (roleCodes.length === 0) {
    return MAIN_NAV;
  }

  return MAIN_NAV.filter((item) => {
    if (!item.anyOf) return true;
    return item.anyOf.some((r) => roleCodes.includes(r));
  });
}
