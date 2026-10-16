import { delay, http, HttpResponse, ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import type { NftUpdatedEvent, OrderUpdatedEvent } from "../types/realtime";
import type { Order } from "../types/payment";
import { nfts } from "./data";
import { buildConfig, getConfig, patchConfig, presets, resetConfig, setConfig } from "@/core/msw/config";
import { authenticate, expireSessions, resetDb, userForToken } from "@/core/msw/db";
import { resetScenarioState } from "@/core/msw/scenarios";
import { DEFAULT_SETTLE_MS, findOrder, pendingOrders, resetOrders, settleOrder } from "./orders";

type Client = { emit: (event: string, payload: unknown) => void; close: () => void; userId: string };

const clients = new Set<Client>();
const baseline = nfts.map((nft) => ({ ...nft }));
const versions = new Map<string, number>();
let eventCounter = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const socketLink = ws.link("*");

// Transporte simulado: WebSocket interceptado pelo MSW falando o protocolo Socket.IO.
// Limitações: um único namespace, sem rooms/ack nativos e sem fallback de long-polling.
const socketHandlers = [
  socketLink.addEventListener("connection", (connection) => {
    const url = new URL(connection.client.url);
    // O MSW remove o prefixo /socket.io ao casar a URL; outros WebSockets (ex.: HMR do Vite) seguem ao servidor real.
    if (!url.pathname.startsWith("/socket.io/")) {
      connection.server.connect();
      return;
    }
    const io = toSocketIo(connection);
    // O usuário vem do token da sessão (validado pelo servidor); token ausente ou inválido vira visitante.
    // O Engine.IO exige pings do servidor; sem eles o cliente derruba a conexão.
    const heartbeat = setInterval(() => connection.client.send("2"), 20_000);
    const client: Client = {
      userId: "guest",
      emit: (event, payload) => io.client.emit(event, payload),
      close: () => connection.client.close(1012, "Serviço reiniciando"),
    };
    void userForToken(url.searchParams.get("token")).then((user) => {
      client.userId = user?.id ?? "guest";
    });
    clients.add(client);
    connection.client.addEventListener("close", () => {
      clearInterval(heartbeat);
      clients.delete(client);
    });
  }),
];

function broadcast(event: string, payload: unknown, userId?: string) {
  clients.forEach((client) => {
    if (!userId || client.userId === userId) client.emit(event, payload);
  });
}

function nextEventId() {
  eventCounter += 1;
  return `evt-${Date.now().toString(36)}-${eventCounter}`;
}

type NftChange = { nftId: string; price?: string; available?: boolean; version?: number; eventId?: string };

/** Aplica a mudança ao catálogo (se a versão for mais nova) e publica `nft.updated`. */
export function publishNftUpdate(change: NftChange): NftUpdatedEvent | undefined {
  const nft = nfts.find((candidate) => candidate.id === change.nftId);
  if (!nft) return undefined;
  const current = versions.get(nft.id) ?? 0;
  const version = change.version ?? current + 1;
  const previousPrice = nft.price;

  if (version > current) {
    versions.set(nft.id, version);
    nft.version = version;
    if (change.price && change.price !== nft.price) {
      nft.previousPrice = nft.price;
      nft.price = change.price;
    }
    if (change.available !== undefined) nft.available = change.available;
  }

  const event: NftUpdatedEvent = {
    id: change.eventId ?? nextEventId(),
    version,
    occurredAt: new Date().toISOString(),
    resource: { type: "nft", id: nft.id },
    price: change.price ?? nft.price,
    previousPrice,
    available: change.available ?? nft.available !== false,
  };
  broadcast("nft.updated", event);
  return event;
}

function publishOrder(order: Order, userId: string) {
  const event: OrderUpdatedEvent = {
    id: nextEventId(),
    version: order.version,
    occurredAt: new Date().toISOString(),
    resource: { type: "order", id: order.key },
    userId,
    order,
  };
  broadcast("order.updated", event, userId);
}

export function settleAndPublish(key: string) {
  clearTimeout(timers.get(key));
  timers.delete(key);
  const settled = settleOrder(key);
  if (settled) publishOrder(settled.order, settled.userId);
}

/** Agenda a conclusão do pedido; chamado ao criar e ao retomar pedidos pendentes após refresh. */
export function scheduleSettlement(key: string, settleAt: number) {
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => settleAndPublish(key), Math.max(0, settleAt - Date.now())),
  );
}

export function resumePendingOrders() {
  pendingOrders().forEach(({ order, settleAt }) => scheduleSettlement(order.key, settleAt));
}

export function getSettleMs() {
  return getConfig().orderSettleMs ?? DEFAULT_SETTLE_MS;
}

export function resetRealtime() {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
  versions.clear();
  resetConfig();
  resetScenarioState();
  nfts.forEach((nft, index) => {
    Object.keys(nft).forEach((key) => delete (nft as Record<string, unknown>)[key]);
    Object.assign(nft, baseline[index]);
  });
  resetOrders();
}

// Controles do cenário: alteram o backend simulado pela rede, nunca a interface.
export const realtimeHandlers = [
  ...socketHandlers,
  http.post("/api/mock/nft-update", async ({ request }) => {
    const change = (await request.json()) as NftChange;
    const event = publishNftUpdate(change);
    return event ? HttpResponse.json(event) : HttpResponse.json({ message: "NFT não encontrado." }, { status: 404 });
  }),
  http.post("/api/mock/disconnect", () => {
    const count = clients.size;
    [...clients].forEach((client) => client.close());
    return HttpResponse.json({ closed: count });
  }),
  http.post("/api/mock/config", async ({ request }) => {
    const body = (await request.json()) as { orderSettleMs?: number };
    if (typeof body.orderSettleMs === "number") patchConfig({ orderSettleMs: body.orderSettleMs });
    return HttpResponse.json({ orderSettleMs: getSettleMs() });
  }),
  http.post("/api/mock/orders/settle", async ({ request }) => {
    const { key } = (await request.json()) as { key: string };
    settleAndPublish(key);
    return HttpResponse.json({ settled: true });
  }),
  http.post("/api/mock/scenario", async ({ request }) => {
    const { scenario = "default" } = (await request.json()) as { scenario?: string };
    if (!presets[scenario]) return HttpResponse.json({ message: "Cenário desconhecido." }, { status: 400 });
    resetScenarioState();
    setConfig(buildConfig(scenario));
    return HttpResponse.json(getConfig());
  }),
  http.post("/api/mock/session/expire", async () => {
    await expireSessions();
    return HttpResponse.json({ expired: true });
  }),
  http.post("/api/mock/reset", async () => {
    await resetDb();
    resetRealtime();
    return HttpResponse.json({ reset: true });
  }),
  http.get("/api/orders/:key", async ({ params, request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const userId = auth.user.id;
    await delay(150);
    let order = findOrder(String(params.key), userId);
    if (!order) return HttpResponse.json({ message: "Pedido não encontrado." }, { status: 404 });
    // Pedido vencido enquanto não havia timer ativo (ex.: aba recarregada): conclui agora.
    const due = pendingOrders().find((entry) => entry.order.key === order!.key && entry.settleAt <= Date.now());
    if (due) {
      settleAndPublish(order.key);
      order = findOrder(order.key, userId)!;
    }
    return HttpResponse.json(order);
  }),
];
