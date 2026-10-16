import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient } from "@/core/api/client";
import { AuthContext, type AuthMode, type SessionUser } from "@/core/auth/AuthContext";
import { clearSession, readSession, SESSION_EXPIRED_EVENT, writeSession, type Session } from "@/core/auth/session";
import { AuthDialog } from "@/features/auth/components/AuthDialog";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SessionUser | null>(() => readSession()?.user ?? null);
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [notice, setNotice] = useState<string | undefined>();
  const [afterAuth, setAfterAuth] = useState<(() => void) | undefined>();

  // Dados privados nunca sobrevivem à troca ou ao fim de sessão: o cache é descartado por inteiro.
  const dropSession = useCallback(() => {
    clearSession();
    setUser(null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === "private" });
  }, [queryClient]);

  const openAuth = useCallback((next: AuthMode = "login", onSuccess?: () => void) => {
    setNotice(undefined);
    setAfterAuth(() => onSuccess);
    setMode(next);
  }, []);

  const logout = useCallback(() => {
    void apiClient.post("/auth/logout").catch(() => undefined);
    dropSession();
  }, [dropSession]);

  useEffect(() => {
    const onExpired = () => {
      if (!readSession()) return;
      dropSession();
      setNotice("Sua sessão expirou. Entre novamente para continuar.");
      setMode("login");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [dropSession]);

  // Valida no servidor a sessão guardada (pode ter expirado enquanto a aba estava fechada).
  useEffect(() => {
    if (readSession()) void apiClient.get("/session").catch(() => undefined);
  }, []);

  const handleSuccess = (session: Session) => {
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === "private" });
    writeSession(session);
    setUser(session.user);
    setMode(null);
    setNotice(undefined);
    afterAuth?.();
  };

  const value = useMemo(() => ({ user, openAuth, logout }), [user, openAuth, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthDialog
        mode={mode}
        notice={notice}
        onModeChange={setMode}
        onClose={() => setMode(null)}
        onSuccess={handleSuccess}
      />
    </AuthContext.Provider>
  );
}
