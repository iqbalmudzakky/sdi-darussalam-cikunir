export function toStaffName(account: {
  email: string;
  full_name: string;
}): string {
  return account.full_name || account.email.split("@")[0];
}
