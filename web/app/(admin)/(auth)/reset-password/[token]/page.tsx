import { SetPasswordForm } from "@/components/admin/auth/SetPasswordForm";
import { getLinkStatus } from "@/lib/actions/auth";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const status = await getLinkStatus(token, "reset");

  return (
    <SetPasswordForm purpose="reset" token={token} initialStatus={status} />
  );
}
