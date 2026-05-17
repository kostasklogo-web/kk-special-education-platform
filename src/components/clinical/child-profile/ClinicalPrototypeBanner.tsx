import { Beaker } from "lucide-react";

export function ClinicalPrototypeBanner({ message }: { message: string }) {
  return (
    <div
      className="flex gap-3 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-white px-4 py-3 text-sm text-sky-950 shadow-sm"
      role="status"
    >
      <Beaker className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
      <div>
        <p className="font-bold">Πρωτότυπο κλινικού προφίλ</p>
        <p className="mt-0.5 text-sky-900/90">{message}</p>
        <p className="mt-1 text-xs text-sky-800/80">
          Χωρίς πληρωμές, γραμματεία ή GDPR — μόνο κλινική ροή για αξιολόγηση UX.
        </p>
      </div>
    </div>
  );
}
