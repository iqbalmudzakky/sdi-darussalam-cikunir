import Link from "next/link";
import { cva } from "class-variance-authority";
import {
  Download,
  FilePlus,
  FileText,
  Folder,
  Lock,
  Pencil,
} from "lucide-react";
import { Chip } from "@/components/ui/display/chip";
import { Button } from "@/components/ui/form/button";
import type {
  RegistrationDetail,
  RegistrationLetter,
} from "@/types/registration/Registration";

const cardVariants = cva(
  "space-y-1 rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const rowVariants = cva(
  "flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0",
);

const fileIconVariants = cva(
  "flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500",
);

type LettersCardProps = {
  registration: RegistrationDetail;
};

export function LettersCard({ registration }: LettersCardProps) {
  if (registration.letters.length === 0) return null;

  return (
    <section className={cardVariants()}>
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Folder className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-gray-900">Dokumen</h2>
      </div>

      {registration.letters.map((letter) => (
        <LetterRow key={letter.kind} letter={letter} />
      ))}
    </section>
  );
}

function LetterRow({ letter }: { letter: RegistrationLetter }) {
  const isLocked = letter.state === "locked";
  const lockIcon = isLocked ? <Lock className="h-3 w-3" /> : undefined;
  const editUrl = letter.edit_url;

  return (
    <div className={rowVariants()}>
      <span className={fileIconVariants()}>
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{letter.title}</p>
        {letter.subtitle && (
          <p className="text-xs text-gray-500">{letter.subtitle}</p>
        )}
      </div>

      {letter.status_label && (
        <Chip tone={isLocked ? "amber" : "gray"} icon={lockIcon}>
          {letter.status_label}
        </Chip>
      )}

      {letter.state === "empty" && editUrl && (
        <Button
          nativeButton={false}
          render={<Link href={editUrl} />}
          className="h-9 px-3"
        >
          <FilePlus className="h-4 w-4" />
          Buat
        </Button>
      )}

      {letter.state === "ready" && editUrl && (
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={<Link href={editUrl} />}
          aria-label={`Ubah ${letter.title}`}
          title="Ubah"
          className="h-9 w-9"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {letter.download_url && (
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <a
              href={letter.download_url}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          aria-label={`Unduh ${letter.title}`}
          title="Unduh PDF"
          className="h-9 w-9"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
