/**
 * Stable per-browser guest id for the login-free resume suite.
 *
 * The id is stored in localStorage and sent as `x-guest-id` on API requests
 * made without a session token; the backend maps it to a lightweight guest
 * user so resumes/analyses persist across visits without registration.
 * Returns "" during SSR (no window) — the header is simply omitted.
 */
const STORAGE_KEY = "skillgauge_guest_id";

let cached: string | null = null;

export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";
  if (cached) return cached;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && /^[A-Za-z0-9-]{8,64}$/.test(existing)) {
      cached = existing;
      return cached;
    }
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(STORAGE_KEY, generated);
    cached = generated;
    return cached;
  } catch {
    // Storage disabled (private mode etc.) — still return an ephemeral id.
    cached = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    return cached;
  }
}
