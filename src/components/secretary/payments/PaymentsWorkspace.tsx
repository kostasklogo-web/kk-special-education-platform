"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Copy,
  Download,
  FileText,
  MessageCircle,
  Pencil,
  History,
  Wallet,
  AlertTriangle,
  Check,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import type { RoleCode } from "@/lib/auth/roles";
import type { PaymentObligation, PaymentStatus } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { LOCATION_FILTER_OPTIONS, type LocationFilter } from "@/lib/secretary/schedule-catalog";
import { computeDashboardMetrics } from "@/lib/secretary/payments/calculations";
import {
  getAllCharges,
  PAYMENTS_UPDATED_EVENT,
  upsertCharge,
} from "@/lib/secretary/payments/store";
import {
  locationLabel,
  PAYMENT_DISPLAY_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_STATUS_LABELS,
  OVERDUE_FILTER_OPTIONS,
  type OverdueFilter,
} from "@/lib/secretary/payments/labels";
import {
  canManagePaymentCharges,
  canRegisterPayments,
  canExportPaymentReports,
} from "@/lib/secretary/payments/permissions";
import {
  exportOverdueListExcel,
  exportUnpaidBalancesExcel,
  printMonthlyCollectionPdf,
} from "@/lib/secretary/payments/export";
import { formatDateEl } from "@/lib/ui/child-labels";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import {
  buildPaymentReminderPayload,
  paymentTemplateForStatus,
} from "@/components/secretary/reminders/communication-builders";
import { renderReminderMessage } from "@/lib/secretary/reminders/render-message";
import { PaymentDashboardKpis } from "./PaymentDashboardKpis";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { EntityLinkedTasksBadge } from "@/components/secretary/tasks/EntityLinkedTasksBadge";
import { RegisterPaymentModal } from "./RegisterPaymentModal";
import { EditChargeModal } from "./EditChargeModal";
import { PaymentHistoryModal } from "./PaymentHistoryModal";

type Props = {
  roleCodes: RoleCode[];
};

