import { collectDemoLoadDiagnostics } from "@/lib/dev/demo-load-diagnostics";

export async function DemoDebugPanel() {
  const d = await collectDemoLoadDiagnostics();

  return (
    <section
      className="mt-8 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950 shadow-sm"
      aria-label="Διαγνωστικά demo / Supabase"
    >
      <p className="mb-2 font-semibold uppercase tracking-wide text-amber-900">
        Διαγνωστικά φόρτωσης (demo / ανάπτυξη μόνο)
      </p>
      <ul className="space-y-1 font-mono leading-relaxed">
        <li>
          <span className="text-amber-800">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
          {d.supabaseUrlConfigured ? "yes" : "no"}
        </li>
        <li>
          <span className="text-amber-800">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{" "}
          {d.supabaseAnonKeyConfigured ? "yes (value hidden)" : "no"}
        </li>
        <li>
          <span className="text-amber-800">Auth gating disabled:</span>{" "}
          {d.authGatingDisabled ? "yes" : "no"}
        </li>
        <li>
          <span className="text-amber-800">Demo organization id (resolved):</span> {d.demoOrganizationId}
        </li>
        <li>
          <span className="text-amber-800">organizations row exists:</span>{" "}
          {d.organizationRowPresent === null
            ? "unknown (lookup error)"
            : d.organizationRowPresent
              ? "yes"
              : "no"}
        </li>
        {d.organizationLookupError ? (
          <li className="text-red-800">
            <span className="text-amber-800">organizations lookup:</span> {d.organizationLookupError}
          </li>
        ) : null}
        <li className="pt-2 font-sans text-[11px] text-amber-900">
          Σε λειτουργία demo, ο οργανισμός επιλύεται σταθερά από DEMO_ORGANIZATION_ID / seed· δεν απαιτείται{" "}
          <code className="rounded bg-amber-100/80 px-1">user_roles</code> για το org id.
        </li>
      </ul>

      {d.dashboardOverviewMessages.length > 0 ? (
        <div className="mt-3 border-t border-amber-200 pt-2">
          <p className="mb-1 font-semibold text-amber-900">Μηνύματα dashboard / queries (εφαρμογή)</p>
          <ul className="list-inside list-disc space-y-1 font-mono text-[11px]">
            {d.dashboardOverviewMessages.map((m, i) => (
              <li key={`dash-msg-${i}`}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {d.postgrestErrors.length > 0 ? (
        <div className="mt-3 border-t border-amber-200 pt-2">
          <p className="mb-1 font-semibold text-amber-900">PostgREST / DB (τεχνικά)</p>
          <ul className="space-y-2 font-mono text-[11px]">
            {d.postgrestErrors.map((row, i) => (
              <li key={`pg-${i}-${row.area}`}>
                <span className="text-amber-800">{row.area}:</span> {row.technical}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
