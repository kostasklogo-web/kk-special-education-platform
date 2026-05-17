"use client";

import type { ClinicalNoteField } from "@/lib/gdpr/types";
import { useGdpr } from "./GdprProvider";

type Props = {
  field: ClinicalNoteField;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function ClinicalFieldGate({ field, children, fallback }: Props) {
  const gdpr = useGdpr();
  if (!gdpr.canViewField(field)) {
    return (
      fallback ?? (
        <p className="rounded border border-dashed border-border px-2 py-1 text-xs text-ink-muted">
          Περιορισμένο πεδίο (GDPR) — δεν εμφανίζεται για τον ρόλο σας.
        </p>
      )
    );
  }
  return <>{children}</>;
}

export function ClinicalFieldEditGate({
  field,
  children,
}: {
  field: ClinicalNoteField;
  children: React.ReactNode;
}) {
  const gdpr = useGdpr();
  if (!gdpr.canEditField(field)) {
    return (
      <p className="text-xs text-ink-muted italic">Μόνο προβολή — χωρίς δικαίωμα επεξεργασίας.</p>
    );
  }
  return <>{children}</>;
}