export function PaymentsWorkspace({ roleCodes }: Props) {
  const searchParams = useSearchParams();
  const today = todayAthensYmd();
  const monthYmd = `${today.slice(0, 7)}-01`;
  const { consents, openReminder, createReminderFromPayload, copyMessage, markSent } = useReminders();

  const canMutate = canRegisterPayments(roleCodes);
  const canManage = canManagePaymentCharges(roleCodes);
  const canExport = canExportPaymentReports(roleCodes);

  const [charges, setCharges] = useState<PaymentObligation[]>(() => getAllCharges(today));
  const [location, setLocation] = useState<LocationFilter>("omilos");
  const [month, setMonth] = useState(today.slice(0, 7));
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [parentQ, setParentQ] = useState("");
  const [childQ, setChildQ] = useState(() => searchParams.get("child") ?? "");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [overdueFilter, setOverdueFilter] = useState<OverdueFilter>(() => {
    const f = searchParams.get("filter");
    if (f === "suspended_management" || f === "overdue_1_30" || f === "overdue_30_60" || f === "overdue_60_plus") {
      return f;
    }
    return "all";
  });

  const [registerCharge, setRegisterCharge] = useState<PaymentObligation | null>(null);
  const [editCharge, setEditCharge] = useState<PaymentObligation | null>(null);
  const [historyCharge, setHistoryCharge] = useState<PaymentObligation | null>(null);

  const refresh = useCallback(() => {
    setCharges(getAllCharges(today));
  }, [today]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(PAYMENTS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(PAYMENTS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const metrics = useMemo(
    () => computeDashboardMetrics(charges, monthYmd, today),
    [charges, monthYmd, today]
  );

  const filtered = useMemo(() => {
    return charges.filter((c) => {
      if (location !== "omilos" && c.locationCode !== location) return false;
      if (month && !c.obligationMonth.startsWith(month)) return false;
      if (statusFilter !== "all" && c.paymentStatus !== statusFilter) return false;
      if (parentQ && !(c.parentLabel ?? "").toLowerCase().includes(parentQ.toLowerCase())) return false;
      if (childQ && !c.childLabel.toLowerCase().includes(childQ.toLowerCase())) return false;
      if (methodFilter !== "all" && c.paymentMethod !== methodFilter) return false;
      if (overdueFilter !== "all" && c.paymentStatus !== overdueFilter) return false;
      return true;
    });
  }, [charges, location, month, statusFilter, parentQ, childQ, methodFilter, overdueFilter]);

  const sendReminder = (charge: PaymentObligation) => {
    const tpl = paymentTemplateForStatus(charge, today);
    const payload = buildPaymentReminderPayload(charge, consents, tpl);
    openReminder(payload);
  };

  const copyReminder = async (charge: PaymentObligation) => {
    const tpl = paymentTemplateForStatus(charge, today);
    const payload = buildPaymentReminderPayload(charge, consents, tpl);
    const rec = createReminderFromPayload(payload, payload.suggestedChannel ?? "sms", "copied");
    const msg = renderReminderMessage(tpl, payload.context, payload.suggestedChannel ?? "sms");
    await copyMessage(rec.id, msg, payload.suggestedChannel ?? "sms");
    upsertCharge({ ...charge, lastReminderAt: new Date().toISOString() }, today);
    refresh();
  };

  const markReminderSent = (charge: PaymentObligation) => {
    const tpl = paymentTemplateForStatus(charge, today);
    const payload = buildPaymentReminderPayload(charge, consents, tpl);
    const rec = createReminderFromPayload(payload, payload.suggestedChannel ?? "sms", "sent");
    markSent(rec.id, payload.suggestedChannel ?? "sms");
    upsertCharge({ ...charge, lastReminderAt: new Date().toISOString() }, today);
    refresh();
  };

  const escalate = (charge: PaymentObligation) => {
    if (!confirm("Ανάθεση σε διοίκηση για αυτή την οφειλή;")) return;
    upsertCharge({ ...charge, escalatedToManagement: true }, today);
    refresh();
  };

  const addNote = (charge: PaymentObligation) => {
    const note = window.prompt("Νέα σημείωση:", "");
    if (!note?.trim()) return;
    upsertCharge(
      {
        ...charge,
        notes: charge.notes ? `${charge.notes}\n[${today}] ${note.trim()}` : `[${today}] ${note.trim()}`,
      },
      today
    );
    refresh();
  };

  return (
    <div className="space-y-4">
      <PaymentDashboardKpis metrics={metrics} />

      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface-muted/30 p-3">
        <span className="w-full text-xs font-semibold uppercase text-ink-muted">Φίλτρα</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Τοποθεσία">
          {LOCATION_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLocation(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                location === opt.value
                  ? "border-clinical-600 bg-clinical-600 text-white"
                  : "border-border bg-white text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          aria-label="Μήνας"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          aria-label="Κατάσταση"
        >
          <option value="all">Όλες οι καταστάσεις</option>
          {(Object.keys(PAYMENT_DISPLAY_STATUS_LABELS) as PaymentStatus[]).map((s) => (
            <option key={s} value={s}>
              {PAYMENT_DISPLAY_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={overdueFilter}
          onChange={(e) => setOverdueFilter(e.target.value as OverdueFilter)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          {OVERDUE_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Γονέας"
          value={parentQ}
          onChange={(e) => setParentQ(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Παιδί"
          value={childQ}
          onChange={(e) => setChildQ(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλοι οι τρόποι</option>
          {(Object.keys(PAYMENT_METHOD_LABELS) as Array<keyof typeof PAYMENT_METHOD_LABELS>).map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      {canExport ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportUnpaidBalancesExcel(charges)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Ανεξόφλητα (Excel)
          </button>
          <button
            type="button"
            onClick={() => exportOverdueListExcel(charges, today)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Καθυστερήσεις (Excel)
          </button>
          <button
            type="button"
            onClick={() =>
              printMonthlyCollectionPdf(charges, monthYmd, {
                expected: metrics.expectedThisMonth,
                collected: metrics.collectedThisMonth,
                cashFlowPct: metrics.cashFlowPct,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-surface-muted"
          >
            <FileText className="h-3.5 w-3.5" />
            Μηνιαία συλλογή (PDF)
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-surface-muted/50 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2">Παιδί</th>
              <th className="px-3 py-2">Γονέας</th>
              <th className="px-3 py-2">Τοποθ.</th>
              <th className="px-3 py-2">Μήνας</th>
              <th className="px-3 py-2">Πρόγραμμα</th>
              <th className="px-3 py-2 text-right">Αναμ.</th>
              <th className="px-3 py-2 text-right">Πληρ.</th>
              <th className="px-3 py-2 text-right">Υπόλ.</th>
              <th className="px-3 py-2">Λήξη</th>
              <th className="px-3 py-2">Πληρωμή</th>
              <th className="px-3 py-2">Τρόπος</th>
              <th className="px-3 py-2">Απόδειξη</th>
              <th className="px-3 py-2">Κατάσταση</th>
              <th className="px-3 py-2">Σημ.</th>
              {canMutate ? <th className="px-3 py-2">Ενέργειες</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canMutate ? 15 : 14} className="px-4 py-10 text-center text-ink-muted">
                  Δεν βρέθηκαν εγγραφές.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-t border-border/60 hover:bg-surface-muted/20">
                  <td className="px-3 py-2 font-medium text-ink">
                    <span className="flex flex-wrap items-center gap-1">
                      {c.childLabel}
                      <EntityLinkedTasksBadge link={{ kind: "payment", paymentId: c.id, childId: c.childId }} />
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-muted">{c.parentLabel ?? "—"}</td>
                  <td className="px-3 py-2">{locationLabel(c.locationCode)}</td>
                  <td className="px-3 py-2 tabular-nums">{c.obligationMonth.slice(0, 7)}</td>
                  <td className="max-w-[140px] truncate px-3 py-2" title={c.programLabel}>
                    {c.programLabel}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.expectedAmount}€</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.paidAmount}€</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{c.balance}€</td>
                  <td className="px-3 py-2 tabular-nums">{formatDateEl(c.dueDate)}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {c.paymentDate ? formatDateEl(c.paymentDate) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {c.paymentMethod ? PAYMENT_METHOD_LABELS[c.paymentMethod] : "—"}
                  </td>
                  <td className="px-3 py-2">{RECEIPT_STATUS_LABELS[c.receiptStatus]}</td>
                  <td className="px-3 py-2">
                    <PaymentStatusBadge status={c.paymentStatus} />
                  </td>
                  <td className="max-w-[100px] truncate px-3 py-2 text-xs text-ink-faint" title={c.notes}>
                    {c.notes || "—"}
                  </td>
                  {canMutate ? (
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        {c.balance > 0 ? (
                          <ActionBtn
                            title="Καταχώριση πληρωμής"
                            onClick={() => setRegisterCharge(c)}
                            icon={Wallet}
                          />
                        ) : null}
                        <ActionBtn title="Επεξεργασία" onClick={() => setEditCharge(c)} icon={Pencil} />
                        {c.balance > 0 ? (
                          <>
                            <ActionBtn title="Υπενθύμιση" onClick={() => sendReminder(c)} icon={MessageCircle} />
                            <ActionBtn title="Αντιγραφή μηνύματος" onClick={() => void copyReminder(c)} icon={Copy} />
                            <ActionBtn title="Σημείωση αποστολής" onClick={() => markReminderSent(c)} icon={Check} />
                            <Link
                              href={`/secretary/tasks?action=create&payment=${c.id}`}
                              title="Νέα εργασία follow-up"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-ink hover:bg-clinical-50 hover:text-clinical-700"
                            >
                              <ListTodo className="h-3.5 w-3.5" />
                            </Link>
                          </>
                        ) : null}
                        <ActionBtn title="Ιστορικό" onClick={() => setHistoryCharge(c)} icon={History} />
                        <ActionBtn title="Σημείωση" onClick={() => addNote(c)} icon={FileText} />
                        {!c.escalatedToManagement && c.balance > 0 ? (
                          <ActionBtn title="Διοίκηση" onClick={() => escalate(c)} icon={AlertTriangle} />
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!canMutate ? (
        <p className="text-sm text-amber-800">Προβολή μόνο — οι καταχωρήσεις πληρωμών δεν είναι διαθέσιμες.</p>
      ) : null}

      {registerCharge ? (
        <RegisterPaymentModal
          charge={registerCharge}
          open
          onClose={() => setRegisterCharge(null)}
          onSaved={refresh}
        />
      ) : null}
      {editCharge ? (
        <EditChargeModal
          charge={editCharge}
          open
          canEditExpectedAmount={canManage}
          onClose={() => setEditCharge(null)}
          onSaved={refresh}
        />
      ) : null}
      {historyCharge ? (
        <PaymentHistoryModal charge={historyCharge} open onClose={() => setHistoryCharge(null)} />
      ) : null}
    </div>
  );
}

function ActionBtn({
  title,
  onClick,
  icon: Icon,
}: {
  title: string;
  onClick: () => void;
  icon: typeof Wallet;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-ink hover:bg-clinical-50 hover:text-clinical-700"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
