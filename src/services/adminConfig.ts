const PASSWORD_KEY = 'eb_admin_password';
const DEFAULT_PASSWORD = 'Admin2026';

export async function getAdminPassword(): Promise<string> {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  localStorage.setItem(PASSWORD_KEY, newPassword);
}