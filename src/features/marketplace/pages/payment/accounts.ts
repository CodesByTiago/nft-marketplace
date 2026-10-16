import type { WalletNetwork } from "@/features/marketplace/types/payment";

export type Account = {
  id: string;
  label: string;
  name: string;
  address: string;
  network: WalletNetwork;
  networkLabel: string;
};

// Carteiras cadastradas do colecionador (a autenticação real ainda não existe).
export const accounts: Account[] = [
  {
    id: "reserva",
    label: "Reserva",
    name: "nova.kurio.eth",
    address: "0x7E2c4a6b8d0f1e3a5c7b9d1f3e5a7c9b1d3f5a7c",
    network: "Polygon",
    networkLabel: "Rede Polygon",
  },
  {
    id: "principal",
    label: "Principal",
    name: "0xA91F…E82C",
    address: "0xA91F3c5b7d9e1a2b4c6d8e0f1a3b5c7d9e0fE82C",
    network: "Ethereum",
    networkLabel: "Rede principal Ethereum",
  },
];
