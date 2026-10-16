import type { Order, OrderRequest, QuoteChanged } from "../types/payment";
import { buildCartQuote } from "./cartQuote";
import { nfts } from "./data";

type OrderResult =
  { status: 201 | 200; body: Order } | { status: 409; body: QuoteChanged } | { status: 400; body: { message: string } };

// Idempotência: a mesma chave devolve o mesmo pedido, sem cobrar duas vezes.
const orders = new Map<string, Order>();

function hashFrom(key: string) {
  let seed = 2166136261;
  let hex = "";
  for (let index = 0; hex.length < 64; index += 1) {
    seed = Math.imul(seed ^ (key.charCodeAt(index % key.length) + index), 16777619) >>> 0;
    hex += seed.toString(16).padStart(8, "0");
  }
  return `0x${hex.slice(0, 64)}`;
}

export function resetOrders() {
  orders.clear();
}

export function placeOrder(request: OrderRequest): OrderResult {
  const existing = orders.get(request.key);
  if (existing) return { status: 200, body: existing };

  const items = request.items.filter((item) => item.quantity > 0 && nfts.some((nft) => nft.id === item.id));
  if (!items.length) return { status: 400, body: { message: "Nenhum item disponível para compra." } };

  const quote = buildCartQuote(items, request.coupon);
  if (quote.total !== request.expectedTotal)
    return { status: 409, body: { code: "quote-changed", total: quote.total } };

  // WalletConnect simula a recusa do colecionador na carteira.
  const declined = request.provider === "walletconnect";
  const order: Order = {
    id: `ORD-${hashFrom(request.key).slice(2, 10).toUpperCase()}`,
    status: declined ? "declined" : "confirmed",
    reason: declined ? "A transação foi recusada na carteira. Nenhum valor foi cobrado." : undefined,
    txHash: hashFrom(`tx-${request.key}`),
    createdAt: new Date().toISOString(),
    provider: request.provider,
    network: request.network,
    items: items.map(({ id, quantity }) => {
      const nft = nfts.find((candidate) => candidate.id === id)!;
      return { id, name: nft.name, image: nft.image, price: nft.price, quantity };
    }),
    subtotal: quote.subtotal,
    discount: quote.discount,
    networkFee: quote.networkFee,
    total: quote.total,
  };
  orders.set(request.key, order);
  return { status: 201, body: order };
}
