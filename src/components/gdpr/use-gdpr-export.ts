"use client";

import { useCallback, useState } from "react";
import type { GdprModule } from "@/lib/gdpr/types";
import { useGdpr } from "./GdprProvider";

export function useGdprExport(module: GdprModule) {
  const gdpr = useGdpr();
  const [pending, setPending] = useState<{
    label: string;
    message: string;
    run: () => void;
  } | null>(null);

  const requestExport = useCallback(
    (
      exportLabel: string,
      run: () => void,
      opts?: { childId?: string | null; childLabel?: string | null }
    ) => {
      const check = gdpr.checkExport(module, exportLabel);
      if (!check.allowed) {
        alert(check.reason);
        return;
      }
      if (check.requiresConfirm && check.confirmMessage) {
        setPending({
          label: exportLabel,
          message: check.confirmMessage,
          run: () => {
            gdpr.runExport({
              module,
              exportLabel,
              childId: opts?.childId,
              childLabel: opts?.childLabel,
              run,
            });
          },
        });
        return;
      }
      gdpr.runExport({
        module,
        exportLabel,
        childId: opts?.childId,
        childLabel: opts?.childLabel,
        run,
      });
    },
    [gdpr, module]
  );

  return {
    requestExport,
    confirmModal: pending
      ? {
          open: true as const,
          title: "Εξαγωγή ευαίσθητων δεδομένων",
          message: pending.message,
          onConfirm: () => {
            pending.run();
            setPending(null);
          },
          onCancel: () => setPending(null),
        }
      : { open: false as const },
  };
}
