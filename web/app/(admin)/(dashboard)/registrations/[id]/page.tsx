import { RegistrationDetailView } from "@/components/admin/registrations/detail/RegistrationDetailView";

type RegistrationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RegistrationDetailPage({
  params,
}: RegistrationDetailPageProps) {
  const { id } = await params;

  return <RegistrationDetailView id={id} />;
}
