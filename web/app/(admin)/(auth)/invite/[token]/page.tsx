"use client";

import { useParams } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { SetPasswordForm } from "@/components/admin/auth/SetPasswordForm";
import { acceptInvite } from "@/lib/api/auth";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();

  return (
    <SetPasswordForm
      icon={UserPlus}
      title="Buat password"
      linkProblemAction={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1.5 pr-3.5 pl-3 text-[13px] font-semibold text-brand-700">
          <Users className="h-4 w-4" />
          Minta undangan baru ke Kepsek
        </span>
      }
      onSubmit={(password) => acceptInvite(token, password)}
    />
  );
}
