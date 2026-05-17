import Link from "next/link";
import type { AlertLevel } from "@/lib/secretary/types";
import { AlertBadge } from "./AlertBadge";

type Alert = { id: string; title: string; detail: string; alertLevel: AlertLevel; href?: string };

export function UrgentAlerts({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <section className="rounded-xl border border-red-200/80 bg-red-50/40 p-4">
      <h2 className="text-sm font-semibold text-red-950">Επείγοντα & προειδοποιήσεις</h2>
      <ul className="mt-2 space-y-2">
        {alerts.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-md border border-red-100 bg-white px-3 py-2 text-sm">
            <AlertBadge level={a.alertLevel} />
            <span className="font-medium text-ink">{a.title}</span>
            <span className="text-ink-muted">— {a.detail}</span>
            {a.href ? (
              <Link href={a.href} className="ml-auto text-xs font-semibold text-clinical-700 hover:underline">
                Άνοιγμα →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
