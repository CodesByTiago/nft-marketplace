export type WalletProvider = "walletconnect" | "metamask" | "coinbase";

export type WalletNetwork = "Ethereum" | "Polygon";

export type OrderRequest = {
  key: string;
  items: { id: string; quantity: number }[];
  coupon?: string;
  expectedTotal: string;
  provider: WalletProvider;
  network: WalletNetwork;
  address: string;
};

export type OrderItem = {
  id: string;
  name: string;
  image: string;
  price: string;
  quantity: number;
};

// Snapshot imutável: o recibo não depende mais do carrinho nem do catálogo.
export type Order = {
  id: string;
  status: "confirmed" | "declined";
  reason?: string;
  txHash: string;
  createdAt: string;
  provider: WalletProvider;
  network: WalletNetwork;
  items: OrderItem[];
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
};

export type QuoteChanged = { code: "quote-changed"; total: string };
