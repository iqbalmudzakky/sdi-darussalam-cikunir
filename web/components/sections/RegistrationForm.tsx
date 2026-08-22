"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitRegistration } from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";

const fieldLabelVariants = cva(["mb-2 block text-sm font-medium text-gray-700"]);

const honeypotVariants = cva(["absolute -left-2499.75 top-auto h-px w-px overflow-hidden"]);

const fieldInputVariants = cva([
  "w-full rounded-xl border border-gray-300",
  "px-3.5 py-3 sm:px-4",
  "text-base text-gray-900",
  "outline-none",
  "transition-[border-color,box-shadow] duration-300",
  "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
]);

const submitButtonVariants = cva([
  "flex w-full items-center justify-center gap-2",
  "rounded-xl px-5 py-3.5 sm:px-8 sm:py-4",
  "font-semibold text-white",
  "bg-linear-to-r from-emerald-600 to-teal-600",

  /*
   * Desktop hover.
   *
   * Scale dibuat 1.02, bukan 1.05,
   * karena tombol memiliki w-full.
   * Ini mengurangi risiko tombol terlalu
   * melebar keluar dari container.
   */
  "md:hover:scale-[1.02] md:hover:shadow-lg",

  /*
   * Touch feedback mobile.
   */
  "active:scale-[0.985]",
  "active:shadow-md",

  /*
   * Disabled state tetap aman.
   */
  "disabled:cursor-not-allowed",
  "disabled:opacity-70",
  "disabled:hover:scale-100",
  "disabled:hover:shadow-none",

  "transition-[transform,box-shadow,opacity] duration-300 ease-out",
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

  /*
   * Khusus UI mobile.
   *
   * Tidak berhubungan dengan logic submit/form.
   */
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  const [isSubmitButtonCenterActive, setIsSubmitButtonCenterActive] = useState(false);

  function updateForm(patch: Partial<typeof EMPTY_FORM>) {
    setForm((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await submitRegistration(form);

    setIsSubmitting(false);

    if (!response.ok) {
      toast.error("Gagal mengirim pendaftaran", response.error);

      return;
    }

    toast.success("Pendaftaran terkirim!", "Tim kami akan segera menghubungi Anda.");

    setForm(EMPTY_FORM);
  }

  /*
   * Detect mode mobile.
   *
   * Mengikuti breakpoint md Tailwind:
   * mobile < 768px.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewportMode = () => {
      const mobile = mediaQuery.matches;

      setIsMobile(mobile);

      if (!mobile) {
        setIsSubmitButtonCenterActive(false);
      }
    };

    updateViewportMode();

    mediaQuery.addEventListener("change", updateViewportMode);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportMode);
    };
  }, []);

  /*
   * Mobile center-hover untuk tombol submit.
   *
   * Ketika tombol berada dekat titik tengah
   * viewport, efek hover desktop diterapkan.
   *
   * Begitu menjauh dari center, efek menutup.
   */
  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const updateSubmitButtonState = () => {
      const button = submitButtonRef.current;

      if (!button) {
        animationFrameRef.current = null;
        return;
      }

      const rect = button.getBoundingClientRect();

      const viewportHeight = window.innerHeight;
      const viewportCenterY = viewportHeight / 2;

      const buttonCenterY = rect.top + rect.height / 2;

      const distanceFromCenter = Math.abs(buttonCenterY - viewportCenterY);

      /*
       * Zona center dibuat cukup ketat.
       *
       * Tombol harus benar-benar berada dekat
       * bagian tengah layar agar hover aktif.
       */
      const centerTolerance = Math.min(72, viewportHeight * 0.09);

      const isVisible = rect.bottom > 0 && rect.top < viewportHeight;

      const shouldBeActive = isVisible && distanceFromCenter <= centerTolerance;

      setIsSubmitButtonCenterActive((current) => (current === shouldBeActive ? current : shouldBeActive));

      animationFrameRef.current = null;
    };

    const requestUpdate = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateSubmitButtonState);
    };

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);

      window.removeEventListener("resize", requestUpdate);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile]);

  /*
   * Selama proses submit, jangan tampilkan
   * efek hover otomatis.
   */
  const isMobileButtonActive = isMobile && isSubmitButtonCenterActive && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-5 sm:space-y-6">
      {/* Anti-spam Honeypot */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) =>
          updateForm({
            website: e.target.value,
          })
        }
        tabIndex={-1}
        autoComplete="off"
        className={honeypotVariants()}
        aria-hidden="true"
      />

      {/* Parent Name */}
      <div className="min-w-0">
        <label className={fieldLabelVariants()}>Nama Orang Tua</label>

        <input
          type="text"
          required
          value={form.parent_name}
          onChange={(e) =>
            updateForm({
              parent_name: e.target.value,
            })
          }
          className={fieldInputVariants()}
          placeholder="Masukkan nama lengkap"
        />
      </div>

      {/* Student Name */}
      <div className="min-w-0">
        <label className={fieldLabelVariants()}>Nama Calon Siswa</label>

        <input
          type="text"
          required
          value={form.student_name}
          onChange={(e) =>
            updateForm({
              student_name: e.target.value,
            })
          }
          className={fieldInputVariants()}
          placeholder="Masukkan nama calon siswa"
        />
      </div>

      {/* WhatsApp */}
      <div className="min-w-0">
        <label className={fieldLabelVariants()}>Nomor WhatsApp</label>

        <input
          type="tel"
          required
          value={form.whatsapp}
          onChange={(e) =>
            updateForm({
              whatsapp: e.target.value,
            })
          }
          className={fieldInputVariants()}
          placeholder="08XX-XXXX-XXXX"
        />
      </div>

      {/* Email */}
      <div className="min-w-0">
        <label className={fieldLabelVariants()}>Email</label>

        <input
          type="email"
          required
          value={form.email}
          onChange={(e) =>
            updateForm({
              email: e.target.value,
            })
          }
          className={fieldInputVariants()}
          placeholder="email@example.com"
        />
      </div>

      {/* Message */}
      <div className="min-w-0">
        <label className={fieldLabelVariants()}>Pesan</label>

        <textarea
          rows={4}
          value={form.message}
          onChange={(e) =>
            updateForm({
              message: e.target.value,
            })
          }
          className={cn(fieldInputVariants(), "resize-none")}
          placeholder="Tulis pesan atau pertanyaan Anda..."
        />
      </div>

      {/* Submit Button */}
      <button ref={submitButtonRef} type="submit" disabled={isSubmitting} className={cn(submitButtonVariants(), isMobileButtonActive && "scale-[1.02] shadow-lg")}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

        {isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
      </button>
    </form>
  );
}
