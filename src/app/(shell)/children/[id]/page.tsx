import { ClinicalChildProfilePage } from "@/components/clinical/child-profile/ClinicalChildProfilePage";

type ChildProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChildProfilePage({ params }: ChildProfilePageProps) {
  const { id } = await params;
  return <ClinicalChildProfilePage childId={id} />;
}
