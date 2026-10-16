import { beforeEach, describe, expect, it } from "vitest";
import { buildCartQuote } from "../mocks/cartQuote";
import { placeOrder, resetOrders } from "../mocks/orders";
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

  it("confirma o pedido com um snapshot dos itens e totais", () => {
    const result = placeOrder(request());
    expect(result.status).toBe(201);
    if (result.status !== 201) return;
    expect(result.body.status).toBe("confirmed");
    expect(result.body.txHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(result.body.items[0]).toMatchObject({ id: "emerald-ape-042", quantity: 2 });
    expect(result.body.total).toBe(buildCartQuote(items).total);
  });

  it("é idempotente para a mesma chave", () => {
    const first = placeOrder(request());
    const second = placeOrder(request());
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });

  it("exige nova confirmação quando o total mudou", () => {
    const result = placeOrder(request({ expectedTotal: "0.001" }));
    expect(result).toEqual({ status: 409, body: { code: "quote-changed", total: buildCartQuote(items).total } });
  });

  it("recusa pela carteira WalletConnect sem confirmar", () => {
    const result = placeOrder(request({ provider: "walletconnect" }));
    expect(result.status).toBe(201);
    if (result.status === 201) expect(result.body.status).toBe("declined");
  });

  it("rejeita pedido sem itens válidos", () => {
    expect(placeOrder(request({ items: [{ id: "x", quantity: 1 }] })).status).toBe(400);
  });
});
