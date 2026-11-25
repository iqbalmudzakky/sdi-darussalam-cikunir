"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { saveAdmissionSettings } from "@/lib/api/admission/admissionSettings";
import type {
  AdmissionSettings,
  AdmissionSettingsPayload,
} from "@/types/admission/AdmissionSettings";

export type MoneyKey =
  | "tahfizh_yearly_fee"
  | "tahfizh_july_fee"
  | "unggulan_yearly_fee"
  | "unggulan_july_fee"
  | "darussalam_discount"
  | "other_discount";

export type TextKey =
  | "payment_deadline"
  | "bank_name"
  | "bank_account_number"
  | "bank_account_name"
  | "principal_name"
  | "committee_chair_name"
  | "director_name"
  | "pmb_contact_phone";

type ContactForm = { name: string; phone: string };

type SettingsForm = Record<MoneyKey | TextKey, string> & {
  letter_contacts: ContactForm[];
};

export function useAdmissionSettings(initial: AdmissionSettings) {
  const toast = useToast();
  const [form, setForm] = useState<SettingsForm>(() => ({
    tahfizh_yearly_fee: String(initial.tahfizh_yearly_fee),
    tahfizh_july_fee: String(initial.tahfizh_july_fee),
    unggulan_yearly_fee: String(initial.unggulan_yearly_fee),
    unggulan_july_fee: String(initial.unggulan_july_fee),
    darussalam_discount: String(initial.darussalam_discount),
    other_discount: String(initial.other_discount),
    payment_deadline: initial.payment_deadline ?? "",
    bank_name: initial.bank_name,
    bank_account_number: initial.bank_account_number,
    bank_account_name: initial.bank_account_name,
    principal_name: initial.principal_name,
    committee_chair_name: initial.committee_chair_name,
    director_name: initial.director_name,
    pmb_contact_phone: initial.pmb_contact_phone,
    letter_contacts: initial.letter_contacts,
  }));
  const [isSaving, setIsSaving] = useState(false);

  function setField(key: MoneyKey | TextKey, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setContact(index: number, field: keyof ContactForm, value: string) {
    setForm((prev) => ({
      ...prev,
      letter_contacts: prev.letter_contacts.map((contact, position) =>
        position === index ? { ...contact, [field]: value } : contact,
      ),
    }));
  }

  function addContact() {
    const emptyContact: ContactForm = { name: "", phone: "" };
    setForm((prev) => ({
      ...prev,
      letter_contacts: [...prev.letter_contacts, emptyContact],
    }));
  }

  function removeContact(index: number) {
    setForm((prev) => ({
      ...prev,
      letter_contacts: prev.letter_contacts.filter(
        (_, position) => position !== index,
      ),
    }));
  }

  async function save() {
    const payload: AdmissionSettingsPayload = {
      ...form,
      tahfizh_yearly_fee: Number(form.tahfizh_yearly_fee),
      tahfizh_july_fee: Number(form.tahfizh_july_fee),
      unggulan_yearly_fee: Number(form.unggulan_yearly_fee),
      unggulan_july_fee: Number(form.unggulan_july_fee),
      darussalam_discount: Number(form.darussalam_discount),
      other_discount: Number(form.other_discount),
    };
    setIsSaving(true);
    try {
      const result = await saveAdmissionSettings(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Pengaturan PMB tersimpan");
    } catch (error) {
      console.error("Failed to save admission settings:", error);
      toast.error("Gagal menyimpan Pengaturan PMB");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    form,
    isSaving,
    setField,
    setContact,
    addContact,
    removeContact,
    save,
  };
}
