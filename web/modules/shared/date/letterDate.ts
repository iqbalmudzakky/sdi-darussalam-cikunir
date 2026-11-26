import { NUMBER_WORDS } from "@/modules/shared/constant/admission/letter";

export type LetterDate = {
  weekday: string;
  dateLabel: string;
  hijriLabel: string;
  spelledLabel: string;
};

export function spellNumber(value: number): string {
  if (value < 12) return NUMBER_WORDS[value];
  if (value < 20) return `${NUMBER_WORDS[value - 10]} Belas`;

  const tensWord = `${NUMBER_WORDS[Math.floor(value / 10)]} Puluh`;
  const unit = value % 10;
  return unit === 0 ? tensWord : `${tensWord} ${NUMBER_WORDS[unit]}`;
}

export function toLetterDate(isoDate: string): LetterDate {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const weekday = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
  const month = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    timeZone: "UTC",
  }).format(date);
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hijriLabel = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  const letterDate: LetterDate = {
    weekday,
    dateLabel: `${day} ${month} ${year}`,
    hijriLabel,
    spelledLabel: `${weekday}, tanggal ${spellNumber(day)} bulan ${month} tahun ${year}`,
  };
  return letterDate;
}
