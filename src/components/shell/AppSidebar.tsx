"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { navItemsForRoles } from "@/lib/auth/nav-config";

type AppSidebarProps = {
  roleCodes: RoleCode[];
};

const NAV_HELPERS: Record<string, string> = {
  "/dashboard": "Σύνοψη ημέρας",
  "/children": "Φάκελοι ωφελούμενων",
  "/parents": "Οικογένειες",
  "/staff": "Ομάδα κέντρου",
  "/schedule": "Συνεδρίες",
  "/attendance": "Παρουσίες",
  "/therapy-goals": "Κλινικοί στόχοι",
  "/session-notes": "Σημειώσεις",
  "/reports": "MVP αναφορές",
  "/rooms": "Αίθουσες",
  "/settings": "Κέντρα & ρυθμίσεις",
};

const WORKFLOW_NAV = new Set(["/children", "/parents", "/schedule", "/attendance", "/therapy-goals", "/session-notes"]);
const ADMIN_NAV = new Set(["/staff", "/rooms", "/settings", "/reports"]);

export function AppSidebar({ roleCodes }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = useMemo(() => navItemsForRoles(roleCodes), [roleCodes]);
  const primaryItems = items.filter((item) => item.href === "/dashboard");
  const workflowItems = items.filter((item) => WORKFLOW_NAV.has(item.href));
  const adminItems = items.filter((item) => ADMIN_NAV.has(item.href));

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return [
      "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
      active
        ? "border-clinical-100 bg-clinical-50 text-clinical-900 shadow-sm"
        : "border-transparent text-ink-muted hover:border-border hover:bg-surface-muted hover:text-ink",
    ].join(" ");
  };

  const renderSection = (label: string, sectionItems: typeof items) => {
    if (sectionItems.length === 0) return null;
    return (
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">{label}</p>
        {sectionItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            onClick={() => setOpen(false)}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span className="min-w-0">
              <span className="block truncate font-medium">{item.label}</span>
              <span className="block truncate text-[11px] text-ink-faint group-hover:text-ink-muted">
                {NAV_HELPERS[item.href]}
              </span>
            </span>
          </Link>
        );
        })}
      </div>
    );
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-5 p-3" aria-label="Κύρια πλοήγηση">
      {renderSection("Κέντρο", primaryItems)}
      {renderSection("Ροή MVP", workflowItems)}
      {renderSection("Λειτουργία", adminItems)}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-card shadow-shell md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="app-sidebar"
        aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-ink/20 backdrop-blur-sm md:hidden"
          aria-label="Κλείσιμο μενού"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={[
          "fixed bottom-0 left-0 top-0 z-30 flex w-[var(--shell-sidebar)] flex-col border-r border-border bg-surface-card shadow-shell transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/dashboard" className="min-w-0" onClick={() => setOpen(false)}>
            <span className="block truncate font-semibold tracking-tight text-ink">Κέντρο Ειδικής Αγωγής</span>
            <span className="block text-xs text-ink-muted">MVP επιχειρησιακή πλατφόρμα</span>
          </Link>
        </div>
        {nav}
        <div className="mt-auto border-t border-border p-3 text-[11px] leading-relaxed text-ink-faint">
          Περιβάλλον ανάπτυξης · Χρησιμοποιείτε μόνο demo ή ανωνυμοποιημένα δεδομένα.
        </div>
      </aside>
    </>
  );
}
