import type { WalletProvider } from "../types/payment";

export const providerLabels: Record<WalletProvider, string> = {
  walletconnect: "WalletConnect",
  metamask: "MetaMask",
  coinbase: "Coinbase Wallet",
};

export function shortHash(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function formatOrderDate(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

export function etherscanUrl(txHash: string) {
  return `https://etherscan.io/tx/${txHash}`;
}

const addressPattern = /^0x[a-fA-F0-9]{40}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isAddress = (value: string) => addressPattern.test(value.trim());
export const isEmail = (value: string) => emailPattern.test(value.trim());
