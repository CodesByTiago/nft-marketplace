import { X } from "lucide-react";
import { useRef } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { AuthMode } from "@/core/auth/AuthContext";
import type { Session } from "@/core/auth/session";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { authLinkClass } from "./Fields";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthDialogProps = {
  mode: AuthMode | null;
  /** Aviso exibido acima do formulário (ex.: sessão expirada). */
  notice?: string;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess: (session: Session) => void;
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

// No mobile ocupa a tela inteira: zera o translate de centralização (via variáveis) e a animação de entrada.
const dialogClass =
  "auth-dialog group/auth flex w-[500px] max-w-[calc(100%-32px)] sm:max-w-[calc(100%-32px)] max-h-[calc(100dvh-32px)] flex-col items-stretch gap-0 overflow-y-auto rounded-[8px] bg-surface p-0 pt-12 pb-[34px] text-foreground shadow-[0_24px_64px_rgb(0_0_0/50%)] ring-0 max-[640px]:inset-0 max-[640px]:h-auto max-[640px]:max-h-none max-[640px]:w-auto max-[640px]:max-w-none max-[640px]:sm:max-w-none max-[640px]:justify-start max-[640px]:gap-10 max-[640px]:overflow-x-hidden max-[640px]:overscroll-contain max-[640px]:rounded-none max-[640px]:bg-background max-[640px]:px-7 max-[640px]:pt-20 max-[640px]:pb-6 max-[640px]:[--tw-translate-x:0] max-[640px]:[--tw-translate-y:0] max-[640px]:transform-none max-[640px]:animate-none max-[640px]:data-open:animate-none max-[640px]:data-closed:animate-none";
export function AuthDialog({ mode, notice, onModeChange, onClose, onSuccess }: AuthDialogProps) {
  const current = copy[mode ?? "login"];
  // O diálogo é controlado (sem Trigger): guarda quem o abriu para devolver o foco ao fechar.
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={dialogClass}
        data-mode={mode ?? "login"}
        onOpenAutoFocus={() => {
          opener.current = document.activeElement as HTMLElement | null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
        }}
      >
        <DialogPrimitive.Close
          className="absolute top-4 right-4 grid size-8 cursor-pointer place-items-center rounded-[6px] text-primary-light hover:bg-primary-light/12 max-[640px]:top-6 max-[640px]:right-6 max-[640px]:size-10 [&>svg]:size-5"
          aria-label="Fechar"
        >
          <X aria-hidden="true" />
        </DialogPrimitive.Close>
        <p
          className="hidden self-center text-center text-[32px] font-bold tracking-[3.2px] max-[640px]:block"
          aria-hidden="true"
        >
          KURIO
        </p>
        <DialogTitle className="m-0 hidden text-xl leading-none font-bold max-[640px]:block">
          {current.mobileTitle}
        </DialogTitle>
        <div className="flex items-center justify-center gap-2 max-[640px]:hidden" role="tablist" aria-label="Acesso">
          {(["login", "register"] as const).map((tab, index) => (
            <span key={tab} className="inline-flex items-center gap-2">
              {index > 0 && <span className="h-6 w-px bg-[#f0805f]" aria-hidden="true" />}
              <button
                type="button"
                role="tab"
                aria-selected={mode === tab}
                className="cursor-pointer text-xl font-medium text-foreground aria-selected:text-primary-light"
                onClick={() => onModeChange(tab)}
              >
                {copy[tab].title}
              </button>
            </span>
          ))}
        </div>
        <DialogDescription className="mx-12 mt-10 mb-0 text-center text-[13px] leading-[1.4] max-[640px]:hidden">
          {current.text}
        </DialogDescription>
        {notice && (
          <p role="alert" className="mx-12 mt-3 text-center text-xs text-muted-foreground">
            {notice}
          </p>
        )}
        {mode === "register" ? <RegisterForm onSuccess={onSuccess} /> : <LoginForm onSuccess={onSuccess} />}
        <p className="hidden text-center text-sm text-muted-foreground max-[640px]:block">
          {current.switchText}{" "}
          <button type="button" className={`${authLinkClass} ml-1`} onClick={() => onModeChange(current.other)}>
            {current.switchLabel}
          </button>
        </p>
        <span className="absolute inset-x-0 bottom-0 h-2.5 bg-primary max-[640px]:hidden" aria-hidden="true" />
      </DialogContent>
    </Dialog>
  );
}
