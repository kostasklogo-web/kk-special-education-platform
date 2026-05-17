"use client";

import { useEffect, useState } from "react";
import type { RoleCode } from "@/lib/auth/roles";
import {
  MODULE_LEGAL_INFO,
  getRetentionPolicy,
  saveRetentionPolicy,
  DEFAULT_RETENTION,
  getAuditLogEntries,
  AUDIT_LOG_UPDATED_EVENT,
  auditActionLabel,
  getConsentRecords,
  CONSENT_CHANNEL_LABELS,
  canPerformGdprAction,
  type RetentionPolicy,
  type AuditLogEntry,
  type ConsentRecord,
} from "@/lib/gdpr";
import { primaryGdprRole } from "@/lib/gdpr/role-map";
import { PermissionDenied } from "./PermissionDenied";

type Tab = "overview" | "consent" | "retention" | "audit" | "legal";

type Props = { roleCodes: RoleCode[]; organizationId: string };

export function GdprSettingsWorkspace({ roleCodes, organizationId }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [retention, setRetention] = useState<RetentionPolicy>(DEFAULT_RETENTION);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);

  const canManage = canPerformGdprAction("edit", "gdpr_settings", { roleCodes, userId: null });

  useEffect(() => {
    setRetention(getRetentionPolicy());
    setAudit(getAuditLogEntries(100));
    setConsents(getConsentRecords());
    const refresh = () => {
      setAudit(getAuditLogEntries(100));
      setConsents(getConsentRecords());
    };
    window.addEventListener(AUDIT_LOG_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(AUDIT_LOG_UPDATED_EVENT, refresh);
  }, []);

  if (!canPerformGdprAction("view", "gdpr_settings", { roleCodes, userId: null })) {
    return (
      <PermissionDenied message="Μόνο η διοίκηση μπορεί να προβάλει τις ρυθμίσεις GDPR." />
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Επισκόπηση" },
    { id: "legal", label: "Νομική βάση" },
    { id: "consent", label: "Συγκαταθέσεις" },
    { id: "retention", label: "Διατήρηση" },
    { id: "audit", label: "Audit log" },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-surface-card p-4 text-sm">
        <p>
          <strong>Οργανισμός:</strong> {organizationId}
        </p>
        <p>
          <strong>Ο ρόλος σας:</strong> {primaryGdprRole(roleCodes)}
        </p>
        <p className="mt-2 text-ink-muted">
          Πλατφόρμα με αρχιτεκτονική privacy-by-design: έλεγχος πρόσβασης ανά ρόλο, καταγραφή ενεργειών,
          διαχωρισμός κλινικών σημειώσεων, soft delete, προστασία αρχείων.
        </p>
      </section>

      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === t.id ? "bg-clinical-600 text-white" : "border bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "legal" ? (
        <ul className="space-y-3">
          {MODULE_LEGAL_INFO.map((m) => (
            <li key={m.module} className="rounded-lg border p-3 text-sm">
              <p className="font-bold">{m.labelEl}</p>
              <p className="text-xs text-ink-muted">
                Νομική βάση: {m.legalBasis} · Ευαίσθητα: {m.sensitiveCategory} · Συγκατάθεση:{" "}
                {m.requiresConsent ? "Ναι" : "Όχι"}
              </p>
              <p className="mt-1 text-xs">{m.descriptionEl}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "consent" ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/50 text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-2 py-2">Παιδί</th>
                <th className="px-2 py-2">Κανάλι</th>
                <th className="px-2 py-2">Κατάσταση</th>
                <th className="px-2 py-2">Ημ/νία</th>
                <th className="px-2 py-2">Έκδοση κειμένου</th>
              </tr>
            </thead>
            <tbody>
              {consents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-ink-muted">
                    Δεν υπάρχουν καταχωρημένες συγκαταθέσεις (demo).
                  </td>
                </tr>
              ) : (
                consents.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-2 py-2">{c.childId ?? "—"}</td>
                    <td className="px-2 py-2">{CONSENT_CHANNEL_LABELS[c.channel]}</td>
                    <td className="px-2 py-2">{c.granted ? "Ναι" : "Όχι"}</td>
                    <td className="px-2 py-2">{c.consentDate}</td>
                    <td className="px-2 py-2 text-xs">{c.consentTextVersion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "retention" ? (
        <div className="grid max-w-md gap-3">
          {canManage ? (
            <>
              <label className="block text-sm">
                Ανενεργά παιδιά (μήνες)
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={retention.inactiveChildMonths}
                  onChange={(e) =>
                    setRetention({ ...retention, inactiveChildMonths: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block text-sm">
                Αρχειοθετημένες αναφορές (έτη)
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={retention.archivedReportYears}
                  onChange={(e) =>
                    setRetention({ ...retention, archivedReportYears: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block text-sm">
                Επικοινωνίες (έτη)
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={retention.communicationLogYears}
                  onChange={(e) =>
                    setRetention({ ...retention, communicationLogYears: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block text-sm">
                HR (έτη)
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={retention.hrRecordYears}
                  onChange={(e) =>
                    setRetention({ ...retention, hrRecordYears: Number(e.target.value) })
                  }
                />
              </label>
              <label className="block text-sm">
                Audit log (έτη)
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={retention.auditLogYears}
                  onChange={(e) =>
                    setRetention({ ...retention, auditLogYears: Number(e.target.value) })
                  }
                />
              </label>
              <button
                type="button"
                className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-bold text-white"
                onClick={() => saveRetentionPolicy(retention)}
              >
                Αποθήκευση πολιτικής
              </button>
            </>
          ) : (
            <PermissionDenied message="Μόνο CEO μπορεί να αλλάξει πολιτικές διατήρησης." />
          )}
        </div>
      ) : null}

      {tab === "audit" ? (
        <div className="max-h-[480px] overflow-y-auto rounded-lg border">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface-muted/80">
              <tr>
                <th className="px-2 py-2">Ώρα</th>
                <th className="px-2 py-2">Χρήστης</th>
                <th className="px-2 py-2">Ενέργεια</th>
                <th className="px-2 py-2">Module</th>
                <th className="px-2 py-2">Περίληψη</th>
              </tr>
            </thead>
            <tbody>
              {audit.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-ink-muted">
                    Δεν υπάρχουν καταγραφές ακόμα. Οι εξαγωγές και προβολές θα εμφανίζονται εδώ.
                  </td>
                </tr>
              ) : (
                audit.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="whitespace-nowrap px-2 py-1 tabular-nums">
                      {new Date(a.occurredAt).toLocaleString("el-GR")}
                    </td>
                    <td className="px-2 py-1">{a.userLabel}</td>
                    <td className="px-2 py-1">{auditActionLabel(a.action)}</td>
                    <td className="px-2 py-1">{a.module}</td>
                    <td className="px-2 py-1">{a.summary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "overview" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <GdprInfoCard title="Ρόλοι" text="CEO, Διοίκηση, Κ.Δ., Επόπτης, Θεραπευτής, Γραμματεία, Γονέας — ελάχιστη πρόσβαση." />
          <GdprInfoCard
            title="Κλινική ιδιωτικότητα"
            text="Διαχωρισμός σημειώσεων θεραπευτή, εποπτείας, διοίκησης, HR."
          />
          <GdprInfoCard
            title="Αρχεία"
            text="Μεταφόρτωση/λήψη μόνο με έλεγχο δικαιωμάτων (signed URLs σε production)."
          />
          <GdprInfoCard title="Soft delete" text="Όχι μόνιμή διαγραφή ευαίσθητων εγγραφών από UI." />
        </div>
      ) : null}
    </div>
  );
}

function GdprInfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-xs text-ink-muted">{text}</p>
    </div>
  );
}
