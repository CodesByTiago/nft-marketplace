import type { SessionUser } from "./AuthContext";

export type Session = { token: string; user: SessionUser };

export const SESSION_KEY = "kurio-session";
export const SESSION_EXPIRED_EVENT = "kurio:session-expired";

export function readSession(): Session | null {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Partial<Session> | null;
    return stored?.token && stored.user ? (stored as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Visitantes sem conta compartilham o identificador "guest".
export function currentUserId() {
  return readSession()?.user.id ?? "guest";
}
