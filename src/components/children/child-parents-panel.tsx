"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  linkParentToChildAction,
  unlinkParentRelationshipAction,
  type ParentFormState,
} from "@/app/(shell)/parents/actions";
import type { ParentLinkRow } from "@/lib/data/children/types";
import type { ParentSummary } from "@/lib/data/parents/types";
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
      {pending ? "Σύνδεση…" : "Σύνδεση γονέα"}
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

type ChildParentsPanelProps = {
  childId: string;
  links: ParentLinkRow[];
  eligibleParents: ParentSummary[];
  canMutate: boolean;
};

export function ChildParentsPanel({
  childId,
  links,
  eligibleParents,
  canMutate,
}: ChildParentsPanelProps) {
  const router = useRouter();
  const [linkState, linkAction] = useFormState(linkParentToChildAction, initial);

  useEffect(() => {
    if (linkState.ok) {
      router.refresh();
    }
  }, [linkState.ok, router]);

  return (
    <div className="space-y-6">
      {links.length === 0 ? (
        <p className="text-sm text-ink-muted">Δεν υπάρχουν συνδεδεμένοι γονείς για αυτό το παιδί.</p>
      ) : (
        <ul className="space-y-3">
          {links.map((l) => (
            <li
              key={l.relationship_id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">
                  <Link href={`/parents/${l.parent.id}`} className="text-clinical-800 hover:underline">
                    {l.parent.first_name} {l.parent.last_name}
                  </Link>
                  {l.is_primary ? (
                    <span className="ml-2 text-xs font-normal text-clinical-700">(Κύριος)</span>
                  ) : null}
                </p>
                <p className="text-xs text-ink-faint">Σχέση: {relationshipLabelEl(l.relationship)}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Email: {l.parent.email ?? "—"} · Τηλέφωνο: {l.parent.phone ?? "—"}
                </p>
              </div>
              {canMutate ? (
                <UnlinkRelationshipForm relationshipId={l.relationship_id} />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canMutate ? (
        <div className="rounded-lg border border-dashed border-clinical-200 bg-clinical-50/30 p-4">
          <h3 className="text-sm font-semibold text-ink">Σύνδεση υπάρχοντος γονέα</h3>
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
          {eligibleParents.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">
              Δεν υπάρχουν άλλοι διαθέσιμοι γονείς στον οργανισμό για σύνδεση. Δημιουργήστε νέο προφίλ γονέα.
            </p>
          ) : (
            <form action={linkAction} className="mt-4 space-y-3">
              <input type="hidden" name="child_id" value={childId} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="parent_id" className="mb-1 block text-xs font-medium text-ink-muted">
                    Γονέας
                  </label>
                  <select
                    id="parent_id"
                    name="parent_id"
                    required
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">— Επιλέξτε —</option>
                    {eligibleParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.last_name} {p.first_name}
                        {p.email ? ` (${p.email})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="relationship" className="mb-1 block text-xs font-medium text-ink-muted">
                    Σχέση με παιδί
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
                Κύριος κηδεμόνας
              </label>
              <LinkSubmit />
            </form>
          )}
          <div className="mt-4 border-t border-clinical-100 pt-4">
            <Link
              href={`/parents/new?linkChildId=${childId}`}
              className="text-sm font-medium text-clinical-800 hover:underline"
            >
              + Δημιουργία νέου γονέα και σύνδεση με αυτό το παιδί
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-faint">
          Η σύνδεση ή αποσύνδεση γονέων απαιτεί ρόλο γραμματείας ή διοίκησης.
        </p>
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
