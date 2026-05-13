import { DashboardCard } from "@/components/shell/DashboardCard";
import { EmptyState } from "@/components/shell/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";

export type PlaceholderCard = {
  title: string;
  subtitle?: string;
  body?: string;
};

type MvpPlaceholderPageProps = {
  title: string;
  description: string;
  cards: PlaceholderCard[];
  emptyTitle: string;
  emptyDescription: string;
};

export function MvpPlaceholderPage({
  title,
  description,
  cards,
  emptyTitle,
  emptyDescription,
}: MvpPlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <DashboardCard key={c.title} title={c.title} subtitle={c.subtitle}>
            {c.body ?? (
              <span className="text-ink-faint">Η λειτουργία θα προστεθεί σε επόμενο στάδιο.</span>
            )}
          </DashboardCard>
        ))}
      </div>
      <EmptyState title={emptyTitle} description={emptyDescription} />
    </div>
  );
}
