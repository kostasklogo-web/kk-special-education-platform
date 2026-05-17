"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function GdprExportConfirmModal({ open, title, message, onConfirm, onCancel }: Props) {
  const [ack, setAck] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-700" />
          <h2 className="text-lg font-bold text-ink">{title}</h2>
        </div>
        <p className="text-sm text-ink-muted">{message}</p>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-1"
          />
          <span>Επιβεβαιώνω ότι έχω εξουσιοδότηση και νόμιμο έρει για την εξαγωγή ευαίσθητων δεδομένων.</span>
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={onCancel}>
            Ακύρωση
          </button>
          <button
            type="button"
            disabled={!ack}
            className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            onClick={() => {
              onConfirm();
              setAck(false);
            }}
          >
            Εξαγωγή & καταγραφή
          </button>
        </div>
      </div>
    </div>
  );
}
