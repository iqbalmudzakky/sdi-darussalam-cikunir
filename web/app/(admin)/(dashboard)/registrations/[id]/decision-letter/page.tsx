import { notFound } from "next/navigation";
import { DecisionLetterScreen } from "@/components/admin/registrations/decision-letter/DecisionLetterScreen";
import { getDecisionLetter } from "@/lib/actions/registrations";

type DecisionLetterPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DecisionLetterPage({
  params,
}: DecisionLetterPageProps) {
  const { id } = await params;
  const letter = await getDecisionLetter(id);
  if (!letter?.can_edit) notFound();

  return <DecisionLetterScreen initial={letter} />;
}
