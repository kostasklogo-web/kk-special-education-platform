export function DiagnosisPrivacyBanner() {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-violet-950">
      <p className="font-semibold">Προστασία δεδομένων (GDPR)</p>
      <p className="mt-1 text-violet-900/90">
        Τα διαγνωστικά έγγραφα περιέχουν ευαίσθητα προσωπικά και ιατρικά δεδομένα. Η πρόσβαση είναι
        ρολοβασιμένη. Τα αρχεία αποθηκεύονται προστατευμένα· η διαγραφή γίνεται μόνο με αρχειοθέτηση,
        εκτός αν επιβεβαιώσει η διοίκηση.
      </p>
    </div>
  );
}
