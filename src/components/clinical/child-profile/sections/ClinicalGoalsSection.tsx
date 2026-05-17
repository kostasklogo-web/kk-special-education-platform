"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GoalProgressSummary } from "@/lib/clinical/child-profile/types";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";
import { buildClinicalGoalsHref } from "@/lib/clinical/child-profile/links";
import { therapyGoalPriorityLabelEl, therapyGoalStatusLabelEl } from "@/lib/ui/therapy-goal-labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalBadge, ClinicalEmpty, ClinicalProgressBar } from "../clinical-ui";

type Props = {
  childId: string;
  goals: TherapyGoalListItem[];
  goalProgress: GoalProgressSummary[];
  canWrite: boolean;
};

export function ClinicalGoalsSection({ childId, goals, goalProgress, canWrite }: Props) {
  const [discipline, setDiscipline] = useState("all");
  const [view, setView] = useState<"active" | "completed" | "interdisciplinary">("active");

  const progressById = useMemo(
    () => new Map(goalProgress.map((p) => [p.goalId, p])),
    [goalProgress]
  );

  const disciplines = useMemo(() => {
    const set = new Map<string, string>();
    for (const g of goals) {
      set.set(g.discipline_code, g.discipline_name_el ?? g.discipline_code);
    }
    return [...set.entries()];
  }, [goals]);

  const filtered = useMemo(() => {
    let pool = goals;
    if (view === "active") {
      pool = goals.filter((g) => ["active", "in_progress", "on_hold"].includes(g.status));
    } else if (view === "completed") {
      pool = goals.filter((g) => g.status === "met");
    } else {
      pool = goals.filter((g) => progressById.get(g.id)?.isInterdisciplinary);
    }
    if (discipline !== "all") {
      pool = pool.filter((g) => g.discipline_code === discipline);
    }
    return pool;
  }, [goals, view, discipline, progressById]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle label="Ενεργοί" active={view === "active"} onClick={() => setView("active")} />
        <ViewToggle label="Ολοκληρωμένοι" active={view === "completed"} onClick={() => setView("completed")} />
        <ViewToggle
          label="Διεπιστημονικοί"
          active={view === "interdisciplinary"}
          onClick={() => setView("interdisciplinary")}
        />
        {canWrite ? (
          <Link
            href={`/therapy-goals/new?child=${encodeURIComponent(childId)}`}
            className="ml-auto rounded-lg bg-clinical-600 px-3 py-2 text-xs font-bold text-white"
          >
            + Νέος στόχος
          </Link>
        ) : null}
      </div>

      {disciplines.length > 1 ? (
        <select
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
          aria-label="Ειδικότητα"
        >
          <option value="all">Όλες οι ειδικότητες</option>
          {disciplines.map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      ) : null}

      {filtered.length === 0 ? (
        <ClinicalEmpty>Δεν υπάρχουν στόχοι σε αυτή την προβολή.</ClinicalEmpty>
      ) : (
        <ul className="space-y-3">
          {filtered.map((g) => {
            const p = progressById.get(g.id);
            return (
              <li key={g.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link href={buildClinicalGoalsHref(childId, g.id)} className="font-semibold text-ink hover:underline">
                      {g.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {g.discipline_name_el} · {therapyGoalStatusLabelEl(g.status)} ·{" "}
                      {therapyGoalPriorityLabelEl(g.priority)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {p?.isInterdisciplinary ? <ClinicalBadge tone="violet">Διεπισθ.</ClinicalBadge> : null}
                    {p?.linkedSessionNoteCount ? (
                      <ClinicalBadge tone="clinical">{p.linkedSessionNoteCount} σημ.</ClinicalBadge>
                    ) : null}
                  </div>
                </div>
                {p ? (
                  <div className="mt-3">
                    <ClinicalProgressBar percent={p.progressPercent} label="Εκτίμηση προόδου" />
                    {p.measurableIndicator ? (
                      <p className="mt-2 text-xs text-ink-muted">
                        <span className="font-semibold text-ink">Μέτρηση:</span> {p.measurableIndicator}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {g.target_completion_date ? (
                  <p className="mt-2 text-xs text-ink-faint">
                    Στόχος ολοκλήρωσης: {formatDateEl(g.target_completion_date)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ViewToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-clinical-600 text-white" : "border border-border text-ink-muted hover:bg-surface-muted"
      }`}
    >
      {label}
    </button>
  );
}
