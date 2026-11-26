"use client";

import Link from "next/link";
import { ArrowLeft, Check, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import { useStatementForm } from "@/hooks/useStatementForm";
import type { StatementView } from "@/types/registration/Registration";
import {
  ChildSection,
  DateSection,
  FeeSection,
  ParentSection,
  SignerSection,
} from "./StatementSections";

type StatementScreenProps = {
  initial: StatementView;
};

export function StatementScreen({ initial }: StatementScreenProps) {
  const state = useStatementForm(initial);
  const { view, isSaving } = state;
  const saveIcon = isSaving ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Check className="h-4 w-4" />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Link
        href={`/registrations/${view.registration_id}`}
        className="flex w-fit items-center gap-2.5 font-semibold text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
        Pendaftar
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="flex-1 text-xl font-semibold text-gray-900 sm:text-2xl">
          Surat pernyataan
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={state.applyLatest}
            disabled={isSaving}
            className="h-10 flex-1 sm:flex-none"
          >
            <RefreshCw className="h-4 w-4" />
            Gunakan Update Terbaru
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={state.download}
            disabled={isSaving}
            className="hidden h-10 sm:inline-flex"
          >
            <Download className="h-4 w-4" />
            Unduh PDF
          </Button>
          <Button
            type="button"
            onClick={state.save}
            disabled={isSaving}
            className="hidden h-10 px-4 sm:inline-flex"
          >
            {saveIcon}
            Simpan
          </Button>
        </div>
      </div>

      <DateSection state={state} />
      <ParentSection state={state} parent="father" />
      <ParentSection state={state} parent="mother" />
      <ChildSection state={state} />
      <FeeSection state={state} />
      <SignerSection state={state} />

      <div className="flex gap-2 sm:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={state.download}
          disabled={isSaving}
          className="h-11 flex-1"
        >
          <Download className="h-4 w-4" />
          Unduh PDF
        </Button>
        <Button
          type="button"
          onClick={state.save}
          disabled={isSaving}
          className="h-11 flex-1"
        >
          {saveIcon}
          Simpan
        </Button>
      </div>
    </div>
  );
}
