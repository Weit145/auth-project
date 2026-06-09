import type { Session } from "@/types/api";

const SESSION_STORAGE_KEY = "kload-testing-session";

export const emptySession: Session = {
  accessToken: "",
  user: null,
};

export function loadSession(): Session {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SESSION_STORAGE_KEY) ?? "{}",
    ) as Partial<Session>;

    return {
      accessToken: saved.accessToken ?? "",
      user: saved.user ?? null,
    };
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return emptySession;
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}
