export type AccountProfile = {
  displayName: string;
  username: string;
  email: string;
  walletNickname: string;
  ensName: string;
  avatar: string;
};

export type PasswordChange = { current: string; next: string; confirm: string };

export type ProfileErrors = Partial<Record<keyof AccountProfile | keyof PasswordChange, string>>;

const required = "Campo obrigatório.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ensPattern = /^[a-z0-9-]{3,}$/i;

export const emptyPasswordChange: PasswordChange = { current: "", next: "", confirm: "" };

export function validateAccount(profile: AccountProfile, password: PasswordChange): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!profile.displayName.trim()) errors.displayName = required;
  if (profile.username.trim().length < 3) errors.username = "Use pelo menos 3 caracteres.";
  if (!emailPattern.test(profile.email.trim())) errors.email = "Informe um e-mail válido.";
  if (!profile.walletNickname.trim()) errors.walletNickname = required;
  if (!ensPattern.test(profile.ensName.trim())) errors.ensName = "Informe um nome ENS com 3+ caracteres.";

  if (password.current || password.next || password.confirm) {
    if (!password.current) errors.current = "Informe a senha atual.";
    if (password.next.length < 8) errors.next = "A nova senha precisa de 8 caracteres ou mais.";
    else if (password.next === password.current) errors.next = "A nova senha deve ser diferente da atual.";
    if (password.confirm !== password.next) errors.confirm = "As senhas não coincidem.";
  }
  return errors;
}
