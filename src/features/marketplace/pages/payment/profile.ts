import type { WalletNetwork } from "@/features/marketplace/types/payment";
import { isAddress, isEmail } from "@/features/marketplace/utils/payment";

export type Profile = {
  displayName: string;
  username: string;
  profileName: string;
  referral: string;
  email: string;
  ens: string;
  network: "" | WalletNetwork;
  address: string;
  secondary: string;
  useOther: boolean;
  note: string;
};

export type ProfileErrors = Partial<Record<keyof Profile, string>>;

export const emptyProfile: Profile = {
  displayName: "",
  username: "",
  profileName: "",
  referral: "",
  email: "",
  ens: "",
  network: "",
  address: "",
  secondary: "",
  useOther: false,
  note: "",
};

const required: [keyof Profile, string][] = [
  ["displayName", "Informe o nome de exibição."],
  ["username", "Informe o nome de usuário."],
  ["profileName", "Informe o nome do perfil."],
  ["referral", "Informe o código de indicação."],
  ["ens", "Informe o nome ENS."],
  ["network", "Selecione uma rede."],
];

export function validateProfile(profile: Profile): ProfileErrors {
  const errors: ProfileErrors = {};
  for (const [field, message] of required) {
    if (!String(profile[field]).trim()) errors[field] = message;
  }
  if (!isEmail(profile.email)) errors.email = "Informe um e-mail válido.";
  if (!isAddress(profile.address)) errors.address = "Informe um endereço 0x válido (42 caracteres).";
  if (profile.useOther && !profile.secondary.trim()) errors.secondary = "Informe a carteira secundária.";
  return errors;
}
