import { notFound } from "next/navigation";
import { ObservationScreen } from "@/components/admin/registrations/observation/ObservationScreen";
import { getObservation } from "@/lib/actions/registrations";

type ObservationPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

export default async function ObservationPage({
  params,
  searchParams,
}: ObservationPageProps) {
  const [{ id }, { step }] = await Promise.all([params, searchParams]);
  const observation = await getObservation(id);
  if (!observation) notFound();

  return (
    <ObservationScreen initial={observation} showProfile={step === "profile"} />
  );
}
