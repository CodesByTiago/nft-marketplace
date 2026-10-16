import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { AuthMode, SessionUser } from "@/core/auth/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthDialogProps = {
  mode: AuthMode | null;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess: (user: SessionUser) => void;
};

const copy = {
  login: {
    title: "Entrar",
    mobileTitle: "Entrar",
    text: "Entre para gerenciar sua carteira, coleção e perfil de criador.",
    switchText: "Novo na Kurio?",
    switchLabel: "Crie uma conta",
    other: "register",
  },
  register: {
    title: "Criar conta",
    mobileTitle: "Criar perfil de colecionador",
    text: "Crie seu perfil de colecionador e conecte uma carteira quando quiser.",
    switchText: "Já tem uma conta?",
    switchLabel: "Entre",
    other: "login",
  },
} as const;

export function AuthDialog({ mode, onModeChange, onClose, onSuccess }: AuthDialogProps) {
  const current = copy[mode ?? "login"];
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="auth-dialog" data-mode={mode ?? "login"}>
        <DialogPrimitive.Close className="auth-close" aria-label="Fechar">
          <X aria-hidden="true" />
        </DialogPrimitive.Close>
        <p className="auth-logo" aria-hidden="true">
          KURIO
        </p>
        <DialogTitle className="auth-mobile-title">{current.mobileTitle}</DialogTitle>
        <div className="auth-tabs" role="tablist" aria-label="Acesso">
          {(["login", "register"] as const).map((tab, index) => (
            <span key={tab} className="auth-tab-group">
              {index > 0 && <span className="auth-tab-divider" aria-hidden="true" />}
              <button
                type="button"
                role="tab"
                aria-selected={mode === tab}
                className="auth-tab"
                onClick={() => onModeChange(tab)}
              >
                {copy[tab].title}
              </button>
            </span>
          ))}
        </div>
        <DialogDescription className="auth-text">{current.text}</DialogDescription>
        {mode === "register" ? <RegisterForm onSuccess={onSuccess} /> : <LoginForm onSuccess={onSuccess} />}
        <p className="auth-switch">
          {current.switchText}{" "}
          <button type="button" className="auth-link" onClick={() => onModeChange(current.other)}>
            {current.switchLabel}
          </button>
        </p>
        <span className="auth-bar" aria-hidden="true" />
      </DialogContent>
    </Dialog>
  );
}
