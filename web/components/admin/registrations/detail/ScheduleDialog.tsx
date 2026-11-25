"use client";

import { useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import {
  DateField,
  SearchSelectField,
} from "@/components/sections/RegistrationForm/fields";
import { TimeField } from "@/components/sections/RegistrationForm/TimeField";
import { Button } from "@/components/ui/form/button";
import { DATE_PICKER_YEARS_AHEAD } from "@/lib/shared/constant/datePicker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import type {
  RegistrationSchedule,
  RegistrationScheduleOptions,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";

type ScheduleDialogProps = {
  open: boolean;
  schedule: RegistrationSchedule | null;
  options: RegistrationScheduleOptions;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: UpdateRegistrationInput) => void;
};

export function ScheduleDialog({
  open,
  onClose,
  ...formProps
}: ScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="sm">
        <DialogTitle className="mb-4">Atur jadwal tes</DialogTitle>
        {open && <ScheduleForm {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

type ScheduleFormProps = Omit<ScheduleDialogProps, "open" | "onClose">;

function ScheduleForm({
  schedule,
  options,
  isSaving,
  onSave,
}: ScheduleFormProps) {
  const today = new Date();
  const lastDay = new Date(
    today.getFullYear() + DATE_PICKER_YEARS_AHEAD,
    11,
    31,
  );
  const [testDate, setTestDate] = useState(schedule?.test_date ?? "");
  const [testTime, setTestTime] = useState(schedule?.test_time ?? "");
  const [interviewerIds, setInterviewerIds] = useState({
    child: schedule?.child_interviewer?.id ?? "",
    parent: schedule?.parent_interviewer?.id ?? "",
  });
  const interviewerOptions = options.interviewers.map((interviewer) => ({
    value: interviewer.id,
    label: interviewer.name,
  }));
  const roles = [
    { key: "child", label: "Observer" },
    { key: "parent", label: "Pewawancara orang tua" },
  ] as const;

  function handleSubmit() {
    const input: UpdateRegistrationInput = {
      action: "schedule",
      schedule: {
        test_date: testDate,
        test_time: testTime,
        child_interviewer_id: interviewerIds.child || null,
        parent_interviewer_id: interviewerIds.parent || null,
      },
    };
    onSave(input);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <DateField
          id="schedule-date"
          label="Tanggal"
          value={testDate}
          onChange={setTestDate}
          startMonth={today}
          endMonth={lastDay}
          defaultMonth={today}
          minDate={today}
          required
        />
        <TimeField
          id="schedule-time"
          label="Jam"
          value={testTime}
          options={options.time_options}
          onChange={setTestTime}
          required
        />
      </div>

      {roles.map((role) => (
        <div key={role.key} className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <SearchSelectField
              id={`schedule-${role.key}-interviewer`}
              label={role.label}
              value={interviewerIds[role.key]}
              options={interviewerOptions}
              disabled={!options.can_assign_others}
              onChange={(value) =>
                setInterviewerIds((prev) => ({ ...prev, [role.key]: value }))
              }
            />
          </div>
          {options.self && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setInterviewerIds((prev) => ({
                  ...prev,
                  [role.key]: options.self?.id ?? "",
                }))
              }
              className="h-12.5 shrink-0 border-brand-200 text-brand-700"
            >
              <UserRound className="h-4 w-4" />
              Ambil
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
        className="h-11 w-full"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        Simpan jadwal
      </Button>
    </div>
  );
}
