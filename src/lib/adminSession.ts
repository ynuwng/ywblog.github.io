export const ADMIN_SESSION_KEY = 'blog_admin_key';

export function getAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_SESSION_KEY);
}

export function setAdminKey(key: string) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, key);
}

export function clearAdminKey() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
