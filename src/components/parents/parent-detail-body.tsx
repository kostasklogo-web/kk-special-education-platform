import Link from "next/link";
import { ProfileSectionCard } from "@/components/children/profile-section-card";
import { ParentChildrenPanel } from "@/components/parents/parent-children-panel";
import type { LinkedChildSummary, ParentRow } from "@/lib/data/parents/types";

type ParentDetailBodyProps = {
  parent: ParentRow;
  links: LinkedChildSummary[];
  eligibleChildren: { id: string; first_name: string; last_name: string }[];
  canMutate: boolean;
  readOnlyNotice?: boolean;
};

export function ParentDetailBody({
  parent,
  links,
  eligibleChildren,
  canMutate,
  readOnlyNotice,
}: ParentDetailBodyProps) {
  return (
    <div className="space-y-6">
      {readOnlyNotice ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <strong>Προβολή μόνο:</strong> Ο ρόλος σας επιτρέπει ανάγνωση (επόπτης / θεραπευτής). Η επεξεργασία απαιτεί
          γραμματεία ή διοίκηση.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Προφίλ γονέα / κηδεμόνα</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {parent.first_name} {parent.last_name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/parents"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            ← Λίστα
          </Link>
          {canMutate ? (
            <Link
              href={`/parents/${parent.id}/edit`}
              className="rounded-lg bg-clinical-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Επεξεργασία
            </Link>
          ) : null}
        </div>
      </div>

      <ProfileSectionCard
        title="Στοιχεία επικοινωνίας"
        description="Στοιχεία επικοινωνίας και σημειώσεις διαχείρισης (όχι κλινικό ιστορικό)."
      >
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-faint">Τηλέφωνο</dt>
            <dd className="text-ink">{parent.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Email</dt>
            <dd className="break-all text-ink">{parent.email ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-ink-faint">Διεύθυνση</dt>
            <dd className="whitespace-pre-wrap text-ink">{parent.address_line ?? "—"}</dd>
          </div>
          {parent.notes ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-ink-faint">Σημειώσεις</dt>
              <dd className="whitespace-pre-wrap text-ink">{parent.notes}</dd>
            </div>
          ) : null}
        </dl>
      </ProfileSectionCard>

      <ProfileSectionCard
        title="Συνδεδεμένα παιδιά"
        description="Ένας γονέας μπορεί να συνδέεται με πολλά παιδιά· κάθε σύνδεση έχει τύπο σχέσης."
      >
        <ParentChildrenPanel
          parentId={parent.id}
          links={links}
          eligibleChildren={eligibleChildren}
          canMutate={canMutate}
        />
      </ProfileSectionCard>
    </div>
  );
}
