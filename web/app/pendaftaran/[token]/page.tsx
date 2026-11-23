import type { Metadata } from "next";
import {
  FullFormExpired,
  FullRegistrationForm,
} from "@/components/sections/FullRegistrationForm/FullRegistrationForm";
import { getFullFormByToken } from "@/lib/actions/registrations";

export const metadata: Metadata = {
  title: "Form Lengkap | SDI Darussalam Cikunir",
  robots: { index: false, follow: false },
};

type FullFormPageProps = {
  params: Promise<{ token: string }>;
};

export default async function FullFormPage({ params }: FullFormPageProps) {
  const { token } = await params;
  const result = await getFullFormByToken(token);

  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:py-10">
      {result.status === "valid" ? (
        <FullRegistrationForm token={token} form={result.form} />
      ) : (
        <FullFormExpired whatsappUrl={result.whatsapp_url} />
      )}
    </main>
  );
}
