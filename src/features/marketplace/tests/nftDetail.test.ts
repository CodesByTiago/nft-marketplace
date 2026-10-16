import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/core/msw/server";
import { handlers } from "@/features/marketplace/mocks/handlers";
import { getNft, getNfts } from "@/features/marketplace/services/nftService";

describe("getNft", () => {
  beforeEach(() => server.use(...handlers));

  it("devolve o detalhe completo e determinístico de um NFT", async () => {
    const { items } = await getNfts({ limit: 1 });
    const first = await getNft(items[0].id);
    const again = await getNft(items[0].id);

    expect(first.id).toBe(items[0].id);
    expect(first.description.length).toBeGreaterThan(0);
    expect(first.editions.length).toBeGreaterThan(0);
    expect(first).toEqual(again);
  });

  it("só libera a edição 1/1 para obras de edição única", async () => {
    const { items } = await getNfts({ limit: 99 });
    for (const nft of items.slice(0, 10)) {
      const detail = await getNft(nft.id);
      const unique = detail.editions.find((edition) => edition.label === "1/1");
      if (unique) expect(unique.available).toBe(nft.totalEditions === 1);
    }
  });

  it("rejeita com 404 quando o NFT não existe", async () => {
    await expect(getNft("nao-existe")).rejects.toMatchObject({ response: { status: 404 } });
  });
});
