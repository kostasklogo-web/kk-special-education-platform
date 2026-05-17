import Link from "next/link";
import type { DashboardSectionCard, DashboardCardTone } from "@/lib/secretary/dashboard/master-model";

const TONE_STYLES: Record<DashboardCardTone, string> = {
  green: "border-emerald-200 bg-emerald-50/60",
  yellow: "border-amber-200 bg-amber-50/60",
  orange: "border-orange-200 bg-orange-50/60",
  red: "border-red-200 bg-red-50/60",
  dark_red: "border-red-900/40 bg-red-950/10",
};

const VALUE_STYLES: Record<DashboardCardTone, string> = {
  green: "text-emerald-900",
  yellow: "text-amber-950",
  orange: "text-orange-950",
  red: "text-red-900",
  dark_red: "text-red-950",
};

export function DashboardMetricCard({ card }: { card: DashboardSectionCard }) {
  const cls = `rounded-lg border p-3 shadow-sm transition hover:shadow-md ${TONE_STYLES[card.tone]}`;
  const inner = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{card.label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${VALUE_STYLES[card.tone]}`}>{card.value}</p>
      {card.helper ? <p className="mt-0.5 text-[10px] text-ink-faint">{card.helper}</p> : null}
    </>
  );
  return card.href ? (
    <Link href={card.href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
