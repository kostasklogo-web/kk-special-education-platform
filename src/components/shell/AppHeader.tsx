import Link from "next/link";
import { RoleBadge } from "@/components/shell/RoleBadge";
import type { RoleCode } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth/actions";

type AppHeaderProps = {
  roleCodes: RoleCode[];
  userEmail?: string | null;
};

export function AppHeader({ roleCodes, userEmail }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-4 border-b border-border bg-surface-card/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-surface-card/80 md:px-6">
      <div className="min-w-0 flex-1 pl-12 md:pl-0">
        <Link href="/" className="block min-w-0 hover:opacity-90">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-clinical-700">
            Λειτουργική πλατφόρμα
          </p>
          <p className="truncate text-sm font-medium text-ink">Κεντρικός πίνακας λειτουργίας</p>
        </Link>
        {userEmail ? (
          <p className="truncate text-xs text-ink-muted" title={userEmail}>
            {userEmail}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
            Dev auth off
          </span>
          <RoleBadge roleCodes={roleCodes} />
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-600"
          >
            Αποσύνδεση
          </button>
        </form>
      </div>
    </header>
  );
}
