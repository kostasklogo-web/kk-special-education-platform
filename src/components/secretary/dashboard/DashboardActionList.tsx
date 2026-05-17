"use client";

import Link from "next/link";
import {
  Bell,
  Calendar,
  Check,
  ClipboardList,
  ExternalLink,
  MessageSquare,
  Phone,
  TrendingUp,
} from "lucide-react";
import type { DashboardActionRow } from "@/lib/secretary/dashboard/master-model";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { useGdpr } from "@/components/gdpr/GdprProvider";

const TONE_TO_ALERT: Record<
  DashboardActionRow["tone"],
  "green" | "yellow" | "red"
> = {
  green: "green",
  yellow: "yellow",
  orange: "yellow",
  red: "red",
  dark_red: "red",
};

type Props = {
  title: string;
  rows: DashboardActionRow[];
  emptyMessage?: string;
  onAuditOpen?: (row: DashboardActionRow) => void;
};

export function DashboardActionList({
  title,
  rows,
  emptyMessage = "Δεν υπάρχουν εγγραφές.",
  onAuditOpen,
}: Props) {
  const gdpr = useGdpr();

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-surface-muted/20 p-4">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="mt-2 text-xs text-ink-muted">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-white shadow-sm">
      <h3 className="border-b border-border px-4 py-3 text-sm font-bold text-ink">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-surface-muted/40 text-[10px] uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2">Παιδί</th>
              <th className="px-3 py-2">Γονέας</th>
              <th className="px-3 py-2">Θέμα</th>
              <th className="px-3 py-2">Προτεραιότητα</th>
              <th className="px-3 py-2">Λήξη</th>
              <th className="px-3 py-2">Κατάσταση</th>
              <th className="px-3 py-2 text-right">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/60 hover:bg-surface-muted/30">
                <td className="px-3 py-2 font-medium text-ink">{r.childLabel ?? "—"}</td>
                <td className="px-3 py-2 text-ink-muted">{r.parentLabel ?? "—"}</td>
                <td className="max-w-[200px] truncate px-3 py-2" title={r.title}>
                  {r.title}
                </td>
                <td className="px-3 py-2 capitalize">{r.priority}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{r.dueLabel}</td>
                <td className="px-3 py-2">
                  <AlertBadge level={TONE_TO_ALERT[r.tone]} />
                  <span className="ml-1">{r.statusLabel}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Link
                      href={r.href}
                      className="inline-flex items-center gap-0.5 rounded border px-2 py-1 font-semibold hover:bg-surface-muted"
                      onClick={() => {
                        onAuditOpen?.(r);
                        if (["diagnoses", "reports", "meetings", "intake"].includes(r.module)) {
                          const mod =
                            r.module === "gdpr"
                              ? "gdpr_settings"
                              : (r.module as "diagnoses" | "reports" | "meetings" | "intake");
                          gdpr.auditView(mod, `Προβολή από πίνακα: ${r.title}`, {
                            childId: r.childId,
                            entityId: r.entityId,
                          });
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Άνοιγμα
                    </Link>
                    <Link
                      href={`/secretary/reminders?child=${encodeURIComponent(r.childLabel ?? "")}`}
                      className="inline-flex items-center gap-0.5 rounded border border-clinical-200 px-2 py-1 font-semibold text-clinical-800 hover:bg-clinical-50"
                      title="GDPR: έλεγχος συγκατάθεσης πριν την αποστολή"
                    >
                      <Bell className="h-3 w-3" />
                      Υπενθύμιση
                    </Link>
                    <Link
                      href={`/secretary/tasks?action=new&child=${r.childId ?? ""}`}
                      className="inline-flex items-center gap-0.5 rounded border px-2 py-1 font-semibold hover:bg-surface-muted"
                    >
                      <ClipboardList className="h-3 w-3" />
                      Εργασία
                    </Link>
                    <Link
                      href={`/secretary/schedule?action=new&child=${r.childId ?? ""}`}
                      className="inline-flex items-center gap-0.5 rounded border px-2 py-1 font-semibold hover:bg-surface-muted"
                    >
                      <Calendar className="h-3 w-3" />
                      Ραντεβού
                    </Link>
                    <Link
                      href={`/secretary/communications?action=new&child=${r.childId ?? ""}`}
                      className="inline-flex items-center gap-0.5 rounded border px-2 py-1 font-semibold hover:bg-surface-muted"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Καταγραφή
                    </Link>
                    {r.module === "payments" ? (
                      <Link
                        href={`/secretary/payments?escalate=${r.entityId}`}
                        className="inline-flex items-center gap-0.5 rounded border border-red-200 px-2 py-1 font-semibold text-red-900 hover:bg-red-50"
                      >
                        <TrendingUp className="h-3 w-3" />
                        Διοίκηση
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 rounded border px-2 py-1 font-semibold text-ink-muted hover:bg-surface-muted"
                      title="Σημείωση ολοκλήρωσης στο module"
                      onClick={() => {
                        window.location.href = `${r.href}&done=1`;
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 rounded border px-2 py-1 font-semibold text-ink-muted hover:bg-surface-muted"
                      onClick={() => {
                        if (r.parentLabel) {
                          void navigator.clipboard.writeText(
                            `Αγαπητέ/ή ${r.parentLabel}, σχετικά με ${r.childLabel ?? "το παιδί"}: `
                          );
                        }
                      }}
                    >
                      <Phone className="h-3 w-3" />
                      Αντιγραφή
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
