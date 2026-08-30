import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (user) {
    redirect("/admin");
  }

  return <>{children}</>;
}
