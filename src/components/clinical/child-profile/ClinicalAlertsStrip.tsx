"use client";

import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";
import type { ClinicalAlert } from "@/lib/clinical/child-profile/types";

const SEVERITY_STYLES = {
  urgent: "border-red-200 bg-red-50 text-red-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
};

export function ClinicalAlertsStrip({ alerts }: { alerts: ClinicalAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <section className="rounded-xl border border-clinical-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        Κλινικές ειδοποιήσεις
      </h2>
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${SEVERITY_STYLES[a.severity]}`}
          >
            {a.severity === "info" ? (
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{a.title}</p>
              <p className="mt-0.5 text-xs opacity-90">{a.detail}</p>
              {a.href ? (
                <Link href={a.href} className="mt-1 inline-block text-xs font-bold underline">
                  Μετάβαση →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
