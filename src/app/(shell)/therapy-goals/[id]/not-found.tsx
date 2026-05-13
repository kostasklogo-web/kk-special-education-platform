import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function TherapyGoalNotFound() {
  return (
    <div>
      <PageHeader title="Δεν βρέθηκε" description="Ο στόχος δεν υπάρχει ή δεν έχετε πρόσβαση." />
      <Link href="/therapy-goals" className="text-sm font-medium text-clinical-700 hover:underline">
        Επιστροφή στη λίστα
      </Link>
    </div>
  );
}
