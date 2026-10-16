import type { SessionUser } from "@/core/auth/AuthContext";

export type LoginInput = { email: string; password: string };

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = { user: SessionUser; token: string; expiresAt: number };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string) => emailPattern.test(value.trim());

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateLogin({ email, password }: LoginInput): FieldErrors<LoginInput> {
  const errors: FieldErrors<LoginInput> = {};
  if (!isEmail(email)) errors.email = "Informe um e-mail válido.";
  if (!password) errors.password = "Informe sua senha.";
  return errors;
}

export function validateRegister(input: RegisterInput): FieldErrors<RegisterInput> {
  const errors: FieldErrors<RegisterInput> = {};
  if (input.username.trim().length < 3) errors.username = "Use pelo menos 3 caracteres.";
  if (!isEmail(input.email)) errors.email = "Informe um e-mail válido.";
  if (input.password.length < 8) errors.password = "A senha precisa de 8 caracteres ou mais.";
  if (input.confirmPassword !== input.password) errors.confirmPassword = "As senhas não coincidem.";
  return errors;
}
