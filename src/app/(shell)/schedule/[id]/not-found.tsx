import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function SessionNotFound() {
  return (
    <div>
      <PageHeader title="Συνεδρία δεν βρέθηκε" description="Η εγγραφή δεν υπάρχει ή δεν έχετε πρόσβαση." />
      <Link href="/schedule" className="text-sm font-medium text-clinical-700 hover:underline">
        Επιστροφή στο πρόγραμμα
      </Link>
    </div>
  );
}
