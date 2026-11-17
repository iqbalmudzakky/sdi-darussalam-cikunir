"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { KeyRound, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SetPasswordForm } from "@/components/admin/auth/SetPasswordForm";
import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();

  return (
    <SetPasswordForm
      icon={KeyRound}
      title="Password baru"
      linkProblemAction={
        <Link
          href="/forgot-password"
          className={buttonVariants({ className: "h-11 w-full font-semibold" })}
        >
          <Send className="h-4 w-4" />
          Minta link baru
        </Link>
      }
      onSubmit={(password) => resetPassword(token, password)}
    />
  );
}
