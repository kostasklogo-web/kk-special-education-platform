"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";
import { buildClinicalGoalsHref, buildClinicalSessionNotesHref } from "@/lib/clinical/child-profile/links";
import { sessionNoteStatusLabelEl } from "@/lib/ui/session-note-labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalPanel } from "../clinical-ui";

type Props = {
  childId: string;
  notes: SessionNoteListItem[];
  goals: TherapyGoalListItem[];
  canViewBodies: boolean;
};

export function ClinicalSessionNotesSection({ childId, notes, goals, canViewBodies }: Props) {
  const [therapistId, setTherapistId] = useState("all");
  const [discipline, setDiscipline] = useState("all");

  const goalTitles = useMemo(() => new Map(goals.map((g) => [g.id, g.title])), [goals]);

  const therapists = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of notes) {
      map.set(n.author_user_id, n.author_display_name ?? n.therapist_name ?? "—");
    }
    return [...map.entries()];
  }, [notes]);

  const disciplines = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of notes) {
      map.set(n.discipline_code, n.discipline_name_el ?? n.discipline_code);
    }
    return [...map.entries()];
  }, [notes]);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      if (therapistId !== "all" && n.author_user_id !== therapistId) return false;
      if (discipline !== "all" && n.discipline_code !== discipline) return false;
      return true;
    });
  }, [notes, therapistId, discipline]);

  const quickSummary = useMemo(() => {
    const recent = notes.filter((n) => n.status === "finalized").slice(0, 5);
    if (recent.length === 0) return null;
    const disciplines = [...new Set(recent.map((n) => n.discipline_name_el).filter(Boolean))];
    return {
      count: recent.length,
      disciplines: disciplines.join(", "),
      lastDate: recent[0]?.session_starts_at ?? recent[0]?.updated_at,
    };
  }, [notes]);

  return (
    <section className="space-y-4">
      {quickSummary && canViewBodies ? (
        <ClinicalPanel title="Γρήγορη κλινική σύνοψη">
          <p className="text-sm text-ink-muted">
            {quickSummary.count} πρόσφατες οριστικές σημειώσεις · {quickSummary.disciplines || "—"}
            {quickSummary.lastDate
              ? ` · τελευταία ${formatDateEl(quickSummary.lastDate.slice(0, 10))}`
              : ""}
          </p>
        </ClinicalPanel>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {therapists.length > 1 ? (
          <select
            value={therapistId}
            onChange={(e) => setTherapistId(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
            aria-label="Φίλτρο θεραπευτή"
          >
            <option value="all">Όλοι οι θεραπευτές</option>
            {therapists.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        ) : null}
        {disciplines.length > 1 ? (
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
            aria-label="Φίλτρο ειδικότητας"
          >
            <option value="all">Όλες οι ειδικότητες</option>
            {disciplines.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        ) : null}
        <Link
          href={buildClinicalSessionNotesHref(childId)}
          className="ml-auto rounded-lg border border-clinical-600 px-3 py-2 text-xs font-bold text-clinical-700"
        >
          Πλήρης λίστα →
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-ink-muted">
          Δεν υπάρχουν σημειώσεις.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.slice(0, 24).map((n) => (
            <li key={n.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-muted">
                <span className="font-semibold text-ink">
                  {formatDateEl((n.session_starts_at ?? n.updated_at).slice(0, 10))}
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  {n.visible_to_parent ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-900">
                      Γονέας
                    </span>
                  ) : (
                    <span className="rounded-full bg-clinical-50 px-2 py-0.5 text-[10px] font-bold text-clinical-800">
                      Κλινικό
                    </span>
                  )}
                  {n.visible_to_supervisor && !n.visible_to_parent ? (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900">
                      Επόπτης
                    </span>
                  ) : null}
                  <span>
                    {n.discipline_name_el} · {n.author_display_name ?? n.therapist_name} ·{" "}
                    {sessionNoteStatusLabelEl(n.status)}
                  </span>
                </span>
              </div>
              {canViewBodies ? (
                <p className="mt-2 text-sm text-ink leading-relaxed">
                  {(n.observations || n.goals_worked || n.body || "—").slice(0, 400)}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-ink-muted">Μη διαθέσιμο για τον ρόλο σας.</p>
              )}
              {n.linked_goal_ids.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1">
                  {n.linked_goal_ids.map((gid) => (
                    <li key={gid}>
                      <Link
                        href={buildClinicalGoalsHref(childId, gid)}
                        className="rounded-full bg-clinical-50 px-2 py-0.5 text-[10px] font-bold text-clinical-800 hover:underline"
                      >
                        {goalTitles.get(gid) ?? "Στόχος"}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : n.goals_worked.trim() ? (
                <p className="mt-2 text-xs text-ink-muted">
                  <span className="font-semibold">Εργάστηκαν:</span> {n.goals_worked.slice(0, 120)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
