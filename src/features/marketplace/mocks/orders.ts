import { getConfig } from "@/core/msw/config";
import type { Order, OrderRequest, QuoteChanged } from "../types/payment";
import { buildCartQuote } from "./cartQuote";
import { nfts } from "./data";

type OrderResult =
  | { status: 201 | 200 | 202; body: Order }
  | { status: 409; body: QuoteChanged | { code: "idempotency-conflict" } }
  | { status: 400; body: { message: string } };

type StoredOrder = { order: Order; userId: string; fingerprint: string; settleAt: number };

const STORE_KEY = "kurio-mock-orders";
export const DEFAULT_SETTLE_MS = 1_500;

// Estado do backend simulado: persistido para sobreviver a refresh e reinício do worker.
function readAll(): StoredOrder[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as StoredOrder[];
  } catch {
    return [];
  }
}

function writeAll(stored: StoredOrder[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(stored));
}

function hashFrom(key: string) {
  let seed = 2166136261;
  let hex = "";
  for (let index = 0; hex.length < 64; index += 1) {
    seed = Math.imul(seed ^ (key.charCodeAt(index % key.length) + index), 16777619) >>> 0;
    hex += seed.toString(16).padStart(8, "0");
  }
  return `0x${hex.slice(0, 64)}`;
}

function fingerprintOf(request: OrderRequest) {
  const items = [...request.items].sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify([items, request.coupon ?? "", request.provider, request.network, request.address]);
}

export function resetOrders() {
  localStorage.removeItem(STORE_KEY);
}

export function placeOrder(request: OrderRequest, userId: string, settleMs = DEFAULT_SETTLE_MS): OrderResult {
  const stored = readAll();
  const existing = stored.find((entry) => entry.order.key === request.key);
  // Idempotência: a mesma chave devolve o mesmo pedido; conteúdo diferente é conflito.
  if (existing) {
    if (existing.userId !== userId || existing.fingerprint !== fingerprintOf(request)) {
      return { status: 409, body: { code: "idempotency-conflict" } };
    }
    return { status: 200, body: existing.order };
  }

  const items = request.items.filter((item) => item.quantity > 0 && nfts.some((nft) => nft.id === item.id));
  if (!items.length) return { status: 400, body: { message: "Nenhum item disponível para compra." } };

  const quote = buildCartQuote(items, request.coupon);
  if (quote.unavailable?.length || quote.total !== request.expectedTotal)
    return { status: 409, body: { code: "quote-changed", total: quote.total } };

  const order: Order = {
    id: `ORD-${hashFrom(request.key).slice(2, 10).toUpperCase()}`,
    key: request.key,
    version: 1,
    status: "pending",
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
  writeAll([...stored, { order, userId, fingerprint: fingerprintOf(request), settleAt: Date.now() + settleMs }]);
  return { status: 202, body: order };
}

/** Consulta restrita ao dono: pedidos de outro usuário aparecem como inexistentes. */
export function findOrder(key: string, userId: string) {
  const entry = readAll().find((candidate) => candidate.order.key === key && candidate.userId === userId);
  return entry?.order;
}

export function pendingOrders() {
  return readAll().filter((entry) => entry.order.status === "pending");
}

/** Conclui o pedido pendente (confirma ou recusa) e devolve a nova versão. */
export function settleOrder(key: string): { order: Order; userId: string } | undefined {
  const stored = readAll();
  const entry = stored.find((candidate) => candidate.order.key === key && candidate.order.status === "pending");
  if (!entry) return undefined;

  // WalletConnect simula a recusa do colecionador na carteira.
  const declined = entry.order.provider === "walletconnect" || Boolean(getConfig().declineOrders);
  entry.order = {
    ...entry.order,
    version: entry.order.version + 1,
    status: declined ? "declined" : "confirmed",
    reason: declined ? "A transação foi recusada na carteira. Nenhum valor foi cobrado." : undefined,
  };
  writeAll(stored);
  return { order: entry.order, userId: entry.userId };
}
