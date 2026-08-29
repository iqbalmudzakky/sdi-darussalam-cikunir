"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { cva } from "class-variance-authority";
import { Check, Loader2 } from "lucide-react";
import { startRegistrationPayment } from "@/lib/api/payments";
import { createManualRegistration } from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";
import {
  REGISTRATION_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PHYSICAL_DISABILITY_OPTIONS,
  PARENT_RELATIONSHIP_OPTIONS,
  RELIGION_OPTIONS,
} from "@/lib/registrationOptions";
import { TextField, SelectField, TextareaField, DateField } from "./fields";
import { RegionSelect } from "./RegionSelect";
import { clearDraft, isDraftMeaningful, loadDraft, saveDraft } from "./draft";
import { buildRegistrationPayload } from "./payload";
import {
  EMPTY_FORM,
  FIELD_LABELS,
  validateField,
  normalizeWhatsappNumber,
  PHONE_FIELDS,
  type FieldName,
  type FieldErrors,
} from "./config";

/*
 * Judul bagian memakai gaya "eyebrow" yang sama dengan section di halaman
 * utama — huruf kapital kecil ber-tracking lebar — supaya formulir terasa
 * satu bahasa dengan situsnya, bukan komponen tempelan.
 */
const sectionHeadingVariants = cva([
  "mb-1 border-b border-brand-200 pb-2",
  "text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase",
]);

const honeypotVariants = cva([
  "absolute -left-2499.75 top-auto h-px w-px overflow-hidden",
]);

const submitButtonVariants = cva([
  "flex w-full cursor-pointer items-center justify-center gap-2",
  "rounded-xl bg-brand-600 px-5 py-3.5",
  "font-medium text-white",
  "transition-colors duration-200",
  "hover:bg-brand-700",
  "disabled:cursor-not-allowed disabled:opacity-60",
]);

const stepVariants = cva(
  [
    "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5",
    "text-[11px] font-medium sm:text-xs",
    "transition-colors duration-200",
  ],
  {
    variants: {
      state: {
        /* Langkah yang sedang diisi. */
        active: "bg-brand-600 text-white",
        /* Sudah dilewati — ditandai centang supaya kemajuan terlihat. */
        done: "bg-brand-100 text-brand-800",
        /* Belum dijalani; sengaja paling redup agar tidak menarik perhatian. */
        upcoming: "bg-brand-50 text-brand-700/70",
      },
    },
    defaultVariants: {
      state: "upcoming",
    },
  },
);

export type RegistrationFormMode = "public" | "manual";

type RegistrationFormProps = {
  onSuccess?: () => void;
  mode?: RegistrationFormMode;
};

const TODAY = new Date();

const STUDENT_BIRTH_RANGE = {
  startMonth: new Date(TODAY.getFullYear() - 25, 0),
  endMonth: TODAY,
  defaultMonth: new Date(TODAY.getFullYear() - 7, 0),
};

const PARENT_BIRTH_RANGE = {
  startMonth: new Date(TODAY.getFullYear() - 80, 0),
  endMonth: TODAY,
  defaultMonth: new Date(TODAY.getFullYear() - 35, 0),
};

const DIGITS_ONLY_FIELDS: FieldName[] = [
  "student_nik",
  "birth_order",
  "sibling_count",
  "father_nik",
  "father_income",
  "mother_nik",
  "mother_income",
  "height",
  "weight",
  "head_circumference",
];

