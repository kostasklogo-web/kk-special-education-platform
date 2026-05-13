import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function AttendanceSessionNotFound() {
  return (
    <div>
      <PageHeader title="Δεν βρέθηκε" description="Η συνεδρία δεν υπάρχει ή δεν έχετε πρόσβαση." />
      <Link href="/attendance" className="text-sm font-medium text-clinical-700 hover:underline">
        Επιστροφή στο παρουσιολόγιο
      </Link>
    </div>
  );
}
