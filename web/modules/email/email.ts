import { createEmailClient } from "./client";
import {
  BRAND_100,
  BRAND_600,
  BRAND_700,
  SCHOOL_NAME,
} from "@/modules/shared/constant/email";

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

function formatReceiptAmount(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatReceiptDate(paidAt: string): string {
  return new Date(paidAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* DOKU mengirim mis. "VIRTUAL_ACCOUNT_BCA"; Input Manual "CASH"/"TRANSFER". */
function formatReceiptMethod(method: string | null): string {
  if (!method) return "—";
  return method
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildPaymentReceiptHtml(input: {
  logoUrl: string;
  studentName: string;
  invoiceNumber: string;
  amount: number;
  paidAt: string;
  paymentMethod: string | null;
}): string {
  const amountText = formatReceiptAmount(input.amount);

  return `
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">
  Pembayaran pendaftaran ${input.studentName} sebesar ${amountText} telah kami terima.
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

        <tr>
          <td style="background-color:${BRAND_600};padding:24px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="${input.logoUrl}" width="36" height="36" alt="${SCHOOL_NAME}" style="display:block;border-radius:6px;" />
                </td>
                <td style="vertical-align:middle;padding-left:12px;">
                  <span style="color:#ffffff;font-size:16px;font-weight:700;">${SCHOOL_NAME}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:32px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:${BRAND_100};color:${BRAND_700};font-size:13px;font-weight:700;padding:6px 14px;border-radius:999px;">
                  &#10003; Pembayaran Berhasil
                </td>
              </tr>
            </table>

            <p style="font-size:15px;color:#18181b;line-height:1.6;margin:20px 0 0;">
              Terima kasih. Pembayaran pendaftaran atas nama <strong>${input.studentName}</strong> telah kami terima dengan baik.
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:#f9fafb;border-radius:10px;">
              <tr>
                <td style="padding:22px 24px;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;">Total Dibayar</p>
                  <p style="margin:6px 0 0;font-size:30px;font-weight:700;color:#18181b;">${amountText}</p>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;font-size:14px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;">Nomor Invoice</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#18181b;">${input.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;">Metode Pembayaran</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#18181b;">${formatReceiptMethod(input.paymentMethod)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#71717a;">Tanggal Bayar</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;color:#18181b;">${formatReceiptDate(input.paidAt)}</td>
              </tr>
            </table>

            <p style="font-size:13px;color:#71717a;line-height:1.6;margin:28px 0 0;">
              Simpan email ini sebagai bukti pembayaran Anda. Tim kami akan segera menghubungi Anda untuk proses pendaftaran selanjutnya.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">${SCHOOL_NAME}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">Email ini dibuat otomatis. Mohon tidak membalas ke alamat ini.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
}

export async function sendPaymentReceiptEmail(input: {
  to: string;
  studentName: string;
  invoiceNumber: string;
  amount: number;
  paidAt: string;
  paymentMethod: string | null;
  logoUrl: string;
}): Promise<void> {
  try {
    const resend = createEmailClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: `Struk Pembayaran Pendaftaran — ${input.invoiceNumber}`,
      html: buildPaymentReceiptHtml(input),
    });

    if (error) {
      console.error(
        "[email] sendPaymentReceiptEmail failed (non-fatal):",
        error,
      );
    }
  } catch (error) {
    console.error("[email] sendPaymentReceiptEmail failed (non-fatal):", error);
  }
}
