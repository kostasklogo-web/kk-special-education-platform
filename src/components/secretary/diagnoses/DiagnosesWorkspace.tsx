"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Plus } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import type { DiagnosisDocument, DiagnosisDocumentStatus, DiagnosisDocumentTypeCode } from "@/lib/secretary/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { LOCATION_FILTER_OPTIONS, type LocationFilter } from "@/lib/secretary/schedule-catalog";
import {
  computeDiagnosisDashboardMetrics,
  isExpiredWithoutFollowUp,
} from "@/lib/secretary/diagnoses/calculations";
import { DIAGNOSIS_DOCUMENT_TYPES } from "@/lib/secretary/diagnoses/catalog";
import { DIAGNOSIS_STATUS_LABELS } from "@/lib/secretary/diagnoses/labels";
import { getAllDiagnoses, DIAGNOSES_UPDATED_EVENT } from "@/lib/secretary/diagnoses/store";
import {
  canArchiveDiagnosis,
  canExportDiagnosisReports,
  canManageDiagnoses,
} from "@/lib/secretary/diagnoses/permissions";
import {
  exportActiveDiagnosesExcel,
  exportExpiredDiagnosesExcel,
  exportExpiringDiagnosesExcel,
  exportRenewalFollowUpExcel,
} from "@/lib/secretary/diagnoses/export";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { DiagnosisPrivacyBanner } from "./DiagnosisPrivacyBanner";
import { GdprPrivacyStrip } from "@/components/gdpr/GdprPrivacyStrip";
import { GdprExportBinding } from "@/components/gdpr/GdprExportBinding";
import { DiagnosisDashboardKpis } from "./DiagnosisDashboardKpis";
import { DiagnosisStatusBadge } from "./DiagnosisStatusBadge";
import { CreateDiagnosisModal } from "./CreateDiagnosisModal";
import { DiagnosisDetailModal } from "./DiagnosisDetailModal";
import { EditDiagnosisModal } from "./EditDiagnosisModal";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildDiagnosisReminderPayload } from "@/components/secretary/reminders/communication-builders";

type QuickFilter =
  | "active"
  | "exp60"
  | "exp30"
  | "exp7"
  | "expired"
  | "renewal_pending"
  | "missing_file"
  | "multi"
  | "renewed_month"
  | null;

type Props = { roleCodes: RoleCode[] };

