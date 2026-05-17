"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  ShieldAlert,
  Users,
} from "lucide-react";
import type { HrPerformanceModel, HrTherapistProfile } from "@/lib/management/hr-performance/types";
import {
  AchievementBadge,
  GrowthIndicator,
  KpiCard,
  RiskBadge,
  ScoreDimensionCard,
  SectionHeading,
  WarningAlert,
} from "./HrPerfUi";
import { riskBadgeClass } from "@/lib/management/hr-performance/labels";
type ModelProps = { model: HrPerformanceModel };

function TherapistPicker({
  therapists,
  selectedId,
  onSelect,
}: {
  therapists: HrTherapistProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {therapists.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
            selectedId === t.id
              ? "border-violet-600 bg-violet-600 text-white"
              : "border-border bg-white text-ink hover:bg-surface-muted"
          }`}
        >
          {t.name}
          <span className="ml-1 tabular-nums opacity-80">({t.overallScore})</span>
        </button>
      ))}
    </div>
  );
}

export function OverviewSection({ model, therapist }: ModelProps & { therapist: HrTherapistProfile }) {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Επισκόπηση απόδοσης θεραπευτή"
        description={`${therapist.name} · ${therapist.specialty} · ${therapist.center === "nikaia" ? "Νίκαια" : "Εύοσμος"} · Επόπτης: ${therapist.supervisorName}`}
      />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs text-ink-muted">Σύνθετο σκορ (balanced)</p>
          <p className="text-3xl font-bold tabular-nums text-ink">{therapist.overallScore}/100</p>
        </div>
        <RiskBadge level={therapist.riskLevel} />
        {therapist.incentiveEligible ? (
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            Επιλέξιμος κίνητρα · {therapist.incentiveTierLabel ?? "—"}
          </span>
        ) : (
          <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-ink-muted">Όχι επιλέξιμος bonus αυτή την περίοδο</span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {therapist.kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>
    </div>
  );
}

export function ReliabilitySection({ model }: ModelProps) {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Λειτουργική αξιοπιστία"
        description="Καθυστερήσεις, εκκρεμότητες, εποπτεία και προγραμματισμός — όχι παραγωγικότητα πωλήσεων"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {model.reliabilitySummary.map((r) => (
          <div key={r.label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <FileWarning className="h-5 w-5 text-amber-600" aria-hidden />
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${riskBadgeClass(r.level)}`}>
                {r.level}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{r.count}</p>
            <p className="text-sm text-ink-muted">{r.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-3 py-2">Θεραπευτής</th>
              <th className="px-3 py-2">Καθυστερήσεις</th>
              <th className="px-3 py-2">Σημειώσεις</th>
              <th className="px-3 py-2">Αναφορές</th>
              <th className="px-3 py-2">Εποπτεία</th>
              <th className="px-3 py-2">Σκορ</th>
            </tr>
          </thead>
          <tbody>
            {model.therapists.map((t) => {
              const rel = t.kpis.find((k) => k.id === "punct");
              return (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{t.name}</td>
                  <td className="px-3 py-2 tabular-nums">{t.id === "t3" ? 4 : t.id === "t2" ? 2 : t.id === "t1" ? 1 : 0}</td>
                  <td className="px-3 py-2 tabular-nums">{t.id === "t3" ? 4 : t.id === "t2" ? 2 : t.id === "t1" ? 1 : 0}</td>
                  <td className="px-3 py-2 tabular-nums">{t.id === "t3" ? 2 : t.id === "t2" ? 1 : 0}</td>
                  <td className="px-3 py-2 tabular-nums">{t.id === "t3" ? 2 : t.id === "t2" ? 1 : 0}</td>
                  <td className="px-3 py-2">
                    <RiskBadge level={rel?.status === "critical" ? "high" : t.riskLevel} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CLINICAL_TRACK = [
  { label: "Συνέπεια καταγραφής στόχων", pct: 88 },
  { label: "Διεπιστημονική συνεργασία", pct: 81 },
  { label: "Ενεργή εποπτεία", pct: 74 },
  { label: "Τήρηση πρωτοκόλλων", pct: 87 },
  { label: "Συνέχεια περιστατικού", pct: 90 },
  { label: "Εκπαιδευτικό υλικό", pct: 62 },
  { label: "Μέντορας / onboarding", pct: 55 },
];

export function ClinicalSection() {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Κλινική συνεισφορά"
        description="Μετρήσιμοι στόχοι, πρωτόκολλα, συνέχεια — όχι αύξηση συνεδριών για bonus"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {CLINICAL_TRACK.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-ink">{c.label}</span>
              <span className="tabular-nums font-bold">{c.pct}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${c.pct >= 85 ? "bg-emerald-500" : c.pct >= 70 ? "bg-sky-500" : "bg-amber-500"}`}
                style={{ width: `${c.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TEAM_TRACK = [
  { label: "Συμμετοχή συναντήσεων", pct: 84 },
  { label: "Εσωτερικές εκπαιδεύσεις", pct: 79 },
  { label: "Υποστήριξη συναδέλφων", pct: 86 },
  { label: "Πρωτοβουλία", pct: 72 },
  { label: "Λειτουργική συνεργασία", pct: 88 },
];

export function TeamSection() {
  return (
    <div className="space-y-4">
      <SectionHeading title="Συνεισφορά στην ομάδα" description="Συναντήσεις, εκπαιδεύσεις, συνεργασία" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_TRACK.map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
            <Users className="h-8 w-8 text-violet-600 shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xl font-bold tabular-nums">{c.pct}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoringSection({ model }: ModelProps) {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Βαθμολόγηση απόδοσης"
        description={model.philosophyNote}
      />
      <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 text-sm text-violet-950">
        <p className="font-semibold">Σύνθετο σκορ οργανισμού: {model.organizationOverallScore}/100</p>
        <p className="mt-1 text-violet-900/90">
          Βάρη: τεκμηρίωση 22% · αξιοπιστία 22% · συνεργασία 16% · εποπτεία 14% · ροή 14% · ποιότητα 12%. Δεν
          περιλαμβάνουν έσοδα ή αριθμό συνεδριών.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {model.scoreDimensions.map((d) => (
          <ScoreDimensionCard key={d.id} dim={d} />
        ))}
      </div>
    </div>
  );
}

export function IncentivesSection({ model }: ModelProps) {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Κίνητρα & αναγνώριση"
        description="Μηνιαία / τριμηνιαία / ετήσια · οικονομικά & μη οικονομικά — με έγκριση διοίκησης"
      />
      <div className="space-y-2">
        {model.incentiveProposals.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-white p-4 shadow-sm flex flex-wrap justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-ink">{p.labelEl}</p>
              <p className="text-sm text-ink-muted">
                {p.therapistName} ·{" "}
                {p.period === "monthly" ? "Μηνιαίο" : p.period === "quarterly" ? "Τριμηνιαίο" : "Ετήσιο"} ·{" "}
                {p.type === "financial" ? "Οικονομικό" : p.type === "recognition" ? "Αναγνώριση" : "Μη οικονομικό"}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {p.basedOn.map((b) => (
                  <span key={b} className="rounded bg-surface-muted px-2 py-0.5 text-[10px] text-ink-muted">
                    {b}
                  </span>
                ))}
              </ul>
            </div>
            <div className="text-right text-sm">
              {model.showFinancialAmounts && p.amountEur != null ? (
                <p className="text-lg font-bold tabular-nums">€{p.amountEur}</p>
              ) : (
                <p className="text-ink-muted italic">Ποσό κρυφό (ρόλος)</p>
              )}
              <p className="mt-1 capitalize text-ink-muted">{p.status}</p>
              {p.supervisorRecommendation ? (
                <p className="text-xs text-emerald-700">Σύσταση επόπτη ✓</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManagementSection({ model }: ModelProps) {
  return (
    <div className="space-y-4">
      <SectionHeading title="Έλεγχοι διοίκησης" description="Override, έγκριση, audit log — HR visibility" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm space-y-3">
          <p className="text-sm font-bold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" aria-hidden />
            Χειροκίνητες προσαρμογές
          </p>
          {model.managementAdjustments.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">{a.therapistName}</p>
              <p className="tabular-nums">
                {a.previousScore} → {a.newScore}
              </p>
              <p className="text-ink-muted mt-1">{a.reason}</p>
              <p className="text-[10px] text-ink-muted mt-1">
                {a.adjustedBy} · {new Date(a.adjustedAt).toLocaleDateString("el-GR")}
              </p>
            </div>
          ))}
          <p className="text-xs text-ink-muted">Πεδίο εξήγησης υποχρεωτικό σε κάθε override (πρωτότυπο).</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm space-y-2">
          <p className="text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" aria-hidden />
            Audit log
          </p>
          {model.auditLog.map((e) => (
            <div key={e.id} className="border-b border-border pb-2 text-sm last:border-0">
              <p className="font-medium">{e.action}</p>
              <p className="text-ink-muted">{e.detail}</p>
              <p className="text-[10px] text-ink-muted">
                {e.actor} · {e.visibility}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SupervisorSection({ model }: ModelProps) {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Αξιολόγηση επόπτη"
        description="Ποιοτική ανατροφοδότηση, σχέδια δράσης, συστάσεις κινήτρων"
      />
      {model.supervisorEvaluations.map((ev) => (
        <div key={ev.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-bold text-ink">
              {ev.therapistName} — {ev.periodLabel}
            </p>
            <span className="text-xs text-ink-muted">{ev.supervisorName}</span>
          </div>
          <p className="mt-2 text-sm text-ink">{ev.qualitativeFeedback}</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-muted">
            {ev.recommendedActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs font-semibold text-violet-800">
            Σύσταση κινήτρου:{" "}
            {ev.incentiveRecommendation === "none"
              ? "Καμία"
              : ev.incentiveRecommendation === "recognition"
                ? "Αναγνώριση"
                : "Έλεγχος bonus"}
          </p>
        </div>
      ))}
    </div>
  );
}

export function TherapistSelfSection({ therapist }: { therapist: HrTherapistProfile }) {
  return (
    <div className="space-y-4">
      <SectionHeading title="Η απόδοσή μου" description="KPIs, υποχρεώσεις, δυνατά σημεία — χωρίς οικονομικά συναδέλφων" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
          <p className="text-sm font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Δυνατά σημεία
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {therapist.strengths.map((s) => (
              <li key={s}>
                <GrowthIndicator label={s} positive />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
          <p className="text-sm font-bold text-amber-900">Περιοχές ανάπτυξης</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-950">
            {therapist.growthAreas.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </div>
      {therapist.pendingObligations.length > 0 ? (
        <WarningAlert
          title="Εκκρεμείς υποχρεώσεις"
          detail={therapist.pendingObligations.join(" · ")}
        />
      ) : (
        <p className="text-sm text-emerald-700 font-medium">Καμία κρίσιμη εκκρεμότητα.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {therapist.achievements.map((a) => (
          <AchievementBadge key={a} label={a} />
        ))}
      </div>
    </div>
  );
}

export function RisksSection({ model }: ModelProps) {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Ανίχνευση κινδύνου"
        description="Burnout, υπερφόρτωση, πτώση τεκμηρίωσης, αποστασιοποίηση εποπτείας"
      />
      {model.burnoutRisks.length === 0 ? (
        <p className="text-sm text-ink-muted">Δεν εντοπίστηκαν σύνθετοι κίνδυνοι.</p>
      ) : (
        model.burnoutRisks.map((b) => (
          <div key={b.id} className="rounded-xl border border-red-200 bg-red-50/40 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-700" aria-hidden />
              <p className="font-bold text-ink">{b.therapistName}</p>
              <RiskBadge level={b.level} />
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {b.signals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs font-semibold text-ink-muted">Προτεινόμενες ενέργειες:</p>
            <ul className="text-sm text-ink-muted list-disc pl-5">
              {b.suggestedActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export { TherapistPicker };
