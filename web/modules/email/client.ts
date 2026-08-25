import { Resend } from "resend";

export function createEmailClient() {
  return new Resend(process.env.RESEND_API_KEY!);
}
