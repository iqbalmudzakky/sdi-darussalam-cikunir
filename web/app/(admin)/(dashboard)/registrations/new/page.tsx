import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FullRegistrationForm } from "@/components/sections/FullRegistrationForm/FullRegistrationForm";

export default function AdminNewRegistrationPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Link
        href="/registrations"
        className="flex w-fit items-center gap-2.5 font-semibold text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
        Pendaftar
      </Link>

      <FullRegistrationForm mode="manual" />
    </div>
  );
}
