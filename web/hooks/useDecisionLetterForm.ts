"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { saveDecisionLetter } from "@/lib/api/registration/registrations";
import type {
  DecisionLetterContent,
  DecisionLetterView,
  SaveDecisionLetterPayload,
} from "@/types/registration/Registration";

type LetterField = "letter_number" | "letter_date";
type ChildField = keyof DecisionLetterContent["child"];
type PaymentField = keyof DecisionLetterContent["payment"];
type SignerField = keyof DecisionLetterContent["signers"];

export function useDecisionLetterForm(initial: DecisionLetterView) {
  const toast = useToast();
  const [view, setView] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const form = useDecisionLetterContent(initial.content);
  const { content } = form;
  const letter: SaveDecisionLetterPayload["letter"] = {
    letter_number: content.letter_number,
    letter_date: content.letter_date,
    child: content.child,
    payment: content.payment,
    signers: content.signers,
  };

  async function submit(payload: SaveDecisionLetterPayload): Promise<boolean> {
    setIsSaving(true);
    try {
      const result = await saveDecisionLetter(view.registration_id, payload);
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      setView(result.letter);
      form.reset(result.letter.content);
      return true;
    } catch (error) {
      console.error("Failed to save decision letter:", error);
      toast.error("Gagal menyimpan Surat Keterangan");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function save(): Promise<boolean> {
    const payload: SaveDecisionLetterPayload = {
      action: "save_decision_letter",
      letter,
    };
    const saved = await submit(payload);
    if (saved) toast.success("Surat Keterangan tersimpan");
    return saved;
  }

  async function applyLatest() {
    const payload: SaveDecisionLetterPayload = {
      action: "refresh_decision_letter",
      letter,
    };
    const saved = await submit(payload);
    if (saved) toast.success("Data pembayaran terbaru dipakai");
  }

  async function download() {
    const pdfWindow = window.open("", "_blank");
    const isReady = view.is_saved && !form.isDirty ? true : await save();
    if (!isReady) {
      pdfWindow?.close();
      return;
    }
    if (pdfWindow) pdfWindow.location.href = view.download_url;
    else window.location.href = view.download_url;
  }

  return {
    ...form,
    view,
    isSaving,
    save,
    applyLatest,
    download,
  };
}

function useDecisionLetterContent(initial: DecisionLetterContent) {
  const [content, setContent] = useState(initial);
  const [isDirty, setIsDirty] = useState(false);

  function update(
    next: (prev: DecisionLetterContent) => DecisionLetterContent,
  ) {
    setContent(next);
    setIsDirty(true);
  }

  function reset(next: DecisionLetterContent) {
    setContent(next);
    setIsDirty(false);
  }

  function setLetter(field: LetterField, value: string) {
    update((prev) => ({ ...prev, [field]: value }));
  }

  function setChild(field: ChildField, value: string) {
    update((prev) => ({ ...prev, child: { ...prev.child, [field]: value } }));
  }

  function setPayment(field: PaymentField, value: string) {
    update((prev) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value },
    }));
  }

  function setSigner(field: SignerField, value: string) {
    update((prev) => ({
      ...prev,
      signers: { ...prev.signers, [field]: value },
    }));
  }

  return {
    content,
    isDirty,
    reset,
    setLetter,
    setChild,
    setPayment,
    setSigner,
  };
}
