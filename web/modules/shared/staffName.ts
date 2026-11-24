export function toStaffName(email: string): string {
  return email.split("@")[0];
}
