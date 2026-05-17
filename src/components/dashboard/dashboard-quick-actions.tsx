import Link from "next/link";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  FileText,
  LayoutGrid,
  PlusCircle,
  Target,
  Users,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { buildScheduleHref } from "@/lib/schedule/search-params";

const dayYmd = todayAthensYmd();

type QuickAction = { href: string; label: string; icon: LucideIcon };

const OPERATIONS_ACTIONS: QuickAction[] = [
  { href: "/schedule/control-center", label: "Πίνακας προγράμματος", icon: LayoutGrid },
  { href: buildScheduleHref({ view: "day", dateYmd: dayYmd, filters: {} }), label: "Πρόγραμμα σήμερα", icon: CalendarDays },
  { href: "/schedule/new", label: "Νέα συνεδρία", icon: CalendarPlus },
  { href: "/attendance", label: "Παρουσίες", icon: ClipboardCheck },
  { href: "/session-notes", label: "Σημειώσεις", icon: FileText },
  { href: "/reports", label: "Αναφορές", icon: BarChart3 },
  { href: "/therapy-goals", label: "Στόχοι", icon: Target },
  { href: "/children", label: "Μητρώο παιδιών", icon: UsersRound },
  { href: "/parents", label: "Γονείς", icon: Users },
  { href: buildScheduleHref({ view: "list", dateYmd: dayYmd, filters: {} }), label: "Λίστα συνεδριών", icon: LayoutGrid },
  { href: "/rooms", label: "Αίθουσες", icon: Building2 },
];

const CLINICAL_DESK_ACTIONS: QuickAction[] = [
  { href: buildScheduleHref({ view: "day", dateYmd: dayYmd, filters: {} }), label: "Πρόγραμμα σήμερα", icon: CalendarDays },
  { href: "/attendance", label: "Παρουσίες", icon: ClipboardCheck },
  { href: "/session-notes", label: "Σημειώσεις", icon: FileText },
  { href: "/therapy-goals", label: "Στόχοι", icon: Target },
  { href: buildScheduleHref({ view: "list", dateYmd: dayYmd, filters: {} }), label: "Λίστα συνεδριών", icon: LayoutGrid },
  { href: "/children", label: "Μητρώο παιδιών", icon: UsersRound },
  { href: "/reports", label: "Αναφορές", icon: BarChart3 },
];

export type DashboardQuickActionsDesk = "operations" | "clinical";

export function DashboardQuickActions({ desk = "operations" }: { desk?: DashboardQuickActionsDesk }) {
  const actions = desk === "clinical" ? CLINICAL_DESK_ACTIONS : OPERATIONS_ACTIONS;
  const blurb =
    desk === "clinical"
      ? "Κλινικό γραφείο — πρόγραμμα, παρουσίες, σημειώσεις και στόχοι σε μία γραμμή εργασίας."
      : "Ρεσεψιόν, διοίκηση και ομάδα — λιγότερα κλικ για την καθημερινή ροή του κέντρου.";

  return (
    <div className="rounded-2xl border border-clinical-100/70 bg-gradient-to-r from-white via-clinical-50/25 to-white p-4 shadow-shell sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clinical-800">Γρήγορες ενέργειες</p>
          <p className="mt-0.5 text-sm text-ink-muted">{blurb}</p>
        </div>
        <Link
          href="/children/new"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-clinical-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden />
          Νέος φάκελος
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border border-border bg-white/95 px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50/50 sm:px-3.5"
          >
            <Icon className="h-4 w-4 shrink-0 text-clinical-700" aria-hidden />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
