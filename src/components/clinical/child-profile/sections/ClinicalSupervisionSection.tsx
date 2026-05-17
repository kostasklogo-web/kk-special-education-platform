import Link from "next/link";
import type { SupervisionBundle, SupervisionEntry } from "@/lib/clinical/child-profile/types";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalBadge, ClinicalEmpty, ClinicalPanel, ROLE_LABELS_EL } from "../clinical-ui";

type Props = {
  supervision: SupervisionBundle;
  canViewDirectorComments: boolean;
};

export function ClinicalSupervisionSection({ supervision, canViewDirectorComments }: Props) {
  const directorComments = canViewDirectorComments ? supervision.directorComments : [];

  return (
    <section id="supervision" className="space-y-6">
      <p className="text-sm text-ink-muted">
        Εποπτεία και κλινική καθοδήγηση — συστάσεις, σχέδια δράσης θεραπευτών, σχόλια διοίκησης όπου
        εφαρμόζεται.
      </p>

      <SupervisionList title="Συστάσεις εποπτείας" entries={supervision.recommendations} />
      <SupervisionList title="Σχέδια δράσης θεραπευτών" entries={supervision.actionPlans} />
      {canViewDirectorComments ? (
        <SupervisionList title="Σχόλια κλινικού διευθυντή" entries={directorComments} />
      ) : (
        <ClinicalPanel title="Σχόλια κλινικού διευθυντή">
          <ClinicalEmpty>Δεν εμφανίζονται για τον ρόλο σας.</ClinicalEmpty>
        </ClinicalPanel>
      )}
    </section>
  );
}

function SupervisionList({ title, entries }: { title: string; entries: SupervisionEntry[] }) {
  return (
    <ClinicalPanel title={title}>
      {entries.length === 0 ? (
        <ClinicalEmpty>—</ClinicalEmpty>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg border border-violet-100 bg-violet-50/30 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ClinicalBadge tone="violet">{ROLE_LABELS_EL[e.audience]}</ClinicalBadge>
                <time className="text-xs text-ink-muted" dateTime={e.occurredAt}>
                  {formatDateEl(e.occurredAt.slice(0, 10))}
                </time>
              </div>
              <p className="mt-2 font-semibold text-ink">{e.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{e.summary}</p>
              {e.therapistName ? (
                <p className="mt-1 text-xs text-ink-faint">Θεραπευτής: {e.therapistName}</p>
              ) : null}
              {e.href ? (
                <Link href={e.href} className="mt-2 inline-block text-xs font-bold text-violet-800">
                  Λεπτομέρειες →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </ClinicalPanel>
  );
}
