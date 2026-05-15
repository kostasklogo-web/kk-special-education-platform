import Link from "next/link";

/** Χωρίς auth/Supabase εδώ: το `/schedule/control-center` είναι στατικό πρωτότυπο. Οι υποσελίδες με δεδομένα βάσης κάνουν δικό τους έλεγχο πρόσβασης. */
export default function ScheduleModuleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-4">
      <nav
        className="-mt-2 flex flex-wrap gap-2 border-b border-border/80 pb-3 text-sm font-medium text-ink-muted"
        aria-label="Υποενότητες προγράμματος"
      >
        <Link href="/schedule" className="rounded-lg px-3 py-2 hover:bg-surface-muted hover:text-ink">
          Συνεδρίες
        </Link>
        <Link
          href="/schedule/control-center"
          className="rounded-lg border border-clinical-100 bg-clinical-50/50 px-3 py-2 text-clinical-900 hover:bg-clinical-50"
        >
          Κεντρικός Πίνακας
        </Link>
      </nav>
      {children}
    </div>
  );
}
