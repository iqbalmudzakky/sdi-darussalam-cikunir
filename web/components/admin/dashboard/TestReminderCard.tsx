"use client";

import { useState, useSyncExternalStore } from "react";
import { cva } from "class-variance-authority";
import { Bell, Check, ChevronDown, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { markTestReminded } from "@/lib/api/registration/registrations";
import type { TestReminderGroup } from "@/types/registration/Registration";

const OPEN_STORAGE_KEY = "test-reminders-open";
const OPEN_CHANGE_EVENT = "test-reminders-open-change";

const cardVariants = cva(
  "mb-6 rounded-xl border border-amber-200 bg-white shadow-(--admin-card-shadow)",
);

const countChipVariants = cva([
  "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs",
  "font-semibold text-amber-700",
]);

const timeChipVariants = cva([
  "flex h-7.5 w-13.5 shrink-0 items-center justify-center rounded-lg",
  "bg-brand-50 text-sm font-semibold text-brand-700",
]);

const toggleVariants = cva(
  "h-4 w-4 text-gray-500 transition-transform duration-200",
  {
    variants: {
      open: { true: "rotate-180", false: "" },
    },
  },
);

const iconButtonVariants = cva(
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors",
  {
    variants: {
      tone: {
        whatsapp: "bg-green-600 text-white hover:bg-green-700",
        done: "border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 disabled:opacity-50",
      },
    },
  },
);

type TestReminderCardProps = {
  groups: TestReminderGroup[];
};

export function TestReminderCard({ groups }: TestReminderCardProps) {
  const toast = useToast();
  const [visibleGroups, setVisibleGroups] = useState(groups);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const isOpen = useSyncExternalStore(subscribeOpen, readOpen, () => true);
  const total = visibleGroups.reduce(
    (sum, group) => sum + group.reminders.length,
    0,
  );

  async function handleMarkReminded(registrationId: string) {
    setPendingId(registrationId);
    try {
      const result = await markTestReminded(registrationId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setVisibleGroups((prev) =>
        prev.map((group) => ({
          ...group,
          reminders: group.reminders.filter(
            (reminder) => reminder.registration_id !== registrationId,
          ),
        })),
      );
    } catch (error) {
      console.error("Failed to mark test reminded:", error);
      toast.error("Gagal menyimpan");
    } finally {
      setPendingId(null);
    }
  }

  if (total === 0) return null;

  return (
    <section className={cardVariants()}>
      <button
        type="button"
        onClick={() => writeOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3.5 text-left"
      >
        <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Bell className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-gray-900">
          Ingatkan jadwal tes
        </span>
        <span className={countChipVariants()}>{total}</span>
        <ChevronDown className={toggleVariants({ open: isOpen })} />
      </button>

      {isOpen && (
        <div className="max-h-80 overflow-y-auto px-4 pb-2">
          {visibleGroups
            .filter((group) => group.reminders.length > 0)
            .map((group) => (
              <div key={group.key}>
                <p className="pt-1 pb-1.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                  {group.label}
                </p>
                {group.reminders.map((reminder) => (
                  <div
                    key={reminder.registration_id}
                    className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0"
                  >
                    <span className={timeChipVariants()}>
                      {reminder.time_label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {reminder.full_name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {[
                          reminder.registration_number,
                          reminder.interviewer_name,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {reminder.whatsapp_url && (
                      <a
                        href={reminder.whatsapp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ingatkan orang tua ${reminder.full_name}`}
                        title="Kirim pengingat WA"
                        className={iconButtonVariants({ tone: "whatsapp" })}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkReminded(reminder.registration_id)
                      }
                      disabled={pendingId === reminder.registration_id}
                      aria-label="Sudah diingatkan"
                      title="Sudah diingatkan"
                      className={iconButtonVariants({ tone: "done" })}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

function subscribeOpen(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(OPEN_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(OPEN_CHANGE_EVENT, onChange);
  };
}

function readOpen(): boolean {
  try {
    return localStorage.getItem(OPEN_STORAGE_KEY) !== "closed";
  } catch {
    return true;
  }
}

function writeOpen(open: boolean) {
  try {
    localStorage.setItem(OPEN_STORAGE_KEY, open ? "open" : "closed");
  } catch {
    return;
  }
  window.dispatchEvent(new Event(OPEN_CHANGE_EVENT));
}
