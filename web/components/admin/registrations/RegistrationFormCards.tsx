import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import {
  Activity,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Trophy,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type {
  RegistrationFormAchievement,
  RegistrationFormParent,
  RegistrationFormRow,
  RegistrationFormSection,
} from "@/types/registration/Registration";

const cardVariants = cva("rounded-[14px] border px-4 pt-3.5 pb-1.5", {
  variants: {
    empty: {
      true: "border-dashed border-gray-300 pb-3.5",
      false: "border-gray-200 bg-white",
    },
  },
  defaultVariants: { empty: false },
});

const iconTileVariants = cva(
  "flex shrink-0 items-center justify-center rounded-lg",
  {
    variants: {
      tone: {
        brand: "h-7.5 w-7.5 bg-brand-50 text-brand-600",
        muted: "h-7.5 w-7.5 bg-gray-100 text-gray-400",
        trophy: "h-9 w-9 rounded-[10px] bg-amber-100 text-amber-700",
      },
    },
  },
);

const chipVariants = cva(
  "rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        brand: "bg-brand-100 text-brand-700",
        gray: "bg-gray-100 text-gray-700",
      },
    },
  },
);

const rowVariants = cva([
  "flex items-start justify-between gap-3 border-b border-gray-100 py-2.25",
  "text-[13px] last:border-b-0",
]);

type FormSectionCardProps = {
  section: RegistrationFormSection;
  className?: string;
};

export function FormSectionCard({ section, className }: FormSectionCardProps) {
  const icons: Record<RegistrationFormSection["key"], LucideIcon> = {
    identity: User,
    address: MapPin,
    previous_school: GraduationCap,
    periodic: Activity,
    social_aid: Heart,
    contact: Mail,
    payment: Wallet,
  };
  const Icon = icons[section.key];

  return (
    <section className={cardVariants({ className })}>
      <CardTitle
        title={section.title}
        icon={
          <span className={iconTileVariants({ tone: "brand" })}>
            <Icon className="h-4 w-4" />
          </span>
        }
      />
      <FormRows rows={section.rows} />
    </section>
  );
}

export function ParentFormCard({ parent }: { parent: RegistrationFormParent }) {
  const isEmpty = parent.rows === null;

  return (
    <section className={cardVariants({ empty: isEmpty })}>
      <CardTitle
        title={parent.title}
        muted={isEmpty}
        icon={
          <span
            className={iconTileVariants({ tone: isEmpty ? "muted" : "brand" })}
          >
            <User className="h-4 w-4" />
          </span>
        }
        trailing={
          isEmpty && (
            <span className={chipVariants({ tone: "gray" })}>Tidak diisi</span>
          )
        }
      />
      {parent.rows && <FormRows rows={parent.rows} />}
    </section>
  );
}

export function AchievementCard({
  achievement,
}: {
  achievement: RegistrationFormAchievement;
}) {
  return (
    <div className="flex gap-3 rounded-[14px] border border-gray-200 bg-white p-3.5">
      <span className={iconTileVariants({ tone: "trophy" })}>
        <Trophy className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-sm font-semibold break-words text-gray-900">
          {achievement.name}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className={chipVariants({ tone: "brand" })}>
            {achievement.category}
          </span>
          <span className={chipVariants({ tone: "gray" })}>
            {achievement.level}
          </span>
          <span className={chipVariants({ tone: "gray" })}>
            {achievement.year}
          </span>
        </div>
        {achievement.organizer && (
          <p className="text-[13px] text-gray-500">{achievement.organizer}</p>
        )}
      </div>
    </div>
  );
}

export function CountChip({ label }: { label: string }) {
  return <span className={chipVariants({ tone: "brand" })}>{label}</span>;
}

type CardTitleProps = {
  title: string;
  icon: ReactNode;
  muted?: boolean;
  trailing?: ReactNode;
};

function CardTitle({ title, icon, muted, trailing }: CardTitleProps) {
  return (
    <div className="flex items-center gap-2.5 pb-1">
      {icon}
      <h3
        className={
          muted
            ? "text-sm font-semibold text-gray-500"
            : "text-sm font-semibold text-gray-900"
        }
      >
        {title}
      </h3>
      {trailing}
    </div>
  );
}

function FormRows({ rows }: { rows: RegistrationFormRow[] }) {
  return (
    <dl>
      {rows.map((row) => (
        <div key={row.label} className={rowVariants()}>
          <dt className="shrink-0 text-gray-500">{row.label}</dt>
          <dd
            className={
              row.value
                ? "min-w-0 text-right font-semibold break-words text-gray-900"
                : "text-gray-400"
            }
          >
            {row.value ?? "–"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
