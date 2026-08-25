"use client";

import { useEffect, useState, type FormEvent } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { startRegistrationPayment } from "@/lib/api/payments";
import { useToast } from "@/hooks/useToast";
import { REGISTRATION_TYPE_OPTIONS, GENDER_OPTIONS, PHYSICAL_DISABILITY_OPTIONS, PARENT_RELATIONSHIP_OPTIONS, RELIGION_OPTIONS } from "@/lib/registrationOptions";
import type { SubmitRegistrationInput } from "@/types/Registration";
import { TextField, SelectField, TextareaField } from "./fields";
import { RegionSelect } from "./RegionSelect";
import { EMPTY_FORM, FIELD_LABELS, validateField, normalizeWhatsappNumber, PHONE_FIELDS, type FieldName, type FieldErrors } from "./config";

const sectionHeadingVariants = cva(["mb-1 border-b border-brand-200 pb-2 text-sm font-semibold text-ink-900"]);

const honeypotVariants = cva(["absolute -left-2499.75 top-auto h-px w-px overflow-hidden"]);

const submitButtonVariants = cva([
  "flex w-full cursor-pointer items-center justify-center gap-2",
  "bg-brand-600 px-5 py-3.5",
  "font-medium text-white",
  "transition-colors duration-200",
  "hover:bg-brand-700",
  "disabled:cursor-not-allowed disabled:opacity-60",
]);

const stepVariants = cva(["flex items-center justify-center rounded-xl px-4 py-2 text-xs font-medium"]);

type RegistrationFormProps = {
  onSuccess?: () => void;
};

