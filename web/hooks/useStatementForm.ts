"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { saveStatement } from "@/lib/api/registration/registrations";
import type {
  SaveStatementPayload,
  StatementContent,
  StatementView,
} from "@/types/registration/Registration";

type ParentKey = "father" | "mother";
type ParentField = "name" | "nik" | "occupation" | "phone";
type AddressField = keyof StatementContent["father"]["address"];
type ChildField = keyof StatementContent["child"];
type SignerField = keyof StatementContent["signers"];

export function useStatementForm(initial: StatementView) {
  const toast = useToast();
  const [view, setView] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const form = useStatementContent(initial.content);
  const { content } = form;
  const statement: SaveStatementPayload["statement"] = {
    letter_date: content.letter_date,
    father: content.father,
    mother: content.mother,
    child: content.child,
    signers: content.signers,
  };

  async function submit(payload: SaveStatementPayload): Promise<boolean> {
    setIsSaving(true);
    try {
      const result = await saveStatement(view.registration_id, payload);
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      setView(result.statement);
      form.reset(result.statement.content);
      return true;
    } catch (error) {
      console.error("Failed to save statement:", error);
      toast.error("Gagal menyimpan surat pernyataan");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function save(): Promise<boolean> {
    const payload: SaveStatementPayload = {
      action: "save_statement",
      statement,
    };
    const saved = await submit(payload);
    if (saved) toast.success("Surat pernyataan tersimpan");
    return saved;
  }

  async function applyLatest() {
    const payload: SaveStatementPayload = {
      action: "refresh_statement",
      statement,
    };
    const saved = await submit(payload);
    if (saved) toast.success("Biaya terbaru dipakai");
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

function useStatementContent(initial: StatementContent) {
  const [content, setContent] = useState(initial);
  const [isDirty, setIsDirty] = useState(false);

  function update(next: (prev: StatementContent) => StatementContent) {
    setContent(next);
    setIsDirty(true);
  }

  function reset(next: StatementContent) {
    setContent(next);
    setIsDirty(false);
  }

  function setLetterDate(value: string) {
    update((prev) => ({ ...prev, letter_date: value }));
  }

  function setParent(parent: ParentKey, field: ParentField, value: string) {
    update((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  }

  function setAddress(parent: ParentKey, field: AddressField, value: string) {
    update((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        address: { ...prev[parent].address, [field]: value },
      },
    }));
  }

  function setSameAddress(value: boolean) {
    update((prev) => ({
      ...prev,
      mother: { ...prev.mother, same_address: value },
    }));
  }

  function setChild(field: ChildField, value: string) {
    update((prev) => ({ ...prev, child: { ...prev.child, [field]: value } }));
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
    setLetterDate,
    setParent,
    setAddress,
    setSameAddress,
    setChild,
    setSigner,
  };
}
