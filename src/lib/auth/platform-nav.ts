import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Headset,
  Home,
  Landmark,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Settings,
  Stethoscope,
  Target,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { canAccessSecretaryModule } from "@/lib/auth/secretary-permissions";
import { DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-child-profile-demo";

export type PlatformNavItem = {
  id: string;
  href: string;
  label: string;
  helper: string;
  icon: LucideIcon;
  /** Hide unless user has one of these roles. Omit = visible to all authenticated users. */
  anyOf?: RoleCode[];
  /** Extra paths that mark this item active (e.g. child profile under /children/[id]). */
  activePrefixes?: string[];
  badge?: "mvp" | "live";
};

export type PlatformNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Hide entire group when user lacks any matching role on all items. */
  defaultOpen?: boolean;
  items: PlatformNavItem[];
};

const CLINICAL_ROLES: RoleCode[] = [
  "ORG_OWNER",
  "ORG_ADMIN",
  "RECEPTION",
  "SUPERVISOR",
  "THERAPIST",
];

const SECRETARY_VIEW: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"];

function item(
  partial: PlatformNavItem & { anyOf?: RoleCode[] }
): PlatformNavItem {
  return partial;
}

/** Unified platform navigation — single source for the operational shell sidebar. */
export const PLATFORM_NAV_GROUPS: PlatformNavGroup[] = [
  {
    id: "home",
    label: "Κεντρικός Πίνακας",
    icon: Home,
    defaultOpen: true,
    items: [
      item({
        id: "platform-home",
        href: "/",
        label: "Κεντρικός Πίνακας",
        helper: "Επιχειρησιακή εικόνα ημέρας",
        icon: LayoutDashboard,
      }),
    ],
  },
  {
    id: "schedule",
    label: "Πρόγραμμα",
    icon: CalendarDays,
    defaultOpen: true,
    items: [
      item({
        id: "schedule-control-center",
        href: "/schedule/control-center",
        label: "Κεντρικός Πίνακας Προγράμματος",
        helper: "Πλήρης πίνακας 13:00–21:00 · πρωτότυπο",
        icon: CalendarDays,
        anyOf: CLINICAL_ROLES,
        activePrefixes: ["/schedule/control-center"],
      }),
      item({
        id: "secretary-schedule",
        href: "/secretary/schedule",
        label: "Πρόγραμμα Γραμματείας",
        helper: "Ραντεβού & διαθεσιμότητα",
        icon: CalendarDays,
        anyOf: SECRETARY_VIEW,
      }),
      item({
        id: "schedule-classic",
        href: "/schedule",
        label: "Συνεδρίες (κλασικό)",
        helper: "Λίστα & ημερολόγιο συνεδριών",
        icon: ClipboardList,
        anyOf: CLINICAL_ROLES,
        activePrefixes: ["/schedule"],
      }),
    ],
  },
  {
    id: "children",
    label: "Παιδιά & κλινική",
    icon: UsersRound,
    defaultOpen: true,
    items: [
      item({
        id: "children-registry",
        href: "/children",
        label: "Παιδιά",
        helper: "Μητρώο ωφελούμενων",
        icon: UsersRound,
        anyOf: CLINICAL_ROLES,
        activePrefixes: ["/children"],
      }),
      item({
        id: "clinical-profile",
        href: `/children/${DEMO_CLINICAL_CHILD_ID}`,
        label: "Κλινικός Φάκελος",
        helper: "Πολυθεματικό προφίλ · επίδειξη",
        icon: FileText,
        anyOf: CLINICAL_ROLES,
        activePrefixes: [`/children/${DEMO_CLINICAL_CHILD_ID}`],
      }),
      item({
        id: "therapy-goals",
        href: "/therapy-goals",
        label: "Θεραπευτικοί Στόχοι",
        helper: "Στόχοι παρέμβασης",
        icon: Target,
        anyOf: CLINICAL_ROLES,
      }),
      item({
        id: "session-notes",
        href: "/session-notes",
        label: "Σημειώσεις Συνεδριών",
        helper: "Κλινική τεκμηρίωση",
        icon: FileText,
        anyOf: CLINICAL_ROLES,
      }),
      item({
        id: "attendance",
        href: "/attendance",
        label: "Παρουσίες",
        helper: "Παρουσιολόγιο & αναπληρώσεις",
        icon: ClipboardCheck,
        anyOf: CLINICAL_ROLES,
      }),
      item({
        id: "reports-clinical",
        href: "/reports",
        label: "Αναφορές",
        helper: "Αναφορές προόδου",
        icon: BarChart3,
        anyOf: CLINICAL_ROLES,
      }),
    ],
  },
  {
    id: "secretary",
    label: "Γραμματεία",
    icon: Headset,
    defaultOpen: true,
    items: [
      item({
        id: "secretary-dashboard",
        href: "/secretary/dashboard",
        label: "Πίνακας Γραμματείας",
        helper: "Εικόνα ημέρας",
        icon: LayoutDashboard,
        anyOf: SECRETARY_VIEW,
        activePrefixes: ["/secretary", "/secretary/dashboard"],
      }),
      item({
        id: "secretary-new-case",
        href: "/secretary/new-case",
        label: "Νέο Περιστατικό",
        helper: "Intake & καταχώρηση",
        icon: UserPlus,
        anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
      }),
      item({
        id: "secretary-meetings",
        href: "/secretary/meetings",
        label: "Εποπτείες / Συναντήσεις",
        helper: "Επόπτες & διεύθυνση",
        icon: Users,
        anyOf: SECRETARY_VIEW,
      }),
      item({
        id: "secretary-reminders",
        href: "/secretary/reminders",
        label: "Υπενθυμίσεις",
        helper: "Αποστολή σε γονείς",
        icon: Bell,
        anyOf: SECRETARY_VIEW,
      }),
      item({
        id: "secretary-tasks",
        href: "/secretary/tasks",
        label: "Tasks",
        helper: "Εκκρεμότητες & κλήσεις",
        icon: ListTodo,
        anyOf: SECRETARY_VIEW,
      }),
      item({
        id: "secretary-reports",
        href: "/secretary/reports",
        label: "Αιτήματα Αναφορών",
        helper: "Πρόοδος, σχολείο, γιατρός",
        icon: FileText,
        anyOf: SECRETARY_VIEW,
      }),
      item({
        id: "secretary-diagnoses",
        href: "/secretary/diagnoses",
        label: "Γνωματεύσεις",
        helper: "Λήξεις & ανανεώσεις",
        icon: Stethoscope,
        anyOf: SECRETARY_VIEW,
      }),
      item({
        id: "secretary-payments",
        href: "/secretary/payments",
        label: "Πληρωμές",
        helper: "Οφειλές & εισπράξεις",
        icon: Wallet,
        anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
      }),
      item({
        id: "secretary-finances",
        href: "/secretary/finances",
        label: "Οικονομικά",
        helper: "Financial command center · πρωτότυπο",
        icon: Landmark,
        anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
        badge: "mvp",
      }),
      item({
        id: "secretary-communications",
        href: "/secretary/communications",
        label: "Επικοινωνίες",
        helper: "Γονείς, σχολεία, γιατροί",
        icon: MessageSquare,
        anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
      }),
    ],
  },
  {
    id: "admin",
    label: "Διοίκηση & υποδομή",
    icon: Building2,
    defaultOpen: false,
    items: [
      item({
        id: "parents",
        href: "/parents",
        label: "Γονείς / Κηδεμόνες",
        helper: "Οικογένειες & επικοινωνία",
        icon: Users,
        anyOf: CLINICAL_ROLES,
      }),
      item({
        id: "staff",
        href: "/staff",
        label: "Προσωπικό",
        helper: "Θεραπευτές & ομάδα",
        icon: Stethoscope,
        anyOf: CLINICAL_ROLES,
      }),
      item({
        id: "rooms",
        href: "/rooms",
        label: "Αίθουσες",
        helper: "Χώροι παρέμβασης",
        icon: Building2,
        anyOf: CLINICAL_ROLES,
      }),
      item({
        id: "settings",
        href: "/settings",
        label: "Ρυθμίσεις",
        helper: "Κέντρα, ρόλοι, GDPR",
        icon: Settings,
        anyOf: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"],
        activePrefixes: ["/settings"],
      }),
    ],
  },
];

