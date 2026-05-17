"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GlobalSearchResult } from "@/lib/secretary/types";

export function GlobalSearchClient({ seed }: { seed: GlobalSearchResult[] }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return seed.slice(0, 12);
    return seed.filter(
      (r) => r.title.toLowerCase().includes(t) || r.subtitle.toLowerCase().includes(t)
    );
  }, [q, seed]);

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Όνομα παιδιού, γονέα, τηλέφωνο, σχολείο…"
        className="w-full max-w-xl rounded-lg border border-border px-3 py-2 text-sm"
        aria-label="Αναζήτηση"
      />
      <ul className="divide-y divide-border rounded-xl border border-border bg-white">
        {results.length === 0 ? (
          <li className="px-4 py-6 text-sm text-ink-muted">Δεν βρέθηκαν αποτελέσματα.</li>
        ) : (
          results.map((r) => (
            <li key={`${r.kind}-${r.id}`}>
              <Link href={r.href} className="flex flex-wrap gap-2 px-4 py-3 hover:bg-surface-muted">
                <span className="text-[10px] font-semibold uppercase text-clinical-700">{r.kind}</span>
                <span className="font-medium text-ink">{r.title}</span>
                <span className="text-sm text-ink-muted">{r.subtitle}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
