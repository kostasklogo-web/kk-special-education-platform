import type { ClinicalCollaborationBundle } from "@/lib/clinical/child-profile/types";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalEmpty, ClinicalPanel } from "../clinical-ui";

export function ClinicalInterdisciplinarySection({
  collaboration,
}: {
  collaboration: ClinicalCollaborationBundle;
}) {
  return (
    <section id="interdisciplinary" className="space-y-6">
      <p className="text-sm text-ink-muted">
        Διεπιπληρωματικός συντονισμός — παρατηρήσεις, κοινές ανησυχίες, κλινικές αποφάσεις και σχολική
        συνεργασία (κλινικό πλαίσιο μόνο).
      </p>

      <CollaborationList
        title="Διασταυρούμενες παρατηρήσεις"
        items={collaboration.crossDisciplineObservations.map((o) => ({
          id: o.id,
          date: o.occurredAt,
          primary: o.disciplineLabel,
          secondary: o.therapistName,
          body: o.excerpt,
        }))}
      />

      <CollaborationList
        title="Κοινές ανησυχίες"
        items={collaboration.sharedConcerns.map((c) => ({
          id: c.id,
          date: c.occurredAt,
          primary: c.disciplineLabel,
          secondary: c.therapistName,
          body: c.excerpt,
        }))}
        tone="warning"
      />

      <CollaborationList
        title="Κλινικές αποφάσεις"
        items={collaboration.clinicalDecisions.map((d) => ({
          id: d.id,
          date: d.occurredAt,
          primary: d.disciplineLabel,
          secondary: d.therapistName,
          body: d.excerpt,
        }))}
        tone="clinical"
      />

      <CollaborationList
        title="Σημειώσεις συνεργασίας"
        items={collaboration.collaborationNotes.map((n) => ({
          id: n.id,
          date: n.occurredAt,
          primary: n.disciplineLabel,
          secondary: n.therapistName,
          body: n.excerpt,
        }))}
      />

      <ClinicalPanel title="Συνεργασία με σχολείο (κλινικά σχετικό)">
        {collaboration.schoolCollaborationNotes.length === 0 ? (
          <ClinicalEmpty>Δεν έχουν καταγραφεί κλινικές σημειώσεις σχολείου.</ClinicalEmpty>
        ) : (
          <ul className="space-y-2 text-sm">
            {collaboration.schoolCollaborationNotes.map((n) => (
              <li key={n.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
                <time className="text-xs font-semibold text-emerald-900" dateTime={n.occurredAt}>
                  {formatDateEl(n.occurredAt.slice(0, 10))}
                </time>
                <p className="mt-1 text-ink-muted">{n.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </ClinicalPanel>
    </section>
  );
}

function CollaborationList({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: { id: string; date: string; primary: string; secondary: string | null; body: string }[];
  tone?: "neutral" | "warning" | "clinical";
}) {
  const border =
    tone === "warning"
      ? "border-amber-100"
      : tone === "clinical"
        ? "border-clinical-100"
        : "border-border";

  return (
    <ClinicalPanel title={title}>
      {items.length === 0 ? (
        <ClinicalEmpty>—</ClinicalEmpty>
      ) : (
        <ul className={`space-y-2 text-sm`}>
          {items.map((item) => (
            <li key={item.id} className={`rounded-lg border ${border} px-3 py-2`}>
              <div className="flex flex-wrap justify-between gap-1 text-xs font-semibold text-ink">
                <span>{item.primary}</span>
                <time dateTime={item.date}>{formatDateEl(item.date.slice(0, 10))}</time>
              </div>
              {item.secondary ? <p className="text-xs text-ink-faint">{item.secondary}</p> : null}
              <p className="mt-1 text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </ClinicalPanel>
  );
}
