import Link from "next/link";
import { Bell, CalendarDays, ListTodo, Users } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { canAccessSecretaryModule } from "@/lib/auth/secretary-permissions";

type Props = { roleCodes: RoleCode[] };

const LINKS = [
  { href: "/secretary/meetings", label: "Εποπτείες / Συναντήσεις", icon: Users },
  { href: "/secretary/reminders", label: "Υπενθυμίσεις", icon: Bell },
  { href: "/secretary/tasks", label: "Εκκρεμότητες", icon: ListTodo },
  { href: "/secretary/schedule", label: "Πρόγραμμα γραμματείας", icon: CalendarDays },
] as const;

export function PlatformSecretaryTodayStrip({ roleCodes }: Props) {
  if (!canAccessSecretaryModule(roleCodes)) return null;

  return (
    <section className="rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50/60 to-white p-4 shadow-shell sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-900">Γραμματεία σήμερα</p>
      <p className="mt-0.5 text-sm text-ink-muted">Συναντήσεις, υπενθυμίσεις και εργασίες από ένα σημείο.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-violet-200/80 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-violet-50/80"
          >
            <Icon className="h-4 w-4 text-violet-800" aria-hidden />
            {label}
          </Link>
        ))}
        <Link
          href="/secretary/dashboard"
          className="inline-flex min-h-[40px] items-center rounded-xl bg-violet-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-900"
        >
          Πλήρης πίνακας γραμματείας
        </Link>
      </div>
    </section>
  );
}
