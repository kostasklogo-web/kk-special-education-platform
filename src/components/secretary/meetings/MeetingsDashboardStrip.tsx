"use client";

import Link from "next/link";
import { useMeetings } from "./MeetingsChargeProvider";
import { computeMeetingDashboardMetrics } from "@/lib/secretary/meetings/calculations";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

const CARDS = [
  { key: "today", label: "Σήμερα", href: "/secretary/meetings?quick=today" },
  { key: "upcomingSupervision", label: "Εποπτείες", href: "/secretary/meetings?quick=supervision" },
  { key: "pendingEmergency", label: "Έκτακτες", href: "/secretary/meetings?quick=emergency", urgent: true },
  { key: "awaitingMinutes", label: "Πρακτικά", href: "/secretary/meetings?quick=minutes" },
  { key: "overdueFollowUp", label: "Εκπρόθεσμα", href: "/secretary/meetings?quick=overdue", urgent: true },
] as const;

export function MeetingsDashboardStrip() {
  const today = todayAthensYmd();
  const meetings = useMeetings();
  const metrics = computeMeetingDashboardMetrics(meetings, today);

  return (
    <section className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">Εποπτείες & συναντήσεις</h2>
        <Link href="/secretary/meetings" className="text-xs font-semibold text-clinical-700 hover:underline">
          Όλες →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((card) => {
          const value = metrics[card.key as keyof typeof metrics] ?? 0;
          const urgent = "urgent" in card && card.urgent;
          return (
            <Link
              key={card.key}
              href={card.href}
              className={`rounded-lg border p-3 text-center transition hover:shadow-md ${
                value > 0 && urgent
                  ? "border-red-300 bg-red-50"
                  : value > 0
                    ? "border-amber-200 bg-amber-50"
                    : "border-border bg-white"
              }`}
            >
              <p className="text-2xl font-bold tabular-nums text-ink">{value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase text-ink-muted">{card.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
