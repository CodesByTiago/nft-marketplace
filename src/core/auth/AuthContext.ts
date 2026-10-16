import { createContext, useContext } from "react";

export type SessionUser = {
  id: string;
  username: string;
  email: string;
};

export type AuthMode = "login" | "register";

export type AuthContextValue = {
  user: SessionUser | null;
  /** Abre o diálogo de acesso; `onSuccess` roda após entrar ou criar a conta. */
  openAuth: (mode?: AuthMode, onSuccess?: () => void) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  openAuth: () => undefined,
  logout: () => undefined,
});

export function useAuth() {
  return useContext(AuthContext);
}
