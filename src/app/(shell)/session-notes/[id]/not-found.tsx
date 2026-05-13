import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function SessionNoteNotFound() {
  return (
    <div>
      <PageHeader title="Δεν βρέθηκε" description="Η σημείωση δεν υπάρχει ή δεν έχετε πρόσβαση." />
      <Link href="/session-notes" className="text-sm font-medium text-clinical-700 hover:underline">
        Επιστροφή στη λίστα
      </Link>
    </div>
  );
}
