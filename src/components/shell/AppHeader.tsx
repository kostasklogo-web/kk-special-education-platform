import { RoleBadge } from "@/components/shell/RoleBadge";
import type { RoleCode } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth/actions";

type AppHeaderProps = {
  roleCodes: RoleCode[];
  userEmail?: string | null;
};

export function AppHeader({ roleCodes, userEmail }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-surface-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-card/80 md:px-8">
      <div className="min-w-0 flex-1 pl-14 md:pl-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-faint">
          Ημερήσια λειτουργία κέντρου
        </p>
        {userEmail ? (
          <p className="truncate text-sm text-ink-muted" title={userEmail}>
            {userEmail}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
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
