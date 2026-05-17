import Link from "next/link";
import type { RoleCode } from "@/lib/auth/roles";
import { platformQuickModuleCards } from "@/lib/auth/platform-nav";

type Props = { roleCodes: RoleCode[] };

export function PlatformModuleCards({ roleCodes }: Props) {
  const cards = platformQuickModuleCards(roleCodes);

  return (
    <section className="rounded-2xl border border-clinical-100/80 bg-gradient-to-br from-white via-clinical-50/20 to-white p-4 shadow-shell sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clinical-800">Γρήγορη πλοήγηση</p>
      <p className="mt-0.5 text-sm text-ink-muted">Όλα τα κύρια modules χωρίς χειροκίνητη πληκτρολόγηση URL.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="flex min-h-[72px] flex-col justify-between rounded-xl border border-border bg-white/95 p-3 shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50/50"
            >
              <Icon className="h-4 w-4 text-clinical-700" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink">{card.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-muted">{card.helper}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
