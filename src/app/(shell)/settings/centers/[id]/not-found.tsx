import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function CenterNotFound() {
  return (
    <div>
      <PageHeader title="Δεν βρέθηκε" description="Το κέντρο δεν υπάρχει ή δεν έχετε πρόσβαση." />
      <Link href="/settings/centers" className="text-sm font-medium text-clinical-700 hover:underline">
        Επιστροφή στη λίστα
      </Link>
    </div>
  );
}
