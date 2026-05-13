import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function RoomNotFound() {
  return (
    <div>
      <PageHeader title="Δεν βρέθηκε" description="Η αίθουσα δεν υπάρχει ή δεν έχετε πρόσβαση." />
      <Link href="/rooms" className="text-sm font-medium text-clinical-700 hover:underline">
        Επιστροφή στη λίστα
      </Link>
    </div>
  );
}
