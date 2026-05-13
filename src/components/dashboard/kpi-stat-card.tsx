import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type KpiStatCardProps = {
  label: string;
  value: number;
  helper: string;
  icon?: LucideIcon;
  /** Slightly stronger visual weight for top-row executive KPIs */
  emphasis?: boolean;
  /** Optional link — entire card becomes clickable */
  href?: string;
  variant?: "default" | "clinical" | "muted";
};

export function KpiStatCard({ label, value, helper, icon: Icon, emphasis, href, variant = "default" }: KpiStatCardProps) {
  const shell = [
    "relative overflow-hidden rounded-2xl border p-5 shadow-shell transition-shadow",
    href ? "hover:shadow-md" : "",
    variant === "clinical"
      ? "border-clinical-200/80 bg-gradient-to-br from-clinical-50/40 via-white to-white"
      : variant === "muted"
        ? "border-border/80 bg-surface-muted/20"
        : emphasis
          ? "border-clinical-100/80 bg-gradient-to-br from-white via-white to-clinical-50/50"
          : "border-border bg-surface-card",
  ].join(" ");

  const inner = (
    <>
      {Icon ? (
        <div
          className="absolute right-4 top-4 rounded-lg border border-clinical-100/60 bg-clinical-50/90 p-2 text-clinical-800"
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </div>
      ) : null}
      <p className="pr-14 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{helper}</p>
      {href ? (
        <span className="mt-3 inline-block text-xs font-semibold text-clinical-700">Προβολή →</span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${shell} block text-left outline-none ring-clinical-500 focus-visible:ring-2`}>
        {inner}
      </Link>
    );
  }

  return <div className={shell}>{inner}</div>;
}
