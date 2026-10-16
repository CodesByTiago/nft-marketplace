import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthMode, type SessionUser } from "@/core/auth/AuthContext";
import { AuthDialog } from "@/features/auth/components/AuthDialog";

const SESSION_KEY = "kurio-session";

function readSession(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as SessionUser | null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSession);
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [afterAuth, setAfterAuth] = useState<(() => void) | undefined>();

  const openAuth = useCallback((next: AuthMode = "login", onSuccess?: () => void) => {
    setAfterAuth(() => onSuccess);
    setMode(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const handleSuccess = (session: SessionUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    setMode(null);
    afterAuth?.();
  };

  const value = useMemo(() => ({ user, openAuth, logout }), [user, openAuth, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthDialog mode={mode} onModeChange={setMode} onClose={() => setMode(null)} onSuccess={handleSuccess} />
    </AuthContext.Provider>
  );
}
