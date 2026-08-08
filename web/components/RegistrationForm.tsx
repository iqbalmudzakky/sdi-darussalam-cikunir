"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitRegistration } from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";

const fieldLabelVariants = cva([
  "block text-sm font-medium text-gray-700 mb-2",
]);

const honeypotVariants = cva([
  "absolute -left-2499.75 top-auto w-px h-px overflow-hidden",
]);

const fieldInputVariants = cva([
  "w-full px-4 py-3 rounded-xl border border-gray-300 outline-none transition-all",
  "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
]);

const submitButtonVariants = cva([
  "w-full px-8 py-4 rounded-xl font-semibold",
  "bg-linear-to-r from-emerald-600 to-teal-600 text-white",
  "flex items-center justify-center gap-2",
  "hover:shadow-lg hover:scale-105 disabled:hover:scale-100 disabled:opacity-70",
  "transition-all duration-300",
]);

const EMPTY_FORM = {
  parent_name: "",
  student_name: "",
  whatsapp: "",
  email: "",
  message: "",
  website: "",
};

export function RegistrationForm() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateForm(patch: Partial<typeof EMPTY_FORM>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await submitRegistration(form);

    setIsSubmitting(false);

    if (!response.ok) {
      toast.error("Gagal mengirim pendaftaran", response.error);
      return;
    }

    toast.success(
      "Pendaftaran terkirim!",
      "Tim kami akan segera menghubungi Anda.",
    );
    setForm(EMPTY_FORM);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => updateForm({ website: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        className={honeypotVariants()}
        aria-hidden="true"
      />

      <div>
        <label className={fieldLabelVariants()}>Nama Orang Tua</label>
        <input
          type="text"
          required
          value={form.parent_name}
          onChange={(e) => updateForm({ parent_name: e.target.value })}
          className={fieldInputVariants()}
          placeholder="Masukkan nama lengkap"
        />
      </div>
      <div>
        <label className={fieldLabelVariants()}>Nama Calon Siswa</label>
        <input
          type="text"
          required
          value={form.student_name}
          onChange={(e) => updateForm({ student_name: e.target.value })}
          className={fieldInputVariants()}
          placeholder="Masukkan nama calon siswa"
        />
      </div>
      <div>
        <label className={fieldLabelVariants()}>Nomor WhatsApp</label>
        <input
          type="tel"
          required
          value={form.whatsapp}
          onChange={(e) => updateForm({ whatsapp: e.target.value })}
          className={fieldInputVariants()}
          placeholder="08XX-XXXX-XXXX"
        />
      </div>
      <div>
        <label className={fieldLabelVariants()}>Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => updateForm({ email: e.target.value })}
          className={fieldInputVariants()}
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className={fieldLabelVariants()}>Pesan</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => updateForm({ message: e.target.value })}
          className={cn(fieldInputVariants(), "resize-none")}
          placeholder="Tulis pesan atau pertanyaan Anda..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={submitButtonVariants()}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
      </button>
    </form>
  );
}
