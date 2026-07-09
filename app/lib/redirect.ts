/**
 * Normalises a `?redirect=` value into a safe, same-origin path.
 *
 * A bare `startsWith('/')` check is not enough: browsers treat `//evil.com` as a
 * protocol-relative absolute URL, so it must be rejected too. Anything that is not
 * a plain internal path falls back to the home page.
 */
export function safeRedirect(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

/** Builds an auth URL that will send the user back to `destination` once signed in. */
export function withRedirect(authPath: string, destination: string): string {
  const separator = authPath.includes('?') ? '&' : '?';
  return `${authPath}${separator}redirect=${encodeURIComponent(destination)}`;
}
