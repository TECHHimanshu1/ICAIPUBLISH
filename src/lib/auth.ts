// Fake auth stored in localStorage. Prototype only.
export type Session = {
  type: "member" | "non-member" | "admin";
  name: string;
  email?: string;
  memberId?: string;
  loginAt: string;
};

const KEY = "icai.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("icai-auth"));
}

export function clearSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("icai-auth"));
}

export function trackView(pubId: string) {
  const raw = localStorage.getItem("icai.recent") ?? "[]";
  const arr: string[] = JSON.parse(raw);
  const next = [pubId, ...arr.filter((x) => x !== pubId)].slice(0, 8);
  localStorage.setItem("icai.recent", JSON.stringify(next));
}
export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("icai.recent") ?? "[]");
}
export function toggleSaved(pubId: string) {
  const arr: string[] = JSON.parse(localStorage.getItem("icai.saved") ?? "[]");
  const next = arr.includes(pubId) ? arr.filter((x) => x !== pubId) : [...arr, pubId];
  localStorage.setItem("icai.saved", JSON.stringify(next));
  return next;
}
export function getSaved(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("icai.saved") ?? "[]");
}
