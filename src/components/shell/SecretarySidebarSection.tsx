"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Headset } from "lucide-react";
import type { RoleCode } from "@/lib/auth/roles";
import { secretaryNavItemsForRoles } from "@/lib/auth/secretary-nav";

type Props = {
  roleCodes: RoleCode[];
  onNavigate?: () => void;
};

export function SecretarySidebarSection({ roleCodes, onNavigate }: Props) {
  const pathname = usePathname();
  const items = useMemo(() => secretaryNavItemsForRoles(roleCodes), [roleCodes]);
  const inSecretary = pathname.startsWith("/secretary");
  const [open, setOpen] = useState(inSecretary);

  useEffect(() => {
    if (inSecretary) setOpen(true);
  }, [inSecretary]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "group flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors sm:py-2.5",
          inSecretary
            ? "border-clinical-200/80 bg-gradient-to-r from-clinical-50 to-white text-clinical-950 shadow-sm"
            : "border-transparent text-ink-muted hover:border-border hover:bg-surface-muted hover:text-ink",
        ].join(" ")}
        aria-expanded={open}
      >
        <Headset className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium">Γραμματεία</span>
          <span className="block truncate text-[11px] text-ink-faint group-hover:text-ink-muted">
            Ρεσεψιόν & διοίκηση
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul className="ml-2 space-y-0.5 border-l-2 border-clinical-100 pl-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={[
                    "group flex min-h-[40px] items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-clinical-50 font-semibold text-clinical-900"
                      : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    <span className="block truncate text-[10px] font-normal text-ink-faint">{item.helper}</span>
                  </span>
                  {item.implementation === "live" ? (
                    <span className="sr-only">Έτοιμο</span>
                  ) : (
                    <span
                      className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900"
                      title="Σε εξέλιξη"
                    >
                      MVP
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
