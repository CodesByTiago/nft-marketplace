import { useState, type FormEvent } from "react";
import type { Session } from "@/core/auth/session";
import { register } from "../services/authService";
import { validateRegister, type FieldErrors, type RegisterInput } from "../types";
import { PasswordField, TextField } from "./Fields";
import { SocialButtons } from "./SocialButtons";

const empty: RegisterInput = { username: "", email: "", password: "", confirmPassword: "" };

export function RegisterForm({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [values, setValues] = useState<RegisterInput>(empty);
  const [errors, setErrors] = useState<FieldErrors<RegisterInput>>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateRegister(values);
    setErrors(found);
    setFailure("");
    if (Object.keys(found).length) return;
    setPending(true);
    try {
      onSuccess(await register(values));
    } catch (error) {
      setFailure((error as Error).message);
      setPending(false);
    }
  }

  const bind = (name: keyof RegisterInput) => ({
    value: values[name],
    error: errors[name],
    onChange: (event: { target: { value: string } }) => setValues({ ...values, [name]: event.target.value }),
  });

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="auth-fields">
        <TextField
          id="auth-register-username"
          label="Nome de usuário"
          autoComplete="username"
          placeholder="Nome de usuário"
          {...bind("username")}
        />
        <TextField
          id="auth-register-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          {...bind("email")}
        />
        <PasswordField
          id="auth-register-password"
          label="Senha"
          autoComplete="new-password"
          placeholder="Senha"
          {...bind("password")}
        />
        <PasswordField
          id="auth-register-confirm"
          label="Confirmar senha"
          autoComplete="new-password"
          placeholder="Confirmar senha"
          {...bind("confirmPassword")}
        />
      </div>
      {failure && (
        <p role="alert" className="auth-error auth-failure">
          {failure}
        </p>
      )}
      <button type="submit" className="auth-submit" disabled={pending}>
        {pending ? "Criando..." : "Criar conta"}
      </button>
      <SocialButtons />
    </form>
  );
}
