import { ShieldAlert } from "lucide-react";

export function CommunicationPrivacyBanner() {
  return (
    <div
      className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
      role="note"
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-bold">Προστασία προσωπικών δεδομένων</p>
        <p className="mt-1 text-amber-900/90">
          Οι καταχωρήσεις επικοινωνίας μπορεί να περιέχουν ευαίσθητα προσωπικά δεδομένα. Πρόσβαση:
          γραμματεία, διοίκηση, κλινικός διευθυντής (όλα), επόπτες (παιδιά τμήματος), θεραπευτές
          (μόνο εξουσιοδοτημένα). Οι γονείς δεν έχουν πρόσβαση στο εσωτερικό αρχείο επικοινωνιών.
        </p>
      </div>
    </div>
  );
}