export function DiagnosesWorkspace({ roleCodes }: Props) {
  const searchParams = useSearchParams();
  const today = todayAthensYmd();
  const { consents } = useReminders();

  const canMutate = canManageDiagnoses(roleCodes);
  const canExport = canExportDiagnosisReports(roleCodes);
  const canArchive = canArchiveDiagnosis(roleCodes);

  const [docs, setDocs] = useState<DiagnosisDocument[]>(() => getAllDiagnoses(today));
  const [location, setLocation] = useState<LocationFilter>("omilos");
  const [childQ, setChildQ] = useState(() => searchParams.get("child") ?? "");
  const [parentQ, setParentQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<DiagnosisDocumentTypeCode | "all">("all");
  const [authorityQ, setAuthorityQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiagnosisDocumentStatus | "all">("all");
  const [searchQ, setSearchQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [renewalRequiredOnly, setRenewalRequiredOnly] = useState(false);
  const [renewalStartedOnly, setRenewalStartedOnly] = useState(false);
  const [missingFileOnly, setMissingFileOnly] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<DiagnosisDocument | null>(null);
  const [editing, setEditing] = useState<DiagnosisDocument | null>(null);
  const [uploading, setUploading] = useState<DiagnosisDocument | null>(null);

  const refresh = useCallback(() => setDocs(getAllDiagnoses(today)), [today]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(DIAGNOSES_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(DIAGNOSES_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  useEffect(() => {
    const docId = searchParams.get("doc");
    if (docId) {
      const d = docs.find((x) => x.id === docId);
      if (d) setSelected(d);
    }
    const child = searchParams.get("child");
    if (child) setChildQ(child);
    const quick = searchParams.get("quick");
    if (
      quick === "exp60" ||
      quick === "exp30" ||
      quick === "exp7" ||
      quick === "expired" ||
      quick === "renewal_pending" ||
      quick === "missing_file"
    ) {
      setQuickFilter(quick);
    }
  }, [searchParams, docs]);

  const metrics = useMemo(() => computeDiagnosisDashboardMetrics(docs, today), [docs, today]);

  const childDocCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of docs.filter((x) => !x.archived)) {
      m.set(d.childId, (m.get(d.childId) ?? 0) + 1);
    }
    return m;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    return docs.filter((d) => {
      if (d.archived && statusFilter !== "archived") return false;
      if (location !== "omilos" && d.locationCode !== location) return false;
      if (typeFilter !== "all" && d.documentTypeCode !== typeFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (childQ && !d.childLabel.toLowerCase().includes(childQ.toLowerCase())) return false;
      if (parentQ && !(d.parentLabel ?? "").toLowerCase().includes(parentQ.toLowerCase())) return false;
      if (authorityQ && !d.issuingAuthority.toLowerCase().includes(authorityQ.toLowerCase())) return false;
      if (dateFrom && d.expiryDate < dateFrom) return false;
      if (dateTo && d.expiryDate > dateTo) return false;
      if (renewalRequiredOnly && !d.renewalRequired) return false;
      if (renewalStartedOnly && !d.renewalProcessStarted) return false;
      if (missingFileOnly && d.fileName) return false;

      if (quickFilter === "active")
        return !d.archived && !["renewed", "no_renewal_required", "archived"].includes(d.status);
      if (quickFilter === "exp60") return d.status === "expiring_60";
      if (quickFilter === "exp30") return d.status === "expiring_30";
      if (quickFilter === "exp7") return d.status === "expiring_7";
      if (quickFilter === "expired") return d.status === "expired";
      if (quickFilter === "renewal_pending")
        return d.renewalRequired && !d.renewalProcessStarted && d.daysUntilExpiry <= 60 && !d.renewedAt;
      if (quickFilter === "missing_file") return !d.fileName && !d.archived;
      if (quickFilter === "multi") return (childDocCounts.get(d.childId) ?? 0) > 1;
      if (quickFilter === "renewed_month") return !!d.renewedAt?.startsWith(today.slice(0, 7));

      if (q) {
        const hay = [
          d.childLabel,
          d.parentLabel,
          d.diagnosisDescription,
          d.documentType,
          d.issuingAuthority,
          d.doctorSpecialty,
          d.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    docs,
    location,
    typeFilter,
    statusFilter,
    childQ,
    parentQ,
    authorityQ,
    searchQ,
    dateFrom,
    dateTo,
    renewalRequiredOnly,
    renewalStartedOnly,
    missingFileOnly,
    quickFilter,
    childDocCounts,
    today,
  ]);

  return (
    <GdprExportBinding module="diagnoses">
      {(requestExport) => (
    <div className="space-y-4">
      <GdprPrivacyStrip />
      <DiagnosisPrivacyBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">Επίσημο σύστημα παρακολούθησης λήξεων & ανανεώσεων</p>
        {canMutate ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-clinical-600 px-4 text-sm font-bold text-white shadow hover:bg-clinical-700"
          >
            <Plus className="h-4 w-4" />
            Νέο έγγραφο
          </button>
        ) : null}
      </div>

      <DiagnosisDashboardKpis metrics={metrics} activeFilter={quickFilter} onFilter={setQuickFilter} />

      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface-muted/30 p-3">
        <span className="w-full text-xs font-semibold uppercase text-ink-muted">Φίλτρα & αναζήτηση</span>
        <input
          placeholder="Αναζήτηση (παιδί, γονέας, διάγνωση, γιατρός…)"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          className="min-w-[200px] flex-[2] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DiagnosisDocumentTypeCode | "all")}
          className="max-w-[220px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλοι οι τύποι</option>
          {DIAGNOSIS_DOCUMENT_TYPES.map((t) => (
            <option key={t.code} value={t.code}>
              {t.labelEl}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DiagnosisDocumentStatus | "all")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Όλες οι καταστάσεις</option>
          {(Object.keys(DIAGNOSIS_STATUS_LABELS) as DiagnosisDocumentStatus[]).map((s) => (
            <option key={s} value={s}>
              {DIAGNOSIS_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          placeholder="Παιδί"
          value={childQ}
          onChange={(e) => setChildQ(e.target.value)}
          className="w-28 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Γονέας"
          value={parentQ}
          onChange={(e) => setParentQ(e.target.value)}
          className="w-28 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Φορέας έκδοσης"
          value={authorityQ}
          onChange={(e) => setAuthorityQ(e.target.value)}
          className="w-36 rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-border bg-white px-2 py-2 text-sm"
          title="Λήξη από"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-border bg-white px-2 py-2 text-sm"
          title="Λήξη έως"
        />
        <label className="flex items-center gap-1.5 text-xs font-medium">
          <input
            type="checkbox"
            checked={renewalRequiredOnly}
            onChange={(e) => setRenewalRequiredOnly(e.target.checked)}
          />
          Ανανέωση
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium">
          <input
            type="checkbox"
            checked={renewalStartedOnly}
            onChange={(e) => setRenewalStartedOnly(e.target.checked)}
          />
          Διαδ. ανανέωσης
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium">
          <input type="checkbox" checked={missingFileOnly} onChange={(e) => setMissingFileOnly(e.target.checked)} />
          Χωρίς αρχείο
        </label>
      </div>

      {canExport ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => requestExport("Excel ενεργών διαγνώσεων", () => exportActiveDiagnosesExcel(docs))}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Excel ενεργά
          </button>
          <button
            type="button"
            onClick={() => requestExport("Excel λήγοντων διαγνώσεων", () => exportExpiringDiagnosesExcel(docs))}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Excel λήγοντα
          </button>
          <button
            type="button"
            onClick={() => requestExport("Excel ληγμένων διαγνώσεων", () => exportExpiredDiagnosesExcel(docs))}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Excel ληγμένα
          </button>
          <button
            type="button"
            onClick={() => requestExport("Excel ανανεώσεων διαγνώσεων", () => exportRenewalFollowUpExcel(docs))}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Excel ανανεώσεις
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-surface-muted/50 text-xs font-semibold uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2">Παιδί</th>
              <th className="px-3 py-2">Τοποθ.</th>
              <th className="px-3 py-2">Τύπος</th>
              <th className="px-3 py-2">Περιγραφή</th>
              <th className="px-3 py-2">Φορέας</th>
              <th className="px-3 py-2">Έκδοση</th>
              <th className="px-3 py-2">Λήξη</th>
              <th className="px-3 py-2">Ημέρες</th>
              <th className="px-3 py-2">Ανανέωση</th>
              <th className="px-3 py-2">Υπεύθ.</th>
              <th className="px-3 py-2">Κατάσταση</th>
              <th className="px-3 py-2">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-10 text-center text-ink-muted">
                  Δεν βρέθηκαν έγγραφα.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr
                  key={d.id}
                  className={`border-t border-border/60 hover:bg-surface-muted/20 ${
                    isExpiredWithoutFollowUp(d) ? "bg-red-50/40" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-medium">{d.childLabel}</td>
                  <td className="px-3 py-2 text-ink-muted">{LOCATION_LABELS[d.locationCode]}</td>
                  <td className="max-w-[120px] truncate px-3 py-2" title={d.documentType}>
                    {d.documentType}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2" title={d.diagnosisDescription}>
                    {d.diagnosisDescription}
                  </td>
                  <td className="max-w-[100px] truncate px-3 py-2">{d.issuingAuthority}</td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                    {d.issueDate ? formatDateEl(d.issueDate) : "—"}
                  </td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap">{formatDateEl(d.expiryDate)}</td>
                  <td className="px-3 py-2 tabular-nums">
                    <span className={d.daysUntilExpiry < 0 ? "font-bold text-red-700" : ""}>{d.daysUntilExpiry}</span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {d.renewalProcessStarted ? "Σε εξέλιξη" : d.renewalRequired ? "Ναι" : "Όχι"}
                  </td>
                  <td className="px-3 py-2 text-xs">{d.responsiblePersonLabel ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <DiagnosisStatusBadge status={d.status} />
                      <AlertBadge level={isExpiredWithoutFollowUp(d) ? "red" : d.alertLevel} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setSelected(d)}
                        className="rounded border border-border px-2 py-1 text-xs font-semibold hover:bg-surface-muted"
                      >
                        Άνοιγμα
                      </button>
                      {(d.renewalRequired || d.daysUntilExpiry <= 60) && d.childId ? (
                        <CreateReminderButton
                          size="sm"
                          variant="ghost"
                          payload={buildDiagnosisReminderPayload(d, consents)}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {createOpen ? (
        <CreateDiagnosisModal onClose={() => setCreateOpen(false)} onCreated={refresh} />
      ) : null}

      {selected ? (
        <DiagnosisDetailModal
          doc={selected}
          consents={consents}
          canMutate={canMutate}
          canArchive={canArchive}
          onClose={() => setSelected(null)}
          onUpdated={refresh}
          onEdit={(d) => {
            setSelected(null);
            setEditing(d);
          }}
          onUpload={(d) => {
            setSelected(null);
            setUploading(d);
          }}
        />
      ) : null}

      {editing ? (
        <EditDiagnosisModal doc={editing} onClose={() => setEditing(null)} onSaved={refresh} />
      ) : null}

      {uploading ? (
        <UploadDocumentModal doc={uploading} onClose={() => setUploading(null)} onSaved={refresh} />
      ) : null}
    </div>
      )}
    </GdprExportBinding>
  );
}
