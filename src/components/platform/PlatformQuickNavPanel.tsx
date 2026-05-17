"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Clock, Pin, Star, UsersRound } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { canAccessSecretaryModule } from "@/lib/auth/secretary-permissions";
import { canViewManagementAnalytics } from "@/lib/management/analytics/permissions";
import { canViewOperationsIntelligence } from "@/lib/management/operations-intelligence/permissions";
import { canViewFinancesModule } from "@/lib/secretary/finances/permissions";
import { DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-demo-ids";

const STORAGE_RECENT = "platform-recent-children";
const STORAGE_FAVORITES = "platform-favorite-modules";

type RecentChild = { id: string; label: string; visitedAt: number };

type FavoriteModule = { href: string; label: string };

const DEFAULT_FAVORITES: FavoriteModule[] = [
  { href: "/schedule/control-center", label: "Πίνακας προγράμματος" },
  { href: "/children", label: "Παιδιά" },
  { href: "/secretary/dashboard", label: "Γραμματεία" },
  { href: "/secretary/finances", label: "Οικονομικά" },
  { href: "/management/analytics", label: "Αναλυτικά" },
  { href: "/management/operations-intelligence", label: "Ops Intelligence" },
];

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
function favoritesForRoles(favorites: FavoriteModule[], roleCodes: RoleCode[]): FavoriteModule[] {
  return favorites.filter((f) => {
    if (f.href === "/secretary/finances") return canViewFinancesModule(roleCodes);
    if (f.href.startsWith("/secretary/")) return canAccessSecretaryModule(roleCodes);
    if (f.href.startsWith("/management/analytics")) return canViewManagementAnalytics(roleCodes);
    if (f.href.startsWith("/management/operations-intelligence")) {
      return canViewOperationsIntelligence(roleCodes);
    }
    return true;
  });
}

export function trackRecentChildVisit(childId: string, label: string) {
  if (typeof window === "undefined") return;
  const list = readJson<RecentChild[]>(STORAGE_RECENT, DEFAULT_RECENT);
  const next = [{ id: childId, label, visitedAt: Date.now() }, ...list.filter((c) => c.id !== childId)].slice(0, 6);
  localStorage.setItem(STORAGE_RECENT, JSON.stringify(next));
}

type Props = { roleCodes: RoleCode[] };

export function PlatformQuickNavPanel({ roleCodes }: Props) {
  const [recent, setRecent] = useState<RecentChild[]>(DEFAULT_RECENT);
  const [favorites, setFavorites] = useState<FavoriteModule[]>(DEFAULT_FAVORITES);
  const visibleFavorites = favoritesForRoles(favorites, roleCodes);
  const showSecretary = canAccessSecretaryModule(roleCodes);
  const showFinances = canViewFinancesModule(roleCodes);
  const showAnalytics = canViewManagementAnalytics(roleCodes);
  const showOpsIntel = canViewOperationsIntelligence(roleCodes);

  const hydrate = useCallback(() => {
    setRecent(readJson(STORAGE_RECENT, DEFAULT_RECENT));
    setFavorites(readJson(STORAGE_FAVORITES, DEFAULT_FAVORITES));
  }, []);

  useEffect(() => {
    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, [hydrate]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-clinical-700" aria-hidden />
          <h2 className="text-sm font-semibold text-ink">Εστίαση σήμερα</h2>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between gap-2 rounded-lg border border-clinical-100 bg-clinical-50/50 px-3 py-2">
            <span className="text-ink-muted">Πρόγραμμα</span>
            <Link href="/schedule/control-center" className="font-semibold text-clinical-800 hover:underline">
              Κεντρικός πίνακας →
            </Link>
          </li>
          {showSecretary ? (
            <li className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span className="text-ink-muted">Γραμματεία</span>
              <Link href="/secretary/dashboard" className="font-semibold text-ink hover:underline">
                Πίνακας γραμματείας →
              </Link>
            </li>
          ) : null}
          {showFinances ? (
            <li className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span className="text-ink-muted">Οικονομικά</span>
              <Link href="/secretary/finances" className="font-semibold text-ink hover:underline">
                Οικονομικά κέντρα →
              </Link>
            </li>
          ) : null}
          <li className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <span className="text-ink-muted">Παιδιά</span>
            <Link href="/children" className="font-semibold text-ink hover:underline">
              Μητρώο →
            </Link>
          </li>
          {showAnalytics ? (
            <li className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span className="text-ink-muted">Διοίκηση</span>
              <Link href="/management/analytics" className="font-semibold text-ink hover:underline">
                Αναλυτικά →
              </Link>
            </li>
          ) : null}
          {showOpsIntel ? (
            <li className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span className="text-ink-muted">Ops Intelligence</span>
              <Link href="/management/operations-intelligence" className="font-semibold text-ink hover:underline">
                Λειτουργική intelligence →
              </Link>
            </li>
          ) : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-600" aria-hidden />
          <h2 className="text-sm font-semibold text-ink">Αγαπημένα modules</h2>
        </div>
        <ul className="flex flex-wrap gap-2">
          {visibleFavorites.map((f) => (
            <li key={f.href}>
              <Link
                href={f.href}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-ink shadow-sm hover:border-clinical-200 hover:bg-clinical-50/40"
              >
                <Pin className="h-3 w-3 text-clinical-600" aria-hidden />
                {f.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell sm:p-5 lg:col-span-2">
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
