"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RegistrationForm } from "@/components/sections/RegistrationForm/RegistrationForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";

export default function AdminNewRegistrationPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl">
      <Button
        variant="outline"
        size="sm"
        render={<Link href="/admin/registrations" />}
        className="mb-3"
      >
        <ArrowLeft className="h-4 w-4" />
        Daftar Pendaftar
      </Button>

      <AdminPageHeader
        title="Input Pendaftar Manual"
        description="Untuk calon siswa yang mendaftar dan membayar tunai/transfer langsung di sekolah."
      />

      <RegistrationForm
        mode="manual"
        onSuccess={() => router.push("/admin/registrations")}
      />
    </div>
  );
}
