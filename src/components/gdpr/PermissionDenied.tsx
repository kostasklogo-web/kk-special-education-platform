import { ShieldAlert } from "lucide-react";

type Props = {
  message: string;
  className?: string;
};

export function PermissionDenied({ message, className = "" }: Props) {
  return (
    <div
      className={`flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 ${className}`}
      role="alert"
    >
      <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-amber-950">Περιορισμένη πρόσβαση (GDPR)</p>
        <p className="mt-1 text-xs text-amber-900">{message}</p>
      </div>
    </div>
  );
}
