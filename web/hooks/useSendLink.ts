"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import {
  sendDocuments,
  sendFormLink,
  sendPaymentLink,
} from "@/lib/api/registration/registrations";

type SendLinkKind = "form" | "payment" | "documents";

export function useSendLink(
  registrationId: string,
  onPaymentSent: () => Promise<void>,
) {
  const toast = useToast();
  const [sendingLink, setSendingLink] = useState<SendLinkKind | null>(null);

  async function sendLink(kind: SendLinkKind) {
    const whatsappWindow = window.open("", "_blank");
    setSendingLink(kind);
    try {
      const senders = {
        form: sendFormLink,
        payment: sendPaymentLink,
        documents: sendDocuments,
      };
      const result = await senders[kind](registrationId);
      if (!result.ok) {
        whatsappWindow?.close();
        toast.error(result.error);
        return;
      }
      if (whatsappWindow) whatsappWindow.location.href = result.whatsappUrl;
      else window.location.href = result.whatsappUrl;
      if (kind === "payment") await onPaymentSent();
    } catch (error) {
      console.error(`Failed to send ${kind} link:`, error);
      whatsappWindow?.close();
      toast.error("Gagal membuat link");
    } finally {
      setSendingLink(null);
    }
  }

  return { sendingLink, sendLink };
}
