"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  linkChildToParentAction,
  unlinkParentRelationshipAction,
  type ParentFormState,
} from "@/app/(shell)/parents/actions";
import type { LinkedChildSummary } from "@/lib/data/parents/types";
import { relationshipLabelEl } from "@/lib/ui/parent-relationship-labels";

const initial: ParentFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function LinkSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700 disabled:opacity-60"
    >
      {pending ? "Σύνδεση…" : "Σύνδεση παιδιού"}
    </button>
  );
}

function UnlinkSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
    >
      {pending ? "…" : "Αφαίρεση σύνδεσης"}
    </button>
  );
}

type ParentChildrenPanelProps = {
  parentId: string;
  links: LinkedChildSummary[];
  eligibleChildren: { id: string; first_name: string; last_name: string }[];
  canMutate: boolean;
};

export function ParentChildrenPanel({
  parentId,
  links,
  eligibleChildren,
  canMutate,
}: ParentChildrenPanelProps) {
  const router = useRouter();
  const [linkState, linkAction] = useFormState(linkChildToParentAction, initial);

  useEffect(() => {
    if (linkState.ok) {
      router.refresh();
    }
  }, [linkState.ok, router]);

  return (
    <div className="space-y-6">
      {links.length === 0 ? (
        <p className="text-sm text-ink-muted">Δεν υπάρχουν συνδεδεμένα παιδιά.</p>
      ) : (
        <ul className="space-y-3">
          {links.map((l) => (
            <li
              key={l.link_id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">
                  <Link href={`/children/${l.child.id}`} className="text-clinical-800 hover:underline">
                    {l.child.first_name} {l.child.last_name}
                  </Link>
                  {l.is_primary ? (
                    <span className="ml-2 text-xs font-normal text-clinical-700">(Κύριος)</span>
                  ) : null}
                </p>
                <p className="text-xs text-ink-faint">Σχέση: {relationshipLabelEl(l.relationship)}</p>
              </div>
              {canMutate ? <UnlinkRelationshipForm relationshipId={l.link_id} /> : null}
            </li>
          ))}
        </ul>
      )}

      {canMutate ? (
        <div className="rounded-lg border border-dashed border-clinical-200 bg-clinical-50/30 p-4">
          <h3 className="text-sm font-semibold text-ink">Σύνδεση υπάρχοντος παιδιού</h3>
          {linkState.message && !linkState.ok ? (
            <p className="mt-2 text-sm text-red-800" role="alert">
              {linkState.message}
            </p>
          ) : null}
          {linkState.ok ? (
            <p className="mt-2 text-sm text-emerald-800" role="status">
              {linkState.message}
            </p>
          ) : null}
          {eligibleChildren.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">
              Δεν υπάρχουν άλλα διαθέσιμα παιδιά στον οργανισμό για σύνδεση.
            </p>
          ) : (
            <form action={linkAction} className="mt-4 space-y-3">
              <input type="hidden" name="parent_id" value={parentId} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="child_id" className="mb-1 block text-xs font-medium text-ink-muted">
                    Παιδί
                  </label>
                  <select
                    id="child_id"
                    name="child_id"
                    required
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">— Επιλέξτε —</option>
                    {eligibleChildren.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.last_name} {c.first_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="relationship" className="mb-1 block text-xs font-medium text-ink-muted">
                    Σχέση
                  </label>
                  <select
                    id="relationship"
                    name="relationship"
                    defaultValue="guardian"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="mother">Μητέρα</option>
                    <option value="father">Πατέρας</option>
                    <option value="guardian">Κηδεμόνας</option>
                    <option value="other">Άλλο</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="is_primary" className="rounded border-border" />
                Κύριος κηδεμόνας για αυτό το παιδί
              </label>
              <LinkSubmit />
            </form>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-faint">Μόνο προβολή συνδέσεων (χωρίς δικαίωμα επεξεργασίας).</p>
      )}
    </div>
  );
}

function UnlinkRelationshipForm({ relationshipId }: { relationshipId: string }) {
  const router = useRouter();
  const [state, formAction] = useFormState(unlinkParentRelationshipAction, initial);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="shrink-0">
      <input type="hidden" name="relationship_id" value={relationshipId} />
      {state.message && !state.ok ? (
        <p className="mb-1 text-xs text-red-700">{state.message}</p>
      ) : null}
      <UnlinkSubmit />
    </form>
  );
}
