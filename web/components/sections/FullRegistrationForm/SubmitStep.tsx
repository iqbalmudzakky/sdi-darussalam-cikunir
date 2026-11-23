"use client";

import { cva } from "class-variance-authority";
import {
  AlertTriangle,
  CircleCheck,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import {
  FormSection,
  SelectField,
  TextField,
} from "@/components/sections/RegistrationForm/fields";
import {
  ACHIEVEMENT_CATEGORY_OPTIONS,
  ACHIEVEMENT_LEVEL_OPTIONS,
} from "@/lib/registrationOptions";
import type {
  FullFormController,
  FullFormStep,
} from "@/types/registration/Registration";
import { BoundPhoneField, BoundTextField } from "./BoundFields";

const addButtonVariants = cva(
  "md:col-span-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white py-3 text-sm font-medium text-brand-700 hover:bg-brand-50",
);

const checkRowVariants = cva(
  "flex w-full cursor-pointer items-center gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 text-left",
);

type SubmitStepProps = {
  form: FullFormController;
  stepsWithErrors: FullFormStep[];
  onEditStep: (step: FullFormStep) => void;
};

export function SubmitStep({
  form,
  stepsWithErrors,
  onEditStep,
}: SubmitStepProps) {
  const checkRows = [
    { step: "child", label: "Data anak" },
    { step: "parents", label: "Data orang tua" },
  ] as const;

  return (
    <div className="space-y-8">
      <FormSection title="Kontak">
        <TextField
          id="parent_email"
          label="Email"
          type="email"
          inputMode="email"
          placeholder="nama@email.com"
          value={form.values.parent_email}
          onChange={form.setParentEmail}
          error={form.fieldErrors.parent_email}
        />
        <BoundPhoneField
          form={form}
          section="student"
          field="phone"
          label="No. HP"
        />
        <BoundTextField
          form={form}
          section="student"
          field="home_phone"
          label="Telepon rumah (opsional)"
          inputMode="tel"
        />
      </FormSection>

      <FormSection title="Prestasi">
        {form.values.achievements.map((achievement, index) => (
          <AchievementCard
            key={index}
            form={form}
            index={index}
            achievement={achievement}
          />
        ))}
        <button
          type="button"
          onClick={form.addAchievement}
          className={addButtonVariants()}
        >
          <Plus className="h-4 w-4" />
          Tambah prestasi
        </button>
      </FormSection>

      <FormSection title="Cek data">
        {checkRows.map((row) => {
          const hasError = stepsWithErrors.includes(row.step);
          return (
            <button
              key={row.step}
              type="button"
              onClick={() => onEditStep(row.step)}
              className={checkRowVariants()}
            >
              {hasError ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <CircleCheck className="h-5 w-5 text-brand-600" />
              )}
              <span className="flex-1 text-sm font-medium text-ink-900">
                {row.label}
              </span>
              <ChevronRight className="h-5 w-5 text-ink-500" />
            </button>
          );
        })}
      </FormSection>
    </div>
  );
}

type AchievementCardProps = {
  form: FullFormController;
  index: number;
  achievement: FullFormController["values"]["achievements"][number];
};

function AchievementCard({ form, index, achievement }: AchievementCardProps) {
  const errorKey = `achievements.${index}`;

  return (
    <div className="grid gap-4 rounded-xl border border-brand-100 bg-white p-4 md:col-span-2 md:grid-cols-2">
      <div className="flex items-center justify-between md:col-span-2">
        <p className="text-sm font-semibold text-ink-900">
          Prestasi {index + 1}
        </p>
        <button
          type="button"
          onClick={() => form.removeAchievement(index)}
          aria-label={`Hapus prestasi ${index + 1}`}
          className="cursor-pointer rounded-lg p-1.5 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <SelectField
        id={`achievement-${index}-category`}
        label="Jenis"
        options={ACHIEVEMENT_CATEGORY_OPTIONS}
        value={achievement.category}
        onChange={(value) => form.updateAchievement(index, "category", value)}
        error={form.fieldErrors[`${errorKey}.category`]}
      />
      <SelectField
        id={`achievement-${index}-level`}
        label="Tingkat"
        options={ACHIEVEMENT_LEVEL_OPTIONS}
        value={achievement.level}
        onChange={(value) => form.updateAchievement(index, "level", value)}
        error={form.fieldErrors[`${errorKey}.level`]}
      />
      <TextField
        id={`achievement-${index}-name`}
        label="Nama prestasi"
        value={achievement.name}
        onChange={(value) => form.updateAchievement(index, "name", value)}
        error={form.fieldErrors[`${errorKey}.name`]}
      />
      <div className="grid grid-cols-2 gap-3 md:contents">
        <TextField
          id={`achievement-${index}-year`}
          label="Tahun"
          inputMode="numeric"
          maxLength={4}
          value={achievement.year}
          onChange={(value) => form.updateAchievement(index, "year", value)}
          error={form.fieldErrors[`${errorKey}.year`]}
        />
        <TextField
          id={`achievement-${index}-organizer`}
          label="Penyelenggara"
          value={achievement.organizer}
          onChange={(value) =>
            form.updateAchievement(index, "organizer", value)
          }
          error={form.fieldErrors[`${errorKey}.organizer`]}
        />
      </div>
    </div>
  );
}
