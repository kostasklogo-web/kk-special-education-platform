import { PageHeader } from "@/components/shell/PageHeader";
import { GlobalSearchClient } from "@/components/secretary/GlobalSearchClient";
import { buildSecretarySearchSeed } from "@/lib/secretary/search-seed";

export default function SecretarySearchPage() {
  const seed = buildSecretarySearchSeed();
  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Αναζήτηση"
        description="Παιδί, γονέας, τηλέφωνο, σχολείο, υπόλοιπο, διάγνωση, εργασία."
      />
      <GlobalSearchClient seed={seed} />
    </div>
  );
}
