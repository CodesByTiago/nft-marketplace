import { describe, expect, it } from "vitest";
import { buildCartQuote } from "@/features/marketplace/mocks/cartQuote";
import { nfts } from "@/features/marketplace/mocks/data";

const [first, second] = nfts;
const lines = [
  { id: first.id, quantity: 2 },
  { id: second.id, quantity: 1 },
];

describe("buildCartQuote", () => {
  it("soma subtotal e taxa de rede sem desconto", () => {
    // 1.19 * 2 + 1.69 = 4.07; + 0.016 de taxa
    const quote = buildCartQuote(lines);
    expect(quote.subtotal).toBe("4.070");
    expect(quote.discount).toBe("0.000");
    expect(quote.networkFee).toBe("0.016");
    expect(quote.total).toBe("4.086");
    expect(quote.coupon).toBeUndefined();
  });

  it("aplica o cupom válido, ignorando maiúsculas e espaços", () => {
    const quote = buildCartQuote(lines, " kurio10 ");
    expect(quote.coupon).toEqual({ code: "KURIO10", status: "applied", percent: 10 });
    expect(quote.discount).toBe("0.407");
    expect(quote.total).toBe("3.679");
  });

  it("não dá desconto para cupom expirado ou inválido", () => {
    expect(buildCartQuote(lines, "VERAO20").coupon?.status).toBe("expired");
    expect(buildCartQuote(lines, "NADA").coupon?.status).toBe("invalid");
    expect(buildCartQuote(lines, "NADA").discount).toBe("0.000");
  });
});
