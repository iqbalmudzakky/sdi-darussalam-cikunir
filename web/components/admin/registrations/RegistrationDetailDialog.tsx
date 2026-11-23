"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Trophy, User, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { formatRegistrationSummary } from "@/lib/registrationOptions";
import type {
  RegistrationDetail,
  RegistrationFullForm,
  RegistrationFullFormTab,
} from "@/types/registration/Registration";
import {
  AchievementCard,
  CountChip,
  FormSectionCard,
  ParentFormCard,
} from "./RegistrationFormCards";

const dialogVariants = cva([
  "flex flex-col border-0 md:h-[min(45rem,calc(100dvh-4rem))] md:max-w-170",
  "md:rounded-[18px] lg:max-w-220",
  "max-md:top-0 max-md:left-0 max-md:h-dvh max-md:w-full max-md:max-w-none",
  "max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none",
]);

const topVariants = cva([
  "space-y-3.5 border-b border-brand-100 bg-brand-50 px-4 pt-4.5 pb-3.5",
  "md:space-y-4.5 md:px-6 md:pt-5.5 md:pb-4.5",
]);

const avatarVariants = cva([
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600",
  "text-[15px] font-semibold text-white md:h-13 md:w-13 md:text-[17px]",
]);

const headerChipVariants = cva(
  "rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-brand-700",
);

const closeButtonVariants = cva([
  "flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center",
  "rounded-full bg-white text-gray-600 transition-colors hover:text-gray-900",
]);

const tabVariants = cva(
  [
    "flex cursor-pointer items-center gap-1.5 rounded-full px-2.75 py-2 text-[13px]",
    "whitespace-nowrap transition-colors md:px-3.5 md:py-2.25 md:text-sm",
  ],
  {
    variants: {
      active: {
        true: "bg-brand-600 font-semibold text-white",
        false:
          "border border-brand-100 bg-white font-medium text-brand-700 hover:bg-brand-100",
      },
    },
  },
);

const bodyVariants = cva([
  "flex-1 space-y-3.5 overflow-y-auto bg-gray-50 px-4 pt-4 pb-6",
  "md:space-y-4 md:px-6 md:pt-5",
]);

type RegistrationDetailDialogProps = {
  registration: RegistrationDetail | null;
  onOpenChange: (open: boolean) => void;
};

export function RegistrationDetailDialog({
  registration,
  onOpenChange,
}: RegistrationDetailDialogProps) {
  const fullForm = registration?.full_form ?? null;

  return (
    <Dialog
      open={registration !== null && fullForm !== null}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        size="lg"
        showCloseButton={false}
        className={dialogVariants()}
        contentClassName="flex min-h-0 flex-1 flex-col max-h-none overflow-hidden p-0"
      >
        {registration && fullForm && (
          <FullFormView
            registration={registration}
            fullForm={fullForm}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type FullFormViewProps = {
  registration: RegistrationDetail;
  fullForm: RegistrationFullForm;
  onClose: () => void;
};

function FullFormView({ registration, fullForm, onClose }: FullFormViewProps) {
  const tabs = [
    { key: "child", label: "Anak", Icon: User },
    { key: "parents", label: "Orang tua", Icon: Users },
    { key: "contact", label: "Kontak & prestasi", Icon: Trophy },
  ] as const;
  const [tab, setTab] = useState<RegistrationFullFormTab>("child");
  const initials = registration.full_name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  const summary = formatRegistrationSummary(registration);

  return (
    <>
      <div className={topVariants()}>
        <div className="flex items-center gap-3.5">
          <span className={avatarVariants()}>{initials}</span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <DialogTitle className="truncate text-[17px] font-semibold md:text-[19px]">
              {registration.full_name}
            </DialogTitle>
            <div className="flex flex-wrap gap-1.5">
              <span className={headerChipVariants()}>
                {registration.registration_number ?? "-"}
              </span>
              <span className={headerChipVariants()}>{summary}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className={closeButtonVariants()}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div role="tablist" className="flex gap-1.5 overflow-x-auto md:gap-2">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={tabVariants({ active: tab === key })}
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" className={bodyVariants()}>
        {tab === "child" && <ChildTab fullForm={fullForm} />}
        {tab === "parents" && (
          <div className="grid items-start gap-3.5 md:gap-4 lg:grid-cols-3">
            {fullForm.parents.map((parent) => (
              <ParentFormCard key={parent.key} parent={parent} />
            ))}
          </div>
        )}
        {tab === "contact" && <ContactTab fullForm={fullForm} />}
      </div>
    </>
  );
}

function ChildTab({ fullForm }: { fullForm: RegistrationFullForm }) {
  const sections = fullForm.child.map((section, order) => ({ section, order }));
  const columns = [
    sections.filter((item) => item.order % 2 === 0),
    sections.filter((item) => item.order % 2 === 1),
  ];

  return (
    <div className="flex flex-col gap-3.5 md:grid md:grid-cols-2 md:items-start md:gap-4">
      {columns.map((items, columnIndex) => (
        <div
          key={columnIndex}
          className="contents md:flex md:flex-col md:gap-4"
        >
          {items.map(({ section, order }) => (
            <div key={section.key} style={{ order }}>
              <FormSectionCard section={section} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ContactTab({ fullForm }: { fullForm: RegistrationFullForm }) {
  const achievements = fullForm.achievements;
  const countLabel =
    achievements.length > 0 ? String(achievements.length) : "Tidak ada";

  return (
    <>
      {fullForm.contact.map((section) => (
        <FormSectionCard key={section.key} section={section} />
      ))}

      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Prestasi</h3>
          <CountChip label={countLabel} />
        </div>
        <div className="grid items-start gap-3 md:grid-cols-2">
          {achievements.map((achievement, index) => (
            <AchievementCard key={index} achievement={achievement} />
          ))}
        </div>
      </div>
    </>
  );
}
