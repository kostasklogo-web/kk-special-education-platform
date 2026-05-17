"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ExecutiveFinanceModel } from "@/lib/secretary/finances/types";
import { chargeProgramLabel, chargeTimeLabel } from "@/lib/finance/finance-schedule-read-model";
import { SESSION_PAYMENT_STATUS_LABELS } from "@/lib/finance/labels";
import {
  FINANCE_CENTER_LABELS,
  formatEuro,
  formatEuroPrecise,
} from "@/lib/secretary/finances/labels";
import { MetricStrip, SectionHeading } from "./FinanceUi";
import type { SessionBillingCharge } from "@/lib/finance/types";

type Props = { model: ExecutiveFinanceModel };

type ChargeFilter = "all" | "billable" | "paid" | "outstanding" | "forecast";

function ChargeActions({ charge }: { charge: SessionBillingCharge }) {
  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        className="rounded border border-border px-2 py-0.5 text-[10px] font-medium"
        onClick={() => window.alert(`Πρωτότυπο: άνοιγμα συνεδρίας ${charge.sessionId}`)}
      >
        Άνοιγμα συνεδρίας
      </button>
      {charge.childId ? (
        <Link
          href={`/children/${charge.childId}`}
          className="rounded border border-border px-2 py-0.5 text-[10px] font-medium"
        >
          Άνοιγμα παιδιού
        </Link>
      ) : null}
      <Link
        href="/secretary/payments"
        className="rounded border border-border px-2 py-0.5 text-[10px] font-medium"
      >
        Καταχώρηση πληρωμής
      </Link>
      <button
        type="button"
        className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-900"
        onClick={() => window.alert("Πρωτότυπο: σήμανση ως εξοφλημένο.")}
      >
        Σήμανση ως εξοφλημένο
      </button>
    </div>
  );
}

export function ScheduleFinanceSection({ model }: Props) {
  const [filter, setFilter] = useState<ChargeFilter>("billable");
  const sm = model.scheduleMetrics;
  const charges = model.sessionCharges ?? [];

  const filtered = useMemo(() => {
    const list = charges;
    switch (filter) {
      case "paid":
        return list.filter((c) => c.paymentStatus === "paid");
      case "outstanding":
        return list.filter((c) => c.outstandingAmount > 0 && !c.isForecast);
      case "forecast":
        return list.filter((c) => c.isForecast);
      case "billable":
        return list.filter((c) => c.isBillable);
      default:
        return list;
    }
  }, [charges, filter]);

  const tabs: { id: ChargeFilter; label: string; count: number }[] = [
    { id: "billable", label: "Χρεώσιμες Συνεδρίες", count: sm.billableSessionCount },
    { id: "paid", label: "Πληρωμένες Συνεδρίες", count: sm.paidSessionCount },
    { id: "outstanding", label: "Ανεξόφλητες Συνεδρίες", count: sm.outstandingSessionCount },
    { id: "forecast", label: "Προβλεπόμενα Έσοδα", count: sm.forecastSessionCount },
    { id: "all", label: "Όλες", count: charges.length },
  ];

  return (
    <section className="space-y-4" aria-labelledby="sched-fin">
      <SectionHeading
        title="Έσοδα από Πρόγραμμα"
        description="Χρεώσεις από συνεδρίες control-center · σύνδεση προγράμματος με οικονομικά"
      />

      <MetricStrip
        items={[
          { label: "Υπολογιζόμενα έσοδα", value: formatEuro(sm.calculatedRevenue), tone: "neutral" },
          { label: "Πραγματικά έσοδα", value: formatEuro(sm.realRevenue), tone: "good" },
          { label: "Τζίρος (τιμολογημένα)", value: formatEuro(sm.turnover), tone: "neutral" },
          {
            label: "Κίνδυνος Είσπραξης",
            value:
              sm.collectionRiskLevel === "high"
                ? "Υψηλός"
                : sm.collectionRiskLevel === "medium"
                  ? "Μέτριος"
                  : "Χαμηλός",
            tone: sm.collectionRiskLevel === "low" ? "good" : "neutral",
          },
        ]}
      />

      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              filter === t.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-border bg-white text-ink-muted hover:bg-surface-muted"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b bg-surface-muted/60 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-2 py-2">Ημ/νία · ώρα</th>
              <th className="px-2 py-2">Παιδί</th>
              <th className="px-2 py-2">Γονέας</th>
              <th className="px-2 py-2">Θεραπευτής</th>
              <th className="px-2 py-2">Ειδικότητα</th>
              <th className="px-2 py-2">Κέντρο / Αίθουσα</th>
              <th className="px-2 py-2">Τύπος χρέωσης</th>
              <th className="px-2 py-2 text-right">Αναμενόμενο</th>
              <th className="px-2 py-2 text-right">Πληρώθηκε</th>
              <th className="px-2 py-2 text-right">Υπόλοιπο</th>
              <th className="px-2 py-2">Κατάσταση πληρωμής</th>
              <th className="px-2 py-2">Ενέργειες</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-sm text-ink-muted">
                  Δεν υπάρχουν γραμμές για το επιλεγμένο φίλτρο.
                </td>
              </tr>
            ) : null}
            {filtered.slice(0, 80).map((c) => (
              <tr key={`${c.dateYmd}:${c.sessionId}`} className="align-top hover:bg-surface-muted/20">
                <td className="px-2 py-2 text-xs whitespace-nowrap">{chargeTimeLabel(c)}</td>
                <td className="max-w-[120px] truncate px-2 py-2" title={c.childName}>
                  {c.childName}
                </td>
                <td className="px-2 py-2">{c.parentName}</td>
                <td className="px-2 py-2 text-xs">{c.therapistName}</td>
                <td className="px-2 py-2 text-xs">{c.specialtyLabel}</td>
                <td className="px-2 py-2 text-xs">
                  {FINANCE_CENTER_LABELS[c.center]}
                  {c.roomLabel ? ` · ${c.roomLabel}` : ""}
                </td>
                <td className="px-2 py-2 text-xs">{chargeProgramLabel(c)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatEuroPrecise(c.expectedCharge)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-emerald-800">
                  {formatEuroPrecise(c.paidAmount)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums font-medium">
                  {formatEuroPrecise(c.outstandingAmount)}
                </td>
                <td className="px-2 py-2 text-xs">{SESSION_PAYMENT_STATUS_LABELS[c.paymentStatus]}</td>
                <td className="px-2 py-2">
                  <ChargeActions charge={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 80 ? (
        <p className="text-xs text-ink-muted">Εμφάνιση 80 από {filtered.length} γραμμές (πρωτότυπο).</p>
      ) : null}
    </section>
  );
}
