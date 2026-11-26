"use client";

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import {
  ChoiceField,
  DateField,
  FormSection,
  TextField,
} from "@/components/sections/RegistrationForm/fields";
import type { useStatementForm } from "@/hooks/useStatementForm";
import {
  MOTHER_ADDRESS_OPTIONS,
  STATEMENT_ADDRESS_FIELDS,
  STATEMENT_CHILD_FIELDS,
  STATEMENT_PARENT_FIELDS,
} from "@/lib/shared/constant/statement";
import { toLetterDate } from "@/modules/shared/date/letterDate";

const cardVariants = cva(
  "rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const feeRowVariants = cva([
  "flex flex-col gap-1 border-b border-gray-100 py-2.5 last:border-b-0",
  "sm:flex-row sm:items-center sm:justify-between",
]);

type StatementState = ReturnType<typeof useStatementForm>;

type SectionProps = {
  state: StatementState;
};

export function DateSection({ state }: SectionProps) {
  const letterDate = state.content.letter_date
    ? toLetterDate(state.content.letter_date)
    : null;

  return (
    <Card>
      <FormSection title="Tanggal surat">
        <DateField
          id="statement-date"
          label="Tanggal"
          value={state.content.letter_date}
          onChange={state.setLetterDate}
          required
        />
        <div className="space-y-1 text-[15px] text-gray-700">
          <p className="text-sm font-medium text-ink-700">Ditulis di surat</p>
          <p>
            {letterDate
              ? `${letterDate.weekday}, ${letterDate.dateLabel}`
              : "-"}
          </p>
          <p>{letterDate?.hijriLabel ?? "-"}</p>
        </div>
      </FormSection>
    </Card>
  );
}

type ParentSectionProps = SectionProps & {
  parent: "father" | "mother";
};

export function ParentSection({ state, parent }: ParentSectionProps) {
  const data = state.content[parent];
  const isMother = parent === "mother";
  const showAddress = !isMother || !state.content.mother.same_address;
  const title = isMother ? "Ibu" : "Bapak";

  return (
    <Card>
      <FormSection title={title}>
        {STATEMENT_PARENT_FIELDS.map((field) => (
          <TextField
            key={field.name}
            id={`statement-${parent}-${field.name}`}
            label={field.name === "name" ? `Nama ${title}` : field.label}
            value={data[field.name]}
            onChange={(value) => state.setParent(parent, field.name, value)}
            maxLength={200}
          />
        ))}
        {isMother && (
          <ChoiceField
            id="statement-mother-address"
            label="Alamat"
            value={state.content.mother.same_address ? "same" : "other"}
            options={MOTHER_ADDRESS_OPTIONS}
            onChange={(value) => state.setSameAddress(value === "same")}
          />
        )}
        {showAddress &&
          STATEMENT_ADDRESS_FIELDS.map((field) => (
            <TextField
              key={field.name}
              id={`statement-${parent}-${field.name}`}
              label={field.label}
              value={data.address[field.name]}
              onChange={(value) => state.setAddress(parent, field.name, value)}
              maxLength={200}
            />
          ))}
      </FormSection>
    </Card>
  );
}

export function ChildSection({ state }: SectionProps) {
  const { child } = state.content;

  return (
    <Card>
      <FormSection title="Anak">
        {STATEMENT_CHILD_FIELDS.map((field) => (
          <TextField
            key={field.name}
            id={`statement-child-${field.name}`}
            label={field.label}
            value={child[field.name]}
            onChange={(value) => state.setChild(field.name, value)}
            maxLength={200}
          />
        ))}
        <DateField
          id="statement-child-birth"
          label="Tanggal lahir"
          value={child.date_of_birth}
          onChange={(value) => state.setChild("date_of_birth", value)}
        />
      </FormSection>
    </Card>
  );
}

export function FeeSection({ state }: SectionProps) {
  return (
    <Card>
      <h3 className="mb-2 text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
        Biaya (dari Pengaturan PMB)
      </h3>
      {state.view.fee_rows.map((row) => (
        <div key={row.program} className={feeRowVariants()}>
          <span className="text-sm font-semibold text-gray-900">
            {row.program}
          </span>
          <span className="text-sm text-gray-700 sm:text-right">
            <span className="font-semibold text-gray-900">
              {row.total_label}
            </span>
            <span className="block text-xs text-gray-500">
              Setelah diskon {row.discounted_label}
            </span>
          </span>
        </div>
      ))}
      <div className={feeRowVariants()}>
        <span className="text-sm text-gray-500">Batas bayar</span>
        <span className="text-sm font-semibold text-gray-900">
          {state.view.deadline_label ?? "-"}
        </span>
      </div>
    </Card>
  );
}

export function SignerSection({ state }: SectionProps) {
  const { signers } = state.content;

  return (
    <Card>
      <FormSection title="Penanda tangan">
        <TextField
          id="statement-principal"
          label="Kepala sekolah"
          value={signers.principal_name}
          onChange={(value) => state.setSigner("principal_name", value)}
          maxLength={200}
        />
        <TextField
          id="statement-director"
          label="Direktur"
          value={signers.director_name}
          onChange={(value) => state.setSigner("director_name", value)}
          maxLength={200}
        />
      </FormSection>
    </Card>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <section className={cardVariants()}>{children}</section>;
}
