"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ListTodo, UsersRound } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { canAccessSecretaryModule } from "@/lib/auth/secretary-permissions";
import { DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-demo-ids";

const STORAGE_RECENT = "platform-recent-children";

type RecentChild = { id: string; label: string; visitedAt: number };

const DEFAULT_RECENT: RecentChild[] = [
  { id: DEMO_CLINICAL_CHILD_ID, label: "Παπαδόπουλος Ν. (demo)", visitedAt: Date.now() },
  { id: "30000000-0000-4000-8000-000000000001", label: "Δημοτίου Ε.", visitedAt: Date.now() - 86_400_000 },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Tracks child profile visits for the landing quick panel. */
export function trackRecentChildVisit(childId: string, label: string) {
  if (typeof window === "undefined") return;
  const list = readJson<RecentChild[]>(STORAGE_RECENT, DEFAULT_RECENT);
  const next = [{ id: childId, label, visitedAt: Date.now() }, ...list.filter((c) => c.id !== childId)].slice(0, 6);
  localStorage.setItem(STORAGE_RECENT, JSON.stringify(next));
}

type Props = { roleCodes: RoleCode[] };

/**
 * Complements PlatformModuleCards — recent children & secretary tasks only (no duplicate hub links).
 */
export function PlatformQuickNavPanel({ roleCodes }: Props) {
  const [recent, setRecent] = useState<RecentChild[]>(DEFAULT_RECENT);
  const showSecretary = canAccessSecretaryModule(roleCodes);

  const hydrate = useCallback(() => {
    setRecent(readJson(STORAGE_RECENT, DEFAULT_RECENT));
  }, []);

  useEffect(() => {
    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, [hydrate]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {showSecretary ? (
        <section className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-violet-800" aria-hidden />
            <h2 className="text-sm font-semibold text-ink">Γραμματεία — εκκρεμότητες</h2>
          </div>
          <p className="text-sm text-ink-muted">
            Κύρια modules στην <strong className="font-medium text-ink">Γρήγορη πλοήγηση</strong> παραπάνω.
          </p>
          <Link
            href="/secretary/tasks"
            className="mt-3 inline-flex min-h-[44px] items-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-100"
          >
            Εργασίες γραμματείας →
          </Link>
        </section>
      ) : null}

      <section
        className={`rounded-2xl border border-border bg-surface-card p-4 shadow-shell sm:p-5 ${showSecretary ? "" : "lg:col-span-2"}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <UsersRound className="h-4 w-4 text-clinical-700" aria-hidden />
          <h2 className="text-sm font-semibold text-ink">Πρόσφατα παιδιά</h2>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((c) => (
            <li key={c.id}>
              <Link
                href={`/children/${c.id}`}
                className="flex min-h-[44px] flex-col justify-center rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50/30"
              >
                <span className="font-medium text-ink">{c.label}</span>
                <span className="text-[11px] text-ink-faint">Κλινικός φάκελος</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/children" className="mt-3 inline-block text-xs font-semibold text-clinical-700 hover:underline">
          Όλο το μητρώο παιδιών →
        </Link>
      </section>
    </div>
  );
}
