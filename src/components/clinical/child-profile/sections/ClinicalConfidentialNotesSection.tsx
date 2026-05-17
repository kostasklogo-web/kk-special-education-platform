import { getDemoConfidentialNotes } from "@/lib/demo/clinical-confidential-demo";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalBadge, ClinicalPanel } from "../clinical-ui";

const TIER_TONE: Record<string, "warning" | "violet" | "neutral"> = {
  confidential: "warning",
  supervisor_only: "violet",
  management_clinical: "neutral",
};

type Props = {
  childId: string;
  canViewConfidential: boolean;
};

export function ClinicalConfidentialNotesSection({ childId, canViewConfidential }: Props) {
  const notes = getDemoConfidentialNotes(childId);

  return (
    <section className="space-y-6">
      <ClinicalPanel title="Διαχωρισμός κλινικής πληροφορίας">
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-border/60 bg-white px-3 py-2">
            <p className="font-semibold text-ink">Γενικό κλινικό</p>
            <p className="mt-1 text-xs text-ink-muted">
              Στόχοι, σημειώσεις συνεδρίας, αναφορές — ορατά σε εξουσιοδοτημένη ομάδα.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">
            <p className="font-semibold text-amber-950">Εμπιστευτικό</p>
            <p className="mt-1 text-xs text-amber-900/80">
              Όχι σε γονείς · όχι σε γραμματεία · μόνο κλινικοί ρόλοι με άδεια.
            </p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50/40 px-3 py-2">
            <p className="font-semibold text-violet-950">Μόνο επόπτης / ΚΔ</p>
            <p className="mt-1 text-xs text-violet-900/80">
              Εσωτερικές συστάσεις, κίνδυνοι, σχόλια διοίκησης.
            </p>
          </div>
        </div>
      </ClinicalPanel>

      {!canViewConfidential ? (
        <ClinicalPanel title="Εμπιστευτικές σημειώσεις">
          <p className="text-sm text-ink-muted">
            Δεν έχετε άδεια προβολής εμπιστευτικών σημειώσεων για αυτό το παιδί. Επικοινωνήστε με
            τον επόπτη.
          </p>
        </ClinicalPanel>
      ) : (
        <ClinicalPanel title="Εμπιστευτικές σημειώσεις (πρωτότυπο)">
          <p className="mb-4 text-xs text-ink-muted">
            Τα παρακάτω δεν εμφανίζονται σε γονικό portal ούτε σε λειτουργικά modules (πληρωμές,
            γραμματεία).
          </p>
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ClinicalBadge tone={TIER_TONE[n.tier] ?? "warning"}>{n.tierLabelEl}</ClinicalBadge>
                  <span className="text-xs text-ink-muted">
                    {formatDateEl(n.occurredAtYmd)} · {n.authorLabel}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-ink">{n.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{n.excerpt}</p>
              </li>
            ))}
          </ul>
        </ClinicalPanel>
      )}
    </section>
  );
}
