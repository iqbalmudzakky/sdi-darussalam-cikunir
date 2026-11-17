import { SetPasswordForm } from "@/components/admin/auth/SetPasswordForm";
import { getLinkStatus } from "@/lib/actions/auth";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const status = await getLinkStatus(token, "invite");

  return (
    <SetPasswordForm purpose="invite" token={token} initialStatus={status} />
  );
}
