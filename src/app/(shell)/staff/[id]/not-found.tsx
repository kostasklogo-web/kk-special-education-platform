import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function StaffNotFound() {
  return (
    <div>
      <PageHeader title="Δεν βρέθηκε" description="Η εγγραφή δεν υπάρχει ή δεν έχετε πρόσβαση." />
      <Link href="/staff" className="text-sm font-medium text-clinical-700 hover:underline">
        Επιστροφή στη λίστα
      </Link>
    </div>
  );
}
