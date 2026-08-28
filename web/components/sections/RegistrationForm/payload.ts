import type { SubmitRegistrationInput } from "@/types/Registration";
import { normalizeWhatsappNumber, type FormFields } from "./config";

export function buildRegistrationPayload(
  form: FormFields,
): SubmitRegistrationInput {
  return {
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
      phone: form.student_phone
        ? normalizeWhatsappNumber(form.student_phone)
        : null,
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
      head_circumference: form.head_circumference
        ? Number(form.head_circumference)
        : null,
    },
    website: form.website,
  } as SubmitRegistrationInput;
}
