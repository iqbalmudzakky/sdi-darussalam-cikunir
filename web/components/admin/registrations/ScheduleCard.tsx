"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { CalendarDays, CheckCheck, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import type {
  RegistrationDetail,
  RegistrationSchedule,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";
import { ScheduleDialog } from "./ScheduleDialog";

const cardVariants = cva(
  "space-y-3.5 rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const dateBlockVariants = cva([
  "flex h-16 w-14.5 shrink-0 flex-col items-center justify-center rounded-xl",
  "bg-brand-600 text-white",
]);

const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      tone: {
        gray: "bg-gray-100 text-gray-700",
        brand: "border border-brand-200 bg-brand-50 text-brand-700",
      },
    },
  },
);

const interviewerRowVariants = cva(
  "flex items-center gap-2.5 border-t border-gray-100 py-2.5 text-sm last:pb-0",
);

const initialVariants = cva([
  "flex h-6 w-6 items-center justify-center rounded-full bg-brand-100",
  "text-[11px] font-semibold text-brand-700",
]);

type ScheduleCardProps = {
  registration: RegistrationDetail;
  isSaving: boolean;
  onSave: (input: UpdateRegistrationInput) => Promise<boolean>;
};

export function ScheduleCard({
  registration,
  isSaving,
  onSave,
}: ScheduleCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const schedule = registration.schedule;
  const canEdit = registration.can_cancel;

  async function handleSave(input: UpdateRegistrationInput) {
    const saved = await onSave(input);
    if (saved) setIsDialogOpen(false);
  }

  return (
    <section className={cardVariants()}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <CalendarDays className="h-4 w-4" />
        </span>
        <h2 className="flex-1 text-sm font-semibold text-gray-900">
          Jadwal tes
        </h2>
        {!schedule && (
          <span className={chipVariants({ tone: "gray" })}>
            Belum dijadwalkan
          </span>
        )}
        {schedule && canEdit && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            aria-label="Ubah jadwal"
            title="Ubah jadwal"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!schedule && canEdit && (
        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="h-11 w-full sm:w-auto"
        >
          <CalendarDays className="h-4 w-4" />
          Atur jadwal
        </Button>
      )}

      {schedule && <ScheduleSummary schedule={schedule} />}

      <ScheduleDialog
        open={isDialogOpen}
        schedule={schedule}
        options={registration.schedule_options}
        isSaving={isSaving}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </section>
  );
}

function ScheduleSummary({ schedule }: { schedule: RegistrationSchedule }) {
  const interviewers = [
    { label: "Pewawancara anak", person: schedule.child_interviewer },
    { label: "Pewawancara orang tua", person: schedule.parent_interviewer },
  ];

  return (
    <>
      <div className="flex items-center gap-3.5">
        <div className={dateBlockVariants()}>
          <span className="text-[11px] font-semibold text-brand-100">
            {schedule.weekday_short}
          </span>
          <span className="text-2xl leading-7 font-bold">
            {schedule.day_number}
          </span>
          <span className="text-[11px] font-medium text-brand-100">
            {schedule.month_short}
          </span>
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="font-semibold text-gray-900">{schedule.date_label}</p>
          <div className="flex flex-wrap gap-1.5">
            <span className={chipVariants({ tone: "gray" })}>
              <Clock className="h-3 w-3" />
              {schedule.time_label} WIB
            </span>
            {schedule.is_reminded && (
              <span className={chipVariants({ tone: "brand" })}>
                <CheckCheck className="h-3 w-3" />
                Sudah diingatkan
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        {interviewers.map(({ label, person }) => (
          <div key={label} className={interviewerRowVariants()}>
            <span className="flex-1 text-gray-500">{label}</span>
            {person ? (
              <>
                <span className={initialVariants()}>
                  {person.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold text-gray-900">
                  {person.name}
                </span>
              </>
            ) : (
              <span className="text-gray-400">–</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
