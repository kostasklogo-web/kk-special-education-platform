"use client";

import type { GdprModule } from "@/lib/gdpr/types";
import { GdprExportConfirmModal } from "./GdprExportConfirmModal";
import { useGdprExport } from "./use-gdpr-export";

type Props = {
  module: GdprModule;
  children: (requestExport: ReturnType<typeof useGdprExport>["requestExport"]) => React.ReactNode;
};

/** Wraps a module workspace and renders the GDPR export confirmation modal when needed. */
export function GdprExportBinding({ module, children }: Props) {
  const { requestExport, confirmModal } = useGdprExport(module);

  return (
    <>
      {children(requestExport)}
      <GdprExportConfirmModal
        open={confirmModal.open}
        title={confirmModal.open ? confirmModal.title : ""}
        message={confirmModal.open ? confirmModal.message : ""}
        onConfirm={confirmModal.open ? confirmModal.onConfirm : () => {}}
        onCancel={confirmModal.open ? confirmModal.onCancel : () => {}}
      />
    </>
  );
}
