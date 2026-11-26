import { notFound } from "next/navigation";
import { StatementScreen } from "@/components/admin/registrations/statement/StatementScreen";
import { getStatement } from "@/lib/actions/registrations";

type StatementPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StatementPage({ params }: StatementPageProps) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement?.can_edit) notFound();

  return <StatementScreen initial={statement} />;
}
