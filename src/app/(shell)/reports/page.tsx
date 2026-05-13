import { MvpPlaceholderPage } from "@/components/shell/MvpPlaceholderPage";

export default function ReportsPage() {
  return (
    <MvpPlaceholderPage
      title="Αναφορές"
      description="Αναφορές προόδου και συνοπτικά έγγραφα. Οι γονείς θα βλέπουν μόνο δημοσιευμένο υλικό που έχει σημανθεί ως ορατό."
      cards={[
        { title: "Πρόσφατες αναφορές", subtitle: "Ανά παιδί" },
        { title: "Δημοσίευση", subtitle: "Ροή ελέγχου" },
        { title: "Αρχεία", subtitle: "Συνημμένα" },
      ]}
      emptyTitle="Δεν υπάρχουν αναφορές"
      emptyDescription="Η λίστα παραμένει κενή. Δεν προστίθενται επίδειξη αναφορές με πραγματικά κλινικά περιεχόμενα."
    />
  );
}
