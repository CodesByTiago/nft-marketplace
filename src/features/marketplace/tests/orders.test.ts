import { beforeEach, describe, expect, it } from "vitest";
import { buildCartQuote } from "../mocks/cartQuote";
import { findOrder, placeOrder, resetOrders, settleOrder } from "../mocks/orders";
import type { OrderRequest } from "../types/payment";

const items = [{ id: "emerald-ape-042", quantity: 2 }];

function request(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return {
    key: "key-1",
    items,
    expectedTotal: buildCartQuote(items).total,
    provider: "metamask",
    network: "Ethereum",
    address: "0xA91F3c5b7d9e1a2b4c6d8e0f1a3b5c7d9e0fE82C",
    ...overrides,
  };
}

describe("placeOrder", () => {
  beforeEach(resetOrders);

  it("cria o pedido pendente com snapshot dos itens e totais", () => {
    const result = placeOrder(request(), "u1");
    expect(result.status).toBe(202);
    if (result.status !== 202) return;
    expect(result.body).toMatchObject({ status: "pending", version: 1, key: "key-1" });
    expect(result.body.items[0]).toMatchObject({ id: "emerald-ape-042", quantity: 2 });
    expect(result.body.total).toBe(buildCartQuote(items).total);
  });

  it("é idempotente para a mesma chave e conflita com conteúdo diferente", () => {
    const first = placeOrder(request(), "u1");
    const second = placeOrder(request(), "u1");
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(placeOrder(request({ provider: "coinbase" }), "u1").status).toBe(409);
    expect(placeOrder(request(), "u2").status).toBe(409);
  });

  it("exige nova confirmação quando o total mudou", () => {
    const result = placeOrder(request({ expectedTotal: "0.001" }), "u1");
    expect(result).toEqual({ status: 409, body: { code: "quote-changed", total: buildCartQuote(items).total } });
  });

  it("confirma na conclusão e recusa pela carteira WalletConnect", () => {
    placeOrder(request(), "u1");
    expect(settleOrder("key-1")?.order).toMatchObject({ status: "confirmed", version: 2 });
    placeOrder(request({ key: "key-2", provider: "walletconnect" }), "u1");
    expect(settleOrder("key-2")?.order).toMatchObject({ status: "declined", version: 2 });
    expect(settleOrder("key-2")).toBeUndefined();
  });

  it("só o dono consulta o pedido", () => {
    placeOrder(request(), "u1");
    expect(findOrder("key-1", "u1")?.id).toMatch(/^ORD-/);
    expect(findOrder("key-1", "u2")).toBeUndefined();
  });

  it("rejeita pedido sem itens válidos", () => {
    expect(placeOrder(request({ items: [{ id: "x", quantity: 1 }] }), "u1").status).toBe(400);
  });
});
