// Keep the credential in memory; refresh clears the admin session.
let adminKey: string | null = null;

// Remove credentials left behind by older versions of the admin panel.
try { sessionStorage.removeItem('blog_admin_key'); } catch { /* storage may be disabled */ }

export function getAdminKey(): string | null {
  return adminKey;
}

export function setAdminKey(key: string) {
  adminKey = key;
}

export function clearAdminKey() {
  adminKey = null;
}
