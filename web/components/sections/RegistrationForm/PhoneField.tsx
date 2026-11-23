"use client";

import { cva } from "class-variance-authority";
import AE from "country-flag-icons/react/3x2/AE";
import AU from "country-flag-icons/react/3x2/AU";
import BN from "country-flag-icons/react/3x2/BN";
import CN from "country-flag-icons/react/3x2/CN";
import DE from "country-flag-icons/react/3x2/DE";
import EG from "country-flag-icons/react/3x2/EG";
import GB from "country-flag-icons/react/3x2/GB";
import HK from "country-flag-icons/react/3x2/HK";
import ID from "country-flag-icons/react/3x2/ID";
import IN from "country-flag-icons/react/3x2/IN";
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import KW from "country-flag-icons/react/3x2/KW";
import MY from "country-flag-icons/react/3x2/MY";
import NL from "country-flag-icons/react/3x2/NL";
import PH from "country-flag-icons/react/3x2/PH";
import PK from "country-flag-icons/react/3x2/PK";
import QA from "country-flag-icons/react/3x2/QA";
import SA from "country-flag-icons/react/3x2/SA";
import SG from "country-flag-icons/react/3x2/SG";
import TH from "country-flag-icons/react/3x2/TH";
import TL from "country-flag-icons/react/3x2/TL";
import TR from "country-flag-icons/react/3x2/TR";
import TW from "country-flag-icons/react/3x2/TW";
import US from "country-flag-icons/react/3x2/US";
import { SearchSelect } from "@/components/ui/form/search-select";
import { PHONE_COUNTRIES } from "@/lib/registrationOptions";
import { cn } from "@/lib/utils";
import { fieldInputVariants } from "./fields";

const flagVariants = cva("h-3.5 w-5 shrink-0 rounded-[2px] shadow-sm");

type PhoneFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function PhoneField({
  id,
  label,
  required,
  value,
  onChange,
  error,
}: PhoneFieldProps) {
  const flags = {
    AE,
    AU,
    BN,
    CN,
    DE,
    EG,
    GB,
    HK,
    ID,
    IN,
    JP,
    KR,
    KW,
    MY,
    NL,
    PH,
    PK,
    QA,
    SA,
    SG,
    TH,
    TL,
    TR,
    TW,
    US,
  };
  const countryOptions = PHONE_COUNTRIES.map((country) => {
    const Flag = flags[country.code];
    const option = {
      value: country.code,
      label: `${country.name} +${country.dial}`,
      triggerLabel: `+${country.dial}`,
      icon: <Flag className={flagVariants()} />,
    };
    return option;
  });

  const digits = value.replace(/\D/g, "");
  const country = value.startsWith("+")
    ? [...PHONE_COUNTRIES]
        .sort((first, second) => second.dial.length - first.dial.length)
        .find((item) => digits.startsWith(item.dial))
    : undefined;
  const selectedCountry = country ?? PHONE_COUNTRIES[0];
  const localNumber = country
    ? digits.slice(country.dial.length)
    : digits.replace(/^0+/, "");

  function emit(dial: string, number: string) {
    const cleanNumber = number.replace(/\D/g, "").replace(/^0+/, "");
    onChange(cleanNumber ? `+${dial}${cleanNumber}` : "");
  }

  function handleCountryChange(code: string) {
    const next = PHONE_COUNTRIES.find((item) => item.code === code);
    if (next) emit(next.dial, localNumber);
  }

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-ink-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <SearchSelect
          id={`${id}-country`}
          value={selectedCountry.code}
          options={countryOptions}
          onValueChange={handleCountryChange}
          searchPlaceholder="Cari negara"
          className={cn(
            fieldInputVariants({ invalid: Boolean(error) }),
            "w-28 shrink-0",
          )}
        />
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="812 3456 7890"
          value={localNumber}
          onChange={(event) => emit(selectedCountry.dial, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={fieldInputVariants({ invalid: Boolean(error) })}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
