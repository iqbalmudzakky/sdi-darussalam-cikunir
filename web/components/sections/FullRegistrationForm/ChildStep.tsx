"use client";

import { useState } from "react";
import {
  DateField,
  FormSection,
} from "@/components/sections/RegistrationForm/fields";
import { RegionSelect } from "@/components/sections/RegistrationForm/RegionSelect";
import {
  GENDER_OPTIONS,
  LIVING_ARRANGEMENT_OPTIONS,
  RELIGION_OPTIONS,
  SPECIAL_NEEDS_OPTIONS,
  TRANSPORTATION_OPTIONS,
} from "@/lib/registrationOptions";
import type { FullFormController } from "@/types/registration/Registration";
import {
  BoundChoiceField,
  BoundSelectField,
  BoundTextField,
} from "./BoundFields";

type StepProps = {
  form: FullFormController;
};

export function ChildStep({ form }: StepProps) {
  return (
    <div className="space-y-8">
      <ChildIdentity form={form} />
      <ChildAddress form={form} />
      <ChildSchool form={form} />
      <ChildPeriodic form={form} />
      <ChildAid form={form} />
    </div>
  );
}

function ChildIdentity({ form }: StepProps) {
  const today = new Date();
  const birthStartMonth = new Date(today.getFullYear() - 15, 0);
  const birthDefaultMonth = new Date(today.getFullYear() - 6, 0);

  return (
    <FormSection title="Identitas">
      <BoundTextField
        form={form}
        section="student"
        field="full_name"
        label="Nama lengkap anak"
        placeholder="Sesuai akta kelahiran"
      />
      <BoundTextField
        form={form}
        section="student"
        field="nik"
        label="NIK anak"
        placeholder="16 digit"
        inputMode="numeric"
        maxLength={16}
      />
      <BoundTextField
        form={form}
        section="student"
        field="nisn"
        label="NISN (opsional)"
        placeholder="10 digit"
        inputMode="numeric"
        maxLength={10}
      />
      <BoundChoiceField
        form={form}
        section="student"
        field="gender"
        label="Jenis kelamin"
        options={GENDER_OPTIONS}
      />
      <BoundTextField
        form={form}
        section="student"
        field="place_of_birth"
        label="Tempat lahir"
        placeholder="Kota kelahiran"
      />
      <DateField
        id="student-date_of_birth"
        label="Tanggal lahir"
        startMonth={birthStartMonth}
        endMonth={today}
        defaultMonth={birthDefaultMonth}
        value={form.values.student.date_of_birth}
        onChange={(value) =>
          form.setSectionField("student", "date_of_birth", value)
        }
        error={form.fieldErrors["student.date_of_birth"]}
      />
      <BoundSelectField
        form={form}
        section="student"
        field="religion"
        label="Agama"
        options={RELIGION_OPTIONS}
      />
      <BoundChoiceField
        form={form}
        section="student"
        field="physical_disability"
        label="Berkebutuhan khusus"
        options={SPECIAL_NEEDS_OPTIONS}
      />
      <BoundTextField
        form={form}
        section="student"
        field="birth_certificate_number"
        label="No. registrasi akta lahir (opsional)"
      />
    </FormSection>
  );
}

