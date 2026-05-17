import type { ReactNode } from "react";
import type { DashboardSectionCard } from "@/lib/secretary/dashboard/master-model";
import { DashboardMetricCard } from "./DashboardMetricCard";

type Props = {
  title: string;
  icon?: ReactNode;
  cards: DashboardSectionCard[];
};

export function DashboardSection({ title, icon, cards }: Props) {
  if (cards.length === 0) return null;
  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink">
        {icon}
        {title}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <DashboardMetricCard key={c.id} card={c} />
        ))}
      </div>
    </section>
  );
}
