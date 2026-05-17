import Link from "next/link";

type Props = {
  title?: string;
  message: string;
  showChildrenLink?: boolean;
};

export function ClinicalAccessDenied({
  title = "Δεν επιτρέπεται πρόσβαση",
  message,
  showChildrenLink = true,
}: Props) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50 to-white px-6 py-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Κλινική πρόσβαση</p>
      <h1 className="mt-2 text-lg font-bold text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{message}</p>
      <p className="mt-2 text-xs text-ink-faint">
        Η πρόσβαση βασίζεται σε <strong>ενεργές αναθέσεις</strong> θεραπευτή–παιδιού, όχι στο ιστορικό συνεδριών.
      </p>
      {showChildrenLink ? (
        <Link
          href="/children"
          className="mt-6 inline-flex rounded-lg border border-clinical-600 bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
        >
          Επιστροφή στα παιδιά μου
        </Link>
      ) : null}
    </div>
  );
}
