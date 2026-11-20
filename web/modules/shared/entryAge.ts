export function calculateEntryAge(
  birthDate: string,
  academicYear: string,
): { years: number; months: number } {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const entryYear = Number(academicYear.split("/")[0]);
  const birthdayOffset = birthDay > 1 ? 1 : 0;
  const totalMonths =
    (entryYear - birthYear) * 12 + (7 - birthMonth) - birthdayOffset;
  const age = {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  };
  return age;
}
