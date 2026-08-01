const STORAGE_KEY = "sdi_mock_session";

const MOCK_ACCOUNT = {
  email: "admin@sdidarussalam.sch.id",
  password: "admin123",
};

export function mockLogin(email: string, password: string): boolean {
  const is_valid =
    email.trim().toLowerCase() === MOCK_ACCOUNT.email &&
    password === MOCK_ACCOUNT.password;

  if (is_valid) {
    localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
  }

  return is_valid;
}

export function mockLogout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getMockSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
