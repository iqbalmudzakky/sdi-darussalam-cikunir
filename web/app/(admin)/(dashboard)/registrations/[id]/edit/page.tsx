import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FullRegistrationForm } from "@/components/sections/FullRegistrationForm/FullRegistrationForm";
import { getRegistrationForm } from "@/lib/actions/registrations";

type EditRegistrationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRegistrationPage({
  params,
}: EditRegistrationPageProps) {
  const { id } = await params;
  const form = await getRegistrationForm(id);
  if (!form) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Link
        href={`/registrations/${id}`}
        className="flex w-fit items-center gap-2.5 font-semibold text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
        Pendaftar
      </Link>

      <FullRegistrationForm mode="edit" form={form} />
    </div>
  );
}