const DIGITS_ONLY_FIELDS: FieldName[] = ["student_nik", "birth_order", "sibling_count", "father_nik", "father_income", "mother_nik", "mother_income", "height", "weight", "head_circumference"];

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);

  /*
   * Development convenience: fill the form from devPrefill.local.ts if that
   * file exists, so manual testing does not mean typing 30-odd fields each
   * time. The file is gitignored and the import is lazy, so this branch is
   * dead code in production and the data can never ship.
   */
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let cancelled = false;

    import("./devPrefill.local")
      .then((module) => {
        if (!cancelled) {
          setForm((prev) => ({ ...prev, ...module.DEV_PREFILL }));
        }
      })
      .catch(() => {
        // No prefill file — the normal case. Leave the form empty.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [step, setStep] = useState(1);

  const [errors, setErrors] = useState<FieldErrors>({});

  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return <SelectField id={fieldId(field)} label={FIELD_LABELS[field]} value={form[field]} onChange={(value) => updateField(field, value)} onBlur={() => handleBlur(field)} error={fieldError(field)} options={options} />;
  }

  function renderTextarea(field: FieldName, placeholder?: string) {
    return <TextareaField id={fieldId(field)} label={FIELD_LABELS[field]} value={form[field]} onChange={(value) => updateField(field, value)} onBlur={() => handleBlur(field)} error={fieldError(field)} placeholder={placeholder} />;
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

    const response = await startRegistrationPayment({
      registration_type: form.registration_type,

      parent_email: form.parent_email?.trim() || null,

      student: {
        full_name: form.full_name.trim().toUpperCase(),

        nickname: form.nickname.trim() || null,

        nik: form.student_nik.trim(),

        nisn: form.nisn.trim() || null,

        gender: form.gender,

        place_of_birth: form.place_of_birth.trim(),

        date_of_birth: form.date_of_birth,

        address: form.current_address.trim(),

        village: form.village.trim(),

        rt_rw: form.rt_rw.trim(),

        district: form.district.trim(),

        city: form.city.trim(),

        province: form.province.trim(),

        phone: form.student_phone ? normalizeWhatsappNumber(form.student_phone) : null,

        birth_order: Number(form.birth_order),

        sibling_count: Number(form.sibling_count),

        orphan_status: form.orphan_status.trim() || null,

        daily_language: form.daily_language.trim() || null,

        citizenship: form.citizenship.trim() || "Indonesia",

        religion: form.religion.trim(),

        physical_disability: form.physical_disability,

        previous_school: form.previous_school.trim(),

        previous_school_transfer: form.previous_school_transfer.trim() || null,
      },

      parents: [
        {
          parent_type: "father",

          relationship_status: form.father_status,

          name: form.father_name.trim().toUpperCase(),

          nik: form.father_nik.trim(),

          place_of_birth: form.father_place_of_birth.trim(),

          date_of_birth: form.father_date_of_birth,

          religion: form.father_religion.trim() || null,

          education: form.father_education.trim() || null,

          occupation: form.father_occupation.trim() || null,

          position: form.father_position.trim() || null,

          income: Number(form.father_income),

          citizenship: form.father_citizenship.trim() || "Indonesia",

          phone: normalizeWhatsappNumber(form.father_phone),
        },

        {
          parent_type: "mother",

          relationship_status: form.mother_status,

          name: form.mother_name.trim().toUpperCase(),

          nik: form.mother_nik.trim(),

          place_of_birth: form.mother_place_of_birth.trim(),

          date_of_birth: form.mother_date_of_birth,

          religion: form.mother_religion.trim() || null,

          education: form.mother_education.trim() || null,

          occupation: form.mother_occupation.trim() || null,

          position: form.mother_position.trim() || null,

          income: Number(form.mother_income),

          citizenship: form.mother_citizenship.trim() || "Indonesia",

          phone: normalizeWhatsappNumber(form.mother_phone),
        },
      ],

      details: {
        living_with: form.living_with.trim() || null,

        distance_to_school: form.distance_to_school.trim() || null,

        owned_vehicle: form.owned_vehicle.trim() || null,

        transportation_method: form.transportation_method.trim() || null,

        talent: form.talent.trim() || null,

        blood_type: form.blood_type.trim() || null,

        height: form.height ? Number(form.height) : null,

        weight: form.weight ? Number(form.weight) : null,

        head_circumference: form.head_circumference ? Number(form.head_circumference) : null,
      },

      website: form.website,
    } as SubmitRegistrationInput);

    if (!response.ok) {
      setIsSubmitting(false);
      toast.error("Gagal memulai pembayaran", response.error);
      return;
    }

    // The button stays disabled while the browser navigates to DOKU, so the
    // form cannot be submitted twice and open a second checkout session. The
    // fields are deliberately left filled: if the redirect fails the applicant
    // still has their data.
    toast.success(
      "Mengalihkan ke halaman pembayaran",
      "Selesaikan pembayaran untuk menyelesaikan pendaftaran.",
    );

    onSuccess?.();
    window.location.href = response.paymentUrl;
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
            className={stepVariants({
              className: step === item.number ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700",
            })}
          >
            {item.number}. {item.label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-6">
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

            {renderText("date_of_birth", {
              type: "date",
            })}
          </div>

          {renderTextarea("current_address", "Nama jalan, nomor rumah, RT/RW")}

          {/*
            Wilayah dipilih dari atas ke bawah: setiap pilihan menentukan
            daftar di bawahnya. Nama jalan tetap diketik manual di kolom
            alamat, jadi tidak ada bagian alamat yang ditulis dua kali.
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
                setStep(2);
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

            {renderText("father_date_of_birth", {
              type: "date",
            })}
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

            {renderText("mother_date_of_birth", {
              type: "date",
            })}
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
            <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-brand-200 px-5 py-3.5 font-medium text-brand-700 transition-colors hover:bg-brand-50">
              Kembali
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStepTwo()) {
                  setStep(3);
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
          <p className={sectionHeadingVariants()}>Keterangan Lain Tentang Anak</p>

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
            <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-brand-200 px-5 py-3.5 font-medium text-brand-700 transition-colors hover:bg-brand-50">
              Kembali
            </button>

            <button type="submit" disabled={isSubmitting} className={submitButtonVariants()}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

              {isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
