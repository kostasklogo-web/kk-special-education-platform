import Link from "next/link";

export default function ParentNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-border bg-surface-card p-8 text-center shadow-shell">
      <h1 className="text-lg font-semibold text-ink">Ο γονέας δεν βρέθηκε</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Η εγγραφή δεν υπάρχει ή δεν έχετε δικαίωμα πρόσβασης (RLS).
      </p>
      <Link
        href="/parents"
        className="mt-6 inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
      >
        Επιστροφή στη λίστα
      </Link>
    </div>
  );
}
