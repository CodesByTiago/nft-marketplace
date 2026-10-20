import { useState, type FormEvent } from "react";
import type { Session } from "@/core/auth/session";
import { login } from "../services/authService";
import { validateLogin, type FieldErrors, type LoginInput } from "../types";
import {
  authFailureClass,
  authFieldsClass,
  authFormClass,
  authLinkClass,
  authSubmitClass,
  PasswordField,
  TextField,
} from "./Fields";
import { SocialButtons } from "./SocialButtons";

export function LoginForm({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginInput>>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    setFailure("");
    if (Object.keys(found).length) return;
    setPending(true);
    try {
      onSuccess(await login(values));
    } catch (error) {
      setFailure((error as Error).message);
      setPending(false);
    }
  }

  const bind = (name: keyof LoginInput) => ({
    value: values[name],
    error: errors[name],
    onChange: (event: { target: { value: string } }) => setValues({ ...values, [name]: event.target.value }),
  });

  return (
    <form className={authFormClass} onSubmit={submit} noValidate>
      <div className={authFieldsClass}>
        <TextField
          id="auth-login-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="contato@email.com"
          {...bind("email")}
        />
        <PasswordField
          id="auth-login-password"
          label="Senha"
          autoComplete="current-password"
          placeholder="Senha"
          {...bind("password")}
        />
        <button
          type="button"
          className={`${authLinkClass} self-end`}
          onClick={() => setFailure("A recuperação de senha estará disponível em breve.")}
        >
          Esqueceu a senha?
        </button>
      </div>
      {failure && (
        <p role="alert" className={authFailureClass}>
          {failure}
        </p>
      )}
      <button type="submit" className={`auth-submit ${authSubmitClass}`} disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
      <SocialButtons />
    </form>
  );
}
