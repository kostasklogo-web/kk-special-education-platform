import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Stethoscope,
  UserPlus,
  Wallet,
  Users,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";

export type SecretaryRouteId =
  | "dashboard"
  | "schedule"
  | "new-case"
  | "appointments"
  | "payments"
  | "tasks"
  | "communications"
  | "diagnoses"
  | "reports"
  | "reminders"
  | "meetings";

export type SecretaryNavItem = {
  id: SecretaryRouteId;
  href: string;
  label: string;
  helper: string;
  icon: LucideIcon;
  /** Roles that can open this page (read). */
  viewRoles: RoleCode[];
  /** Roles that can create/edit/delete on this page. */
  mutateRoles: RoleCode[];
  /** Fully implemented vs placeholder UI. */
  implementation: "live" | "placeholder";
};

export const SECRETARY_NAV_ITEMS: SecretaryNavItem[] = [
  {
    id: "dashboard",
    href: "/secretary/dashboard",
    label: "Πίνακας Γραμματείας",
    helper: "Εικόνα ημέρας & ειδοποιήσεις",
    icon: LayoutDashboard,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "schedule",
    href: "/secretary/schedule",
    label: "Πρόγραμμα",
    helper: "Πλήρης έλεγχος ραντεβού",
    icon: CalendarDays,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "new-case",
    href: "/secretary/new-case",
    label: "Νέο Περιστατικό",
    helper: "Intake & νέος ωφελούμενος",
    icon: UserPlus,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "appointments",
    href: "/secretary/appointments",
    label: "Ραντεβού / Αξιολογήσεις",
    helper: "Αξιολόγηση, ιστορικό, ενημέρωση",
    icon: ClipboardList,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "placeholder",
  },
  {
    id: "payments",
    href: "/secretary/payments",
    label: "Πληρωμές & Οφειλές",
    helper: "Υπόλοιπα & καθυστερήσεις",
    icon: Wallet,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "tasks",
    href: "/secretary/tasks",
    label: "Εκκρεμότητες",
    helper: "Εργασίες & κλήσεις",
    icon: ListTodo,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "communications",
    href: "/secretary/communications",
    label: "Επικοινωνίες",
    helper: "Γονείς, σχολεία, γιατροί",
    icon: MessageSquare,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "diagnoses",
    href: "/secretary/diagnoses",
    label: "Γνωματεύσεις",
    helper: "Λήξεις & ανανεώσεις",
    icon: Stethoscope,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "reports",
    href: "/secretary/reports",
    label: "Αιτήματα Αναφορών",
    helper: "Πρόοδος, σχολείο, γιατρός",
    icon: FileText,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "reminders",
    href: "/secretary/reminders",
    label: "Υπενθυμίσεις",
    helper: "Αποστολή σε γονείς",
    icon: Bell,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
  {
    id: "meetings",
    href: "/secretary/meetings",
    label: "Εποπτείες / Συναντήσεις",
    helper: "Επόπτες & διεύθυνση",
    icon: Users,
    viewRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"],
    mutateRoles: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
    implementation: "live",
  },
];

export function secretaryNavItemsForRoles(roleCodes: RoleCode[]): SecretaryNavItem[] {
  if (roleCodes.length === 0) return [];
  return SECRETARY_NAV_ITEMS.filter((item) => item.viewRoles.some((r) => roleCodes.includes(r)));
}

export function secretaryNavItemByHref(pathname: string): SecretaryNavItem | null {
  const exact = SECRETARY_NAV_ITEMS.find((i) => i.href === pathname);
  if (exact) return exact;
  return (
    SECRETARY_NAV_ITEMS.find((i) => pathname.startsWith(`${i.href}/`)) ??
    (pathname === "/secretary" || pathname.startsWith("/secretary/")
      ? SECRETARY_NAV_ITEMS.find((i) => i.id === "dashboard") ?? null
      : null)
  );
}

export function secretaryRouteIdFromPathname(pathname: string): SecretaryRouteId | null {
  if (pathname === "/secretary") return "dashboard";
  const item = SECRETARY_NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`)
  );
  return item?.id ?? null;
}
