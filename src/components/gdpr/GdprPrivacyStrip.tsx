"use client";

import { Shield } from "lucide-react";
import { useGdpr } from "./GdprProvider";

export function GdprPrivacyStrip() {
  const gdpr = useGdpr();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-clinical-200/60 bg-clinical-50/50 px-3 py-2 text-[11px] text-clinical-900">
      <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{gdpr.privacyNotice}</span>
      <span className="ml-auto text-ink-faint">Ρόλος: {gdpr.primaryRole}</span>
    </div>
  );
}