function ChildAddress({ form }: StepProps) {
  const [regionCodes, setRegionCodes] = useState({
    province: "",
    city: "",
    district: "",
  });
  const student = form.values.student;

  function selectProvince(name: string, code: string) {
    form.setSectionField("student", "province", name);
    form.setSectionField("student", "city", "");
    form.setSectionField("student", "district", "");
    form.setSectionField("student", "village", "");
    setRegionCodes({ province: code, city: "", district: "" });
  }

  function selectCity(name: string, code: string) {
    form.setSectionField("student", "city", name);
    form.setSectionField("student", "district", "");
    form.setSectionField("student", "village", "");
    setRegionCodes((prev) => ({ ...prev, city: code, district: "" }));
  }

  function selectDistrict(name: string, code: string) {
    form.setSectionField("student", "district", name);
    form.setSectionField("student", "village", "");
    setRegionCodes((prev) => ({ ...prev, district: code }));
  }

  return (
    <FormSection title="Alamat">
      <BoundTextField
        form={form}
        section="student"
        field="address"
        label="Alamat lengkap"
        placeholder="Jalan dan nomor rumah"
      />
      <div className="grid grid-cols-2 gap-3 md:contents">
        <BoundTextField
          form={form}
          section="student"
          field="rt_rw"
          label="RT/RW"
          placeholder="002/015"
        />
        <BoundTextField
          form={form}
          section="student"
          field="hamlet"
          label="Dusun (opsional)"
        />
      </div>
      <RegionSelect
        id="student-province"
        label="Provinsi"
        level="provinces"
        value={student.province}
        onChange={selectProvince}
        error={form.fieldErrors["student.province"]}
      />
      <RegionSelect
        id="student-city"
        label="Kota / kabupaten"
        level="regencies"
        parentCode={regionCodes.province || undefined}
        value={student.city}
        onChange={selectCity}
        error={form.fieldErrors["student.city"]}
      />
      <RegionSelect
        id="student-district"
        label="Kecamatan"
        level="districts"
        parentCode={regionCodes.city || undefined}
        value={student.district}
        onChange={selectDistrict}
        error={form.fieldErrors["student.district"]}
      />
      <RegionSelect
        id="student-village"
        label="Kelurahan / desa"
        level="villages"
        parentCode={regionCodes.district || undefined}
        value={student.village}
        onChange={(name) => form.setSectionField("student", "village", name)}
        error={form.fieldErrors["student.village"]}
      />
      <BoundTextField
        form={form}
        section="student"
        field="postal_code"
        label="Kode pos (opsional)"
        inputMode="numeric"
        maxLength={5}
      />
      <div className="grid grid-cols-2 gap-3 md:contents">
        <BoundTextField
          form={form}
          section="student"
          field="latitude"
          label="Lintang (opsional)"
          inputMode="decimal"
        />
        <BoundTextField
          form={form}
          section="student"
          field="longitude"
          label="Bujur (opsional)"
          inputMode="decimal"
        />
      </div>
      <BoundSelectField
        form={form}
        section="details"
        field="living_with"
        label="Jenis tinggal"
        options={LIVING_ARRANGEMENT_OPTIONS}
      />
      <BoundSelectField
        form={form}
        section="details"
        field="transportation_method"
        label="Transportasi ke sekolah"
        options={TRANSPORTATION_OPTIONS}
      />
    </FormSection>
  );
}

function ChildSchool({ form }: StepProps) {
  return (
    <FormSection title="Sekolah asal">
      <BoundTextField
        form={form}
        section="student"
        field="previous_school"
        label="Asal sekolah"
        placeholder="TK / PAUD"
      />
      <BoundTextField
        form={form}
        section="student"
        field="previous_school_npsn"
        label="NPSN sekolah asal (opsional)"
        inputMode="numeric"
        maxLength={8}
      />
      <BoundTextField
        form={form}
        section="student"
        field="previous_school_address"
        label="Alamat sekolah asal (opsional)"
      />
    </FormSection>
  );
}

function ChildPeriodic({ form }: StepProps) {
  return (
    <FormSection title="Data periodik">
      <div className="grid grid-cols-2 gap-3 md:contents">
        <BoundTextField
          form={form}
          section="details"
          field="height"
          label="Tinggi badan (cm)"
          inputMode="numeric"
        />
        <BoundTextField
          form={form}
          section="details"
          field="weight"
          label="Berat badan (kg)"
          inputMode="numeric"
        />
        <BoundTextField
          form={form}
          section="details"
          field="distance_km"
          label="Jarak ke sekolah (km)"
          inputMode="decimal"
        />
        <BoundTextField
          form={form}
          section="details"
          field="travel_time_minutes"
          label="Waktu tempuh (menit)"
          inputMode="numeric"
        />
      </div>
      <BoundTextField
        form={form}
        section="student"
        field="sibling_count"
        label="Jumlah saudara kandung"
        inputMode="numeric"
      />
    </FormSection>
  );
}

function ChildAid({ form }: StepProps) {
  return (
    <FormSection title="Bantuan sosial (opsional)">
      <BoundTextField
        form={form}
        section="student"
        field="kks_number"
        label="No. KKS"
      />
      <BoundTextField
        form={form}
        section="student"
        field="kps_number"
        label="No. KPS / PKH"
      />
      <BoundTextField
        form={form}
        section="student"
        field="kip_number"
        label="No. KIP"
      />
      <BoundTextField
        form={form}
        section="student"
        field="kip_name"
        label="Nama tertera di KIP"
      />
    </FormSection>
  );
}