function visibleItem(item: PlatformNavItem, roleCodes: RoleCode[]): boolean {
  if (!item.anyOf?.length) return true;
  if (roleCodes.length === 0) return true;
  return item.anyOf.some((r) => roleCodes.includes(r));
}

export function platformNavGroupsForRoles(roleCodes: RoleCode[]): PlatformNavGroup[] {
  const showSecretary = canAccessSecretaryModule(roleCodes);

  return PLATFORM_NAV_GROUPS.map((group) => {
    if (group.id === "secretary" && !showSecretary) {
      return { ...group, items: [] };
    }

    const items = group.items.filter((i) => {
      if (group.id === "secretary") return visibleItem(i, roleCodes);
      return visibleItem(i, roleCodes);
    });

    return { ...group, items };
  }).filter((g) => g.items.length > 0);
}

export function isPlatformNavItemActive(pathname: string, item: PlatformNavItem): boolean {
  if (item.href === "/") return pathname === "/";
  if (pathname === item.href) return true;
  const prefixes = item.activePrefixes ?? [item.href];
  return prefixes.some((p) => {
    if (p === "/schedule" && item.id === "schedule-classic") {
      return (
        pathname === "/schedule" ||
        (pathname.startsWith("/schedule/") && !pathname.startsWith("/schedule/control-center"))
      );
    }
    if (p === "/children" && item.id === "children-registry") {
      return pathname === "/children" || pathname.startsWith("/children/");
    }
    return pathname === p || pathname.startsWith(`${p}/`);
  });
}

/** Flat list of primary module cards for the landing dashboard. */
export function platformQuickModuleCards(roleCodes: RoleCode[]): PlatformNavItem[] {
  const ids = new Set([
    "schedule-control-center",
    "children-registry",
    "clinical-profile",
    "secretary-dashboard",
    "secretary-schedule",
    "secretary-tasks",
    "attendance",
    "reports-clinical",
  ]);

  const out: PlatformNavItem[] = [];
  for (const group of platformNavGroupsForRoles(roleCodes)) {
    for (const navItem of group.items) {
      if (ids.has(navItem.id)) out.push(navItem);
    }
  }
  return out;
}
