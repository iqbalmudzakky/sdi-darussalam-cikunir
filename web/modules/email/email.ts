import { createEmailClient } from "./client";

const EMAIL_FROM = process.env.EMAIL_FROM!;

export async function sendInviteEmail(input: {
  to: string;
  inviteUrl: string;
}): Promise<void> {
  try {
    const resend = createEmailClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: "Undangan Admin — SDI Darussalam Cikunir",
      html: `<p>Anda diundang sebagai admin panel SDI Darussalam Cikunir.</p>
             <p><a href="${input.inviteUrl}">Klik di sini untuk mengatur password Anda</a></p>
             <p>Tautan ini berlaku selama beberapa jam.</p>`,
    });

    if (error) {
      throw new Error("Gagal mengirim email undangan.", { cause: error });
    }
  } catch (error) {
    console.error("[email] sendInviteEmail failed:", error);
    throw new Error("Gagal mengirim email undangan.", { cause: error });
  }
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  try {
    const resend = createEmailClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: "Reset Password Admin — SDI Darussalam Cikunir",
      html: `<p>Ada permintaan reset password untuk akun admin Anda.</p>
             <p><a href="${input.resetUrl}">Klik di sini untuk mengatur password baru</a></p>
             <p>Jika Anda tidak meminta ini, abaikan email ini.</p>`,
    });
    if (error) {
      console.error(
        "[email] sendPasswordResetEmail failed (non-fatal):",
        error,
      );
    }
  } catch (error) {
    console.error("[email] sendPasswordResetEmail failed (non-fatal):", error);
  }
}
