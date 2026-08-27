import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegistrationForm } from "@/components/sections/RegistrationForm/RegistrationForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminNewRegistrationPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Input Pendaftar Manual"
        description="Untuk calon siswa yang mendaftar lewat formulir kertas di sekolah. Data langsung tersimpan tanpa proses pembayaran online."
        action={
          <Link
            href="/admin/registrations"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        }
      />

      <RegistrationForm mode="manual" />
    </div>
  );
}
