import type { WalletNetwork, WalletProvider } from "@/features/marketplace/types/payment";
import { isAddress, isEmail } from "@/features/marketplace/utils/payment";

export type PrimaryWallet = {
  displayName: string;
  nickname: string;
  network: "" | WalletNetwork;
  profileName: string;
  address: string;
  secondary: string;
  provider: "" | WalletProvider;
  referral: string;
  email: string;
  ens: string;
};

export type SecondaryWallet = { nickname: string; network: WalletNetwork; address: string };

export type WalletsData = { primary: PrimaryWallet; secondary: SecondaryWallet | null };

export type WalletErrors = Partial<Record<keyof PrimaryWallet, string>>;

export const emptyPrimary: PrimaryWallet = {
  displayName: "",
  nickname: "",
  network: "",
  profileName: "",
  address: "",
  secondary: "",
  provider: "",
  referral: "",
  email: "",
  ens: "",
};

const required: [keyof PrimaryWallet, string][] = [
  ["displayName", "Informe o nome de exibição."],
  ["nickname", "Informe o apelido da carteira."],
  ["network", "Selecione uma rede."],
  ["profileName", "Informe o nome do perfil."],
  ["provider", "Selecione uma carteira."],
  ["referral", "Informe o código de indicação."],
  ["ens", "Informe o nome ENS."],
];

export function validatePrimary(wallet: PrimaryWallet): WalletErrors {
  const errors: WalletErrors = {};
  for (const [field, message] of required) {
    if (!wallet[field].trim()) errors[field] = message;
  }
  if (!isEmail(wallet.email)) errors.email = "Informe um e-mail válido.";
  if (!isAddress(wallet.address)) errors.address = "Informe um endereço 0x válido (42 caracteres).";
  return errors;
}

export type SecondaryErrors = Partial<Record<keyof SecondaryWallet, string>>;

export function validateSecondary(wallet: SecondaryWallet): SecondaryErrors {
  const errors: SecondaryErrors = {};
  if (!wallet.nickname.trim()) errors.nickname = "Informe o apelido da carteira.";
  if (!isAddress(wallet.address)) errors.address = "Informe um endereço 0x válido (42 caracteres).";
  return errors;
}

const storageKey = (userId: string) => `kurio-wallets:${userId}`;

export function loadWallets(userId: string, email: string): WalletsData {
  const base: WalletsData = { primary: { ...emptyPrimary, email }, secondary: null };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "null") as Partial<WalletsData> | null;
    return { primary: { ...base.primary, ...stored?.primary }, secondary: stored?.secondary ?? null };
  } catch {
    return base;
  }
}

export function saveWallets(userId: string, data: WalletsData) {
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}
