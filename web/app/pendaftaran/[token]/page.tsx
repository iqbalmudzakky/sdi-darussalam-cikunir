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

  if (result.status !== "valid") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-4">
        <FullFormExpired whatsappUrl={result.whatsapp_url} />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-paper px-4 py-6 sm:py-10">
      <FullRegistrationForm mode="link" token={token} form={result.form} />
    </main>
  );
}
