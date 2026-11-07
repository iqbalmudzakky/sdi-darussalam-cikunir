import { z } from "zod";

const AcademicYearSchema = z
  .string()
  .regex(
    /^\d{4}\/\d{4}$/,
    "Format tahun ajaran tidak valid. Contoh: 2027/2028.",
  )
  .refine((value) => {
    const [first, second] = value.split("/").map(Number);
    return second === first + 1;
  }, "Tahun kedua harus tahun pertama + 1, contoh: 2027/2028.");

export const CreateAcademicYearRequestSchema = z.object({
  academic_year: AcademicYearSchema,
});
export type CreateAcademicYearRequest = z.infer<
  typeof CreateAcademicYearRequestSchema
>;

export const SetCurrentAcademicYearRequestSchema = z.object({
  academic_year: AcademicYearSchema,
});
export type SetCurrentAcademicYearRequest = z.infer<
  typeof SetCurrentAcademicYearRequestSchema
>;

export const SaveOfflineCountRequestSchema = z.object({
  academic_year: AcademicYearSchema,
  offline_count: z
    .number({ message: "Jumlah pendaftar offline harus berupa angka." })
    .int("Jumlah pendaftar offline harus bilangan bulat.")
    .min(0, "Jumlah pendaftar offline tidak boleh negatif."),
});
export type SaveOfflineCountRequest = z.infer<
  typeof SaveOfflineCountRequestSchema
>;

export type AcademicYearSummaryResponse = {
  academic_year: string;
  is_current: boolean;
  online_count: number;
  offline_recorded_count: number;
  offline_pending_count: number;
  total: number;
};
