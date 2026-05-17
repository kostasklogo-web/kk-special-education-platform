"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import {
  isPlatformNavItemActive,
  platformNavGroupsForRoles,
  type PlatformNavGroup,
  type PlatformNavItem,
} from "@/lib/auth/platform-nav";

type PlatformSidebarProps = {
  roleCodes: RoleCode[];
};

export function PlatformSidebar({ roleCodes }: PlatformSidebarProps) {
  const pathname = usePathname();
  const groups = useMemo(() => platformNavGroupsForRoles(roleCodes), [roleCodes]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const g of groups) {
        const active = g.items.some((i) => isPlatformNavItemActive(pathname, i));
        if (active) next[g.id] = true;
        else if (next[g.id] === undefined) next[g.id] = g.defaultOpen ?? false;
      }
      return next;
    });
  }, [pathname, groups]);

  const linkClass = (item: PlatformNavItem) => {
    const active = isPlatformNavItemActive(pathname, item);
    return [
      "group flex min-h-[40px] items-center gap-2.5 rounded-lg border px-2.5 py-2 text-[13px] transition-colors",
      active
        ? "border-clinical-200/80 bg-gradient-to-r from-clinical-50 to-white font-semibold text-clinical-950 shadow-sm"
        : "border-transparent text-ink-muted hover:border-border hover:bg-surface-muted hover:text-ink",
    ].join(" ");
  };

  const renderItem = (item: PlatformNavItem) => {
    const Icon = item.icon;
    return (
      <Link key={item.id} href={item.href} className={linkClass(item)} onClick={() => setOpen(false)}>
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{item.label}</span>
          <span className="block truncate text-[10px] font-normal text-ink-faint group-hover:text-ink-muted">
            {item.helper}
          </span>
        </span>
        {item.badge === "mvp" ? (
          <span className="shrink-0 rounded bg-amber-100 px-1 py-0.5 text-[8px] font-bold uppercase text-amber-900">
            MVP
          </span>
        ) : null}
      </Link>
    );
  };

  const renderGroup = (group: PlatformNavGroup) => {
    const isSingle = group.items.length === 1 && group.id === "home";
    if (isSingle) {
      return (
        <div key={group.id} className="space-y-0.5">
          {group.items.map(renderItem)}
        </div>
      );
    }

    const isOpen = expanded[group.id] ?? group.defaultOpen ?? false;
    const GroupIcon = group.icon;
    const groupActive = group.items.some((i) => isPlatformNavItemActive(pathname, i));

    return (
      <div key={group.id} className="space-y-0.5">
        <button
          type="button"
          onClick={() => setExpanded((e) => ({ ...e, [group.id]: !isOpen }))}
          className={[
            "flex min-h-[40px] w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[13px] transition-colors",
            groupActive
              ? "border-clinical-100 bg-clinical-50/40 text-clinical-950"
              : "border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink",
          ].join(" ")}
          aria-expanded={isOpen}
        >
          <GroupIcon className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-semibold">{group.label}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {isOpen ? <div className="ml-1 space-y-0.5 border-l-2 border-clinical-100 pl-1.5">{group.items.map(renderItem)}</div> : null}
      </div>
    );
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-3 p-2.5" aria-label="Πλατφόρμα">
      {groups.map(renderGroup)}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-card shadow-shell md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="platform-sidebar"
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
        id="platform-sidebar"
        className={[
          "fixed bottom-0 left-0 top-0 z-30 flex w-[var(--shell-sidebar)] min-h-0 flex-col border-r border-border bg-surface-card shadow-shell transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-[3.75rem] shrink-0 items-center border-b border-border bg-gradient-to-r from-surface-card to-surface-muted/30 px-3">
          <Link href="/" className="min-w-0" onClick={() => setOpen(false)}>
            <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-clinical-700">
              Ειδική αγωγή & παρέμβαση
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold tracking-tight text-ink">Λειτουργική πλατφόρμα</span>
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{nav}</div>
        <div className="mt-auto shrink-0 border-t border-border bg-surface-muted/40 p-2.5 text-[10px] leading-relaxed text-ink-faint">
          Ενιαίο περιβάλλον λειτουργίας · Επίδειξη
        </div>
      </aside>
    </>
  );
}