export function RegistrationForm({
  onSuccess,
  mode = "public",
}: RegistrationFormProps) {
  const toast = useToast();

  const isManual = mode === "manual";

  const [form, setForm] = useState(EMPTY_FORM);

  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  /*
   * Mengembalikan isian yang belum sempat dikirim.
   *
   * Formulirnya panjang, dan dialog gampang tertutup — klik di luar, tombol
   * back, atau tab keburu ditutup. Tanpa ini, semuanya harus diketik ulang
   * dari nol.
   */
  useEffect(() => {
    if (isManual) return;

    const draft = loadDraft();
    if (!draft) return;

    setForm(draft.form);
    setStep(draft.step);
    setHasRestoredDraft(true);
  }, [isManual]);

  /*
   * Mengisi form dari devPrefill.local.ts kalau filenya ada, supaya testing
   * manual tidak berarti mengetik 30-an kolom. File-nya gitignored dan
   * import-nya lazy, jadi datanya tidak pernah ikut ke produksi.
   */
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let cancelled = false;

    import("./devPrefill.local")
      .then((module) => {
        if (cancelled) return;

        const prefill = module.DEV_PREFILL;
        if (!prefill || Object.keys(prefill).length === 0) return;

        /*
         * Menimpa draft, bukan digabung di belakangnya.
         *
         * Draft dipulihkan lebih dulu, jadi tanpa ini hasil percobaan
         * sebelumnya — termasuk formulir yang sengaja dikosongkan — akan
         * menang atas data prefill, dan formulir terbuka kosong justru saat
         * kita ingin mengujinya.
         */
        setForm({ ...EMPTY_FORM, ...prefill });
        setHasRestoredDraft(false);
      })
      .catch(() => {
        /* Tidak ada file prefill — kondisi normal. Form dibiarkan kosong. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [step, setStep] = useState(1);

  const formRef = useRef<HTMLFormElement>(null);

  const [errors, setErrors] = useState<FieldErrors>({});

  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Menyimpan isian setiap kali berubah, ditunda sebentar supaya tidak menulis
   * ke localStorage pada setiap ketikan.
   */
  useEffect(() => {
    if (isManual) return;
    if (isSubmitting) return;
    if (!isDraftMeaningful(form)) return;

    const timer = setTimeout(() => saveDraft(form, step), 500);
    return () => clearTimeout(timer);
  }, [form, step, isSubmitting, isManual]);

  /*
   * Menyimpan pilihan wilayah beserta kodenya, lalu mengosongkan tingkat di
   * bawahnya. Tanpa itu, mengganti provinsi setelah kecamatan terisi akan
   * menyisakan kecamatan lama yang sudah tidak cocok — dan ikut terkirim.
   */
  function selectRegion(
    field: "province" | "city" | "district" | "village",
    name: string,
    code: string,
  ) {
    setForm((prev) => {
      const next = { ...prev, [field]: name };

      if (field === "province") {
        next.province_code = code;
        next.city = "";
        next.city_code = "";
        next.district = "";
        next.district_code = "";
        next.village = "";
      } else if (field === "city") {
        next.city_code = code;
        next.district = "";
        next.district_code = "";
        next.village = "";
      } else if (field === "district") {
        next.district_code = code;
        next.village = "";
      }

      return next;
    });

    setErrors((prev) => ({ ...prev, [field]: validateField(field, name) }));
  }

  function updateField(field: FieldName, rawValue: string) {
    let value = rawValue;

    if (PHONE_FIELDS.includes(field)) {
      value = rawValue.replace(/[^\d+\s()-]/g, "");
    } else if (DIGITS_ONLY_FIELDS.includes(field)) {
      value = rawValue.replace(/\D/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }
  }

  function handleBlur(field: FieldName) {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  }

  function fieldError(field: FieldName) {
    return touched[field] ? errors[field] : undefined;
  }

  function fieldId(field: FieldName) {
    return `reg-${field.replace(/_/g, "-")}`;
  }

  function renderText(
    field: FieldName,
    options?: {
      type?: string;
      placeholder?: string;
      optional?: boolean;
      autoComplete?: string;
      inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
      maxLength?: number;
    },
  ) {
    return (
      <TextField
        id={fieldId(field)}
        label={FIELD_LABELS[field]}
        value={form[field]}
        onChange={(value) => updateField(field, value)}
        onBlur={() => handleBlur(field)}
        error={fieldError(field)}
        optional={options?.optional}
        type={options?.type}
        placeholder={options?.placeholder}
        autoComplete={options?.autoComplete}
        inputMode={options?.inputMode}
        maxLength={options?.maxLength}
      />
    );
  }

  function renderSelect(
    field: FieldName,
    options: {
      value: string;
      label: string;
    }[],
  ) {
    return (
      <SelectField
        id={fieldId(field)}
        label={FIELD_LABELS[field]}
        value={form[field]}
        onChange={(value) => updateField(field, value)}
        onBlur={() => handleBlur(field)}
        error={fieldError(field)}
        options={options}
      />
    );
  }

  function renderDate(
    field: FieldName,
    range: {
      startMonth: Date;
      endMonth: Date;
      defaultMonth: Date;
    },
  ) {
    return (
      <DateField
        id={fieldId(field)}
        label={FIELD_LABELS[field]}
        value={form[field]}
        onChange={(value) => updateField(field, value)}
        onBlur={() => handleBlur(field)}
        error={fieldError(field)}
        startMonth={range.startMonth}
        endMonth={range.endMonth}
        defaultMonth={range.defaultMonth}
      />
    );
  }

  function renderTextarea(field: FieldName, placeholder?: string) {
    return (
      <TextareaField
        id={fieldId(field)}
        label={FIELD_LABELS[field]}
        value={form[field]}
        onChange={(value) => updateField(field, value)}
        onBlur={() => handleBlur(field)}
        error={fieldError(field)}
        placeholder={placeholder}
      />
    );
  }

  function validateStepOne() {
    const fields: FieldName[] = [
      "registration_type",
      "full_name",
      "student_nik",
      "gender",
      "religion",

      "place_of_birth",
      "date_of_birth",

      "current_address",
      "village",
      "rt_rw",
      "district",
      "city",
      "province",

      "birth_order",
      "sibling_count",

      "physical_disability",
      "previous_school",
    ];

    return validateFields(fields);
  }

  function validateStepTwo() {
    const fields: FieldName[] = [
      "father_religion",
      "father_education",
      "father_occupation",
      "father_position",
      "father_phone",
      "father_income",

      "mother_religion",
      "mother_education",
      "mother_occupation",
      "mother_position",
      "mother_phone",
      "mother_income",
    ];

    return validateFields(fields);
  }

  function validateFields(fields: FieldName[]) {
    const nextErrors: FieldErrors = {};

    for (const field of fields) {
      const error = validateField(field, form[field]);

      if (error) {
        nextErrors[field] = error;
      }
    }

    setTouched((prev) => ({
      ...prev,
      ...fields.reduce(
        (acc, field) => ({
          ...acc,
          [field]: true,
        }),
        {},
      ),
    }));

    setErrors((prev) => {
      const updated = { ...prev };

      for (const field of fields) {
        delete updated[field];
      }

      return {
        ...updated,
        ...nextErrors,
      };
    });

    return Object.keys(nextErrors).length === 0;
  }

  /*
   * Pindah langkah sekaligus mengembalikan tampilan ke awal formulir.
   *
   * Formulir ini tinggal di dalam dialog yang punya area gulir sendiri, jadi
   * window.scrollTo tidak berpengaruh — yang harus digulir adalah pembungkus
   * ber-overflow terdekat. Tanpa ini, langkah berikutnya terbuka di posisi
   * gulir langkah sebelumnya, jadi pengisi melihat bagian tengah formulir
   * dan harus menggulir ke atas sendiri.
   */
  function goToStep(nextStep: number) {
    setStep(nextStep);

    const container = formRef.current?.closest<HTMLElement>(
      "[data-slot='dialog-scroll-area']",
    );

    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Formulir bisa juga dipakai di luar dialog.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToError() {
    const firstError = document.querySelector("[aria-invalid='true']");

    firstError?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateStepOne()) {
      setStep(1);
      setTimeout(scrollToError, 100);
      return;
    }

    if (!validateStepTwo()) {
      setStep(2);
      setTimeout(scrollToError, 100);
      return;
    }

    setIsSubmitting(true);

    const payload = buildRegistrationPayload(form);

    try {
      if (isManual) {
        const result = await createManualRegistration(payload);

        setIsSubmitting(false);

        if (!result.ok) {
          toast.error("Gagal menyimpan pendaftaran", result.error);
          return;
        }

        toast.success(
          "Pendaftar tersimpan",
          "Data sudah masuk ke daftar pendaftar.",
        );

        onSuccess?.();
        return;
      }

      const response = await startRegistrationPayment(payload);

      if (!response.ok) {
        setIsSubmitting(false);
        toast.error("Gagal memulai pembayaran", response.error);
        return;
      }

      /* Tombol tetap nonaktif selama berpindah ke DOKU supaya tidak terkirim
       * dua kali. Isian sengaja tidak dikosongkan kalau pengalihan gagal. */
      toast.success(
        "Mengalihkan ke halaman pembayaran",
        "Selesaikan pembayaran untuk menyelesaikan pendaftaran.",
      );

      /* Data sudah aman di server, salinan lokalnya tidak perlu tertinggal. */
      clearDraft();

      onSuccess?.();
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error("Failed to submit registration:", error);
      setIsSubmitting(false);
      toast.error(
        isManual ? "Gagal menyimpan pendaftaran" : "Gagal memulai pembayaran",
        "Periksa koneksi internet Anda, lalu coba lagi.",
      );
    }
  }

  function renderStepIndicator() {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            number: 1,
            label: "Data Siswa",
          },
          {
            number: 2,
            label: "Orang Tua",
          },
          {
            number: 3,
            label: "Keterangan",
          },
        ].map((item) => (
          <div
            key={item.number}
            aria-current={step === item.number ? "step" : undefined}
            className={stepVariants({
              state:
                step === item.number
                  ? "active"
                  : step > item.number
                    ? "done"
                    : "upcoming",
            })}
          >
            {step > item.number ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">{item.number}.</span>
            )}

            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="min-w-0 space-y-6"
    >
      {/*
        Honeypot: hidden from people, tempting to bots. A submission that
        carries a value here is rejected server-side.

        readOnly is what keeps it from catching the wrong culprit — browser
        autofill and form-filler extensions skip read-only inputs, while a bot
        that assigns the value through script still trips it. Without it, an
        autofill pass silently looks exactly like a bot and the applicant is
        turned away with no idea why.
      */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            website: e.target.value,
          }))
        }
        readOnly
        tabIndex={-1}
        autoComplete="off"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        className={honeypotVariants()}
        aria-hidden="true"
      />

      {hasRestoredDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3">
          <p className="text-[13px] text-ink-700">
            Isian sebelumnya dilanjutkan. Periksa kembali sebelum mengirim.
          </p>

          <button
            type="button"
            onClick={() => {
              clearDraft();
              setForm(EMPTY_FORM);
              setErrors({});
              setTouched({});
              setHasRestoredDraft(false);
              goToStep(1);
            }}
            className="cursor-pointer text-[13px] font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            Mulai dari awal
          </button>
        </div>
      )}

      {renderStepIndicator()}

      {step === 1 && (
        <div className="space-y-4">
          <div className="border-b border-brand-200 pb-2" />

          <div className="grid gap-5 sm:grid-cols-2">
            {renderSelect("registration_type", REGISTRATION_TYPE_OPTIONS)}

            {renderSelect("gender", GENDER_OPTIONS)}
          </div>

          {renderText("full_name", {
            placeholder: "Nama lengkap siswa",
          })}

          {renderText("nickname", {
            optional: true,
            placeholder: "Nama panggilan",
          })}

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("student_nik", {
              inputMode: "numeric",
              maxLength: 16,
              placeholder: "16 digit NIK anak",
            })}

            {renderText("nisn", {
              optional: true,
              inputMode: "numeric",
              placeholder: "Jika sudah ada",
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("place_of_birth", {
              placeholder: "Tempat lahir",
            })}

            {renderDate("date_of_birth", STUDENT_BIRTH_RANGE)}
          </div>

          {/*
            Wilayah dipilih dari atas ke bawah: setiap pilihan menentukan
            daftar di bawahnya, lalu detail jalan diisi terakhir — mengikuti
            cara alamat dibacakan, dari yang paling umum ke paling spesifik.
          */}
          <div className="grid gap-5 sm:grid-cols-2">
            <RegionSelect
              id={fieldId("province")}
              label={FIELD_LABELS.province}
              level="provinces"
              value={form.province}
              onChange={(name, code) => selectRegion("province", name, code)}
              onBlur={() => handleBlur("province")}
              error={fieldError("province")}
            />

            <RegionSelect
              id={fieldId("city")}
              label={FIELD_LABELS.city}
              level="regencies"
              parentCode={form.province_code || undefined}
              value={form.city}
              onChange={(name, code) => selectRegion("city", name, code)}
              onBlur={() => handleBlur("city")}
              error={fieldError("city")}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <RegionSelect
              id={fieldId("district")}
              label={FIELD_LABELS.district}
              level="districts"
              parentCode={form.city_code || undefined}
              value={form.district}
              onChange={(name, code) => selectRegion("district", name, code)}
              onBlur={() => handleBlur("district")}
              error={fieldError("district")}
            />

            <RegionSelect
              id={fieldId("village")}
              label={FIELD_LABELS.village}
              level="villages"
              parentCode={form.district_code || undefined}
              value={form.village}
              onChange={(name) => selectRegion("village", name, "")}
              onBlur={() => handleBlur("village")}
              error={fieldError("village")}
            />
          </div>

          {renderText("rt_rw", {
            placeholder: "Contoh: 004/006",
          })}

          {renderTextarea("current_address", "Nama jalan dan nomor rumah")}

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("birth_order", {
              inputMode: "numeric",
            })}

            {renderText("sibling_count", {
              inputMode: "numeric",
            })}
          </div>

          {renderSelect("religion", RELIGION_OPTIONS)}

          <div className="grid gap-5 sm:grid-cols-2">
            {renderSelect("physical_disability", PHYSICAL_DISABILITY_OPTIONS)}

            {renderText("previous_school")}
          </div>

          <button
            type="button"
            onClick={() => {
              if (validateStepOne()) {
                goToStep(2);
              } else {
                setTimeout(scrollToError, 100);
              }
            }}
            className={submitButtonVariants()}
          >
            Selanjutnya
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className={sectionHeadingVariants()}>Data Orang Tua/Wali</p>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderSelect("father_status", PARENT_RELATIONSHIP_OPTIONS)}

            {renderText("father_name", {
              placeholder: "Nama ayah",
            })}
          </div>

          {renderText("father_nik", {
            inputMode: "numeric",
            maxLength: 16,
            placeholder: "16 digit NIK ayah",
          })}

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("father_place_of_birth", {
              placeholder: "Tempat lahir ayah",
            })}

            {renderDate("father_date_of_birth", PARENT_BIRTH_RANGE)}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderSelect("father_religion", RELIGION_OPTIONS)}

            {renderText("father_education", {
              optional: true,
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("father_occupation", {
              optional: true,
            })}

            {renderText("father_position", {
              optional: true,
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("father_phone", {
              type: "tel",
              inputMode: "numeric",
              maxLength: 13,
              placeholder: "081234567890",
            })}

            {renderText("father_income", {
              inputMode: "numeric",
              maxLength: 12,
              placeholder: "Contoh: 5000000",
            })}
          </div>

          <div className="border-t border-brand-100 pt-5">
            <p className={sectionHeadingVariants()}>Data Ibu</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderSelect("mother_status", PARENT_RELATIONSHIP_OPTIONS)}

            {renderText("mother_name", {
              placeholder: "Nama ibu",
            })}
          </div>

          {renderText("mother_nik", {
            inputMode: "numeric",
            maxLength: 16,
            placeholder: "16 digit NIK ibu",
          })}

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("mother_place_of_birth", {
              placeholder: "Tempat lahir ibu",
            })}

            {renderDate("mother_date_of_birth", PARENT_BIRTH_RANGE)}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderSelect("mother_religion", RELIGION_OPTIONS)}

            {renderText("mother_education", {
              optional: true,
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("mother_occupation", {
              optional: true,
            })}

            {renderText("mother_position", {
              optional: true,
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("mother_phone", {
              type: "tel",
              inputMode: "numeric",
              maxLength: 13,
              placeholder: "081234567890",
            })}

            {renderText("mother_income", {
              inputMode: "numeric",
              maxLength: 12,
              placeholder: "Contoh: 5000000",
            })}
          </div>

          <div className="border-t border-brand-100 pt-5"></div>

          {renderText("parent_email", {
            type: "email",
            optional: true,
            placeholder: "nama@email.com",
          })}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="rounded-xl border border-brand-200 px-5 py-3.5 font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              Kembali
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStepTwo()) {
                  goToStep(3);
                } else {
                  setTimeout(scrollToError, 100);
                }
              }}
              className={submitButtonVariants()}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className={sectionHeadingVariants()}>
            Keterangan Lain Tentang Anak
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("living_with", {
              optional: true,
            })}

            {renderText("distance_to_school", {
              optional: true,
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {renderText("owned_vehicle", {
              optional: true,
            })}

            {renderText("transportation_method", {
              optional: true,
            })}
          </div>

          {renderText("talent", {
            optional: true,
            placeholder: "Bakat/minat anak",
          })}

          <div className="grid gap-5 sm:grid-cols-3">
            {renderText("blood_type", {
              optional: true,
            })}

            {renderText("height", {
              optional: true,
              inputMode: "numeric",
              maxLength: 3,
            })}

            {renderText("weight", {
              optional: true,
              inputMode: "numeric",
              maxLength: 3,
            })}
          </div>

          {renderText("head_circumference", {
            optional: true,
            inputMode: "numeric",
            maxLength: 3,
          })}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="rounded-xl border border-brand-200 px-5 py-3.5 font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              Kembali
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={submitButtonVariants()}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

              {isManual
                ? isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Pendaftaran"
                : isSubmitting
                  ? "Mengirim..."
                  : "Kirim Pendaftaran"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
